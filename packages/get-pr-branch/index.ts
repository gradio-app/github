import { getInput, setOutput, setFailed, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";

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
				};
			}[];
		};
	};
}

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

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
				}
			}
		}
	}
}`);

		const source_repo =
			context.payload.workflow_run?.head_repository?.full_name;
		const source_branch = context.payload.workflow_run?.head_branch;

		if (!source_repo || !source_branch) {
			setFailed("Could not determine source repository and branch.");
		}

		const [, , pr_number] = (
			open_pull_requests.map((pr) => [
				pr.node.headRepository.nameWithOwner,
				pr.node.headRefName,
				pr.node.number,
			]) as [string, string, number][]
		).find(
			([repo, branch]) => source_repo === repo && source_branch === branch
		) || [null, null, null];

		if (!pr_number) {
			setFailed("Could not determine PR number.");
		}

		setOutput("pr_number", pr_number);
	} catch (e: any) {
		warning("Could not determine PR number branch and repository.");
		setFailed(e.message);
	}
}

run();
