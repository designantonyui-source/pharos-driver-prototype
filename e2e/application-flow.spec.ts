import { expect, test } from 'playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('map pins mirror the feed and open the sheet', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  const map = page.getByRole('tabpanel', { name: 'Map' });
  // One pin per visible load, labelled with the same facts as the list card.
  await expect(map.getByRole('button', { name: 'Lille to Brussels, €360', exact: true })).toBeVisible();
  await expect(map.getByRole('button', { name: 'Ghent to Antwerp, €210', exact: true })).toBeVisible();
  await expect(map.getByRole('button', { name: 'Calais to Lille, €290', exact: true })).toBeVisible();
  // Pin tap selects; compact card opens the same sheet as the list card.
  await map.getByRole('button', { name: 'Ghent to Antwerp, €210', exact: true }).click();
  await map.getByRole('button', { name: 'Ghent to Antwerp, €210. Open details.', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Load Ghent to Antwerp, €210' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply for €210', exact: true })).toBeVisible();
});

test('filters narrow the feed and the empty state recovers', async ({ page }) => {
  await page.goto('/#/v2');
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  // Filters live behind one button now: open, toggle Today, preview, apply.
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Today' }).click();
  await expect(page.getByRole('button', { name: 'Show 2 loads' })).toBeVisible();
  await page.getByRole('button', { name: 'Show 2 loads' }).click();
  await expect(page.getByRole('button', { name: 'Filters 1' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load calais-lille' })).toHaveCount(0);
  // Reopen, clear, apply: the full feed returns and the badge hides.
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'Show 3 loads' }).click();
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load calais-lille' })).toBeVisible();
});

test('direction changes without leaving the feed', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: /Direction: loads towards Brussels/ }).click();
  await expect(page.getByRole('dialog', { name: 'Change direction' })).toBeVisible();
  await page.getByLabel('Destination city').fill('Antwerp');
  await expect(page.getByRole('button', { name: 'Show 1 load' })).toBeVisible();
  await page.getByRole('button', { name: 'Show 1 load' }).click();
  // Direction commits, but the demo feed is not filtered by destination:
  // the header follows the new direction, the feed stays.
  await expect(page.getByRole('button', { name: /Direction: loads towards Antwerp/ })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load belroute' })).toBeVisible();
});

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
    await page.getByRole('button', { name: 'Send application', exact: true }).click();
  });

  await test.step('4. See the SENT tracker', async () => {
    await expect(page).toHaveURL(/#\/application\/nordcargo$/);
    await expect(page.getByText('Application sent', { exact: true }).first()).toBeVisible();
    await page.screenshot({ path: test.info().outputPath('tracker-sent.png') });
  });

  await test.step('5. Wait for the automatic status update', async () => {
    await expect(page.getByText('Under dispatcher review', { exact: true }).first()).toBeVisible({ timeout: 8000 });
  });

  await test.step('6. Go back, reopen the application and cancel', async () => {
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(/#\/v2$/);
    await page.getByRole('button', { name: /Awaiting dispatcher/ }).click();
    page.once('dialog', (confirm) => void confirm.accept());
    await page.getByRole('button', { name: 'Cancel application', exact: true }).click();
  });

  await test.step('7. Return to the list with the cancellation saved', async () => {
    await expect(page).toHaveURL(/#\/v2$/);
    await expect(page.getByRole('button', { name: /Cancelled by you/ })).toBeVisible();
    // Cancelled load re-sorts last, so its CTA reads "Apply again", not "Apply for €…".
    await expect(page.getByRole('button', { name: 'Apply again', exact: true })).toBeEnabled();
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
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page.getByText('Load confirmed', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Cancel application', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page).toHaveURL(/#\/application\/nordcargo\?scenario=reject$/);
  await expect(page.getByText('Application sent', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Under dispatcher review', { exact: true }).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Application declined', { exact: true }).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('The customer chose another carrier.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel application', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View trip', exact: true })).toHaveCount(0);
  const dialog = page.waitForEvent('dialog').then(async (alert) => {
    expect(alert.message()).toBe('Demo: disputing a decision is not connected yet.');
    await alert.accept();
  });
  await Promise.all([dialog, page.getByRole('button', { name: 'Dispute decision', exact: true }).click()]);
  await page.screenshot({ path: test.info().outputPath('tracker-rejected.png') });
  await page.getByRole('button', { name: 'Back to loads', exact: true }).click();
  await expect(page).toHaveURL(/#\/v2\?scenario=reject$/);
  // Rejected load re-sorts last, so its CTA reads "Apply again", not "Apply for €…".
  await expect(page.getByRole('button', { name: 'Apply again', exact: true })).toBeEnabled();
});


test('confirmed trip cancellation records a reason', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pharos-driver-prototype', JSON.stringify({
    applications: { nordcargo: { loadId: 'nordcargo', status: 'CONFIRMED', submittedAt: null, tripId: 'TR-nordcargo' } },
    route: { from: '', to: '' }, loadId: 'nordcargo', status: 'CONFIRMED', submittedAt: null,
  })));
  await page.goto('/#/trip/nordcargo');
  await page.getByRole('button', { name: 'Cancel trip', exact: true }).click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByRole('button', { name: 'Cancel trip', exact: true })).toBeDisabled();
  await sheet.getByRole('radio', { name: 'Vehicle breakdown' }).check();
  await sheet.getByRole('button', { name: 'Cancel trip', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('Cancelled by you');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pharos-driver-prototype')!));
  expect(saved.applications.nordcargo).toMatchObject({ cancelReason: 'breakdown', cancelledAfterConfirm: true, tripId: 'TR-nordcargo' });
});
