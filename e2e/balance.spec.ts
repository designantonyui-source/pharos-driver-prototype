import { test, expect } from 'playwright/test';

test('balance: add SCA-approved IBAN then SEPA cash out to history', async ({ page }) => {
  await page.goto('/#/v2/account/balance');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Available balance')).toBeVisible();
  await expect(page.getByText('EUR 720.00').first()).toBeVisible();

  // The demo driver already has one verified IBAN. Add a second one through SCA.
  await page.getByRole('link', { name: /Business account/ }).click();
  await expect(page.getByText(/1 saved/)).toBeVisible();
  await page.getByRole('textbox', { name: /IBAN/ }).fill('DE89370400440532013000');
  await page.getByRole('button', { name: 'Add bank account' }).click();
  const sca = page.getByRole('dialog', { name: 'Confirm with your bank' });
  await expect(sca).toContainText('Confirm the new bank account');
  await sca.getByRole('button', { name: 'Confirm with bank app' }).click();
  await expect(page.getByText(/2 saved/)).toBeVisible({ timeout: 10000 });

  // Manual cash out is a second, separate SCA challenge.
  await page.goto('/#/v2/account/balance/cashout');
  await page.getByRole('textbox', { name: /Amount/ }).fill('100');
  await page.getByRole('button', { name: /Cash out/ }).click();
  const confirm = page.getByRole('dialog', { name: 'Confirm cash out' });
  await expect(confirm).toBeVisible();
  await expect(confirm).toContainText('No fee');
  await expect(confirm).toContainText('Total debit');
  await confirm.getByRole('button', { name: /Confirm/ }).click();
  const cashOutSca = page.getByRole('dialog', { name: 'Confirm with your bank' });
  await expect(cashOutSca).toContainText('Confirm the cash out');
  await cashOutSca.getByRole('button', { name: 'Confirm with bank app' }).click();
  await expect(page).toHaveURL(/#\/v2\/account\/balance\/withdrawals\//, { timeout: 15000 });

  await page.goto('/#/v2/account/balance/history');
  await expect(page.getByText(/Ghent → Antwerp/)).toBeVisible();
});

test('balance: card method with instant fee quote', async ({ page }) => {
  await page.goto('/#/v2/account/balance/method');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText(/1 saved/)).toBeVisible();
  await page.getByRole('button', { name: /Card \(instant/ }).click();
  await page.getByRole('textbox', { name: /Card number/ }).fill('4242424242424242');
  await page.getByRole('textbox', { name: /Expiry/ }).fill('12/30');
  await page.getByRole('textbox', { name: /CVC/ }).fill('123');
  await page.getByRole('textbox', { name: /Cardholder name/ }).fill('Alexey K.');
  await page.getByRole('textbox', { name: /Card nickname/ }).fill('Fuel card');
  await page.getByRole('button', { name: 'Add card' }).click();
  const sca = page.getByRole('dialog', { name: 'Confirm with your bank' });
  await expect(sca).toContainText('Confirm the new card');
  await sca.getByRole('button', { name: 'Confirm with bank app' }).click();
  await expect(page.getByText(/2 saved/)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Visa •••• 4242 · Instant/).first()).toBeVisible();

  // Card is a distinct rail with a visible fee, not hidden inside the amount.
  await page.goto('/#/v2/account/balance/cashout');
  await page.getByRole('radio', { name: 'Fuel card' }).check();
  await page.getByRole('textbox', { name: /Amount/ }).fill('50');
  await expect(page.getByText(/Fee EUR 1\.50/)).toBeVisible();
});

test('balance: invoices list, details, route VAT and history link', async ({ page }) => {
  await page.goto('/#/v2/account/balance/invoices');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('INV-2026-0038 · BelRoute')).toBeVisible();
  await page.getByRole('link', { name: /INV-2026-0038/ }).click();
  // Ghent → Antwerp is a Belgian domestic route: 21% VAT, not reverse charge.
  await expect(page.getByText(/TVA 21%/).first()).toBeVisible();
  await expect(page.getByText(/Northway Freight SAS/)).toBeVisible();
  await page.goto('/#/v2/account/balance/history');
  await page.getByRole('link', { name: /Ghent → Antwerp.*invoice/ }).click();
  await expect(page.getByText('INV-2026-0038', { exact: false }).first()).toBeVisible();
});

test('balance: auto-withdraw rule saves and lists runs', async ({ page }) => {
  await page.goto('/#/v2/account/balance/schedules');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('Manual only')).toBeVisible();
  await page.getByRole('radio', { name: /Every Friday/ }).click();
  await expect(page.getByText('Rule saved')).toBeVisible();
  await expect(page.getByText('Export monthly statement (CSV)')).toBeVisible();
});
