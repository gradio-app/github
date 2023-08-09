import * as core from "@actions/core";
import * as github from "@actions/github";

type Octokit = ReturnType<typeof github.getOctokit>;

const make_comment_tag = (id: string) =>
	`<!-- GRADIO_GITHUB_ACTION_COMMENT_ID_${id.toUpperCase()} -->`;
const make_sub_comment_tag = (id: string, sub_id: string) =>
	`GRADIO_GITHUB_ACTION_COMMENT_ID_${id.toUpperCase()}_${sub_id.toUpperCase()}`;

async function run() {
	const token = core.getInput("gh_token");
	const octokit = github.getOctokit(token);
	const pr_number = parseInt(core.getInput("pr_number"));
	const tag = core.getInput("tag");
	const message = core.getInput("message");
	let additional_text: string | null = core.getInput("additional_text") || null;
	const context = github.context;
	const repo = context.repo;

	if (!pr_number) {
		core.info("No PR number found.");
		return;
	}

	if (!pr_number) {
		core.setFailed("No PR number found.");
		return;
	}

	const COMMENT_ID = make_comment_tag(tag);
	const SUB_COMMENT_ID = make_sub_comment_tag(
		tag,
		message.trim().split("~")[0]
	);

	// get pr comments
	const comments = await octokit.rest.issues.listComments({
		...repo,
		issue_number: pr_number,
	});

	if (comments.data.length === 0) {
		let body = message ? process_body(null, message, COMMENT_ID) : "";
		body = handle_additional_text(additional_text, body, SUB_COMMENT_ID);

		await createComment(octokit, repo, pr_number, body);
	} else {
		const comment = comments.data.find((comment) =>
			comment.body?.includes(COMMENT_ID)
		);
		if (comment) {
			if (comment.body?.includes(COMMENT_ID)) {
				let body = process_body(comment.body, message, COMMENT_ID);
				body = handle_additional_text(additional_text, body, SUB_COMMENT_ID);
				await update_pr_comment(octokit, repo, pr_number, comment.id, body);
			} else {
				let body = process_body(null, message, COMMENT_ID);
				body = handle_additional_text(additional_text, body, SUB_COMMENT_ID);

				await update_pr_comment(octokit, repo, pr_number, comment.id, body);
			}
		} else {
			let body = process_body(null, message, COMMENT_ID);
			body = handle_additional_text(additional_text, body, SUB_COMMENT_ID);
			await createComment(octokit, repo, pr_number, body);
		}
	}
}

run();

async function createComment(
	client: Octokit,
	repo: {
		owner: string;
		repo: string;
	},

	pr_number: number,
	body: string
) {
	if (!pr_number) {
		core.setFailed("No PR number found.");
		return;
	}

	await client.rest.issues.createComment({
		...repo,
		issue_number: pr_number,
		body,
	});
}

function make_additional_text(message: string, id: string) {
	return `<!-- BEGIN_MESSAGE: ${id} -->\n${message}\n<!-- END_MESSAGE: ${id} -->`;
}

function handle_additional_text(
	additional_text: string | null,
	body: string,
	id: string
) {
	let _body = body;
	if (body.includes(id)) {
		if (additional_text?.trim() === "") return body;
		if (additional_text !== null) {
			_body = body.replace(
				new RegExp(
					`<!-- BEGIN_MESSAGE: ${id} -->.*<!-- END_MESSAGE: ${id} -->`,
					"s"
				),
				make_additional_text(additional_text, id)
			);
		} else {
			_body = body.replace(
				new RegExp(
					`\n---\n<!-- BEGIN_MESSAGE: ${id} -->.*<!-- END_MESSAGE: ${id} -->`,
					"s"
				),
				""
			);
		}
	} else if (additional_text !== null) {
		_body += `\n---\n${make_additional_text(additional_text, id)}`;
	}

	return _body;
}

async function update_pr_comment(
	client: Octokit,
	repo: {
		owner: string;
		repo: string;
	},
	pr_number: number,
	comment_id: number,
	body: string
) {
	await client.rest.issues.updateComment({
		...repo,
		issue_number: pr_number,
		body,
		comment_id,
	});
}

const order = [
	"**Spaces**",
	"**Website**",
	"**Storybook**",
	"**Visual tests**",
	"**Changes**",
	"**Notebooks**",
];

function process_body(body: string | null, message: string, id: string) {
	let table_lines: string[] = [];
	let _other_lines: string[] = [];
	if (body) {
		const [first_part, ...rest] = body.split("\n---\n");
		_other_lines = rest;
		table_lines = first_part
			.substring(first_part.indexOf("|"))
			.split("\n")
			.slice(2)
			.filter((l) => l.trim() !== "");
	}

	const processed_message = Object.entries(parse_message(message));

	for (const [, value] of processed_message) {
		const line_index = table_lines.findIndex((line) =>
			line.includes(value.name)
		);
		if (line_index === -1) {
			table_lines.push(make_line(value));
		} else {
			table_lines[line_index] = make_line(value);
		}
	}

	const sorted_table_lines = table_lines.sort((a, b) => {
		const a_index = order.findIndex((o) => a.includes(o));
		const b_index = order.findIndex((o) => b.includes(o));
		return a_index - b_index;
	});

	return `${id}

## 🪼 branch checks and previews

| • | Name | Status | URL |
|:---:|:---|:---|:---|
${sorted_table_lines.join("\n")}

${_other_lines.length ? `---\n${_other_lines.join("\n---\n")}` : ""}`.trim();
}

