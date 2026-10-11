import { test, expect } from 'playwright/test';

test('balance cash out flow with IBAN method', async ({ page }) => {
  await page.goto('/#/v2/account/balance');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Available balance')).toBeVisible();
  await page.getByRole('button', { name: /Add bank account to cash out/ }).click();
  await page.getByRole('textbox', { name: /IBAN/ }).fill('DE89370400440532013000');
  await page.getByRole('button', { name: /Add bank account|Save bank account/ }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.goto('/#/v2/account/balance/cashout');
  await page.getByRole('textbox', { name: /Amount/ }).fill('100');
  await page.getByRole('button', { name: /Cash out/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /Confirm/ }).click();
  await expect(page.getByText(/is on its way/)).toBeVisible();
  await page.goto('/#/v2/account/balance/history');
  await expect(page.getByText(/Lille - Brussels/)).toBeVisible();
});
