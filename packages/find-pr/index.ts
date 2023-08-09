import { getInput, setOutput, setFailed, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";

type Client = ReturnType<typeof getOctokit>;

interface PullRequestResponse {
	repository: {
		pullRequests: {
			edges: {
				node: {
					number: number;
					headRepository: {
						nameWithOwner: string;
					};
					headRefName: string;
					headRefOid: string;
					title: string;
				};
			}[];
		};
	};
}

type PullRequests = PullRequestResponse["repository"]["pullRequests"]["edges"];

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

	const open_pull_requests = await get_prs(octokit, repo, owner);

	if (context.eventName === "push") {
		const [source_repo, source_branch, pr_number] =
			get_pr_details_from_sha(open_pull_requests);

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	} else if (context.eventName === "pull_request") {
		const source_repo = context.payload.pull_request?.head.repo.full_name;
		const source_branch = context.payload.pull_request?.head.ref;
		const pr_number = context.payload.pull_request?.number;

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	} else if (context.eventName === "issue_comment") {
		console.log(JSON.stringify(context, null, 2));
		const [source_repo, source_branch, pr_number] = get_pr_details_from_number(
			open_pull_requests,
			context.payload.issue?.number
		);

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	}

	if (!context.payload.workflow_run) return;

	if (
		context.payload.workflow_run.event === "pull_request" ||
		context.payload.workflow_run.event === "push"
	) {
		const [source_repo, source_branch, pr_number] =
			get_pr_details_from_refs(open_pull_requests);

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
	} else if (context.payload.workflow_run.event === "issue_comment") {
		const title = context.payload.workflow_run?.display_title;
		const [source_repo, source_branch, pr_number] = get_pr_details_from_title(
			open_pull_requests,
			title
		);

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
	} else {
		setFailed(
			"This action can only be run on pull_request, push, or issue_comment events."
		);
	}
}

run();

async function get_prs(octokit: Client, repo: string, owner: string) {
	let pull_requests: PullRequests = [];
	try {
		const {
			repository: {
				pullRequests: { edges: open_pull_requests },
			},
		}: PullRequestResponse = await octokit.graphql(`
{	
	repository(name: "${repo}", owner: "${owner}") {
		pullRequests(first: 50, states: OPEN) {
			edges {
				node {
					number
					headRepository {
						nameWithOwner
					}
					headRefName
					headRefOid
					title
				}
			}
		}
	}
}`);

		pull_requests = open_pull_requests;
	} catch (e: any) {
		setFailed(e.message);
	}

	return pull_requests;
}

function get_pr_details_from_number(
	pull_requests: PullRequests,
	pr_number: number | undefined
) {
	if (!pr_number) return [null, null, null];
	const [source_repo, source_branch] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
		]) as [string, string, number][]
	).find(([, , number]) => number === pr_number) || [null, null];

	return [source_repo, source_branch, pr_number];
}

function get_pr_details_from_sha(pull_requests: PullRequests) {
	const head_sha = context.payload.head_commit?.id;

	const [source_repo, source_branch, pr_number] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.headRefOid,
		]) as [string, string, number, string][]
	).find(([, , , headRefOid]) => headRefOid === head_sha) || [
		context.payload.repository?.full_name,
		context.payload.ref?.split("/").slice(2).join("/"),
		null,
	];

	return [source_repo, source_branch, pr_number];
}

function get_pr_details_from_title(pull_requests: PullRequests, title: string) {
	const [source_repo, source_branch, pr_number] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.title,
		]) as [string, string, number, string][]
	).find(([, , , _title]) => _title === title) || [null, null, null];

	return [source_repo, source_branch, pr_number];
}

function get_pr_details_from_refs(pull_requests: PullRequests) {
	const source_repo: string | null =
		context.payload.workflow_run?.head_repository?.full_name;
	const source_branch: string | null =
		context.payload.workflow_run?.head_branch;

	const [, , pr_number] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
		]) as [string, string, number][]
	).find(
		([repo, branch]) => source_repo === repo && source_branch === branch
	) || [null, null, null];

	return [source_repo, source_branch, pr_number];
}
