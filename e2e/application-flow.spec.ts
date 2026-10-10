import { expect, test } from 'playwright/test';

test('driver submits, sees a status update and cancels an application', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await test.step('1. Open the loads list', async () => {
    await page.goto('/#/v2');
    await expect(page.getByRole('button', { name: 'Apply for €360', exact: true }).first()).toBeVisible();
  });

  await test.step('2. Open Quick Apply', async () => {
    await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('Lille → Brussels');
    await page.screenshot({ path: test.info().outputPath('quick-apply.png') });
  });

  await test.step('3. Confirm in the modal', async () => {
    await page.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
  });

  await test.step('4. See the SENT tracker', async () => {
    await expect(page).toHaveURL(/#\/application\/nordcargo$/);
    await expect(page.getByRole('heading', { name: 'Application sent', exact: true })).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('tracker-sent.png') });
  });

  await test.step('5. Wait for the automatic status update', async () => {
    await expect(page.getByRole('heading', { name: 'Under dispatcher review', exact: true })).toBeVisible({ timeout: 8000 });
  });

  await test.step('6. Go back, reopen the application and cancel', async () => {
    await page.getByRole('link', { name: 'Back to loads', exact: true }).click();
    await expect(page).toHaveURL(/#\/v2$/);
    await page.getByRole('button', { name: /Awaiting dispatcher/ }).click();
    await page.getByRole('button', { name: 'Cancel application', exact: true }).click();
  });

  await test.step('7. Return to the list with the cancellation saved', async () => {
    await expect(page).toHaveURL(/#\/v2$/);
    await expect(page.getByRole('button', { name: /Application cancelled/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply for €360', exact: true }).first()).toBeEnabled();
    const status = await page.evaluate(() => JSON.parse(localStorage.getItem('pharos-driver-prototype') ?? '{}').status);
    expect(status).toBe('CANCELLED');
    expect(errors).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: test.info().outputPath('loads-mobile-390.png') });
  });
});

test('confirmed application opens trip details and demo actions', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Load confirmed', exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Cancel application', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await expect(page.getByRole('heading', { name: 'Trip details', exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Route stops' })).toContainText('Pickup');
  await expect(page.getByRole('list', { name: 'Route stops' })).toContainText('Lille');
  await expect(page.getByRole('list', { name: 'Route stops' })).toContainText('Brussels');
  await expect(page.getByRole('list', { name: 'Route stops' })).toContainText('17:00–18:00');
  await expect(page.getByText('Customer rating: 4.8 / 5', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('€360');

  for (const [button, message] of [
    ['Navigation', 'Navigation is not connected in this demo.'],
    ['Documents', 'Trip documents are not connected in this demo.'],
  ]) {
    const dialog = page.waitForEvent('dialog').then(async (alert) => {
      expect(alert.message()).toBe(message);
      await alert.accept();
    });
    await Promise.all([dialog, page.getByRole('button', { name: button, exact: true }).click()]);
  }
  await page.screenshot({ path: test.info().outputPath('trip-details.png') });
});


test('reject scenario shows the reason, appeal and return to loads', async ({ page }) => {
  await page.goto('/#/v2?scenario=reject');
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
  await expect(page).toHaveURL(/#\/application\/nordcargo\?scenario=reject$/);
  await expect(page.getByRole('heading', { name: 'Application sent', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Under dispatcher review', exact: true })).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('heading', { name: 'Application declined', exact: true })).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Клиент выбрал другого перевозчика', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel application', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View trip', exact: true })).toHaveCount(0);
  const dialog = page.waitForEvent('dialog').then(async (alert) => {
    expect(alert.message()).toBe('Демо: оспаривание решения пока не подключено.');
    await alert.accept();
  });
  await Promise.all([dialog, page.getByRole('button', { name: 'Оспорить решение', exact: true }).click()]);
  await page.screenshot({ path: test.info().outputPath('tracker-rejected.png') });
  await page.getByRole('button', { name: 'Посмотреть похожие грузы', exact: true }).click();
  await expect(page).toHaveURL(/#\/v2\?scenario=reject$/);
  await expect(page.getByRole('button', { name: 'Apply for €360', exact: true }).first()).toBeEnabled();
});
