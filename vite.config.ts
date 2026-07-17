import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const repositoryBase = process.env.GITHUB_ACTIONS ? '/ReliTree/' : './';

export default defineConfig({
  plugins: [svelte()],
  base: repositoryBase,
  build: {
    target: 'es2024',
    sourcemap: true
  }
});
