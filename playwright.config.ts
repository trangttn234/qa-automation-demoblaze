import { defineConfig, devices } from '@playwright/test';
import * as os from 'os';
import { EnvManager } from './src/common/config/envManager';

const config = EnvManager.getInstance();

const useAllure = process.env.ALLURE !== 'false';

const reporters: any[] = [
  ['list'],
  ['html', { open: 'never', outputFolder: 'reports/playwright' }],
  ['junit', { outputFile: 'reports/results.xml' }],
];

if (useAllure) {
  reporters.push([
    'allure-playwright',
    {
      resultsDir: 'reports/allure/results',
      environmentInfo: {
        base_url: config.baseURL,
        api_url: config.apiURL,
        execution: process.env.CI ? 'CI' : 'Local',
        os_platform: os.platform(),
        os_release: os.release(),
        node_version: process.version,
      },
    },
  ]);
}

export default defineConfig({
  testDir: './tests',

  globalSetup: './src/common/config/globalSetup.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: reporters,

  use: {
    baseURL: process.env.BASE_URL || config.baseURL,
    headless: process.env.HEADED !== 'true',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'Asia/Ho_Chi_Minh',
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  expect: {
    timeout: 5000,
  },

  projects: [
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});