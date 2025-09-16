import { getOctokit } from "@actions/github";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import frontmatter from "remark-frontmatter";
import yaml from "js-yaml";
import { visit } from "unist-util-visit";

import { find } from "unist-util-find";
import { ListItem, Text } from "mdast";

export function validate_feat_fix(changelog: string) {
	let ast = unified().use(remarkParse).parse(changelog);

	if (
		ast.children &&
		ast.children.length == 2 &&
		ast.children[0].type === "paragraph" &&
		ast.children[1].type === "list"
	) {
		return true;
	}
	if (
		ast.children &&
		ast.children.length == 1 &&
		ast.children[0].type === "paragraph"
	) {
		return true;
	}

	return false;
}

export const GQL_GET_PR = `query RepoData($owner: String!, $name: String!, $pr_number: Int!) {
	repository(owner: $owner, name: $name) {
		pullRequest(number: $pr_number) {
			id
			baseRefName
			headRefName
			baseRefOid
			headRefOid
			headRepository {
				nameWithOwner
			}
			closingIssuesReferences(first: 50) {
				nodes {
					labels(first: 10) {
						nodes {
							name
						}
					}
					id
					body
					number
					title
				}
			}
			labels(first: 10) {
				nodes {
					name
					id
					description
					color
				}
			}
			title
			comments(first: 50) {
				nodes {
					id
					author {
						login
					}
					body
					fullDatabaseId
					url
					createdAt
					lastEditedAt
					editor {
						login
					}
				}
			}
		}
	}
}`;

const GQL_UPDATE_ISSUE_COMMENT = `mutation UpdateComment($comment_id: ID!, $body: String!){
	 updateIssueComment(input: {id: $comment_id, body: $body}) {
		 issueComment {
			 url
		 }
	 }
 }`;

const GQL_CREATE_ISSUE_COMMENT = `mutation CreateComment($body: String!, $pr_id: ID!){
	 addComment(input: {body: $body, subjectId: $pr_id}) {
		 commentEdge {
			 node {
				 url
			 }
		 }
	 }
 }`;


function get_title(packages: [string, string | boolean][]) {
	return packages.length ? `change detected` : `no changes detected`;
}

function create_version_table(packages: [string, string | boolean][]) {
	const packages_to_render = packages.filter(([p, v]) => p && v);
	if (!packages_to_render.length) return "__No changes detected. __";

	const rendered_packages = packages_to_render
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([p, v]) => `|\`${p}\` | \`${v}\` |`)

		.join("\n");

	return `| Package | Version |
|--------|--------|
${rendered_packages}`;
}

function create_package_checklist(packages: [string, string | boolean][]) {
	const changed_packages_list = packages
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([p, v]) => `- [${!!v ? "x" : " "}] \`${p}\``);

	return `\n#### Select the correct packages:
${changed_packages_list.join("\n")}

\\-
`;
}

function get_version_interaction_text(manual_version: boolean) {
	return manual_version
		? "enable automatic package selection"
		: "manually select packages to update";
}

function format_changelog_preview(
	changelog: string,
	pacakges: [string, string | boolean][],
	changelog_entry_type: string
) {
	if (!pacakges.length) return "";
	return changelog
		.split("\n\n")
		.map((line) => {
			if (changelog_entry_type === "highlight") {
				return `#### ${line}`;
			}
			return `- ${line}`;
		})
		.join("\n\n");
}

function generate_mode_description(
	manual_package_selection: boolean,
	manual_mode: boolean
) {
	if (manual_mode) {
		return ``;
	} else {
		return `- [${manual_package_selection ? "x" : " "}] Maintainers can ${
			manual_package_selection ? "de" : " "
		}select this checkbox to ${get_version_interaction_text(
			manual_package_selection
		)}.`;
	}
}

