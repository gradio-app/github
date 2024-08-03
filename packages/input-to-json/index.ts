import { getInput, setOutput } from "@actions/core";
import { writeFileSync } from "fs";
import { join } from "path";

async function run() {
	const path = getInput("path");
	try {
		const inputs: Record<string, any> = {};
		for (const key in process.env) {
			if (key.startsWith("INPUT_")) {
				const input_name = key.slice(6).toLowerCase();
				const parts = input_name.split(".");

				let current = inputs;
				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					if (i === parts.length - 1) {
						current[part] = process.env[key];
					} else {
						if (!current[part]) {
							current[part] = {};
						}
						current = current[part];
					}
				}
			}
		}

		const json = JSON.stringify(inputs, null, 2);
		const full_path = join(process.cwd(), path);

		writeFileSync(full_path, json, "utf-8");
		setOutput("path", full_path);
	} catch (error) {
		console.error(error);
		setOutput("path", "");
	}
}

run();
