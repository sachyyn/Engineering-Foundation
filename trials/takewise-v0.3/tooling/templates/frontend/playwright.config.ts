import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  failOnFlakyTests: !!process.env.CI,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:5173", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: [
    {
      command: "php -S 127.0.0.1:8000 -t ../backend/public",
      url: "http://127.0.0.1:8000/api/v1/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm exec vite --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