export function create_changeset_comment({
	packages,
	changelog,
	manual_package_selection,
	manual_mode = false,
	changeset_content,
	changeset_url,
	previous_comment,
	approved,
	approved_by,
	changelog_entry_type,
}: {
	packages: [string, string | boolean][];
	changelog: string;
	manual_package_selection: boolean;
	manual_mode?: boolean;
	changeset_content: string;
	changeset_url: string;
	previous_comment?: string;
	approved: boolean;
	approved_by?: string;
	changelog_entry_type: string;
}) {
	const new_comment = `<!-- tag=changesets_gradio -->

###  🦄 ${get_title(packages)}

#### ${
		packages.length
			? "This Pull Request includes changes to the following packages. "
			: "This Pull Request does not include changes to any packages."
	}

${create_version_table(packages)}

---

${format_changelog_preview(changelog, packages, changelog_entry_type)}

---

${
	approved
		? `✅ Changeset approved${approved_by ? ` by @${approved_by}` : ''}`
		: "‼️ Changeset not approved. Ensure the version bump is appropriate for all packages before approving."
}

${
	approved
		? "- [x] Maintainers can remove approval by unchecking this checkbox."
		: "- [ ] Maintainers can approve the changeset by checking this checkbox."
}

<!-- approval_state:${JSON.stringify({ approved, approved_by: approved_by || null })} -->

<details><summary>

#### Something isn't right?</summary>

- Maintainers can change the version label to modify the version bump. 
- If the bot has failed to detect any changes, or if this pull request needs to update multiple packages to different versions or requires a more comprehensive changelog entry, maintainers can [${
		packages.length ? "update" : "create"
	} the changelog file directly](${
		packages.length ? changeset_url : changeset_url.replace("/edit/", "/new/")
	}).

</details>
`.trim();

	const normalize = (text: string) =>
		text.replace(/\(https:\/\/github.com[^]*\.md\)/g, "").trim();

	const changes =
		!previous_comment || normalize(previous_comment) !== normalize(new_comment);

	if (!changes && previous_comment) {
		console.log(
			`[create_changeset_comment] No changes detected, skipping comment update`
		);
	}

	return {
		pr_comment_content: new_comment,
		changes,
	};
}

const md_parser = unified().use(remarkParse).use(frontmatter).use(remarkGfm);

export function get_frontmatter_versions(
	md: string
): [string, string][] | false {
	const ast = md_parser.parse(md);
	const frontmatter_node = ast.children.find((n) => n.type === "yaml") as {
		value: string;
	};

	if (frontmatter_node) {
		const versions = (
			Object.entries(yaml.load(frontmatter_node.value) || {}) as [
				string,
				string
			][]
		).map<[string, string]>(([key, value]) => {
			return [key.trim(), value.trim()];
		});

		return versions;
	}

	return false;
}

function get_previous_approval_state(md_src: string): { approved: boolean; approved_by: string | null } | null {
	const match = md_src.match(/<!-- approval_state:({.*?}) -->/);
	if (match) {
		try {
			return JSON.parse(match[1]);
		} catch {
			// Fallback for old format
			const oldMatch = md_src.match(/<!-- approval_state:(true|false) -->/);
			return oldMatch ? { approved: oldMatch[1] === 'true', approved_by: null } : null;
		}
	}
	return null;
}

