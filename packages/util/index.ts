import * as core from "@actions/core";

import { createRepo, commit } from "@huggingface/hub";
import type { RepoId, Credentials } from "@huggingface/hub";

const src = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<title>My static Space</title>
		<link rel="stylesheet" href="style.css" />
	</head>
	<body>
		<div class="card">
			<h1>Hello from @huggingface/hub!</h1>
		</div>
	</body>
</html>`;

async function run() {
	const repo: RepoId = {
		name: "pngwn/test-repo",
		type: "space",
	};

	const credentials: Credentials = {
		accessToken: "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",
	};
	try {
		const res = await createRepo({ repo, credentials });
	} catch (e) {
		console.log(e);
	}

	// console.log(res)
	await commit({
		repo,
		credentials,
		title: "Add model file",
		operations: [
			{
				operation: "addOrUpdate",
				path: "index.html",
				content: new Blob([src]), // Can work with native File in browsers
			},
		],
	});

	// const r2 = res.json()
}

console.log("hello");
run();
