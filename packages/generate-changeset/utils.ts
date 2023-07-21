import { context, getOctokit } from "@actions/github";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import frontmatter from "remark-frontmatter";
import yaml from "js-yaml";
import { visit } from "unist-util-visit";

import { find } from "unist-util-find";
import { ListItem, Text } from "mdast";

export function gql_get_pr(owner: string, repo: string, pr_number: number) {
	return `{
    repository(owner: "${owner}", name: "${repo}") {
      pullRequest(number: ${pr_number}) {
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
            labels(after: "", first: 10) {
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
        comments(first: 10) {
          nodes {
            id
            author {
              login
            }
            body
            fullDatabaseId
          }
        }
      }
    }
  }`;
}

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

function format_changelog_preview(changelog: string) {
	return changelog
		.split("\n")
		.map((line) => `> ${line}`)
		.join("\n");
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
	changeset_content: string,
	changeset_url: url,
}: {
	packages: [string, string | boolean][];
	changelog: string;
	manual_package_selection: boolean;
	manual_mode?: boolean;
	changeset_content: string;
	changeset_url: string;
}) {
	return `<!-- tag=changesets_gradio -->

###  🦄 ${get_title(packages)}

#### This Pull Request includes changes to the following packages. 

${create_version_table(packages)}
${manual_package_selection ? create_package_checklist(packages) : ""}
${generate_mode_description(manual_package_selection, manual_mode)}


#### With the following changelog entry.

${format_changelog_preview(changelog)}

${
	manual_mode
		? "⚠️ _The changeset file for this pull request has been modified manually, so the changeset generation bot has been disabled. To go back into automatic mode, delete the changeset file._"
		: `_Maintainers or the PR author can modify the PR title to modify this entry._
<details><summary>

#### Something isn't right?</summary>

- Maintainers can change the version label to modify the version bump. 
- If this pull request needs to update multiple packages to different versions or requires a more comprehensive changelog entry, maintainers can [update the changelog file directly](https://github.com/sveltejs/kit/new/server-js-fallthrough?filename=.changeset/grumpy-ears-own.md&value=---%0A%22%40sveltejs%2Fkit%22%3A%20patch%0A%22test-basics%22%3A%20patch%0A---%0A%0Afeat%3A%20server%20js%20fallthrough%20to%20page%20if%20handler%20doesn%27t%20exist%0A)

</details>`
}`.trim();
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

export function check_for_manual_selection(md_src: string): {
	manual_package_selection: boolean;
	versions?: [string, boolean][];
} {
	if (!md_src) return { manual_package_selection: false };

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

	return {
		manual_package_selection: !!manual_node?.checked,
		versions: manual_node ? versions : undefined,
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
			} = await octokit.graphql<Record<string, any>>(
				gql_get_pr(owner, repo, pr_number)
			);

			return {
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
			pr_number,
			comment_id,
			body,
		}: {
			pr_number: number;
			comment_id?: string;
			body: string;
		}) {
			if (comment_id) {
				await octokit.rest.issues.updateComment({
					owner: context.repo.owner,
					repo: context.repo.repo,
					comment_id: parseInt(comment_id),
					body,
				});
			} else {
				await octokit.rest.issues.createComment({
					owner: context.repo.owner,
					repo: context.repo.repo,
					issue_number: pr_number,
					body,
				});
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

const RE_VALID_FEAT_FIX_REGEX = /^(feat|fix)\s*:.*$/i;
const RE_VALID_HIGHLIGHT_REGEX = /^highlight\s*:\n\n####[^]*$/i;

export function validate_changelog(changelog: string): {
	valid: boolean;
	message: string | false;
} {
	const changelog_content = changelog.split("---")[2].trim();

	if (RE_FEAT_FIX_REGEX.test(changelog_content)) {
		return {
			valid: RE_VALID_FEAT_FIX_REGEX.test(changelog_content),
			message: `⚠️ Warning invalid changelog entry.

Changelog entry must be in the format \`feat: <description>\` or \`fix: <description>\`. Entries fior fixes or features cannot span multiple lines. If you wish to add a longer description, please created a \`highlight\` entry instead.`,
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
