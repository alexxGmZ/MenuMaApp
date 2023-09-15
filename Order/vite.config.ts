import { fileURLToPath } from 'url'
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist/',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
		    main: "./src/index.html",
		    heehee: "./src/heehee.html",
      }
    }
  },
});
