/**
 * Capture the case-study screenshot set.
 *
 * Walks the full "money loop" of the prototype — book a load → deliver it →
 * money lands as pending → customer pays → money becomes available → set up a
 * payout method → cash out → resolve a payout issue — and drops one PNG per
 * beat into `docs/screens/`.
 *
 * Why a script and not manual shots: the case study must stay reproducible.
 * Anyone can re-run `pnpm capture:case-study` after a UI change and get the
 * same set back, so the README images never drift from the code.
 *
 * Usage:  node tools/capture-case-study.mjs [--base http://127.0.0.1:5180]
 */
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'screens');

const argBase = process.argv.indexOf('--base');
const BASE = argBase > -1 ? process.argv[argBase + 1] : 'http://127.0.0.1:5180';

/** Demo-enabled URL for a route: the walkthrough panel only renders on ?demo=1. */
const demo = (route) => `${BASE}/?demo=1#${route}`;
/** Clean URL for the same route: same localStorage, no dev chrome in frame. */
const clean = (route) => `${BASE}/#${route}`;

const shots = [];

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  shots.push(name);
  process.stdout.write(`  ✓ ${name}\n`);
}

/** Click the first element matching `text` that is currently visible. */
async function tap(page, text, opts = {}) {
  const loc = page.getByText(text, { exact: opts.exact ?? false }).first();
  await loc.waitFor({ state: 'visible', timeout: opts.timeout ?? 15000 });
  await loc.click();
  await page.waitForTimeout(opts.settle ?? 450);
}

/** Click a button whose accessible name matches `re`. */
async function tapButton(page, re, opts = {}) {
  const loc = page.getByRole('button', { name: re }).first();
  await loc.waitFor({ state: 'visible', timeout: opts.timeout ?? 15000 });
  await loc.click();
  await page.waitForTimeout(opts.settle ?? 450);
}

/**
 * Drive one external event from the walkthrough panel.
 *
 * The panel is a collapsed pill on every screen (?demo=1); open it, click the
 * event, close it again so the panel never sits on top of the captured screen.
 * `route` is where the event should be fired from — the panel is only reachable
 * on a demo-enabled URL, so this navigates there first.
 */
async function drive(page, eventLabel, opts = {}) {
  if (opts.route) {
    await page.goto(demo(opts.route));
    await page.waitForTimeout(opts.routeSettle ?? 900);
  }
  const pill = page.getByRole('button', { name: 'Show walkthrough controls' });
  await pill.waitFor({ state: 'visible', timeout: 15000 });
  await pill.click();
  const btn = page.getByRole('button', { name: eventLabel }).first();
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click();
  await page.waitForTimeout(opts.settle ?? 1200);
  // Close the panel so it never overlaps the screen we are about to capture.
  const hide = page.getByRole('button', { name: 'Hide walkthrough controls' });
  if (await hide.count()) await hide.click();
  await page.waitForTimeout(300);
}

