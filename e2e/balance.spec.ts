import { test, expect } from 'playwright/test';

test('balance: IBAN method then SEPA cash out to history', async ({ page }) => {
  await page.goto('/#/v2/account/balance');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Available balance')).toBeVisible();
  await page.getByRole('button', { name: /Add payout method to cash out/ }).click();
  await page.getByRole('textbox', { name: /IBAN/ }).fill('DE89370400440532013000');
  await page.getByRole('button', { name: 'Add bank account' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.goto('/#/v2/account/balance/cashout');
  await page.getByRole('textbox', { name: /Amount/ }).fill('100');
  await page.getByRole('button', { name: /Cash out/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('No fee');
  await page.getByRole('button', { name: /Confirm/ }).click();
  await expect(page.getByText(/is on its way/)).toBeVisible();
  await page.goto('/#/v2/account/balance/history');
  await expect(page.getByText(/Lille - Brussels/)).toBeVisible();
});

test('balance: card method with instant fee quote', async ({ page }) => {
  await page.goto('/#/v2/account/balance/method');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /Card \(instant/ }).click();
  await page.getByRole('textbox', { name: /Card number/ }).fill('4242424242424242');
  await page.getByRole('textbox', { name: /Expiry/ }).fill('12/30');
  await page.getByRole('textbox', { name: /CVC/ }).fill('123');
  await page.getByRole('textbox', { name: /Cardholder name/ }).fill('Alexey K.');
  await page.getByRole('button', { name: 'Add card' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByText(/instant.*30 minutes/)).toBeVisible();
  await page.goto('/#/v2/account/balance/cashout');
  await page.getByRole('textbox', { name: /Amount/ }).fill('50');
  await expect(page.getByText(/Fee EUR 1\.50/)).toBeVisible();
});
