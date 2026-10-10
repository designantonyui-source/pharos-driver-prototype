import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    channel: 'chrome',
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 402, height: 874 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 1000 },
  },
});
