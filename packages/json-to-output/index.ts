import { getInput, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFileSync } from "fs";
import { join } from "path";

async function run() {
	const path = getInput("path");

	const full_path = join(process.cwd(), path);

	const content = readFileSync(full_path, "utf-8");

	const json = JSON.parse(content);

	for (const key in json) {
		setOutput(key, json[key]);
	}
}

run();
