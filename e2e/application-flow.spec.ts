import { expect, test, type Page } from 'playwright/test';

const NOW = new Date().toISOString();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

/** Seed a confirmed demo trip without replaying the presenter controls. */
async function seedConfirmedTrip(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(({ now, extra }) => {
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
      ...extra,
    }));
  }, { now: NOW, extra });
}

test('map pins mirror the feed and open the sheet', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('tab', { name: 'Map', exact: true }).click();
  const map = page.getByRole('tabpanel', { name: 'Map' });
  // Four live loads: the two paid BelRoute/Côte Fret trips are history, not inventory.
  await expect(map.getByRole('button', { name: 'Lille to Brussels, €435', exact: true })).toBeVisible();
  await expect(map.getByRole('button', { name: 'Paris to Brussels, €1150', exact: true })).toBeVisible();
  // Pin tap selects; compact card opens the same sheet as the list card.
  await map.getByRole('button', { name: 'Paris to Brussels, €1150', exact: true }).click();
  await map.getByRole('button', { name: 'Paris to Brussels, €1150. Open details.', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Load Paris to Brussels, €1150' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply for €1150', exact: true })).toBeVisible();
});

test('filters narrow the feed and the empty state recovers', async ({ page }) => {
  await page.goto('/#/v2');
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  // Default direction is honest: no hidden home city.
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 4 of 4 loads. Activate to change.' })).toBeVisible();

  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await page.getByRole('button', { name: '€2.50+/km net' }).click();
  // Net rate includes the empty run to pickup; only NordCargo clears €2.50/km net.
  await expect(page.getByRole('button', { name: 'Show 1 load' })).toBeVisible();
  await page.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Filters 1' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 1 of 4 loads. Activate to change.' })).toBeVisible();

  // The empty state lives one route away: drive into the Antwerp → Paris dead
  // end by hand — no fixture serves it. With the rate filter still on, even
  // Paris is empty, so the recovery drops both fields and says "anywhere".
  await page.getByRole('button', { name: /Direction:/ }).click();
  const routeSheet = page.getByRole('dialog', { name: 'Change direction' });
  await expect(routeSheet).toBeVisible();
  await routeSheet.getByLabel('From', { exact: true }).fill('Antwerp');
  await routeSheet.getByLabel('To', { exact: true }).fill('Paris');
  await routeSheet.getByRole('heading', { name: 'Change direction' }).click();
  await expect(routeSheet.getByText(/No loads on Antwerp → Paris/)).toBeVisible();
  await routeSheet.getByRole('button', { name: 'Show 1 load anywhere' }).click();
  await expect(routeSheet).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 1 of 4 loads. Activate to change.' })).toBeVisible();

  await page.getByRole('button', { name: 'Filters 1' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('button', { name: 'Show 4 loads' }).click();
  await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(4);
});

test('direction changes without leaving the feed', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 4 of 4 loads. Activate to change.' }).click();
  await expect(page.getByRole('dialog', { name: 'Change direction' })).toBeVisible();
  await page.getByLabel('To', { exact: true }).fill('Brussels');
  await page.getByRole('heading', { name: 'Change direction' }).click();
  await expect(page.getByRole('button', { name: 'Show 2 loads' })).toBeEnabled();
  await page.getByRole('button', { name: 'Show 2 loads' }).click();
  // Direction commits and narrows the feed: only Brussels-bound loads survive.
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Brussels, 2 of 2 loads. Activate to change.' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load nordcargo' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load brussels-amsterdam' })).toHaveCount(0);
});