async function latestWithdrawalId(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('pharos-driver-prototype');
    const state = raw ? JSON.parse(raw) : {};
    const withdrawals = (state.ledger ?? []).filter((entry) => entry.kind === 'withdrawal');
    return withdrawals[withdrawals.length - 1]?.id ?? null;
  });
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => console.error('  ! page error:', e.message));

  // ── Reset state ───────────────────────────────────────────────────────────
  await page.goto(`${BASE}/#/v2`, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // The dev server may hot-reload mid-reset, which destroys the execution
  // context; retry until the store is actually clear.
  for (let i = 0; i < 5; i += 1) {
    try {
      await page.evaluate(() => localStorage.clear());
      break;
    } catch {
      await page.waitForTimeout(600);
    }
  }

  // ── Act 1 · Book a load ───────────────────────────────────────────────────
  console.log('Act 1 · book a load');
  await page.goto(demo('/v2'));
  await page.waitForTimeout(1200);
  await shot(page, '01-loads-feed');

  await tapButton(page, /Apply for/, { exact: false });
  await shot(page, '02-load-details');

  await tapButton(page, 'Send application', { exact: true });
  await page.waitForTimeout(900);
  await shot(page, '03-application-sent');

  // ── Act 2 · Deliver ───────────────────────────────────────────────────────
  console.log('Act 2 · deliver');
  await drive(page, '→ dispatcher + customer review', { route: '/v2', settle: 1400 });
  await drive(page, '→ confirmed', { route: '/v2', settle: 1600 });
  await page.goto(clean('/trip/nordcargo'));
  await page.waitForTimeout(900);
  await shot(page, '04-application-confirmed');

  await drive(page, '→ delivered', { route: '/trip/nordcargo', settle: 1800 });
  await page.goto(clean('/trip/nordcargo'));
  await page.waitForTimeout(1000);
  await shot(page, '05-trip-assigned');

  await drive(page, '→ POD submitted', { route: '/trip/nordcargo', settle: 1400 });
  await drive(page, '→ POD accepted', { route: '/trip/nordcargo', settle: 1800 });
  await page.goto(clean('/trip/nordcargo'));
  await page.waitForTimeout(1000);
  // The money state lives in the Earnings block, below the fold — bring it up.
  await page.locator('section[aria-label="Earnings"]').scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(600);
  await shot(page, '06-trip-earnings-awaiting-payment');

  // ── Act 3 · Money lands — pending ─────────────────────────────────────────
  console.log('Act 3 · pending balance');
  await page.goto(clean('/v2/account/balance'));
  await page.waitForTimeout(1400);
  await shot(page, '07-balance-pending');

  // ── Act 4 · Customer pays — money becomes available ───────────────────────
  console.log('Act 4 · customer pays');
  await drive(page, '→ customer paid', { route: '/v2/account/balance', settle: 2000 });
  await page.goto(clean('/v2/account/balance'));
  await page.waitForTimeout(1400);
  await shot(page, '08-balance-available');

  // ── Act 5 · Payout method + cash out ─────────────────────────────────────
  console.log('Act 5 · payout setup');
  await page.goto(clean('/v2/account/balance/method'));
  await page.waitForTimeout(1200);
  await shot(page, '09-payout-method-iban');

  await page.getByRole('button', { name: /Card \(instant/ }).first().click();
  await page.waitForTimeout(700);
  await shot(page, '10-payout-method-card');

  // Back to the IBAN tab, add a bank account.
  await page.getByRole('button', { name: /Bank account|SEPA/i }).first().click().catch(() => {});
  await page.waitForTimeout(600);
  const iban = page.getByRole('textbox', { name: /IBAN/ }).first();
  if (await iban.count()) {
    // Wrong check digits first: the mod-97 rejection is the point, not a footnote.
    await iban.fill('DE89370400440532013001');
    await iban.blur();
    await page.waitForTimeout(500);
    await shot(page, '11-payout-method-iban-rejected');

    await iban.fill('DE89370400440532013000');
    await page.waitForTimeout(300);
    await shot(page, '12-payout-method-iban-validated');
    await page.getByRole('button', { name: 'Add bank account' }).first().click();
    await page.waitForTimeout(1000);
  }
  await shot(page, '13-payout-method-saved');

  // ── Act 6 · Cash out — quote before execute ───────────────────────────────
  console.log('Act 6 · cash out');
  await page.goto(clean('/v2/account/balance/cashout'));
  await page.waitForTimeout(1300);
  await shot(page, '14-cashout');

  const amount = page.getByRole('textbox', { name: /Amount/ }).first();
  if (await amount.count()) {
    await amount.fill('120');
    await page.waitForTimeout(800);
  }
  await shot(page, '15-cashout-amount');

  await tapButton(page, /Cash out/i);
  await page.waitForTimeout(900);
  await shot(page, '16-cashout-confirm-sheet');

  await tapButton(page, /^Confirm EUR/);
  await page.waitForTimeout(900);
  await tapButton(page, /Confirm with bank app/);
  await page.waitForTimeout(2000);
  await shot(page, '17-cashout-done');

  // ── Act 7 · Ledger + issue resolution ────────────────────────────────────
  console.log('Act 7 · payout issue');
  await page.goto(clean('/v2/account/balance/history'));
  await page.waitForTimeout(1300);
  await shot(page, '18-balance-history');

  await drive(page, '→ delayed', { route: '/v2/account/balance/history', settle: 1600 });
  const delayedId = await latestWithdrawalId(page);
  await page.goto(clean(`/v2/account/balance/withdrawals/${encodeURIComponent(delayedId)}`));
  await page.waitForTimeout(1200);
  await shot(page, '19-payout-delayed');

  await drive(page, '→ failed', { route: '/v2/account/balance/history', settle: 1600 });
  await drive(page, '→ funds returned', { route: '/v2/account/balance/history', settle: 1800 });
  const returnedId = await latestWithdrawalId(page);
  await page.goto(clean(`/v2/account/balance/withdrawals/${encodeURIComponent(returnedId)}`));
  await page.waitForTimeout(1200);
  await shot(page, '20-payout-failed-returned');

  // ── Act 8 · Invoices + schedules (EU B2B compliance) ──────────────────────
  console.log('Act 8 · invoices + schedules');
  await page.goto(clean('/v2/account/balance/invoices'));
  await page.waitForTimeout(1400);
  await shot(page, '21-invoices-list');

  const inv = page.getByRole('link', { name: /INV-2026-0038/ }).first();
  if (await inv.count()) {
    await inv.click();
    await page.waitForTimeout(1200);
    await shot(page, '22-invoice-details');
  }

  await page.goto(clean('/v2/account/balance/schedules'));
  await page.waitForTimeout(1400);
  await shot(page, '23-auto-withdraw-schedules');

  await browser.close();
  console.log(`\n${shots.length} screens → ${path.relative(ROOT, OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
