import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // 2 min per test — npm install in a temp dir can be slow
  timeout: 120_000,
  // Serial execution: each test creates/destroys its own temp dir;
  // running in parallel would not break isolation but serial keeps
  // output readable and avoids concurrency issues with npm cache.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  // No browser projects — these are pure Node.js CLI tests executed
  // via child_process.spawnSync. Playwright is used only as the test
  // runner (fixtures, assertions, reporting).
});
