/**
 * Mock API — the ONLY place that knows where data comes from.
 * Swap the bodies for real fetch() calls and every screen keeps working.
 *
 * Levels:
 *  1. now: localStorage-backed store + artificial latency (skeletons, timers work)
 *  2. later: real backend — replace these functions, nothing else changes
 */
import { ApplicationStatus } from './models';
import { store, type LoadApplication, type Status } from './store';
import { V2_LOADS, type V2Load } from './v2/loads';
import { BL_ORDERS, type BlOrder } from './bl/logic';

import { maskCard, maskIban, normalizeContactProfile, normalizePayoutMethod, normalizeSchedule, type ContactProfile, type LedgerEntry, type PayoutMethod, type PayoutSchedule, type ScheduledRun } from './profile';
import { MockPayoutProvider, PROTOTYPE_FEES, type Destination, type PayoutProvider, type PayoutQuote } from './psp';
export { normalizeSchedule } from './profile';
export type { PayoutSchedule, ScheduledRun } from './profile';
export { validatePhone, validateEmail, validateIban, formatIban, maskIban } from './profile';
export {
  validateCardNumber, detectCardBrand, formatCardNumber, formatCardExpiry,
  maskCard, tokeniseCard, validateCardCvc, validateCardExpiry,
} from './profile';
export type { ContactProfile, LedgerEntry, PayoutMethod } from './profile';
export type { Destination, PayoutQuote, Rail } from './psp';

/** The plugged-in provider. Production: replace with the Stripe/Adyen implementation. */
export const payoutProvider: PayoutProvider = new MockPayoutProvider();

/** Prototype payout policy (NOT approved business rules — see PAYMENTS-VISION.md §7). */
export const PAYOUT_POLICY = Object.freeze({
  rail: 'SEPA transfer',
  eta: PROTOTYPE_FEES.sepa.eta,
  fee: PROTOTYPE_FEES.sepa.fee,
  cardEta: PROTOTYPE_FEES['instant-card'].eta,
  cardFee: PROTOTYPE_FEES['instant-card'].fee,
  minWithdrawal: 10,
  currency: 'EUR',
});

const DAY_MS = 86_400_000;

/** Seed ledger: two settled trips + one pending (net-7 style), so Balance has content on first run. */
function seedLedger(): LedgerEntry[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  return [
    { kind: 'trip', id: 'trip-nordcargo-4821', loadId: 'nordcargo', company: 'NordCargo', from: 'Lille', to: 'Brussels', amount: 360, status: 'available', paidAt: iso(now - 3 * DAY_MS), day: 'Tue' },
    { kind: 'trip', id: 'trip-belroute-1184', loadId: 'belroute', company: 'BelRoute', from: 'Ghent', to: 'Antwerp', amount: 210, status: 'available', paidAt: iso(now - 6 * DAY_MS), day: 'Sat' },
    { kind: 'trip', id: 'trip-calais-0932', loadId: 'calais-lille', company: 'Côte Fret', from: 'Calais', to: 'Lille', amount: 290, status: 'pending', paidAt: null, day: 'Thu' },
  ];
}

function ensureLedger(): LedgerEntry[] {
  const current = store.get().ledger;
  if (current.length > 0) return current;
  const seeded = seedLedger();
  store.set({ ledger: seeded });
  return seeded;
}

export type BalanceSummary = { available: number; pending: number; currency: 'EUR' };

/** Available = settled trips ± adjustments minus withdrawals; pending = unsettled trips. */
export async function getBalance(): Promise<BalanceSummary> {
  await wait(250);
  const ledger = ensureLedger();
  let available = 0;
  let pending = 0;
  for (const entry of ledger) {
    if (entry.kind === 'trip') {
      if (entry.status === 'available') available += entry.amount;
      else pending += entry.amount;
    } else if (entry.kind === 'withdrawal') {
      available -= entry.amount + entry.fee;
    } else if (entry.kind === 'adjustment') {
      available += entry.amount;
    }
  }
  return { available: Math.max(0, available), pending, currency: 'EUR' };
}

export async function getLedger(): Promise<LedgerEntry[]> {
  await wait(250);
  return [...ensureLedger()];
}

/** All payout destinations, default first. */
export async function getPayoutMethods(): Promise<PayoutMethod[]> {
  const methods = [...store.get().payoutMethods];
  methods.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  return methods;
}

export async function getDefaultMethod(): Promise<PayoutMethod | null> {
  const methods = await getPayoutMethods();
  return methods.find(m => m.isDefault) ?? methods[0] ?? null;
}

