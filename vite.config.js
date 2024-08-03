import { defineConfig } from "vite";

export default defineConfig({
	build: {
		// minify: true,
		lib: {
			entry: "index.ts",
			formats: ["es"],
		},
		rollupOptions: {
			input: "index.ts",
			output: {
				dir: "dist",
			},
		},
	},

	ssr: {
		target: "node",
		format: "esm",
		noExternal: [
			"@actions/artifact",
			"@actions/core",
			"@actions/exec",
			"@actions/github",
			"@actions/glob",
			"@actions/io",
			"@manypkg/get-packages",
			"@octokit/types",
			"@types/node",
			"recursive-readdir",
			"typescript",
			"vite",
			"@changesets/git",
			"@huggingface/hub",
			"@manypkg/get-packages",
			"@types/js-yaml",
			"@types/mdast",
			"human-id",
			"js-yaml",
			"remark-frontmatter",
			"remark-gfm",
			"remark-parse",
			"unified",
			"unist-util-find",
			"unist-util-visit",
			"@huggingface/hub",
			"kleur",
			"node-fetch",
			"undici",
			"picomatch",
		],
	},
});