test('route suggestions carry live counts and the dead end recovers', async ({ page }) => {
  await page.goto('/#/v2');
  await page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 4 of 4 loads. Activate to change.' }).click();
  const sheet = page.getByRole('dialog', { name: 'Change direction' });
  await expect(sheet).toBeVisible();
  // A tap opens the picker: the towns that actually carry loads for this half
  // of the route, each with its live count. The town already selected is left
  // out — tapping it would change nothing.
  await sheet.getByLabel('To', { exact: true }).click();
  const picker = sheet.getByTestId('route-destination-suggestions');
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('option', { name: 'Brussels, 2 loads' })).toBeEnabled();
  await expect(picker.getByRole('option', { name: 'Paris, 1 load' })).toBeEnabled();
  await expect(picker.getByRole('option', { name: 'Amsterdam, 1 load' })).toBeEnabled();
  // Dead towns are not offered in the picker — only typing a name may reveal one.
  await expect(picker.getByRole('option', { name: 'Lille, no loads' })).toHaveCount(0);
  // Fast field switching must not kill the new list: the blurred field's
  // 150ms close timer is scoped to itself.
  await sheet.getByLabel('From', { exact: true }).click();
  // Typing filters the cities; every option carries its live count —
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
  await sheet.getByLabel('From', { exact: true }).fill('Paris');
  await sheet.getByRole('heading', { name: 'Change direction' }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 1 loads. Activate to change.' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Load paris-brussels' })).toBeVisible();

  // Now drive into the dead end by hand: Antwerp → Paris has no fixture.
  await page.getByRole('button', { name: /Direction:/ }).click();
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
  // First commit: Paris → Brussels.
  await page.getByRole('button', { name: 'Direction: Anywhere → Anywhere, 4 of 4 loads. Activate to change.' }).click();
  const sheet = page.getByRole('dialog', { name: 'Change direction' });
  await sheet.getByLabel('From', { exact: true }).fill('Paris');
  await sheet.getByLabel('To', { exact: true }).fill('Brussels');
  await sheet.getByRole('heading', { name: 'Change direction' }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 1 loads. Activate to change.' })).toBeVisible();

  // Second commit: Anywhere → Amsterdam. Now Paris → Brussels is a recent.
  await page.getByRole('button', { name: /Direction:/ }).click();
  await sheet.getByLabel('From', { exact: true }).fill('');
  await sheet.getByLabel('To', { exact: true }).fill('Amsterdam');
  await sheet.getByRole('heading', { name: 'Change direction' }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Anywhere → Amsterdam, 1 of 1 loads. Activate to change.' })).toBeVisible();

  // Reopen: Recent fills the draft back in one tap, Show commits.
  await page.getByRole('button', { name: /Direction:/ }).click();
  await expect(sheet.getByRole('region', { name: 'Recent directions' })).toBeVisible();
  await sheet.getByRole('button', { name: /Paris → Brussels, 1 load/ }).click();
  await expect(sheet.getByRole('button', { name: 'Show 1 load' })).toBeEnabled();
  await sheet.getByRole('button', { name: 'Show 1 load' }).click();
  await expect(page.getByRole('button', { name: 'Direction: Paris → Brussels, 1 of 1 loads. Activate to change.' })).toBeVisible();
});

