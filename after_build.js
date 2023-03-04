import path from "path";

// import { readdir } from 'fs'
import { readdir, mkdir, readFile, copyFile } from "fs/promises";

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import recursive_read_dir from "recursive-readdir";

const __dirname = dirname(fileURLToPath(import.meta.url));

const action_target = (pkg) => join(__dirname, "actions", pkg);
const action_src = (pkg) => join(__dirname, "packages", pkg);

async function copy_dist(pkg) {
  let files;
  let pkg_src = action_src(pkg);
  let pkg_dest = action_target(pkg);
  try {
    files = await recursive_read_dir(join(pkg_src, "dist"), ["node_modules"]);
  } catch (e) {
    console.error(e);
  }

  await mkdir(join(pkg_dest, "dist"), {
    recursive: true,
  });
  const meta = await copyFile(
    join(pkg_src, "action.yml"),
    join(pkg_dest, "action.yml")
  );

  await Promise.all(
    files.map((f) => {
      const dest_file = f.replace(pkg_src, pkg_dest);
      return copyFile(f, dest_file);
    })
  );

  console.log(`"${pkg}" action folder created."`);
}

function read_file(f) {
  return new Promise((res) => {
    readFile(f, { encoding: "utf-8" }).then((d) =>
      res([f, JSON.parse(d).name])
    );
  });
}

async function handle_packages() {
  const pkgs = await recursive_read_dir(join(__dirname, "packages"), [
    "node_modules",
    "dist",
  ]);

  const meta = (
    await Promise.all(
      pkgs.filter((f) => f.endsWith("package.json")).map(read_file)
    )
  )
    .filter(([_, name]) => name.startsWith("@gradio-action/"))
    .map(([f, pkg]) => [f, pkg.replace("@gradio-action/", "")]);

  await Promise.all(meta.map((v) => copy_dist(v[1])));
}

handle_packages();