/** Legacy accessor — kept so old callers keep compiling during Wave 1. */
export async function getPayoutMethod(): Promise<{ iban: string; label: string }> {
  const found = (await getPayoutMethods()).find(m => m.kind === 'iban');
  return found && found.kind === 'iban' ? { iban: found.iban, label: found.label } : { iban: '', label: '' };
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

/** Add an IBAN method (verifying -> verified after a mock check). */
export async function addIbanMethod(input: { iban: string; label: string }) {
  await wait(300);
  const compact = input.iban.replace(/[\s-]/g, '').toUpperCase();
  const method: PayoutMethod = normalizePayoutMethod({
    kind: 'iban', id: newId('iban'), iban: compact,
    label: input.label, isDefault: false, verified: false,
  });
  const methods = [...store.get().payoutMethods, { ...method, isDefault: store.get().payoutMethods.length === 0 }];
  store.set({ payoutMethods: methods });
  // Mock verification round-trip (production: micro-deposits / open banking).
  await wait(400);
  store.set({ payoutMethods: store.get().payoutMethods.map(m => m.id === method.id ? { ...m, verified: true } : m) });
  return (await getPayoutMethods()).find(m => m.id === method.id)!;
}

/** Add a card from a one-time token (PAN never stored — see profile.tokeniseCard). */
export async function addCardMethod(input: { token: string; last4: string; brand: string; label: string }) {
  await wait(300);
  if (!input.token || !/^\d{4}$/.test(input.last4) || !input.brand) throw new Error('Invalid card token');
  const method: PayoutMethod = normalizePayoutMethod({
    kind: 'card', id: newId('card'), last4: input.last4,
    brand: input.brand, label: input.label, isDefault: false, verified: false,
  });
  const methods = [...store.get().payoutMethods, { ...method, isDefault: store.get().payoutMethods.length === 0 }];
  store.set({ payoutMethods: methods });
  await wait(400);
  store.set({ payoutMethods: store.get().payoutMethods.map(m => m.id === method.id ? { ...m, verified: true } : m) });
  return (await getPayoutMethods()).find(m => m.id === method.id)!;
}

export async function setDefaultMethod(id: string): Promise<PayoutMethod[]> {
  const methods = store.get().payoutMethods.map(m => ({ ...m, isDefault: m.id === id }));
  if (!methods.some(m => m.id === id)) throw new Error('Unknown method');
  store.set({ payoutMethods: methods });
  return getPayoutMethods();
}

export async function removeMethod(id: string): Promise<PayoutMethod[]> {
  const methods = store.get().payoutMethods.filter(m => m.id !== id);
  if (methods.length > 0 && !methods.some(m => m.isDefault)) methods[0] = { ...methods[0], isDefault: true };
  store.set({ payoutMethods: methods });
  return getPayoutMethods();
}

/** Legacy single-IBAN writer — kept so old callers keep compiling during Wave 1. */
export async function updatePayoutMethod(input: { iban: string; label: string }) {
  await wait(100);
  const compact = input.iban.replace(/[\s-]/g, '').toUpperCase();
  if (!compact) {
    store.set({ payoutMethods: [] });
    return { iban: '', label: '' };
  }
  const existing = (await getPayoutMethods()).find(m => m.kind === 'iban');
  if (existing) {
    store.set({ payoutMethods: store.get().payoutMethods.map(m => m.id === existing.id ? { ...m, label: input.label } : m) });
    return { iban: compact, label: input.label };
  }
  await addIbanMethod(input);
  return { iban: compact, label: input.label };
}

export function methodLabel(method: PayoutMethod): string {
  if (method.kind === 'card') return maskCard(method.last4, method.brand);
  return maskIban(method.iban);
}

export function methodDestination(method: PayoutMethod): Destination {
  return method.kind === 'card'
    ? { kind: 'card', token: `stored_${method.id}`, last4: method.last4, brand: method.brand, label: method.label }
    : { kind: 'iban', iban: method.iban, label: method.label };
}

export function quoteFor(method: PayoutMethod, amount: number): PayoutQuote {
  return payoutProvider.quote(method.kind === 'card' ? 'instant-card' : 'sepa', amount);
}

/* ---------------- Wave 3: schedules, adjustments, export ---------------- */

export async function getSchedule(): Promise<PayoutSchedule> {
  return normalizeSchedule(store.get().payoutSchedule);
}

export async function updateSchedule(schedule: PayoutSchedule): Promise<PayoutSchedule> {
  await wait(200);
  const normalized = normalizeSchedule(schedule);
  if (normalized.mode !== 'off' && normalized.methodId) {
    const known = store.get().payoutMethods.some(m => m.id === normalized.methodId);
    if (!known) throw new Error('Unknown payout method');
  }
  store.set({ payoutSchedule: normalized });
  return getSchedule();
}

export async function getScheduledRuns(): Promise<ScheduledRun[]> {
  return [...store.get().scheduledRuns].reverse();
}

/**
 * Prototype scheduler evaluation: runs on Balance open (production: cron/webhook).
 * Threshold: fires when available >= threshold (once per threshold crossing —
 * re-arms when the balance drops below and rises again is out of scope).
 * Weekly: fires when a Friday passed since the last weekly run.
 * Returns the executed run, or null when nothing was due.
 */
export async function evaluateSchedule(now = new Date()): Promise<ScheduledRun | null> {
  const schedule = await getSchedule();
  if (schedule.mode === 'off') return null;
  const methods = await getPayoutMethods();
  const method = (schedule.methodId ? methods.find(m => m.id === schedule.methodId) : methods.find(m => m.isDefault) ?? methods[0]) ?? null;
  if (!method || !method.verified) return null;
  const { available } = await getBalance();
  let due: 'threshold' | 'weekly' | null = null;
  if (schedule.mode === 'threshold') {
    if (available < Math.max(schedule.threshold, PAYOUT_POLICY.minWithdrawal)) return null;
    due = 'threshold';
  } else {
    const runs = await getScheduledRuns();
    const lastWeekly = runs.find(r => r.trigger === 'weekly');
    const lastFriday = lastFridayBefore(now);
    if (lastWeekly && new Date(lastWeekly.at) >= lastFriday) return null;
    if (available < PAYOUT_POLICY.minWithdrawal) return null;
    due = 'weekly';
  }
  if (!due) return null;
  const amount = Math.floor(available * 100) / 100;
  const { entry } = await requestWithdrawal(amount, method.id);
  const run: ScheduledRun = {
    id: `run-${Date.now().toString(36)}`,
    at: new Date().toISOString(),
    amount,
    methodLabel: method.label || methodLabel(method),
    trigger: due,
    withdrawalId: entry.id,
  };
  store.set({ scheduledRuns: [...store.get().scheduledRuns, run] });
  return run;
}

function lastFridayBefore(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  // Friday = 5. If today is Friday, the due Friday is today (runs once per day max).
  const delta = (d.getDay() - 5 + 7) % 7;
  d.setDate(d.getDate() - delta);
  return d;
}

export type AdjustmentReason = 'dispute' | 'damage' | 'bonus' | 'correction';

const ADJUSTMENT_LABEL: Record<AdjustmentReason, string> = {
  dispute: 'Dispute hold',
  damage: 'Damage claim',
  bonus: 'Bonus',
  correction: 'Correction',
};

/** Explicit ledger correction — never a silent balance edit (Wave 3 discipline). */
export async function addAdjustment(input: { amount: number; reason: AdjustmentReason; note: string; relatedLoadId?: string | null }) {
  await wait(200);
  const rounded = Math.round(input.amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded === 0) throw new Error('Enter a non-zero amount.');
  if (!input.note.trim()) throw new Error('Add a note explaining the adjustment.');
  const entry: LedgerEntry = {
    kind: 'adjustment',
    id: `adj-${Date.now().toString(36)}`,
    amount: rounded,
    reason: input.reason,
    note: input.note.trim(),
    relatedLoadId: input.relatedLoadId ?? null,
    status: 'applied',
    createdAt: new Date().toISOString(),
  };
  store.set({ ledger: [...store.get().ledger, entry] });
  return entry;
}

export function adjustmentLabel(reason: AdjustmentReason): string {
  return ADJUSTMENT_LABEL[reason];
}

/** Monthly statement CSV: every ledger line + running available (for the accountant). */
export function ledgerToCsv(ledger: LedgerEntry[]): string {
  const head = 'date,kind,detail,amount_eur,fee_eur,status';
  const rows = [...ledger].reverse().map(e => {
    if (e.kind === 'trip') {
      return [e.paidAt ? e.paidAt.slice(0, 10) : e.day, 'trip', `"${e.from} - ${e.to} (${e.company})"`, e.amount.toFixed(2), '0.00', e.status].join(',');
    }
    if (e.kind === 'withdrawal') {
      return [e.createdAt.slice(0, 10), 'withdrawal', `"Cash out to ${e.methodLabel} (${e.rail})"`, (-e.amount).toFixed(2), e.fee.toFixed(2), e.status].join(',');
    }
    return [e.createdAt.slice(0, 10), `adjustment:${e.reason}`, `"${e.note.replace(/"/g, '""')}"`, e.amount.toFixed(2), '0.00', e.status].join(',');
  });
  return [head, ...rows].join('\n');
}

export class PayoutError extends Error {
  readonly code: 'NO_METHOD' | 'BELOW_MINIMUM' | 'INSUFFICIENT' | 'INVALID_AMOUNT';
  constructor(code: PayoutError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

/** Prototype withdrawal through the PSP adapter: validates amount vs available
 *  balance + EUR 10 minimum + verified method, quotes fee/ETA per rail,
 *  executes via the provider, appends a `processing` ledger line.
 *  No real money moves — the mock returns `mock_sepa_*` / `mock_card_*` refs. */
export async function requestWithdrawal(amount: number, methodId?: string) {
  const rounded = Math.round(amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) throw new PayoutError('INVALID_AMOUNT', 'Enter an amount greater than EUR 0.');
  const methods = await getPayoutMethods();
  const method = (methodId ? methods.find(m => m.id === methodId) : methods.find(m => m.isDefault) ?? methods[0]) ?? null;
  if (!method) throw new PayoutError('NO_METHOD', 'Add a payout method first.');
  if (!method.verified) throw new PayoutError('NO_METHOD', 'Your payout method is still verifying — try again shortly.');
  if (rounded < PAYOUT_POLICY.minWithdrawal) throw new PayoutError('BELOW_MINIMUM', `Minimum withdrawal is EUR ${PAYOUT_POLICY.minWithdrawal}.`);
  const { available } = await getBalance();
  if (rounded > available) throw new PayoutError('INSUFFICIENT', 'Amount exceeds your available balance.');
  const quote = quoteFor(method, rounded);
  const result = await payoutProvider.execute(quote.rail, rounded, methodDestination(method));
  const entry: LedgerEntry = {
    kind: 'withdrawal',
    id: result.providerRef,
    amount: rounded,
    fee: quote.fee,
    methodLabel: method.label || methodLabel(method),
    rail: quote.rail,
    status: 'processing',
    createdAt: new Date().toISOString(),
  };
  store.set({ ledger: [...store.get().ledger, entry] });
  return { entry, eta: quote.eta };
}

/** Matches existing DriverProfile defaults; prototype identity is read-only. */
const DRIVER_IDENTITY = Object.freeze({
  title: 'Driver', keyFact: 'Alexey K.', body: 'Northway Freight · driver',
  initials: 'AK', verified: false,
});

/** Prototype only: no backend, authentication, or contact verification. */
export async function getDriverProfile() {
  return { ...DRIVER_IDENTITY, ...store.get().contactProfile };
}

/** Only contact fields are accepted; supplied identity fields cannot change the driver. */
export async function updateDriverProfile(contact: ContactProfile) {
  const contactProfile = normalizeContactProfile(contact);
  store.set({ contactProfile });
  return getDriverProfile();
}


const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Driver v2: loads near the driver, already sorted by what pays best per km. */
let loadsCache: Promise<V2Load[]> | null = null;
export function getLoads(): Promise<V2Load[]> {
  loadsCache ??= wait(300).then(() => [...V2_LOADS].sort((a, b) => b.perKm - a.perKm));
  return loadsCache;
}

export async function searchLoads(route: { from: string; to: string }) {
  await wait(800); // keeps the “Searching loads…” screen real
  store.set({ route });
  return { count: 2 };
}

export class AlreadyAppliedError extends Error {
  readonly code = 'ALREADY_APPLIED';
  constructor() { super('ALREADY_APPLIED'); }
}

export function getLoad(loadId: string): V2Load | null {
  return V2_LOADS.find((load) => load.id === loadId) ?? null;
}

export async function submitApplication(loadId: string) {
  await wait(600);
  // Recheck after latency so simultaneous requests cannot create duplicates.
  const existing = store.getApplicationForLoad(loadId);
  // Re-apply after a cancelled trip starts fresh: the flag belongs to the old attempt.
  if (existing && !existing.dismissed && [ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW, ApplicationStatus.CONFIRMED].includes(existing.status) && !existing.cancelledAfterConfirm) {
    throw new AlreadyAppliedError();
  }
  const submittedAt = new Date().toISOString();
  store.set({ loadId, status: ApplicationStatus.SENT, submittedAt, applications: {
    [loadId]: { loadId, status: ApplicationStatus.SENT, submittedAt },
  } });
  return { loadId, status: ApplicationStatus.SENT };
}

/** Dismiss a load from the feed (decline before apply). Free, reversible, no score impact. */
export async function dismissLoad(loadId: string) {
  const existing = store.getApplicationForLoad(loadId);
  if (existing && !existing.dismissed && existing.status !== ApplicationStatus.CANCELLED && existing.status !== ApplicationStatus.REJECTED) {
    throw new Error("An applied load cannot be dismissed");
  }
  // Preserve historical cancellation/rejection metadata when hiding an old load.
  // A never-applied load only needs a disposable dismissed placeholder.
  store.set({
    applications: {
      [loadId]: existing
        ? { ...existing, dismissed: true }
        : { loadId, status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true },
    },
  });
  return { loadId, dismissed: true };
}

/** Bring a dismissed load back into the feed without deleting historical application records. */
export async function restoreLoad(loadId: string) {
  const current = store.get();
  const existing = current.applications[loadId];
  if (existing?.dismissed) {
    const isPlaceholder = existing.status === ApplicationStatus.CANCELLED
      && existing.submittedAt === null && !existing.cancelledAfterConfirm && !existing.cancelReason;
    if (isPlaceholder) {
      store.set(current.loadId === loadId
        ? { loadId: null, status: null, submittedAt: null }
        : {}, [loadId]);
    } else {
      store.set({ applications: { [loadId]: { ...existing, dismissed: false } } });
    }
  }
  return { loadId, dismissed: false };
}

export type CancelTripPenalty = 'none' | 'warning';

/** Preview-only cancellation consequence calculation, shared by confirmation UI and action. */
export function cancellationPenalty(application: LoadApplication, pickupTime?: string, now = Date.now()): CancelTripPenalty {
  const confirmedAt = application.submittedAt ? Date.parse(application.submittedAt) : NaN;
  const pickupAt = pickupTime ? Date.parse(pickupTime) : NaN;
  const minsSinceConfirm = Number.isFinite(confirmedAt) ? (now - confirmedAt) / 60_000 : Infinity;
  const hoursToPickup = Number.isFinite(pickupAt) ? (pickupAt - now) / 3_600_000 : NaN;
  return (minsSinceConfirm >= 0 && minsSinceConfirm <= 15)
    || (Number.isFinite(hoursToPickup) && hoursToPickup >= 24) ? 'none' : 'warning';
}



/**
 * Cancel a CONFIRMED trip (Uber Freight ladder):
 * within 15 min of confirm OR more than 24 h before pickup → 'none';
 * less than 24 h before pickup → 'warning' (reliability impact, reason recorded).
 * Prototype policy only; no approved time-limited rebooking rule is implemented.
 */
export async function cancelTrip(loadId: string, reason: NonNullable<LoadApplication['cancelReason']>) {
  await wait(300);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED) {
    throw new Error('No confirmed trip to cancel');
  }
  const load = getLoad(loadId);
  const penalty = cancellationPenalty(application, load?.pickupTime);
  store.set({
    // Keep the most recently active application untouched when cancelling a different trip.
    ...(current.loadId === loadId ? { status: ApplicationStatus.CANCELLED } : {}),
    applications: {
      [loadId]: {
        ...application,
        status: ApplicationStatus.CANCELLED,
        cancelReason: reason,
        cancelledAfterConfirm: true,
      },
    },
  });
  return { loadId, status: ApplicationStatus.CANCELLED, penalty };
}

export async function cancelApplication(loadId: string) {
  await wait(300);
  const current = store.get();
  if (current.loadId !== loadId || !current.status) throw new Error('Application not found');
  if (![ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW].includes(current.status)) {
    throw new Error('This application can no longer be cancelled');
  }
  store.set({ status: ApplicationStatus.CANCELLED });
  return { loadId, status: ApplicationStatus.CANCELLED };
}

export async function getApplication() {
  await wait(200);
  return { loadId: store.get().loadId, status: store.get().status };
}

export async function advanceStatus(status: Status, loadId?: string, expectedStatus?: Status) {
  await wait(300);
  const current = store.get();
  if (!current.loadId || (loadId && current.loadId !== loadId)) throw new Error('No active application');
  if (expectedStatus && current.status !== expectedStatus) {
    return { status: current.status, updated: false };
  }
  store.set({ status });
  return { status, updated: true };
}

/** Backload (PL): zlecenia po drodze. Mock data only; the screen applies the rules in `./bl/logic`. */
export async function getBlOrders(): Promise<BlOrder[]> {
  await wait(300);
  return BL_ORDERS;
}
