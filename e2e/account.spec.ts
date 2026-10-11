import { test, expect } from 'playwright/test';

test('contact persistence and unsaved tab/browser-back protection', async ({ page }) => {
  await page.goto('/#/v2/account');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('link', { name: /Profile/ }).first().click();
  await page.getByRole('button', { name: 'Edit contact', exact: true }).click();
  await page.getByRole('textbox', { name: /Email/ }).fill('driver@example.com');
  await page.getByRole('link', { name: 'Loads', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await page.goBack();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await page.getByRole('button', { name: 'Save contact', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Contact details saved');
  await page.reload();
  await expect(page.getByRole('textbox', { name: /Email/ })).toHaveValue('driver@example.com');
});
