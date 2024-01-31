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
					mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN";
					potentialMergeCommit: {
						oid: string;
					};
					title: string;
				};
			}[];
		};
	};
}

type PullRequests = PullRequestResponse["repository"]["pullRequests"]["edges"];

interface Outputs {
	source_repo: string | false;
	source_branch: string | false;
	pr_number: number | false;
	sha: string | false;
	mergeable: boolean;
	merge_sha: string | false;
	found_pr: boolean;
}

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

	const outputs: Outputs = {
		source_repo: false,
		source_branch: false,
		pr_number: false,
		sha: false,
		mergeable: false,
		merge_sha: false,
		found_pr: false,
	};

	const open_pull_requests = await get_prs(octokit, repo, owner);

	if (context.eventName === "push") {
		const { source_repo, source_branch, pr_number, sha, mergeable, merge_sha } =
			get_pr_details_from_sha(open_pull_requests);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
	} else if (context.eventName === "pull_request") {
		const source_repo = context.payload.pull_request?.head.repo.full_name;
		const source_branch = context.payload.pull_request?.head.ref;
		const pr_number = context.payload.pull_request?.number;

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = context.payload.pull_request?.head.sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = context.payload.pull_request?.mergeable === true;
		outputs.merge_sha =
			context.payload.pull_request?.merge_commit_sha || outputs.sha || false;
	} else if (context.eventName === "issue_comment") {
		const { source_repo, source_branch, pr_number, sha, mergeable, merge_sha } =
			get_pr_details_from_number(
				open_pull_requests,
				context.payload.issue?.number
			);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
	}

	if (!context.payload.workflow_run) {
		setFailed(
			"This action must be run from the following events: pull_request, pull_request_target, push, workflow_run."
		);
		return;
	}

	if (
		context.payload.workflow_run.event === "pull_request" ||
		context.payload.workflow_run.event === "push"
	) {
		const { source_repo, source_branch, pr_number, sha, mergeable, merge_sha } =
			get_pr_details_from_refs(open_pull_requests);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
	} else if (context.payload.workflow_run.event === "issue_comment") {
		const title = context.payload.workflow_run?.display_title;
		const { source_repo, source_branch, pr_number, sha, mergeable, merge_sha } =
			get_pr_details_from_title(open_pull_requests, title);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
	} else {
		setFailed(
			"This action can only be run on pull_request, push, or issue_comment events."
		);
	}

	for (const [key, value] of Object.entries(outputs)) {
		setOutput(key, value);
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
					mergeable
					potentialMergeCommit {
						oid
					}
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

interface PRDetails {
	source_repo: string | undefined;
	source_branch: string | undefined;
	pr_number: number | undefined;
	sha: string | undefined;
	mergeable: "MERGEABLE" | "CONFLICTING" | "UNKNOWN" | undefined;
	merge_sha: string | undefined;
	title: string | undefined;
}

const empty_pr_details: PRDetails = {
	source_repo: undefined,
	source_branch: undefined,
	pr_number: undefined,
	sha: undefined,
	mergeable: undefined,
	merge_sha: undefined,
	title: undefined,
};

function get_pr_details_from_number(
	pull_requests: PullRequests,
	pr_number: number | undefined
): PRDetails {
	if (!pr_number) return empty_pr_details;
	const outputs =
		(
			pull_requests.map((pr) => ({
				source_repo: pr.node.headRepository.nameWithOwner,
				source_branch: pr.node.headRefName,
				pr_number: pr.node.number,
				sha: pr.node.headRefOid,
				mergeable: pr.node.mergeable,
				merge_sha: pr.node.potentialMergeCommit?.oid,
			})) as PRDetails[]
		).find(({ pr_number: number }) => number === pr_number) || empty_pr_details;

	return outputs;
}

function get_pr_details_from_sha(pull_requests: PullRequests): PRDetails {
	const head_sha: string = context.payload.head_commit?.id;

	const outputs = (
		pull_requests.map((pr) => ({
			source_repo: pr.node.headRepository.nameWithOwner,
			source_branch: pr.node.headRefName,
			pr_number: pr.node.number,
			sha: pr.node.headRefOid,
			mergeable: pr.node.mergeable,
			merge_sha: pr.node.potentialMergeCommit?.oid,
		})) as PRDetails[]
	).find(({ sha }) => sha === head_sha) || {
		source_repo: context.payload.repository?.full_name,
		source_branch: context.payload.ref?.split("/").slice(2).join("/"),
		sha: head_sha,
	};

	return { ...empty_pr_details, ...outputs };
}

function get_pr_details_from_title(
	pull_requests: PullRequests,
	title: string
): PRDetails {
	const outputs =
		(
			pull_requests.map((pr) => ({
				source_repo: pr.node.headRepository.nameWithOwner,
				source_branch: pr.node.headRefName,
				pr_number: pr.node.number,
				sha: pr.node.headRefOid,
				mergeable: pr.node.mergeable,
				merge_sha: pr.node.potentialMergeCommit?.oid,
				title: pr.node.title,
			})) as PRDetails[]
		).find(({ title: _title }) => _title === title) || empty_pr_details;

	return { ...outputs, title };
}

function get_pr_details_from_refs(pull_requests: PullRequests): PRDetails {
	const source_repo: string | undefined =
		context.payload.workflow_run?.head_repository?.full_name || undefined;
	const source_branch: string | undefined =
		context.payload.workflow_run?.head_branch || undefined;
	const _sha = context.payload.workflow_run?.head_sha || undefined;

	const outputs =
		(
			pull_requests.map((pr) => ({
				source_repo: pr.node.headRepository.nameWithOwner,
				source_branch: pr.node.headRefName,
				pr_number: pr.node.number,
				sha: pr.node.headRefOid,
				mergeable: pr.node.mergeable,
				merge_sha: pr.node.potentialMergeCommit?.oid,
				title: pr.node.title,
			})) as PRDetails[]
		).find(
			({ source_repo: repo, source_branch: branch }) =>
				source_repo === repo && source_branch === branch
		) || empty_pr_details;

	return { ...outputs, sha: _sha };
}
