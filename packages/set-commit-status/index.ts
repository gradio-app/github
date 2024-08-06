import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const sha = getInput("sha");
	const name = getInput("name") || "Unknown Workflow";
	const url = getInput("url");
	const run_id = getInput("run_id");

	const octokit = getOctokit(token);

	const workflow_run = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: parseInt(run_id),
	});

	const message = "Skipped — No changes detected";

	const res = await octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state: "success",
		description: message,
		context: name,
		target_url: url || workflow_run.data.html_url,
	});
	console.log({ sha, name, url});
	console.log(JSON.stringify(workflow_run, null, 2));
	console.log(JSON.stringify(res, null, 2));
}

run();
