import { defineConfig } from 'astro/config';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  outDir: 'dist',
  site: isProd ? 'https://atmoore.github.io' : 'http://localhost:4321',
  base: isProd ? '/claude-exam' : '/',
});
