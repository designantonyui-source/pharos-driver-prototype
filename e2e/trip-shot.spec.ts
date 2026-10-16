import { expect, test } from 'playwright/test';

test('trip redesign screenshot', async ({ page }) => {
  await page.goto('/#/v2');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page.getByText('Load confirmed', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await expect(page.getByRole('button', { name: 'Navigate to pickup', exact: true })).toBeVisible();
  // The route artwork was removed (decorative, and it duplicated the route list), so there is
  // no map element to dump any more — the screen scrolls as one sheet instead.
  await page.screenshot({ path: 'test-results/trip-redesign.png', fullPage: false });
});
