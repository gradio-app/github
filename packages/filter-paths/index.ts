import { getInput, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFileSync } from "fs";
import { join } from "path";

import picomatch from "picomatch";

function match_filter(patterns: string[], files: string[]) {
	return files.some((file) => picomatch.isMatch(file, patterns));
}

async function run() {
	console.log(JSON.stringify(context, null, 2));
	const filter_name = getInput("filter");
	const path = getInput("path") || ".github/filters.json";
	const token = getInput("token");

	const octokit = getOctokit(token);

	const full_path = join(process.cwd(), path);
	const filter_file = readFileSync(full_path, "utf-8");

	const filters = JSON.parse(filter_file) as Record<string, string[]>;
	if (!filters.hasOwnProperty(filter_name)) {
		throw new Error(`Unknown filter: ${filter_name}`);
	}
	const filter = filters[filter_name];

	let files: any[] = [];

	if (context.eventName === "pull_request") {
		for await (const response of octokit.paginate.iterator(
			octokit.rest.pulls.listFiles,
			{
				owner: context.repo.owner,
				repo: context.repo.repo,
				pull_number: context.payload.pull_request?.number as number,
				per_page: 100,
			}
		)) {
			files = [...files, ...parse_data(response.data)];
		}
	} else if (context.eventName === "push" || context.eventName === "workflow_dispatch") {
		const response = await octokit.rest.repos.getCommit({
			owner: context.repo.owner,
			repo: context.repo.repo,
			ref: context.ref,
		});
		files = [...files, ...parse_data(response.data.files)];
	} else {
		throw new Error("Unsupported event");
	}

	files = files.map((f) => f.filename);

	const result = match_filter(filter, files);

	console.log(result);

	setOutput("match", result);
}

run();

function parse_data(data: any): any[] {
	if (Array.isArray(data)) {
		return data;
	}

	if (!data) {
		return [];
	}

	delete data.incomplete_results;
	delete data.repository_selection;
	delete data.total_count;

	const namespace_key = Object.keys(data)[0];
	data = data[namespace_key];

	return data;
}
