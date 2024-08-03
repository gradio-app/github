import { getInput, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFileSync } from "fs";
import { join } from "path";

import picomatch from "picomatch";

function match_filter(patterns: string[], files: string[]) {
	return files.some((file) => picomatch.isMatch(file, patterns));
}

async function run() {
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

	const result = match_filter(filter, files);

	console.log(result);

	setOutput("match", result);
}

run();

function parse_data(data: any): any[] {
	// If the data is an array, return that
	if (Array.isArray(data)) {
		return data;
	}

	// Some endpoints respond with 204 No Content instead of empty array
	//   when there is no data. In that case, return an empty array.
	if (!data) {
		return [];
	}

	// Otherwise, the array of items that we want is in an object
	// Delete keys that don't include the array of items
	delete data.incomplete_results;
	delete data.repository_selection;
	delete data.total_count;
	// Pull out the array of items
	const namespaceKey = Object.keys(data)[0];
	data = data[namespaceKey];

	return data;
}
