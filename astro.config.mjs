import { defineConfig } from 'astro/config';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  outDir: 'dist',
  site: isGitHubPages ? 'https://atmoore.github.io' : 'http://localhost:4321',
  base: isGitHubPages ? '/claude-exam' : '/',
});
