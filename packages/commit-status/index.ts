import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const token = getInput("token");
	const pr = getInput("pr");
	const sha = getInput("sha");
	const result = getInput("result");
	const name = getInput("name");
	const init = getInput("init");
	const changes = getInput("changes") || "[]";
	const type = getInput("type");
	const job_id = getInput("job_id");
	const mergeable = getInput("mergeable");

	console.log({
		token,
		pr,
		sha,
		result,
		name,
		init,
		changes,
		type,
		job_id,
		mergeable,
	});
	const octokit = getOctokit(token);

	let _workflow_name = name || context.workflow || "Unknown Workflow";

	const workflow_run = await octokit.rest.actions.getWorkflowRun({
		owner: context.repo.owner,
		repo: context.repo.repo,
		run_id: context.runId,
	});

	if (init === "true") {
		const has_changes = JSON.parse(changes).includes(type) || type == "all";

		if (type == "gradio" || type == "python-client") {
			const context = has_changes
				? "Running checks"
				: "Skipped — No changes detected";
			const result = has_changes ? "pending" : "success";

			["3.8", "3.10"].forEach((version) => {
				create_commit_status(
					octokit,
					sha,
					mergeable === "true" ? result : "failure",
					`test / ${type == "gradio" ? "" : "client / "}python ${version} `,
					mergeable === "true"
						? context
						: "Cannot check out PR as it is not mergeable",
					workflow_run.data.html_url,
				);
			});
		} else {
			const context = has_changes
				? "Running checks"
				: "Skipped — No changes detected";
			const result = has_changes ? "pending" : "success";
			create_commit_status(
				octokit,
				sha,
				mergeable === "true" ? result : "failure",
				_workflow_name,
				mergeable === "true"
					? context
					: "Cannot check out PR as it is not mergeable",
				workflow_run.data.html_url,
			);
		}

		return;
	}

	let state: "pending" | "success" | "failure" | "error" = "pending";

	if (!result) {
		state = "failure";
	}

	if (result === "success") {
		state = "success";
	} else if (result === "failure") {
		state = "failure";
	} else if (result === "cancelled") {
		state = "pending";
	} else if (result === "skipped") {
		state = "success";
	} else {
		state = "error";
	}

	console.log({ state, result, _workflow_name });

	let jobs: Awaited<
		ReturnType<typeof octokit.rest.actions.listJobsForWorkflowRun>
	> | null = null;

	try {
		jobs = await octokit.rest.actions.listJobsForWorkflowRun({
			owner: context.repo.owner,
			repo: context.repo.repo,
			run_id: context.runId,
		});
	} catch (error) {
		console.log(error);
	}

	const { html_url, started_at } = jobs?.data.jobs.find(
		(job) => job.name === job_id,
	) || { html_url: null, created_at: null };

	const current = new Date().toISOString();

	const duration = started_at
		? `${state === "success" ? "Successful in" : "Failed after"} ${get_duration(
				current,
				started_at,
		  )}`
		: `${state === "success" ? "Successful" : "Failed"}`;

	create_commit_status(
		octokit,
		sha,
		state,
		_workflow_name,
		duration,
		html_url || workflow_run.data.html_url,
	);
}

run();

function create_commit_status(
	octokit: ReturnType<typeof getOctokit>,
	sha: string,
	state: "pending" | "success" | "failure" | "error",
	_workflow_name: string,
	description: string,
	target_url?: string,
) {
	octokit.rest.repos.createCommitStatus({
		owner: context.repo.owner,
		repo: context.repo.repo,
		sha,
		state,
		description,
		context: _workflow_name,
		target_url,
	});
}

function get_duration(date1: string, date2: string) {
	var diff = new Date(date1).getTime() - new Date(date2).getTime();
	return format_milliseconds(diff);
}

function format_milliseconds(milliseconds: number): string {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	if (minutes === 0) {
		return `${seconds}s`;
	} else {
		return `${minutes}m${seconds}s`;
	}
}
