import { getInput, info, warning } from "@actions/core";
import { exec } from "@actions/exec";
import { type Packages, getPackagesSync } from "@manypkg/get-packages";
import { context } from "@actions/github";
import { request } from "undici";
import { promises as fs } from "fs";
import { join } from "path";

import * as files from "./requirements";

async function run() {
	const { packages } = getPackagesSync(process.cwd());
	type PackageJson = Packages["packages"][0]["packageJson"];
	const python_packages = packages.filter(
		(p) => (p.packageJson as PackageJson & { python: boolean }).python
	);

	const user = getInput("user");
	const passwords = getInput("passwords");

	const packages_to_publish = (
		await Promise.all(
			python_packages.map(async (p) => {
				const package_name = p.packageJson.name;
				const version = p.packageJson.version;

				const exists = await check_version_exists(package_name, version);

				if (exists) {
					warning(
						`${package_name}@${version} already exists on PyPI. Aborting publish.`
					);
					return false;
				}

				info(`Publishing ${package_name}@${version} to PyPI`);
				return p;
			})
		)
	).filter(Boolean) as Packages["packages"];

	if (packages_to_publish.length === 0) {
		info("No packages to publish.");
		return;
	}

	const pws = passwords
		.trim()
		.split("\n")
		.reduce((acc, next) => {
			const [pkg, pwd] = next.split(":");
			return {
				...acc,
				[pkg]: pwd,
			};
		}, {});

	info("Installing prerequisites.");
	await fs.mkdir("_action_temp/requirements", { recursive: true });

	await Promise.all(
		Object.values(files).map(([name, content]) =>
			fs.writeFile(`_action_temp/requirements/${name}`, content)
		)
	);

	await exec(
		"pip",
		[
			"install",
			"twine",
			"--user",
			"--upgrade",
			"--no-cache-dir",
			"-r",
			"_action_temp/requirements/runtime-prerequisites.in",
		],
		{
			env: {
				...process.env,
				PIP_CONSTRAINT: "_action_temp/requirements/runtime-prerequisites.txt",
			},
		}
	);

	await exec(
		"pip",
		[
			"install",
			"--user",
			"--upgrade",
			"--no-cache-dir",
			"--prefer-binary",
			"-r",
			"_action_temp/requirements/runtime.in",
		],
		{
			env: {
				...process.env,
				PIP_CONSTRAINT: "_action_temp/requirements/runtime.txt",
			},
		}
	);

	await exec("pip", ["install", "secretstorage", "dbus-python"]);

	let publishes: boolean[] = [];
	for await (const p of packages_to_publish) {
		info(`Publishing ${p.packageJson.name}@${p.packageJson.version} to PyPI`);
		//@ts-ignore
		publishes.push(await publish_package(user, pws[p.packageJson.name], p.dir));
	}

	publishes.map((p, i) => {
		if (p) {
			info(`Published ${packages_to_publish[i].packageJson.name}`);
		} else {
			warning(
				`Failed to publish ${packages_to_publish[i].packageJson.name}@${packages_to_publish[i].packageJson.version}`
			);
		}
	});

	await fs.rmdir("_action_temp", { recursive: true });
}

run();

async function check_version_exists(package_name: string, version: string) {
	const { statusCode, body } = await request(
		`https://pypi.org/pypi/${package_name}/json`
	);

	if (statusCode !== 200) {
		warning(`Could not find package: ${package_name} on PyPI.`);
		return false;
	}

	const data = await body.json();

	return version in data.releases;
}

async function publish_package(user: string, password: string, dir: string) {
	try {
		await exec("sh", [join(dir, "..", "build_pypi.sh")]);
		await exec("twine", [
			"upload",
			"-u",
			user,
			"-p",
			password,
			`${join(dir, "..")}/dist/*`,
		]);
		await exec("rm", ["-rf", `${join(dir, "..")}/dist/*`]);
		await exec("rm", ["-rf", `${join(dir, "..")}/build/*`]);

		return true;
	} catch (e: any) {
		warning(e);
		return false;
	}
}