test('driver submits and cancels without an automatic status change', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await test.step('1. Open the loads list', async () => {
    await page.goto('/#/v2');
    await expect(page.getByRole('button', { name: 'Apply for €435', exact: true }).first()).toBeVisible();
  });

  await test.step('2. Open Quick Apply', async () => {
    await page.getByRole('button', { name: 'Apply for €435', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('Lille → Brussels');
    await page.screenshot({ path: test.info().outputPath('quick-apply.png') });
  });

  await test.step('3. Confirm in the modal', async () => {
    await page.getByRole('button', { name: 'Send application', exact: true }).click();
  });

  await test.step('4. See the SENT tracker and wait for no fake advance', async () => {
    await expect(page).toHaveURL(/#\/application\/nordcargo$/);
    await expect(page.getByText('Application sent', { exact: true }).first()).toBeVisible();
    await page.waitForTimeout(2500);
    await expect(page.getByText('Application sent', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Under dispatcher review', { exact: true })).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath('tracker-sent.png') });
  });

  await test.step('5. Go back, reopen the application and cancel', async () => {
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(/#\/v2$/);
    await page.getByRole('link', { name: 'View status', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel application', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Cancel application Lille to Brussels' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes, cancel application', exact: true }).click();
  });

  await test.step('6. Return to the list with the cancellation saved', async () => {
    await expect(page).toHaveURL(/#\/v2$/);
    // Waiting status never becomes a page banner — the card pill owns it and
    // Trips owns the history. Only a confirmed trip gets the active-trip floater.
    await expect(page.getByRole('button', { name: /Lille → Brussels · €435 · by/ })).toHaveCount(0);
    await expect(page.getByText('Cancelled by you', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply again', exact: true })).toBeEnabled();
    const status = await page.evaluate(() => JSON.parse(localStorage.getItem('pharos-driver-prototype') ?? '{}').status);
    expect(status).toBe('CANCELLED');
    expect(errors).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: test.info().outputPath('loads-mobile-390.png') });
  });
});

test('presenter confirmation opens trip details and active-trip banner', async ({ page, context }) => {
  await page.goto('/?demo=1#/v2');
  await page.getByRole('button', { name: 'Apply for €435', exact: true }).first().click();
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page).toHaveURL(/#\/application\/nordcargo$/);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(/#\/v2/);

  // Status is presenter-driven now, not a 5-second timer.
  await page.getByRole('button', { name: 'Show walkthrough controls' }).click();
  await page.getByRole('button', { name: '→ confirmed', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  // The presenter panel floats over the bottom of the phone; hide it before
  // touching the trip actions it would otherwise intercept.
  await page.getByRole('button', { name: 'Hide walkthrough controls' }).click();
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible();

  const stops = page.getByRole('list', { name: 'Route stops' });
  await expect(stops).toContainText('Rue des Champs 12, 59000 Lille');
  await expect(stops).toContainText('Rue du Port 48, 1000 Brussels');
  await expect(stops).toContainText('Gate B · Bay 4');
  await expect(stops.getByRole('link', { name: /Call pickup/ })).toHaveAttribute('href', 'tel:+33320112233');
  await expect(page.getByText('Customer rating: 4.8 / 5', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('€435');
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('€3.54/km net');
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('TR-nordcargo');
  await expect(page.getByRole('region', { name: 'Cargo' })).toContainText('Curtainsider');
  await expect(page.getByRole('region', { name: 'Trip progress' })).toContainText('Confirmed');
  await expect(page.getByRole('button', { name: 'Message dispatcher', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Message dispatcher', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo\/chat$/);
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  // Both pre-departure deeds are offered: Navigate for the road, "I'm already
  // here" for the driver standing at the gate. (Not tapped here — the Navigate
  // path below covers the common flow; the portfolio run covers this one.)
  await expect(page.getByRole('button', { name: "I'm already at pickup", exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Documents \(/ }).click();
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
  // Use the tab, not page.goto: the test's init script clears storage on every full load.
  await page.getByRole('link', { name: 'Loads', exact: true }).click();
  await expect(page).toHaveURL(/#\/v2$/);
  const banner = page.getByRole('button', { name: /km to go/ });
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('En route to pickup');
  await expect(banner).toContainText('Open');
  await page.screenshot({ path: test.info().outputPath('loads-active-trip-banner.png') });
  await banner.click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await page.screenshot({ path: test.info().outputPath('trip-details.png') });
});

test('portfolio happy path: confirmed trip to delivered earnings', async ({ page, context }) => {
  await seedConfirmedTrip(page);
  await page.goto('/#/trip/nordcargo');
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('Confirmed');

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
  // Already at the dock: no Maps tab opens, the stage still advances.
  await page.getByRole('button', { name: "I'm already at delivery", exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('At delivery');
  await page.getByRole('checkbox', { name: 'Cargo handed over' }).check();
  await page.getByRole('button', { name: 'Complete delivery', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Trip summary' })).toContainText('Delivered');

  // Delivered work is not payable until the POD is reviewed. The seeded verified
  // IBAN is the destination already shown on the trip, not a missing-method CTA.
  const earnings = page.getByRole('region', { name: 'Earnings' });
  await expect(earnings).toContainText('Upload POD to unlock earnings');
  await expect(earnings).toContainText('€435 · Expected payout');
  await expect(page.getByText('28 Oct · FR76 •••• 0189')).toBeVisible();
  await expect(page.getByRole('link', { name: /No payout method yet/ })).toHaveCount(0);
});

test('rejected application shows the reason, dispute sheet and reapply', async ({ page }) => {
  await page.addInitScript(({ now }) => {
    localStorage.setItem('pharos-driver-prototype', JSON.stringify({
      applications: {
        nordcargo: {
          loadId: 'nordcargo',
          status: 'REJECTED',
          submittedAt: now,
          approvalsDeadline: new Date(Date.now() + 3_600_000).toISOString(),
        },
      },
      route: { from: '', to: '' },
      loadId: 'nordcargo',
      status: 'REJECTED',
      submittedAt: now,
    }));
  }, { now: NOW });
  await page.goto('/#/application/nordcargo?scenario=reject');
  await expect(page.getByText('Application declined', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('The customer chose another carrier.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yes, cancel application', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View trip', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Dispute decision', exact: true }).click();
  const dispute = page.getByRole('dialog', { name: 'Dispute decision' });
  await expect(dispute).toBeVisible();
  await dispute.getByLabel('What should the dispatcher review?').fill('The customer approved late.');
  await dispute.getByRole('button', { name: 'Send dispute', exact: true }).click();
  await expect(page.getByText('Dispute sent. A dispatcher will review the decision.', { exact: true })).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('tracker-rejected.png') });

  await page.getByRole('button', { name: 'Back to loads', exact: true }).click();
  await expect(page).toHaveURL(/#\/v2\?scenario=reject$/);
  await expect(page.getByRole('button', { name: 'Application rejected', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Apply again', exact: true })).toBeEnabled();
});

test('confirmed trip cancellation records a reason', async ({ page }) => {
  await seedConfirmedTrip(page);
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
