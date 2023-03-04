import { join } from "path";
import { readFile } from "fs/promises";
import "./fetch";
import { Blob } from "node:buffer";
//@ts-ignore
import recursive_read_dir from "recursive-readdir";

import * as core from "@actions/core";
import * as artifact from "@actions/artifact";

import { createRepo, commit } from "@huggingface/hub";
import type { RepoId, Credentials } from "@huggingface/hub";

import k from "kleur";

async function run() {
  const { hf_token, user_name, space_name, space_type, is_artifact, path } =
    handle_inputs();

  const cwd = process.env.GITHUB_WORKSPACE as string;
  let _path = join(cwd, path);

  if (is_artifact) {
    const artifact_client = artifact.create();
    await artifact_client.downloadArtifact(path, path);
  }

  const files: string[] = await recursive_read_dir(_path);
  const file_data: Array<[string, Buffer]> = await Promise.all(
    files.map(read_files(_path))
  );

  const repo: RepoId = {
    name: `${user_name}/${space_name}`,
    type: "space",
  };

  const credentials: Credentials = {
    accessToken: hf_token,
  };

  const x = k.cyan(user_name);
  const y = k.cyan(space_name);
  const formatted_repo = x + k.dim("/") + y;

  try {
    core.info(`Trying to create ${formatted_repo}.`);
    await createRepo({ repo, credentials });
  } catch (e: any) {
    if (e.statusCode === 409) {
      core.info(`${formatted_repo} already exists. Skipping.`);
    } else {
      core.setFailed(`Could not create ${formatted_repo}.\n${e.data.message}`);
    }
  }

  const readme = make_readme({ title: space_name, sdk: space_type });

  file_data.push(["readme.md", Buffer.from(readme)]);

  core.info(
    `Committing ${file_data.length} file${
      file_data.length === 1 ? "" : "s"
    } to ${formatted_repo}.`
  );

  let commits;
  try {
    commits = await commit({
      repo,
      credentials,
      title: "Add model file",
      //@ts-ignore
      operations: file_data.map(([filename, data]) => ({
        operation: "addOrUpdate",
        path: filename,
        content: new Blob([data], {}),
      })),
    });
  } catch (e: any) {
    console.log(e);
    core.setFailed(`Commit failed.\n${e.message}`);
  }

  core.info("Space successfully updated.");
}

function read_files(path: string) {
  return function (file: string): Promise<[string, Buffer]> {
    return new Promise((res, rej) => {
      readFile(file).then((data) => res([file.replace(`${path}/`, ""), data]));
    });
  };
}

function handle_inputs() {
  const _hf_token = core.getInput("hf_token", {
    required: true,
    trimWhitespace: true,
  });

  let hf_token: `hf_${string}`;

  if (_hf_token.startsWith("hf_")) {
    hf_token = _hf_token as `hf_${string}`;
  } else {
    core.setFailed("Not a valid Hugging face token. Must start with 'hf_'.");
    throw new Error();
  }

  const user_name = core.getInput("user_name", {
    required: true,
    trimWhitespace: true,
  });
  const space_name = core.getInput("space_name", {
    required: true,
    trimWhitespace: true,
  });
  const space_type = core.getInput("space_type", { trimWhitespace: true });
  const path = core.getInput("path", { required: true, trimWhitespace: true });
  const is_artifact = core.getBooleanInput("is_artifact", {
    trimWhitespace: true,
  });

  let _space_type;
  if (!["static", "gradio"].includes(space_type)) {
    core.setFailed(
      `'${space_type}' is not a supported space type. Only 'gradio' and 'static' are supported.`
    );
    throw new Error();
  } else {
    _space_type = space_type as "gradio" | "static";
  }

  return {
    hf_token,
    user_name,
    space_name,
    space_type: _space_type,
    is_artifact,
    path,
  };
}

run();

function make_readme({
  title,
  sdk,
  version,
  app_file = "app.py",
}: {
  title: string;
  sdk: "gradio" | "static";
  version?: string;
  app_file?: string;
}) {
  let content = `title: ${title} 
  emoji: 💩
  colorFrom: indigo
  colorTo: indigo
  sdk: ${sdk}
  pinned: false
`;

  if (sdk === "gradio") {
    content += `app_file: ${app_file}`;
    if (version) {
      content += `sdk_version: ${version}`;
    }
  }

  return `---
${content}
---`;
}
