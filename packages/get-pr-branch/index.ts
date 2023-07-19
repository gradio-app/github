import { getInput, setOutput, setFailed, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

	try {
		const {
			repository: {
				pullRequest: {
					headRefName: pr_head_branch,
					headRepositoryOwner: { login: pr_repo_owner },
					headRepository: { name: pr_repo_name },
				},
			},
		} = (await octokit.graphql(`{
			repository(name: "${repo}", owner: "${owner}") {
				pullRequest(number: 9) {
					id
					headRefName
					headRepositoryOwner {
						login
					}
					headRepository {
						name
					}
				}
			}
		}`)) as any;

		setOutput("pr_repo", `${pr_repo_owner}/${pr_repo_name}`);
		setOutput("pr_branch", pr_head_branch);
	} catch (e: any) {
		warning("Could not determine PR branch and repository.");
		setFailed(e.message);
	}
}

run();
