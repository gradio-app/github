import { mkdir, copyFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import recursive_read_dir from "recursive-readdir";

import { getPackagesSync } from "@manypkg/get-packages";

const __dirname = dirname(fileURLToPath(import.meta.url));

const action_target = (pkg) => join(__dirname, "actions", pkg);
const action_src = (pkg) => join(__dirname, "packages", pkg);

async function copy_dist(pkg_name, pkg_dir) {
	let files;
	let pkg_src = action_src(pkg_name);
	let pkg_dest = action_target(pkg_name);
	try {
		files = await recursive_read_dir(join(pkg_dir, "dist"), ["node_modules"]);
	} catch (e) {
		console.error(e);
	}

	await mkdir(join(pkg_dest, "dist"), {
		recursive: true,
	});

	await copyFile(join(pkg_src, "action.yml"), join(pkg_dest, "action.yml"));

	await Promise.all(
		files.map((f) => {
			const dest_file = f.replace(pkg_src, pkg_dest);
			return copyFile(f, dest_file);
		})
	);

	console.log({ pkg_name, pkg_src, pkg_dest, files });

	console.log(`"${pkg_name}" action folder created."`);
	const new_f = await recursive_read_dir(pkg_dest, ["node_modules"]);

	console.log(new_f);
}

async function handle_packages() {
	const { packages: pkgs } = getPackagesSync(process.cwd());

	const action_packages = pkgs
		.filter((p) => p.packageJson.name.startsWith("@gradio-action/"))
		.map((p) => ({
			name: p.packageJson.name.replace("@gradio-action/", ""),
			path: p.dir,
		}));

	console.log(action_packages);

	await Promise.all(
		action_packages.map(({ name, path }) => copy_dist(name, path))
	);
}

handle_packages();
