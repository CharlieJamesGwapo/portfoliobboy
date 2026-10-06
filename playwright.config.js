import { defineConfig, devices } from '@playwright/test'

const externalBaseURL = process.env.PORTFOLIO_BASE_URL
const useExternalServer = process.env.PORTFOLIO_EXTERNAL_SERVER === '1'
const baseURL = externalBaseURL || 'http://127.0.0.1:5175'
const basePort = new URL(baseURL).port || '5175'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          command: `npm run dev -- --host 127.0.0.1 --port ${basePort}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
        },
      }),
})
