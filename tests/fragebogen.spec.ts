import { test, expect } from '@playwright/test';

//const authFile = 'playwright/.auth/user.json';

test.describe('Load questionnaire', () => {
  test('Load questionnaire', async ({ page }) => {
    await page.goto('/questions');

    await expect(page).toHaveTitle(/Transaktionsanalyse/);

    await page.getByPlaceholder('Fragebogen laden').click();

    await page.goto('/results');
    await page.waitForTimeout(500);
  })
});