import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const authFile = 'playwright/.auth/user.json';
const setupProjectName = 'setup';
const baseUrl = 'http://localhost:5173';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: baseUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: setupProjectName,
      testMatch: /.*\.setup\.ts/
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: authFile,
      },
      dependencies: [setupProjectName],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Use prepared auth state.
        storageState: authFile,
      },
      dependencies: [setupProjectName],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        // Use prepared auth state.
        storageState: authFile,
      },
      dependencies: [setupProjectName],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: baseUrl,
  //   reuseExistingServer: !process.env.CI,
  // },
});
