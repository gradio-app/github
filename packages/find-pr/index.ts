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

async function run() {
	console.log(JSON.stringify(context, null, 2));
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

	const open_pull_requests = await get_prs(octokit, repo, owner);

	if (context.eventName === "push") {
		const [source_repo, source_branch, pr_number, sha, mergeable, merge_sha] =
			get_pr_details_from_sha(open_pull_requests);

		if (mergeable === "CONFLICTING" || mergeable === "UNKNOWN") {
			setOutput("mergeable", false);
		} else if (mergeable === "MERGEABLE") {
			setOutput("mergeable", true);
			setOutput("merge_sha", merge_sha);
		}

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("sha", sha);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	} else if (context.eventName === "pull_request") {
		const source_repo = context.payload.pull_request?.head.repo.full_name;
		const source_branch = context.payload.pull_request?.head.ref;
		const pr_number = context.payload.pull_request?.number;

		setOutput("mergeable", context.payload.pull_request?.mergeable);
		setOutput("merge_sha", context.payload.pull_request?.merge_commit_sha);
		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("sha", context.payload.pull_request?.head.sha);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	} else if (context.eventName === "issue_comment") {
		const [source_repo, source_branch, pr_number, sha, mergeable, merge_sha] =
			get_pr_details_from_number(
				open_pull_requests,
				context.payload.issue?.number
			);

		if (mergeable === "CONFLICTING" || mergeable === "UNKNOWN") {
			setOutput("mergeable", false);
		} else if (mergeable === "MERGEABLE") {
			setOutput("mergeable", true);
			setOutput("merge_sha", merge_sha);
		}

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("sha", sha);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
		return;
	}

	if (!context.payload.workflow_run) return;

	if (
		context.payload.workflow_run.event === "pull_request" ||
		context.payload.workflow_run.event === "push"
	) {
		const [source_repo, source_branch, pr_number, sha, mergeable, merge_sha] =
			get_pr_details_from_refs(open_pull_requests);

		if (mergeable === "CONFLICTING" || mergeable === "UNKNOWN") {
			setOutput("mergeable", false);
		} else if (mergeable === "MERGEABLE") {
			setOutput("mergeable", true);
			setOutput("merge_sha", merge_sha);
		}

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("sha", sha);
		setOutput("found_pr", !!(source_repo && source_branch && pr_number));
	} else if (context.payload.workflow_run.event === "issue_comment") {
		const title = context.payload.workflow_run?.display_title;
		const [source_repo, source_branch, pr_number, sha, mergeable, merge_sha] =
			get_pr_details_from_title(open_pull_requests, title);

		if (mergeable === "CONFLICTING" || mergeable === "UNKNOWN") {
			setOutput("mergeable", false);
		} else if (mergeable === "MERGEABLE") {
			setOutput("mergeable", true);
			setOutput("merge_sha", merge_sha);
		}

		setOutput("source_repo", source_repo);
		setOutput("source_branch", source_branch);
		setOutput("pr_number", pr_number);
		setOutput("sha", sha);
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

type PRDetails = [
	string | undefined,
	string | undefined,
	number | undefined,
	string | undefined,
	"MERGEABLE" | "CONFLICTING" | "UNKNOWN" | undefined,
	string | undefined,
];

function get_pr_details_from_number(
	pull_requests: PullRequests,
	pr_number: number | undefined
): PRDetails {
	if (!pr_number)
		return [undefined, undefined, undefined, undefined, undefined, undefined];
	const [source_repo, source_branch, , sha, mergeable, merge_sha] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.headRefOid,
			pr.node.mergeable,
			pr.node.potentialMergeCommit.oid,
		]) as [
			string,
			string,
			number,
			string,
			"MERGEABLE" | "CONFLICTING" | "UNKNOWN",
			string,
		][]
	).find(([, , number]) => number === pr_number) || [
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
	];

	return [source_repo, source_branch, pr_number, sha, mergeable, merge_sha];
}

function get_pr_details_from_sha(pull_requests: PullRequests): PRDetails {
	const head_sha: string = context.payload.head_commit?.id;

	const [source_repo, source_branch, pr_number, , mergeable, merge_sha] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.headRefOid,
			pr.node.mergeable,
			pr.node.potentialMergeCommit.oid,
		]) as [
			string,
			string,
			number,
			string,
			"MERGEABLE" | "CONFLICTING" | "UNKNOWN",
			string,
		][]
	).find(([, , , headRefOid]) => headRefOid === head_sha) || [
		context.payload.repository?.full_name,
		context.payload.ref?.split("/").slice(2).join("/"),
		undefined,
		undefined,
		undefined,
	];

	return [
		source_repo,
		source_branch,
		pr_number,
		head_sha,
		mergeable,
		merge_sha,
	];
}

function get_pr_details_from_title(
	pull_requests: PullRequests,
	title: string
): PRDetails {
	const [source_repo, source_branch, pr_number, sha, , mergeable, merge_sha] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.headRefOid,
			pr.node.title,
			pr.node.mergeable,
			pr.node.potentialMergeCommit.oid,
		]) as [
			string,
			string,
			number,
			string,
			string,
			"MERGEABLE" | "CONFLICTING" | "UNKNOWN",
			string,
		][]
	).find(([, , , , _title]) => _title === title) || [
		undefined,
		undefined,
		undefined,
		undefined,
	];

	return [source_repo, source_branch, pr_number, sha, mergeable, merge_sha];
}

function get_pr_details_from_refs(pull_requests: PullRequests): PRDetails {
	const source_repo: string | undefined =
		context.payload.workflow_run?.head_repository?.full_name || undefined;
	const source_branch: string | undefined =
		context.payload.workflow_run?.head_branch || undefined;
	const _sha = context.payload.workflow_run?.head_sha || undefined;

	const [, , pr_number, sha, mergeable, merge_sha] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
			pr.node.headRefOid,
			pr.node.mergeable,
			pr.node.potentialMergeCommit.oid,
		]) as [
			string,
			string,
			number,
			string,
			"MERGEABLE" | "CONFLICTING" | "UNKNOWN",
			string,
		][]
	).find(
		([repo, branch]) => source_repo === repo && source_branch === branch
	) || [undefined, undefined, undefined, _sha, undefined, undefined];

	return [source_repo, source_branch, pr_number, sha, mergeable, merge_sha];
}
