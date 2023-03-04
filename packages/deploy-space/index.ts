import { join } from 'path'
import { readFile } from 'fs/promises'
//@ts-ignore
import recursive_read_dir from 'recursive-readdir'

import * as core from '@actions/core'
import * as artifact from '@actions/artifact'

import { createRepo, commit } from '@huggingface/hub'
import type { RepoId, Credentials } from '@huggingface/hub'

import './fetch'
import { Blob } from 'node:buffer'

const src = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<title>My static Space</title>
		<link rel="stylesheet" href="style.css" />
	</head>
	<body>
		<div class="card">
			<h1>Hello from @huggingface/hub!</h1>
		</div>
	</body>
</html>`

async function run() {
    const { hf_token, user_name, space_name, space_type, is_artifact, path } =
        handle_inputs()

    const cwd = process.env.GITHUB_WORKSPACE as string
    let _path = join(cwd, path)

    if (is_artifact) {
        const artifact_client = artifact.create()
        await artifact_client.downloadArtifact(path, path)
    }

    const files: string[] = await recursive_read_dir(_path)
    const file_data: Array<[string, string]> = await Promise.all(
        files.map(read_files(_path))
    )

    const repo: RepoId = {
        name: `${user_name}/${space_name}`,
        type: 'space',
    }

    const credentials: Credentials = {
        accessToken: hf_token,
    }
    try {
        await createRepo({ repo, credentials })
    } catch (e) {
        console.log(e)
    }

    // console.log(res)
    await commit({
        repo,
        credentials,
        title: 'Add model file',
        operations: file_data.map(([filename, data]) => ({
            operation: 'addOrUpdate',
            path: filename,
            content: new Blob([data]),
        })),
    })

    core.info('Space successfully updated.')
}

function read_files(path: string) {
    return function (file: string): Promise<[string, string]> {
        return new Promise((res, rej) => {
            readFile(file, { encoding: 'utf-8' }).then((data) =>
                res([file.replace(`${path}/`, ''), data])
            )
        })
    }
}

function handle_inputs() {
    const _hf_token = core.getInput('hf_token', {
        required: true,
        trimWhitespace: true,
    })

    let hf_token: `hf_${string}`

    if (_hf_token.startsWith('hf_')) {
        hf_token = _hf_token as `hf_${string}`
    } else {
        core.setFailed("Not a valid Hugging face token. Must start with 'hf_'.")
        throw new Error()
    }

    const user_name = core.getInput('user_name', {
        required: true,
        trimWhitespace: true,
    })
    const space_name = core.getInput('space_name', {
        required: true,
        trimWhitespace: true,
    })
    const space_type = core.getInput('space_type', { trimWhitespace: true })
    const path = core.getInput('path', { required: true, trimWhitespace: true })
    const is_artifact = core.getBooleanInput('is_artifact', {
        trimWhitespace: true,
    })

    if (!['static', 'gradio'].includes(space_type)) {
        core.setFailed(
            `'${space_type}' is not a supported space type. Only 'gradio' and 'static' are supported.`
        )
        throw new Error()
    }

    return {
        hf_token,
        user_name,
        space_name,
        space_type,
        is_artifact,
        path,
    }
}

run()