function make_line({
	icon,
	name,
	status_icon,
	message,
	url,
}: {
	icon: string[];
	name: string;
	status_icon: string;
	message: string;
	url: null | { text: string; url: string };
}) {
	return `| ${icon
		.map(make_icon)
		.join("")} | **${name}** | ${status_icon} ${message} | ${
		url ? `[${url.text}](${url.url})` : ""
	} |`;

	function make_icon(icon_str: string) {
		return icon_str.startsWith("http")
			? `![](${icon_str})`
			: icon_str.startsWith("<")
			? icon_str
			: icon_str;
	}
}

function parse_message(message: string) {
	const message_parts = message.split("\n").map((l) =>
		l
			.trim()
			.split("~")
			.map((l) => l.trim())
	);
	const message_dict = message_parts.reduce((acc, [key, ...value]) => {
		acc[key] = handle_parts(value, key);
		return acc;
	}, {} as Record<string, any>);

	return message_dict;
}
const icons = {
	website: [
		"https://user-images.githubusercontent.com/12937446/258895361-54b18c11-8562-4ce9-8a9f-46a168df6a70.svg#gh-light-mode-only",
		"https://user-images.githubusercontent.com/12937446/258895359-4772e11f-94bd-47b4-8f69-31fb087f3979.svg#gh-dark-mode-only",
	],
	spaces: [
		"https://user-images.githubusercontent.com/12937446/258895625-3c5788d0-529d-45c2-b850-d33299a7569e.svg",
	],
	storybook: [
		`<img src="https://github.com/pngwn/MDsveX/assets/12937446/22b898c8-c386-4f0f-adef-0f2d09fc8e81.svg" height="20px" />`,
	],
	visual: [
		"https://user-images.githubusercontent.com/12937446/258896371-3e900c2f-457f-4d0a-921f-f9b6af1c7072.svg",
	],
	notebooks: [":notebook:"],
	changes: [":unicorn:"],
};

const status_icons = {
	success: ":white_check_mark:",
	failure: ":x:",
	pending: ":hourglass_flowing_sand:",
	warning: ":warning:",
};

const status_text = {
	success: "ready!",
	failure: "failed!",
	pending: "building...",
	warning: "warning!",
};

type status = "success" | "failure" | "pending" | "warning";

function handle_parts(parts: string[], key: string) {
	switch (key) {
		case "website":
		case "spaces":
		case "storybook":
			return {
				icon: icons[key],
				name: `${key[0].toUpperCase()}${key.substring(1)}`,
				status_icon: status_icons[parts[0] as status],
				message: status_text[parts[0] as status],
				url:
					parts[1].trim() === "null"
						? null
						: {
								url: parts[1],
								text: `${key[0].toUpperCase()}${key.substring(1)} preview`,
						  },
			};
		case "changes":
			return {
				icon: icons[key],
				name: `${key[0].toUpperCase()}${key.substring(1)}`,
				status_icon: status_icons[parts[0] as status],
				message:
					parts[0] === "pending"
						? "detecting..."
						: parts[0] === "success"
						? "detected!"
						: status_text[parts[0] as status],
				url:
					parts[1].trim() === "null"
						? null
						: {
								url: parts[1],
								text: `Workflow log`,
						  },
			};
		case "notebooks":
			const message =
				parts[0] === "success"
					? "matching!"
					: parts[0] === "pending"
					? "checking..."
					: "not matching!";
			return {
				icon: icons[key],
				name: `${key[0].toUpperCase()}${key.substring(1)}`,
				status_icon: status_icons[parts[0] as status],
				message,
				url: null,
			};
		case "visual":
			const [_status, tests, reviews, url] = parts;
			const status =
				_status === "pending"
					? "pending"
					: parseInt(tests) > 1
					? "failure"
					: parseInt(reviews) > 1
					? "warning"
					: "success";

			return {
				icon: icons[key],
				name: `Visual tests`,
				status_icon: status_icons[status],
				message:
					_status === "pending"
						? status_text[_status]
						: format_visual(parseInt(tests), parseInt(reviews)),
				url:
					url.trim() === "null"
						? null
						: {
								url,
								text: "Build review",
						  },
			};
	}
}

function format_visual(tests: number, reviews: number) {
	let str = [];
	if (tests > 0) {
		str.push(`**${tests}** failing test${tests > 1 ? "s" : ""}`);
	}
	if (reviews > 0) {
		str.push(`**${reviews}** change${reviews > 1 ? "s" : ""} to review`);
	}

	return str.length ? str.join(" — ") : "all good!";
}
