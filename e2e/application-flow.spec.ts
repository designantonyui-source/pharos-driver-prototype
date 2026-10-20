import { expect, test } from 'playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('map pins mirror the feed and open the sheet', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  const map = page.getByRole('tabpanel', { name: 'Map' });
  // Pins follow the committed route: default is Brussels, two loads pinned.
  await expect(map.getByRole('button', { name: 'Paris to Brussels, €420', exact: true })).toBeVisible();
  await expect(map.getByRole('button', { name: 'Lille to Brussels, €360', exact: true })).toBeVisible();
  // Pin tap selects; compact card opens the same sheet as the list card.
  await map.getByRole('button', { name: 'Paris to Brussels, €420', exact: true }).click();
  await map.getByRole('button', { name: 'Paris to Brussels, €420. Open details.', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Load Paris to Brussels, €420' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply for €420', exact: true })).toBeVisible();
});

test('filters narrow the feed and the empty state recovers', async ({ page }) => {
  await page.goto('/#/v2');
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  // Load attributes live behind Filters: toggle €3+/km, preview, apply —
  // the badge lands, the Brussels route feed keeps its 2.
  // The count is scoped to the committed direction, so it names the loads the
  // feed will actually show (2 toward Brussels) — not every load in the catalogue.
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await page.getByRole('button', { name: '€3+/km' }).click();
  await expect(page.getByRole('button', { name: 'Show 2 loads' })).toBeVisible();
  await page.getByRole('button', { name: 'Show 2 loads' }).click();
  await expect(page.getByRole('button', { name: 'Filters 1' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toBeVisible();
  // The empty state lives one route away: drive into the Antwerp → Paris dead
  // end by hand — no fixture serves it — and recover via Change direction.
  await page.getByRole('button', { name: 'Direction: Anywhere → Brussels, 2 of 6 loads. Activate to change.' }).click();
  const routeSheet = page.getByRole('dialog', { name: 'Change direction' });
  await expect(routeSheet).toBeVisible();
  await routeSheet.getByLabel('From', { exact: true }).fill('Antwerp');
  await routeSheet.getByLabel('To', { exact: true }).fill('Paris');
  await routeSheet.getByRole('heading', { name: 'Change direction' }).click();
  // Zero matches is a recoverable state, not a dead end: the sheet says what
  // does not match and offers the tap that gets the driver out.
  await expect(routeSheet.getByText(/No loads on Antwerp → Paris/)).toBeVisible();
  await expect(routeSheet.getByRole('button', { name: /Show 1 load toward Paris/ })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(routeSheet).toHaveCount(0);
  // Reopen the filters, clear, apply: the route feed returns, badge hides.
  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'Show 2 loads' }).click();
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
});

test('direction changes without leaving the feed', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Direction: Anywhere → Brussels, 2 of 6 loads. Activate to change.' }).click();
  await expect(page.getByRole('dialog', { name: 'Change direction' })).toBeVisible();
  await page.getByLabel('To', { exact: true }).fill('Antwerp');
  await page.getByRole('heading', { name: 'Change direction' }).click();
  await expect(page.getByRole('button', { name: 'Show 1 load' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await page.getByRole('button', { name: 'Show 1 load' }).click();
  // Direction commits and narrows the feed: only Antwerp survives.
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Antwerp, 1 of 6 loads. Activate to change.' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load belroute' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toHaveCount(0);
});

test('route suggestions carry live counts and the dead end recovers', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Direction: Anywhere → Brussels, 2 of 6 loads. Activate to change.' }).click();
  const sheet = page.getByRole('dialog', { name: 'Change direction' });
  await expect(sheet).toBeVisible();
  // A bare focus shows no catalog — suggestions appear only while typing.
  await sheet.getByLabel('To', { exact: true }).click();
  await expect(sheet.getByTestId('route-destination-suggestions')).toHaveCount(0);
  // Fast field switching must not kill the new list: the blurred field's
  // 150ms close timer is scoped to itself.
  await sheet.getByLabel('From', { exact: true }).click();
  // Typing filters the feed's cities; every option carries its live count —
  // dead ends read "No loads", a live one shows its count, never promising an empty feed.
  await sheet.getByLabel('To', { exact: true }).fill('B');
  const suggestions = sheet.getByTestId('route-destination-suggestions');
  await expect(suggestions).toBeVisible();
  await page.waitForTimeout(300);
  await expect(suggestions).toBeVisible();
  await expect(suggestions.getByRole('option', { name: 'Brussels, 2 loads' })).toBeEnabled();
  // Tapping the option fills the field — one commit path stays: Show.
  await suggestions.getByRole('option', { name: 'Brussels, 2 loads' }).click();
  await expect(sheet.getByLabel('To', { exact: true })).toHaveValue('Brussels');
  // Type to filter, pick Paris as origin via its own suggestions.
  await sheet.getByLabel('From', { exact: true }).fill('Paris');
  await sheet.getByRole('heading', { name: 'Change direction' }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 6 loads. Activate to change.' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toBeVisible();
  // Now drive into the dead end by hand: Antwerp → Paris has no fixture.
  await page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 6 loads. Activate to change.' }).click();
  await expect(sheet).toBeVisible();
  await sheet.getByLabel('From', { exact: true }).fill('Antwerp');
  await sheet.getByLabel('To', { exact: true }).fill('Paris');
  await sheet.getByRole('heading', { name: 'Change direction' }).click();
  // The dead end now recovers in one tap instead of stranding the driver.
  await expect(sheet.getByText(/No loads on Antwerp → Paris/)).toBeVisible();
  await sheet.getByRole('button', { name: /Show 1 load toward Paris/ }).click();
  await expect(page.getByRole('button', { name: /Direction: Anywhere → Paris/ })).toBeVisible();
});

test('recent routes recall the last direction in one tap', async ({ page }) => {
  await page.goto('/#/v2');
  // First apply: Paris → Brussels.
  await page.getByRole('button', { name: 'Direction: Anywhere → Brussels, 2 of 6 loads. Activate to change.' }).click();
  const sheet = page.getByRole('dialog', { name: 'Change direction' });
  await sheet.getByLabel('From', { exact: true }).fill('Paris');
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 6 loads. Activate to change.' })).toBeVisible();
  // Second apply: Anywhere → Antwerp. Now Paris → Brussels is a recent.
  await page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 6 loads. Activate to change.' }).click();
  await sheet.getByLabel('From', { exact: true }).fill('');
  await sheet.getByLabel('To', { exact: true }).fill('Antwerp');
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Antwerp, 1 of 6 loads. Activate to change.' })).toBeVisible();
  // Reopen: Recent fills the draft back in one tap, Show commits.
  await page.getByRole('button', { name: 'Direction: Anywhere → Antwerp, 1 of 6 loads. Activate to change.' }).click();
  await expect(sheet.getByRole('region', { name: 'Recent directions' })).toBeVisible();
  await sheet.getByRole('button', { name: 'Paris to Brussels, 1 load' }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 6 loads. Activate to change.' })).toBeVisible();
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
    await page.getByRole('button', { name: 'Cancel application', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Cancel application Lille to Brussels' })).toBeVisible();
    await page.getByRole('button', { name: 'Withdraw application', exact: true }).click();
  });

  await test.step('7. Return to the list with the cancellation saved', async () => {
    await expect(page).toHaveURL(/#\/v2$/);
    // No banner for ended applications (rule: banner is live-only) — the card
    // pill owns the state, Trips owns the history.
    await expect(page.getByRole('button', { name: /Cancelled by you/ })).toHaveCount(0);
    await expect(page.getByText('Cancelled by you', { exact: true }).first()).toBeVisible();
    // Cancelled load re-sorts last, so its CTA reads "Apply again", not "Apply for €…".
    await expect(page.getByRole('button', { name: 'Apply again', exact: true })).toBeEnabled();
    const status = await page.evaluate(() => JSON.parse(localStorage.getItem('pharos-driver-prototype') ?? '{}').status);
    expect(status).toBe('CANCELLED');
    expect(errors).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: test.info().outputPath('loads-mobile-390.png') });
  });
});

test('confirmed application opens trip details and demo actions', async ({ page, context }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page.getByText('Load confirmed', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Cancel application', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();
  const stops = page.getByRole('list', { name: 'Route stops' });
  await expect(stops).toContainText('Rue des Champs 12, 59000 Lille');
  await expect(stops).toContainText('Rue du Port 48, 1000 Brussels');
  await expect(stops).toContainText('17:00–18:00');
  await expect(stops).toContainText('Gate B · Bay 4');
  await expect(stops.getByRole('link', { name: /Call pickup/ })).toHaveAttribute('href', 'tel:+33320112233');
  await expect(page.getByText('Customer rating: 4.8 / 5', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('€360');
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('TR-nordcargo');
  await expect(page.getByRole('region', { name: 'Cargo' })).toContainText('Curtainsider');
  await expect(page.getByRole('region', { name: 'Trip progress' })).toContainText('Confirmed');
  await expect(page.getByRole('button', { name: 'Contact dispatcher', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Contact dispatcher', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo\/chat$/);
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  // Arrival is not offered before navigation — the driver has not left yet.
  await expect(page.getByRole('button', { name: "I've arrived at pickup", exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: /Documents \(/, exact: false }).click();
  const docs = page.getByRole('dialog', { name: /Documents for trip/ });
  await expect(docs).toContainText('CMR consignment note');
  await docs.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(docs).toHaveCount(0);

  // Navigate opens Google Maps in a new tab and switches the trip to en-route.
  const navigate = page.getByRole('button', { name: 'Navigate to pickup', exact: true });
  const [mapsPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
    navigate.click(),
  ]);
  await mapsPage?.close().catch(() => undefined);
  await expect(page.getByRole('region', { name: 'En route to pickup' })).toBeVisible();
  await expect(page.getByRole('button', { name: "I've arrived at pickup", exact: true })).toBeVisible();
  // Exit to Loads — the mini-player mirrors the active leg and returns to the trip.
  await page.goto('/#/v2');
  const banner = page.getByRole('button', { name: /km to go/ });
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('En route to pickup');
  await expect(banner).toContainText('Open');
  await page.screenshot({ path: test.info().outputPath('loads-active-trip-banner.png') });
  await banner.click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await page.screenshot({ path: test.info().outputPath('trip-details.png') });
});

test('portfolio happy path: apply to payout', async ({ page, context }) => {
  // Loads → Apply → Confirmed → Trip → Delivered → Balance (pending payout).
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page.getByText('Load confirmed', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);

  // En-route to pickup, then arrive.
  const navigate = page.getByRole('button', { name: 'Navigate to pickup', exact: true });
  const [mapsPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
    navigate.click(),
  ]);
  await mapsPage?.close().catch(() => undefined);
  await page.getByRole('button', { name: "I've arrived at pickup", exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('At pickup');

  // Loading complete, en-route to delivery, arrive, hand over, complete.
  await page.getByRole('button', { name: 'Confirm loading complete', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('Loaded');
  const navigateDelivery = page.getByRole('button', { name: 'Navigate to delivery', exact: true });
  const [mapsDelivery] = await Promise.all([
    context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
    navigateDelivery.click(),
  ]);
  await mapsDelivery?.close().catch(() => undefined);
  await page.getByRole('button', { name: "I've arrived at delivery", exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('At delivery');
  await page.getByRole('checkbox', { name: 'Cargo handed over' }).check();
  await page.getByRole('button', { name: 'Complete delivery', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('Delivered');

  // Delivered work lands in Balance as pending payout.
  // No payout method yet in a clean run — the trip row points at method setup.
  await expect(page.getByRole('region', { name: 'Earnings' })).toContainText('Upload POD to unlock earnings');
  await page.getByRole('link', { name: /No payout method yet/ }).click();
  await expect(page).toHaveURL(/#\/v2\/account\/balance\/method$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
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
  await page.getByRole('button', { name: 'Dispute decision', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Disputing a decision is not connected yet.');
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
