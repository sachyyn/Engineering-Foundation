import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/e2e',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'php -S 127.0.0.1:8000 -t backend/public',
      url: 'http://127.0.0.1:8000/api/health',
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'node_modules/.bin/vite --config tooling/vite.config.mjs',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
