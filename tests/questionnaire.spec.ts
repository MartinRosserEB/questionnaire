import { test, expect } from '@playwright/test';

test.describe('Fill in questionnaire Dramadreieck (without sign-in)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Dramadreieck Questionnaire, not signed in', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Transaktionsanalyse/);
    await expect(page.getByRole('link', { name: 'Persönlichkeitsanalyse' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zum Fragebogen' })).toBeVisible();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Zum Fragebogen' }).click();

    await expect(page.getByRole('heading', { name: 'Fragebogen' })).toBeVisible();
    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.waitForTimeout(50);

    await expect(page.getByText('Bitte wählen Sie einen Namen für Ihren Fragebogen.')).toBeVisible();
    await expect(page.getByText('Bitte wählen Sie mindestens eine Kategorie.')).toBeVisible();

    await page.getByPlaceholder('Name des Fragebogens, z.B. Datum').fill('Test');
    await page.getByRole('button', { name: 'Dramadreieck' }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    await page.getByRole('button', { name: '0' }).first().click();
    await page.getByRole('button', { name: '1' }).nth(1).click();
    await page.getByRole('button', { name: '2' }).nth(2).click();
    await page.getByRole('button', { name: '3' }).nth(3).click();
    await page.getByRole('button', { name: '4' }).nth(4).click();

    await page.getByRole('button', { name: '4' }).first().click();
    await page.getByRole('button', { name: '3' }).nth(1).click();
    await page.getByRole('button', { name: '2' }).nth(2).click();
    await page.getByRole('button', { name: '1' }).nth(3).click();
    await page.getByRole('button', { name: '0' }).nth(4).click();

    await page.getByRole('button', { name: '0' }).first().click();
    await page.getByRole('button', { name: '0' }).nth(1).click();
    await page.getByRole('button', { name: '1' }).nth(2).click();
    await page.getByRole('button', { name: '1' }).nth(3).click();
    await page.getByRole('button', { name: '2' }).nth(4).click();

    await page.getByRole('button', { name: '1' }).first().click();
    await page.getByRole('button', { name: '1' }).nth(1).click();
    await page.getByRole('button', { name: '2' }).nth(2).click();
    await page.getByRole('button', { name: '2' }).nth(3).click();
    await page.getByRole('button', { name: '3' }).nth(4).click();

    await page.getByRole('button', { name: '2' }).first().click();
    await page.getByRole('button', { name: '2' }).nth(1).click();
    await page.getByRole('button', { name: '3' }).nth(2).click();
    await page.getByRole('button', { name: '3' }).nth(3).click();
    await page.getByRole('button', { name: '4' }).nth(4).click();

    await page.getByRole('button', { name: '3' }).first().click();
    await page.getByRole('button', { name: '3' }).nth(1).click();
    await page.getByRole('button', { name: '4' }).nth(2).click();
    await page.getByRole('button', { name: '4' }).nth(4).click();
    await page.getByRole('button', { name: '4' }).nth(3).click();
    
    await expect(page.getByRole('button', { name: 'Zur Auswertung' })).toBeVisible();
    await page.getByRole('button', { name: 'Zur Auswertung' }).click();
    await expect(page.getByRole('heading', { name: 'Dramadreieck' })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  })
});