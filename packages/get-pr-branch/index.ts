import { getInput, setOutput, setFailed, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const pr = getInput("pr");
	const { repo, owner } = context.repo;

	const artifact = await octokit.rest.actions.listWorkflowRunArtifacts({
		owner,
		repo,
		run_id: context.runId,
	});

	const pr_artifact = artifact.data.artifacts.find((a) => a.name === "pr");

	if (!pr_artifact) {
		setFailed("Could not find PR artifact.");
		return;
	}

	const pr_number = (
		await octokit.rest.actions.downloadArtifact({
			owner: owner,
			repo: repo,
			artifact_id: pr_artifact.id,
			archive_format: "zip",
		})
	).data;

	console.log(pr_number);

	throw new Error("test");
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
				pullRequest(number: ${pr}) {
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

		setOutput("repo", `${pr_repo_owner}/${pr_repo_name}`);
		setOutput("branch", pr_head_branch);
	} catch (e: any) {
		warning("Could not determine PR branch and repository.");
		setFailed(e.message);
	}
}

run();
