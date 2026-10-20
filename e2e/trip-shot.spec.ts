import { expect, test } from 'playwright/test';

test('trip redesign screenshot', async ({ page }) => {
  const now = new Date().toISOString();
  await page.addInitScript(({ now }) => {
    localStorage.setItem('pharos-driver-prototype', JSON.stringify({
      applications: {
        nordcargo: {
          loadId: 'nordcargo',
          status: 'CONFIRMED',
          submittedAt: now,
          confirmedAt: now,
          tripId: 'TR-nordcargo',
          tripStage: 'confirmed',
        },
      },
      route: { from: '', to: '' },
      loadId: 'nordcargo',
      status: 'CONFIRMED',
      submittedAt: now,
    }));
  }, { now });
  await page.goto('/#/trip/nordcargo');
  await expect(page.getByRole('button', { name: 'Navigate to pickup', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('€435');
  // The route artwork was removed (decorative, and it duplicated the route list), so there is
  // no map element to dump any more — the screen scrolls as one sheet instead.
  await page.screenshot({ path: 'test-results/trip-redesign.png', fullPage: false });
});