export function check_for_manual_selection_and_approval(
	md_src: string,
	wasEdited?: boolean,
	editor?: string | null
): {
	manual_package_selection: boolean;
	versions?: [string, boolean][];
	approved: boolean;
	approved_by?: string | null;
} {
	if (!md_src)
		return { manual_package_selection: false, approved: false, approved_by: null };

	const new_ast = md_parser.parse(md_src);

	const manual_node: ListItem | undefined = find(new_ast, (node) => {
		return (
			node.type === "listItem" &&
			(node as ListItem)?.checked != null &&
			//@ts-ignore
			!!find((node as ListItem)?.children[0], (inner_node) =>
				(inner_node as Text)?.value?.trim()?.startsWith("Maintainers can ")
			)
		);
	}) as ListItem | undefined;

	let versions: [string, boolean][] = [];
	if (manual_node) {
		visit(new_ast, (node) => {
			if (
				node.type === "listItem" &&
				node.checked != null &&
				node.checked != undefined
			) {
				visit(node.children[0], (inner_node) => {
					if (inner_node.type === "inlineCode") {
						versions.push([inner_node.value, !!node.checked]);
					}
				});
			}
		});
	}

	const approved_node: ListItem | undefined = find(new_ast, (node) => {
		return (
			node.type === "listItem" &&
			(node as ListItem)?.checked != null &&
			!!find(
				//@ts-ignore
				(node as ListItem)?.children[0],
				(inner_node) =>
					(inner_node as Text)?.value?.trim()?.includes("approve") &&
					(inner_node as Text)?.value?.trim()?.includes("checkbox")
			)
		);
	}) as ListItem | undefined;

	const checkbox_checked = !!approved_node?.checked;
	const previous_state = get_previous_approval_state(md_src);
	
	// Determine the approval state and approver:
	// 1. If no edit → use checkbox state
	// 2. If bot edit → use previous state (bot doesn't change checkboxes)
	// 3. If human edit → use new checkbox state (human changed it)
	let approved = checkbox_checked;
	let approved_by = previous_state?.approved_by || null;
	
	if (wasEdited && editor === "gradio-pr-bot" && previous_state !== null) {
		// Bot edit: preserve previous state
		approved = previous_state.approved;
		approved_by = previous_state.approved_by;
		console.log(`[check_for_manual_selection_and_approval] Bot edit detected, preserving state: approved=${previous_state.approved}, by=${previous_state.approved_by}`);
	} else if (wasEdited && editor && editor !== "gradio-pr-bot") {
		// Human edit: use the new checkbox state
		approved = checkbox_checked;
		
		// If state changed from unchecked to checked, record who approved
		if (checkbox_checked && (!previous_state || !previous_state.approved)) {
			approved_by = editor;
			console.log(`[check_for_manual_selection_and_approval] Approved by ${editor}`);
		} else if (!checkbox_checked && previous_state?.approved) {
			// If unchecked, clear the approver
			approved_by = null;
			console.log(`[check_for_manual_selection_and_approval] Approval removed by ${editor}`);
		}
		
		console.log(`[check_for_manual_selection_and_approval] Human edit by ${editor}, new state: ${checkbox_checked}`);
	} else if (!wasEdited && previous_state) {
		// No edit but we have previous state: use it
		approved = previous_state.approved;
		approved_by = previous_state.approved_by;
		console.log(`[check_for_manual_selection_and_approval] No edit, using previous state: approved=${previous_state.approved}, by=${previous_state.approved_by}`);
	} else if (!wasEdited) {
		// No edit and no previous state: use current checkbox state
		approved = checkbox_checked;
		approved_by = null;
		console.log(`[check_for_manual_selection_and_approval] No edit, no previous state, using checkbox: ${checkbox_checked}`);
	}

	console.log(`[check_for_manual_selection_and_approval] Final states:`, {
		manual_package_selection: !!manual_node?.checked,
		checkbox_checked,
		previous_state,
		approved,
		approved_by,
		wasEdited,
		editor,
	});

	return {
		manual_package_selection: !!manual_node?.checked,
		versions: manual_node ? versions : undefined,
		approved,
		approved_by,
	};
}

interface Label {
	name: string;
	id: string;
}

export function get_version_from_label(labels: Label[]) {
	if (!labels.length) return undefined;
	return labels
		.filter((l) => l.name.startsWith("v:"))?.[0]
		?.name.slice(2)
		.trim();
}

export function get_type_from_label(labels: Label[]) {
	if (!labels.length) return undefined;
	return labels
		.filter((l) => l.name.startsWith("t:"))?.[0]
		?.name.slice(2)
		.trim();
}

interface Comment {
	id: string;
	body: string;
	author: {
		login: string;
	};
	fullDatabaseId: string;
	url: string;
	createdAt: string;
	lastEditedAt: string | null;
	editor: {
		login: string;
	} | null;
}

export function find_comment(comments: Comment[]) {
	const comment = comments.find((comment) => {
		const body = comment.body;
		return body?.includes("<!-- tag=changesets_gradio -->");
	});

	return comment
		? {
				...comment,
				author: comment.author.login,
				editor: comment.editor?.login,
		  }
		: undefined;
}

interface ClosesLink {
	body: string;
	number: number;
	title: string;
	labels: {
		nodes: { name: string }[];
	};
}

export function get_version_from_linked_issues(closes: ClosesLink[]) {
	let version = "unknown";
	closes.forEach((c) => {
		const labels = c.labels.nodes.map((l) => l.name);
		if (labels.includes("bug") && version !== "minor") {
			version = "patch";
		} else if (labels.includes("enhancement")) {
			version = "minor";
		}
	});

	return version;
}

