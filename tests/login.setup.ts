import { test as setup, expect } from '@playwright/test';
import 'dotenv/config';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  // Timeout since JavaScript appears to take some time to fully load
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Login' }).click();
  if (process.env.TEST_USER && process.env.TEST_PASSWORD) {
    await page.getByLabel('Email address').fill(process.env.TEST_USER); // change this to fit your mode and test user
    await page.getByLabel('Password').fill(process.env.TEST_PASSWORD); // change this to fit your mode and test user
  } else {
    console.log('Test user and test password missing - define corresponding env variables.');
  }
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  // Test that new page has loaded to ensure that cookies are populated
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  // Store cookies for further tests
  await page.context().storageState({ path: authFile });
});