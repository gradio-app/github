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
		],
	},
});
