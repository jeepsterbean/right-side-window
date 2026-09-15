import { defineConfig } from 'vite';

export default defineConfig({
  // Pin port + cache so sibling worktrees cannot steal 5173 or share deps.
  cacheDir: '.vite',
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
});
