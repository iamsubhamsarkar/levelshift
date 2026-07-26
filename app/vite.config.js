import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/levelshift/',
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    minify: 'esbuild'
  }
});
