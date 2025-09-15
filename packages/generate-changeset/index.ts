import { promises as fs } from "fs";
import { join } from "path";

import { getInput, setFailed, info, warning, setOutput } from "@actions/core";
import { exec } from "@actions/exec";
import { context } from "@actions/github";
import { getChangedPackagesSinceRef } from "@changesets/git";
import {
	type Packages,
	type Package,
	getPackagesSync,
} from "@manypkg/get-packages";
import * as human_id from "human-id";

import {
	create_changeset_comment,
	get_frontmatter_versions,
	check_for_manual_selection_and_approval,
	get_type_from_linked_issues,
	get_version_from_linked_issues,
	get_version_from_label,
	get_type_from_label,
	find_comment,
	get_client,
	generate_changeset,
	validate_changelog,
} from "./utils";

const dev_only_ignore_globs = [
	"!**/test/**",
	"!**/*.test.ts",
	"!**/*.test.js",
	"!**/*.spec.js",
	"!**/*.spec.ts",
	"!**/*.stories.svelte",
	"!**/package.json",
	"!**/requirements.txt",
];

type PackageJson = Packages["packages"][0]["packageJson"] & {
	python: boolean;
	main_changeset: boolean;
};

async function run() {
	console.log(JSON.stringify(context, null, 2));
	const branch_name = getInput("branch_name");

	if (branch_name.startsWith("changeset-release/")) {
		info("Release PR. Skipping changeset generation.");
		setOutput("skipped", "true");
		return;
	}

	if (branch_name === "v4") {
		info("Main or dev branch. Skipping changeset generation.");
		setOutput("skipped", "true");
		return;
	}

	const token = getInput("github_token");
	const main_pkg = getInput("main_pkg");
	const client = get_client(token, context.repo.owner, context.repo.repo);
	const pr_input = getInput("pr_number");
	console.log(pr_input);
	const pull_request_number = parseInt(pr_input);

	let {
		id: pr_id,
		base_branch_name,
		source_branch_name,
		source_repo_name,
		base_sha,
		head_sha,
		closes,
		labels,
		title,
		comments,
	} = await client.get_pr(pull_request_number);

	const changed_files = await get_changed_files(base_sha);
	const comment = find_comment(comments);

	// check the status of the changeset

	const { changeset_path, manual_mode, old_changeset_content } =
		await get_changeset_status(changed_files);

	if (manual_mode) {
		warning(
			`Changeset file was edited manually. Skipping changeset generation.`
		);

		// Check if PR has the approved label
		const has_approved_label = labels.some(
			(l) => l.name === "changeset:approved"
		);
		
		// Variables for tracking state changes
		let updated_has_approved_label = has_approved_label;
		let selection: any = null;

		info(`[Manual Mode] Full context:`);
		info(
			JSON.stringify(
				{
					pr_number: pull_request_number,
					labels: labels.map((l) => l.name),
					has_approved_label,
					comment_exists: !!comment,
					comment_id: comment?.id,
					comment_author: comment?.author,
					comment_editor: comment?.editor,
					comment_lastEditedAt: comment?.lastEditedAt,
					changeset_path,
				},
				null,
				2
			)
		);

		if (comment?.body) {
			const wasEdited = comment.lastEditedAt !== null;

			selection = check_for_manual_selection_and_approval(
				comment.body,
				wasEdited,
				comment.editor,
				has_approved_label
			);

			info(`[Manual Mode] Checkbox analysis:`);
			info(
				JSON.stringify(
					{
						wasEdited,
						editor: comment.editor,
						checkbox_checked: selection.checkbox_checked,
						has_approved_label,
						should_toggle_label: selection.should_toggle_label,
					},
					null,
					2
				)
			);

			// Handle label toggling if needed
			if (selection.should_toggle_label) {
				const approved_label_id = await client.get_or_create_label(
					"changeset:approved"
				);
				if (approved_label_id) {
					if (selection.checkbox_checked) {
						info(`[Manual Mode] Adding changeset:approved label`);
						await client.add_label(pr_id, approved_label_id);
						updated_has_approved_label = true;
					} else {
						info(`[Manual Mode] Removing changeset:approved label`);
						await client.remove_label(pr_id, approved_label_id);
						updated_has_approved_label = false;
					}
				} else {
					warning(
						`[Manual Mode] Could not find or create changeset:approved label`
					);
				}
			}
		}

		const versions = get_frontmatter_versions(old_changeset_content) || [];

		const changelog_entry = old_changeset_content.split("---")[2].trim();

		const changelog_entry_message = changelog_entry
			.replace(/^(feat:|fix:|highlight:)/im, "")
			.trim();

		const changelog_entry_type =
			changelog_entry.match(/^(feat:|fix:|highlight:)/im)?.[0] || "unknown";

		const { valid, message } = validate_changelog(old_changeset_content);

		if (message === false) {
			setFailed(
				`Cannot determine a type for the this changeset. Manual changesets should include \`feat:\`, \`fix:\` or \`highlight:\`.`
			);
			return;
		}

		// Use the updated label state after potential toggling
		const final_has_approved_label = comment?.body && selection?.should_toggle_label 
			? updated_has_approved_label 
			: has_approved_label;
		
		const { pr_comment_content, changes } = create_changeset_comment({
			packages: versions,
			changelog: !valid ? message : changelog_entry_message,
			manual_package_selection: false,
			manual_mode: true,
			changeset_content: old_changeset_content,
			changeset_url: `https://github.com/${source_repo_name}/edit/${source_branch_name}/${changeset_path}`,
			previous_comment: comment?.body,
			has_approved_label: final_has_approved_label,
			changelog_entry_type,
		});

		if (changes) {
			info("[Manual Mode] Changeset comment has changes, updating...");
			const url = await client.upsert_comment({
				pr_id,
				body: pr_comment_content,
				comment_id: comment?.id,
			});
			setOutput("comment_url", url);
			info("[Manual Mode] Changeset comment updated successfully.");
		} else {
			setOutput("comment_url", comment?.url);
			info("[Manual Mode] Changeset comment unchanged, skipping update.");
		}

		setOutput("skipped", "false");

		return;
	}

	const { packages: pkgs } = getPackagesSync(process.cwd());

	let packages_versions: undefined | [string, string | boolean][] = undefined;
	let manual_package_selection = false;

	// Check if PR has the approved label
	const has_approved_label = labels.some(
		(l) => l.name === "changeset:approved"
	);
	
	// Variables for tracking state changes
	let updated_has_approved_label = has_approved_label;
	let selection: any = null;

	info(`[Normal Mode] Full context:`);
	info(
		JSON.stringify(
			{
				pr_number: pull_request_number,
				labels: labels.map((l) => l.name),
				has_approved_label,
				comment_exists: !!comment,
				comment_id: comment?.id,
				comment_author: comment?.author,
				comment_editor: comment?.editor,
				comment_lastEditedAt: comment?.lastEditedAt,
				changeset_path,
			},
			null,
			2
		)
	);

	if (comment?.body) {
		const wasEdited = comment.lastEditedAt !== null;

		selection = check_for_manual_selection_and_approval(
			comment.body,
			wasEdited,
			comment.editor,
			has_approved_label
		);

		info(`[Normal Mode] Checkbox analysis:`);
		info(
			JSON.stringify(
				{
					wasEdited,
					editor: comment.editor,
					checkbox_checked: selection.checkbox_checked,
					has_approved_label,
					should_toggle_label: selection.should_toggle_label,
					manual_package_selection: selection.manual_package_selection,
				},
				null,
				2
			)
		);

		manual_package_selection = selection.manual_package_selection;

		if (
			manual_package_selection &&
			selection.versions &&
			selection.versions.length
		) {
			packages_versions = selection.versions;
			info(`[Normal Mode] Using manual package versions from comment`);
		}

		// Handle label toggling if needed
		if (selection.should_toggle_label) {
			const approved_label_id = await client.get_or_create_label(
				"changeset:approved"
			);
			if (approved_label_id) {
				if (selection.checkbox_checked) {
					info(`[Normal Mode] Adding changeset:approved label`);
					await client.add_label(pr_id, approved_label_id);
					updated_has_approved_label = true;
				} else {
					info(`[Normal Mode] Removing changeset:approved label`);
					await client.remove_label(pr_id, approved_label_id);
					updated_has_approved_label = false;
				}
			} else {
				warning(
					`[Normal Mode] Could not find or create changeset:approved label`
				);
			}
		}
	}

	let version =
		get_version_from_label(labels) || get_version_from_linked_issues(closes);

	if (!packages_versions) {
		// get changed packages
		const { updated_pkgs, version: _version } = await get_changed_packages({
			changed_files,
			pkgs,
			base_sha,
			main_pkg,
			version,
		});

		if (_version !== "unknown" && version === "unknown") {
			version = _version;
		}

		packages_versions = Array.from(updated_pkgs).map((pkg) => [pkg, version]);
	}

	if (manual_package_selection) {
		packages_versions = pkgs.map(({ packageJson: { name } }) => [
			name,
			packages_versions?.find(([pkg]) => pkg === name)?.[1] ? version : false,
		]);
	}

	let type = get_type_from_label(labels) || get_type_from_linked_issues(closes);

	const changeset_content = await generate_changeset(
		packages_versions,
		type,
		title
	);

	if (changeset_content.trim() !== old_changeset_content.trim()) {
		const operation =
			(packages_versions.length === 0 ||
				packages_versions.every(([p, v]) => !v)) &&
			changeset_content === ""
				? "delete"
				: "add";

		if (operation === "delete") {
			await fs.unlink(changeset_path);
			warning("No packages selected. Skipping changeset generation.");
		} else {
			fs.writeFile(changeset_path, changeset_content);
		}

		await exec("git", [
			"config",
			"--global",
			"user.email",
			"gradio-pr-bot@users.noreply.github.com",
		]);
		await exec("git", ["config", "--global", "user.name", "gradio-pr-bot"]);
		await exec("git", ["add", "."]);
		await exec("git", ["commit", "-m", `${operation} changeset`]);
		await exec("git", ["push"]);
	}

	// Use the updated label state after potential toggling
	const final_has_approved_label = comment?.body && selection?.should_toggle_label 
		? updated_has_approved_label 
		: has_approved_label;
	
	const { pr_comment_content, changes } = create_changeset_comment({
		packages: packages_versions,
		changelog: title,
		manual_package_selection,
		changeset_content,
		changeset_url: `https://github.com/${source_repo_name}/edit/${source_branch_name}/${changeset_path}`,
		previous_comment: comment?.body,
		has_approved_label: final_has_approved_label,
		changelog_entry_type: type || "unknown",
	});

	// Check if the comment needs updating
	if (changes) {
		info("[Normal Mode] Changeset comment has changes, updating...");
		const url = await client.upsert_comment({
			pr_id,
			body: pr_comment_content,
			comment_id: comment?.id,
		});
		setOutput("comment_url", url);
		info("[Normal Mode] Changeset comment updated successfully.");
	} else {
		info("[Normal Mode] Changeset comment unchanged, skipping update.");
		setOutput("comment_url", comment?.url);
	}

	// this always happens
	setOutput("skipped", "false");
	setOutput("approved", final_has_approved_label.toString());
}

