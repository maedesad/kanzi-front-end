import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api',
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
