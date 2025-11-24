import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import fs from "fs";
import path from "path";

const root = process.cwd();

const copy_all_demos = (
	source_dir: string,
	dest_dir: string,
	demos_to_copy: string[]
) => {
	for (const demo of demos_to_copy) {
		fs.cpSync(path.join(source_dir, demo), path.join(dest_dir, demo), {
			recursive: true,
			force: true,
		});
	}
};

function read_demos_from_json(json_path: string) {
	try {
		const data = fs.readFileSync(json_path, "utf8");
		return JSON.parse(data);
	} catch (error: any) {
		console.error(`Error reading demos from ${json_path}:`, error.message);
		process.exit(1);
	}
}

async function run() {
	const gradio_version = getInput("gradio_version");
	const gradio_client_version = getInput("gradio_client_version");
	const config_path =
		getInput("config_path") || path.join(root, ".config", "demos.json");

	if (!gradio_version || !gradio_client_version) {
		console.error(
			"Usage: node script.js <gradio_version> <gradio_client_version> [config_path]"
		);
		process.exit(1);
	}

	console.log(`Reading demos list from: ${config_path}`);
	const demos_to_copy = read_demos_from_json(config_path);

	const source_dir = path.join(root, "demo");
	const dest_dir = path.join(root, "demo", "all_demos", "demos");
	copy_all_demos(source_dir, dest_dir, demos_to_copy);

	const reqs_file_path = path.join(
		root,
		"demo",
		"all_demos",
		"requirements.txt"
	);
	const requirements = `
${gradio_client_version}
${gradio_version}
pypistats==1.1.0
plotly
matplotlib
altair
vega_datasets
	`.trim();

	fs.writeFileSync(reqs_file_path, requirements);

	console.log("Demos copied and requirements updated successfully.");
}

run();
