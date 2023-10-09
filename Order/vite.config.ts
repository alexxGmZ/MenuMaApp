import { defineConfig } from 'vite';

export default defineConfig({
	root: './src',
	build: {
		outDir: '../dist/',
		minify: false,
		emptyOutDir: true,
		rollupOptions: {
			input: {
				index: "./src/index.html",
				menu: "./src/menu_items.html",
			}
		}
	},
});
