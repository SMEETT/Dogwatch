import svelte from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import path from "path";
import { resolve } from "path";

export default defineConfig({
	server: {
		port: 5000,
	},
	build: {
		cssCodeSplit: false,
		sourcemap: false,
	},
	optimizeDeps: {
		exclude: ["@roxi/routify"],
	},
	resolve: {
		dedupe: ["@roxi/routify"],
		alias: [
			{
				find: "@",
				replacement: path.resolve(__dirname, "./src"),
			},
		],
	},
	plugins: [svelte()],
});