export function get_type_from_linked_issues(closes: ClosesLink[]) {
	let type = "";
	closes.forEach((c) => {
		const labels = c.labels.nodes.map((l) => l.name);
		if (labels.includes("bug") && type !== "feat") {
			type = "fix";
		} else if (labels.includes("enhancement")) {
			type = "feat";
		}
	});

	return type || "feat";
}

export function get_client(token: string, owner: string, repo: string) {
	const octokit = getOctokit(token);

	return {
		async get_pr(pr_number: number) {
			let {
				repository: {
					pullRequest: {
						id,
						baseRefName: base_branch_name,
						headRepository: { nameWithOwner: source_repo_name },
						headRefName: source_branch_name,
						baseRefOid: base_sha,
						headRefOid: head_sha,
						closingIssuesReferences: { nodes: closes },
						labels: { nodes: labels },
						title,
						comments: { nodes: comments },
					},
				},
			} = await octokit.graphql<Record<string, any>>(GQL_GET_PR, {
				owner,
				name: repo,
				pr_number,
			});

			return {
				id,
				base_branch_name,
				source_repo_name,
				source_branch_name,
				base_sha,
				head_sha,
				closes,
				labels,
				title,
				comments,
			};
		},
		async upsert_comment({
			pr_id,
			comment_id,
			body,
		}: {
			pr_id: string;
			comment_id?: string;
			body: string;
		}) {
			console.log({ comment_id });
			if (comment_id) {
				const {
					updateIssueComment: {
						issueComment: { url },
					},
				} = await octokit.graphql<Record<string, any>>(
					GQL_UPDATE_ISSUE_COMMENT,
					{ comment_id, body }
				);

				return url;
			} else {
				const {
					addComment: {
						commentEdge: {
							node: { url },
						},
					},
				} = await octokit.graphql<Record<string, any>>(
					GQL_CREATE_ISSUE_COMMENT,
					{ pr_id, body }
				);

				return url;
			}
		},

	};
}

export async function generate_changeset(
	packages: [string, string | boolean][],
	type: string,
	title: string
) {
	if (packages.filter(([name, version]) => !!name && !!version).length === 0) {
		return "";
	}

	const formatted_type =
		type === "highlight" ? `${type}:\n\n#### ${title}` : `${type}:${title}`;

	return `---
${packages
	.filter(([name, version]) => !!name && !!version)
	.sort((a, b) => a[0].localeCompare(b[0]))
	.map(([name, version]) => `"${name}": ${version}`)
	.join("\n")}
---

${formatted_type}
`;
}

const RE_FEAT_FIX_REGEX = /^(feat|fix)\s*:/i;
const RE_HIGHLIGHT_REGEX = /^highlight\s*:/i;

const RE_VALID_FEAT_FIX_REGEX = /^(feat|fix)\s*:[^]*$/i;
const RE_VALID_HIGHLIGHT_REGEX = /^highlight\s*:\n\n####[^]*$/i;

export function validate_changelog(changelog: string): {
	valid: boolean;
	message: string | false;
} {
	const changelog_content = changelog.split("---")[2].trim();

	if (RE_FEAT_FIX_REGEX.test(changelog_content)) {
		return {
			valid:
				RE_VALID_FEAT_FIX_REGEX.test(changelog_content) &&
				validate_feat_fix(changelog_content),
			message: `⚠️ Warning invalid changelog entry.

Changelog entry must be either a paragraph or a paragraph followed by a list:

\`<type>: <description>\` 

Or

\`\`\`
<type>:<description>

- <change-one>
- <change-two>
- <change-three>
\`\`\`

If you wish to add a more detailed description, please created a \`highlight\` entry instead.`,
		};
	} else if (RE_HIGHLIGHT_REGEX.test(changelog_content)) {
		return {
			valid: RE_VALID_HIGHLIGHT_REGEX.test(changelog_content),
			message: `⚠️ Warning invalid changelog entry.

Changelog entry must be in the format:
\`\`\`highlight: 

#### <feature-title>

<feature-description>
\`\`\`

Any markdown other than level 1-4 headings is allowed.`,
		};
	} else {
		return {
			valid: false,
			message: false,
		};
	}
}