run();

async function get_changed_files(base_sha: string) {
	let output_base = "";
	let error_base = "";

	const options_base = {
		listeners: {
			stdout: (data: Buffer) => {
				output_base += data.toString();
			},
			stderr: (data: Buffer) => {
				error_base += data.toString();
			},
		},
	};

	await exec("git", ["merge-base", base_sha, "HEAD"], options_base);

	console.log({ output_base });

	let output = "";
	let error = "";

	const options = {
		listeners: {
			stdout: (data: Buffer) => {
				output += data.toString();
			},
			stderr: (data: Buffer) => {
				error += data.toString();
			},
		},
	};

	await exec("git", ["diff", "--name-only", output_base.trim()], options);

	return output
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean)
		.reduce<Set<string>>((acc, next) => {
			acc.add(next);
			return acc;
		}, new Set());
}

async function get_changeset_status(changed_files: Set<string>): Promise<{
	changeset_path: string;
	manual_mode: boolean;
	old_changeset_content: string;
}> {
	let changeset_path = "";

	changed_files.forEach((f) => {
		if (f.startsWith(".changeset/") && f.endsWith(".md")) {
			changeset_path = f;
		}
	});

	if (changeset_path === "") {
		return {
			changeset_path: `.changeset/${human_id.humanId({
				separator: "-",
				capitalize: false,
			})}.md`,
			manual_mode: false,
			old_changeset_content: "",
		};
	}

	const old_changeset_content = await fs.readFile(changeset_path, "utf-8");

	let output_data = "";
	const options = {
		listeners: {
			stdout: (data: Buffer) => {
				output_data += data.toString();
			},
			stderr: (data: Buffer) => {
				output_data += data.toString();
			},
		},
	};

	await exec(
		"git",
		["--no-pager", "log", "-p", "-1", "--", changeset_path],
		options
	);

	const last_change = output_data.trim();

	if (!/Author: gradio-pr-bot/.test(last_change)) {
		warning(
			`Changeset file was edited manually. Skipping changeset generation.`
		);
		return {
			changeset_path,
			manual_mode: true,
			old_changeset_content,
		};
	} else {
		return {
			changeset_path,
			manual_mode: false,
			old_changeset_content,
		};
	}
}

