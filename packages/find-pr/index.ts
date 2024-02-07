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
					labels: {
						nodes: {
							name: string;
						}[];
					};
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
	labels: string[];
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
		labels: [],
	};

	const open_pull_requests = await get_prs(octokit, repo, owner);

	if (context.eventName === "push") {
		const {
			source_repo,
			source_branch,
			pr_number,
			sha,
			mergeable,
			merge_sha,
			labels,
		} = get_pr_details_from_sha(open_pull_requests);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
		outputs.labels = labels;
	} else if (context.eventName === "pull_request") {
		console.log(
			"PULL REQUEST",
			JSON.stringify(context.payload.pull_request, null, 2)
		);
		const source_repo = context.payload.pull_request?.head.repo.full_name;
		const source_branch = context.payload.pull_request?.head.ref;
		const pr_number = context.payload.pull_request?.number;

		const mergeable =
			open_pull_requests.find(({ node: { number } }) => number === pr_number)
				?.node.mergeable === "MERGEABLE";

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = context.payload.pull_request?.head.sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable;
		outputs.merge_sha =
			context.payload.pull_request?.merge_commit_sha || outputs.sha || false;
		outputs.labels =
			(context.payload.pull_request?.labels as { name: string }[])?.map(
				({ name }) => name
			) || [];
	} else if (context.eventName === "issue_comment") {
		const {
			source_repo,
			source_branch,
			pr_number,
			sha,
			mergeable,
			merge_sha,
			labels,
		} = get_pr_details_from_number(
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
		outputs.labels = labels;
	}

	console.log("EVENT NAME", context.eventName);
	console.log("WORKFLOW EVENT TYPE", context.payload?.workflow_run?.event);

	if (
		context.payload?.workflow_run?.event === "pull_request" ||
		context.payload?.workflow_run?.event === "push"
	) {
		const {
			source_repo,
			source_branch,
			pr_number,
			sha,
			mergeable,
			merge_sha,
			labels,
		} = get_pr_details_from_refs(open_pull_requests);

		console.log({
			source_repo,
			source_branch,
			pr_number,
			sha,
			mergeable,
			merge_sha,
		});

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
		outputs.labels = labels;
	} else if (context.payload?.workflow_run?.event === "issue_comment") {
		const title = context.payload.workflow_run?.display_title;
		const {
			source_repo,
			source_branch,
			pr_number,
			sha,
			mergeable,
			merge_sha,
			labels,
		} = get_pr_details_from_title(open_pull_requests, title);

		outputs.source_repo = source_repo || false;
		outputs.source_branch = source_branch || false;
		outputs.pr_number = pr_number ?? false;
		outputs.sha = sha || false;
		outputs.found_pr = !!(source_repo && source_branch && pr_number);
		outputs.mergeable = mergeable === "MERGEABLE" ? true : false;
		outputs.merge_sha = merge_sha || sha || false;
		outputs.labels = labels;
	} else if (context.payload?.workflow_run?.event) {
		setFailed(
			"This action can only be run on pull_request, push, or issue_comment events or workflow_run events triggered from those events."
		);
	} else {
		outputs.found_pr = false;
		outputs.source_repo = `${owner}/${repo}`;
		outputs.source_branch = "main";
		outputs.pr_number = false;
		outputs.sha = context.sha;
		outputs.mergeable = false;
		outputs.merge_sha = context.sha;
		outputs.labels = [];
		warning(
			"This action is not being run from a pull_request, push, or issue_comment event or a workflow_run event triggered from those events and so everything is defaulting to 'main' branch."
		);
	}

	console.log("PULL_REQUESTS", JSON.stringify(open_pull_requests, null, 2));
	console.log("OUTPUTS", outputs);

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
					labels(first: 50) {
						nodes {
							name
						}
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
	labels: string[];
}

const empty_pr_details: PRDetails = {
	source_repo: undefined,
	source_branch: undefined,
	pr_number: undefined,
	sha: undefined,
	mergeable: undefined,
	merge_sha: undefined,
	title: undefined,
	labels: [],
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
				labels: pr.node.labels.nodes.map(({ name }) => name),
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
			labels: pr.node.labels.nodes.map(({ name }) => name),
		})) as PRDetails[]
	).find(({ sha }) => sha === head_sha) || {
		source_repo: context.payload.repository?.full_name,
		source_branch: context.payload.ref?.split("/").slice(2).join("/"),
		sha: head_sha,
	};

	console.log("get_pr_details_from_sha", outputs);

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
				labels: pr.node.labels.nodes.map(({ name }) => name),
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
				labels: pr.node.labels.nodes.map(({ name }) => name),
			})) as PRDetails[]
		).find(
			({ source_repo: repo, source_branch: branch }) =>
				source_repo === repo && source_branch === branch
		) || empty_pr_details;

	console.log("get_pr_details_from_refs", outputs);

	return { ...outputs, sha: _sha, source_repo, source_branch };
}
