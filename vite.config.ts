import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
	plugins: [
		sveltekit(),
		dynamicImport() // For lib/components/results folder, https://github.com/vite-plugin/vite-plugin-dynamic-import
	],
	resolve: { // According to https://github.com/vite-plugin/vite-plugin-dynamic-import/issues/40
	    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.svelte'],
	},
});