async function get_changed_packages({
	changed_files,
	pkgs,
	base_sha,
	main_pkg,
	version,
}: {
	changed_files: Set<string>;
	pkgs: Package[];
	base_sha: string;
	main_pkg: string;
	version: string;
}) {
	const changed_pkgs = await getChangedPackagesSinceRef({
		cwd: process.cwd(),
		ref: base_sha,
		changedFilePatterns: dev_only_ignore_globs,
	});

	const main_package_json = pkgs.find(
		(p) => p.packageJson.name === main_pkg
	) as Packages["packages"][0];

	if (!main_package_json) {
		setFailed(`Could not find main package ${main_pkg}`);
	}

	const dependency_files = pkgs.map(({ packageJson, relativeDir }) => {
		if ((packageJson as PackageJson).python) {
			return [join(relativeDir, "..", "requirements.txt"), packageJson.name];
		} else {
			return [join(relativeDir, "package.json"), packageJson.name];
		}
	});

	const changed_dependency_files = dependency_files.filter(([f]) =>
		changed_files.has(f)
	);
	interface PackageSimple {
		name: string;
		add_to_main_changeset: boolean;
	}

	const updated_pkgs = new Set<string>();

	changed_pkgs.forEach((pkg) => {
		updated_pkgs.add(pkg.packageJson.name);
		if ((pkg.packageJson as PackageJson)?.main_changeset) {
			updated_pkgs.add(main_pkg);
		}
	});

	changed_dependency_files.forEach(([file, pkg]) => {
		updated_pkgs.add(pkg);
		if (
			(pkgs.find((p) => p.packageJson.name === pkg)?.packageJson as PackageJson)
				?.main_changeset
		) {
			updated_pkgs.add(main_pkg);
		}
	});

	let new_version = version;

	if (new_version === "unknown") {
		if (changed_pkgs.length) {
			new_version = "minor";
		} else if (changed_dependency_files.length) {
			new_version = "patch";
		}
	}

	return {
		updated_pkgs,
		version: new_version,
	};
}
