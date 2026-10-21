/**
 * Mock API — the ONLY place that knows where data comes from.
 * Swap the bodies for real fetch() calls and every screen keeps working.
 *
 * Levels:
 *  1. now: localStorage-backed store + artificial latency (skeletons, timers work)
 *  2. later: real backend — replace these functions, nothing else changes
 */
import { ApplicationStatus } from './models';
import { APPROVAL_WINDOW_MIN } from './approval';
import { store, type LoadApplication, type Status } from './store';
import { V2_LOADS, isPickupClosed, isPickupUnreachable, type V2Load } from './v2/loads';
import { BL_ORDERS, type BlOrder } from './bl/logic';
import { createDemoInvoice } from './invoices';
import { aiDispatcherReply, chatId, seedThread, type ChatMessage } from './chat';

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

/**
 * Portfolio demo assumption (product): the driver is an owner-driver — they run
 * their own carrier (Northway Freight SPRL) and are entitled to receive trip revenue
 * and manage payout details. Prototype-only: no KYC/KYB, no real money.
 */
export const OWNER_DRIVER_ASSUMPTION = Object.freeze({
  role: 'owner-driver',
  carrier: 'Northway Freight SAS',
  note: 'Assumption: the driver receives trip revenue and manages payout details.',
});

/**
 * Portfolio demo trip: the single load every payments scenario runs on.
 * id, route, rate and documents must match everywhere (loads feed, trip, invoice, ledger).
 */
export const DEMO_LOAD_ID = 'nordcargo';

export function getDemoLoad(): V2Load {
  const load = V2_LOADS.find((l) => l.id === DEMO_LOAD_ID);
  if (!load) throw new Error('Seed load is missing from the feed');
  return load;
}

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

/** Seed ledger: settled history ONLY. The demo trip (DEMO_LOAD_ID) never seeds —
 * its money appears only by completing delivery in the scenario. */
function seedLedger(): LedgerEntry[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  return [
    { kind: 'trip', id: 'trip-belroute-1184', loadId: 'belroute', company: 'BelRoute', from: 'Ghent', to: 'Antwerp', amount: 290, status: 'available', paidAt: iso(now - 6 * DAY_MS), day: 'Sat', paymentTermDays: 14, dueAt: iso(now - 6 * DAY_MS) },
    { kind: 'trip', id: 'trip-calais-0932', loadId: 'calais-lille', company: 'Côte Fret', from: 'Calais', to: 'Lille', amount: 430, status: 'available', paidAt: iso(now - 9 * DAY_MS), day: 'Sun', paymentTermDays: 7, dueAt: iso(now - 9 * DAY_MS) },
  ];
}

function ensureLedger(): LedgerEntry[] {
  const current = store.get().ledger;
  if (current.length > 0) return current;
  const seeded = seedLedger();
  store.set({ ledger: seeded });
  return store.get().ledger;
}

export type BalanceSummary = { available: number; pending: number; pendingDueAt: string | null; currency: 'EUR' };

/** Available = settled trips ± adjustments minus active withdrawals.
 * Returned payouts give the amount back; the fee stays debited unless feeRefunded. */
export async function getBalance(): Promise<BalanceSummary> {
  await wait(250);
  const ledger = ensureLedger();
  let available = 0;
  let pending = 0;
  let pendingDueAt: string | null = null;
  for (const entry of ledger) {
    if (entry.kind === 'trip') {
      if (entry.status === 'available') available += entry.amount;
      else {
        pending += entry.amount;
        if (entry.dueAt && (!pendingDueAt || Date.parse(entry.dueAt) < Date.parse(pendingDueAt))) pendingDueAt = entry.dueAt;
      }
    } else if (entry.kind === 'withdrawal') {
      if (entry.status === 'returned') {
        available -= entry.feeRefunded ? 0 : entry.fee;
      } else if (entry.status !== 'failed') {
        available -= entry.amount + entry.fee;
      }
    } else if (entry.kind === 'adjustment') {
      available += entry.amount;
    }
  }
  return { available: Math.max(0, available), pending, pendingDueAt, currency: 'EUR' };
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
  const methods = (await getPayoutMethods()).filter(m => m.verified);
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

/**
 * SCA (PSD2 strong customer authentication) prototype.
 *
 * Real SCA is a bank challenge bound to one operation: a fresh, single-use token.
 * Here `authorizeSca` stands in for Face ID / bank-app approval and returns an
 * operation-scoped token; the sensitive API calls refuse to proceed without one.
 * The UI must show the ScaSheet before calling it. A recurring auto-withdraw runs
 * under a standing mandate (`sca_standing_mandate`), not a per-run challenge.
 */
export type ScaPurpose = 'payout-method' | 'withdrawal';

export function isScaToken(token: string | undefined): boolean {
  return typeof token === 'string' && /^sca_[a-z_-]+_\d+$/.test(token);
}

export function scaRequired(): PayoutError {
  return new PayoutError('SCA_REQUIRED', 'Confirm this change with your bank first.');
}

export async function authorizeSca(purpose: ScaPurpose): Promise<string> {
  await wait(650);
  return `sca_${purpose}_${Date.now()}`;
}

/** Add an IBAN method (verifying -> verified after a mock check). SCA-gated. */
export async function addIbanMethod(input: { iban: string; label: string; scaToken?: string }) {
  if (!isScaToken(input.scaToken)) throw scaRequired();
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

/** Add a card from a one-time token (PAN never stored — see profile.tokeniseCard). SCA-gated. */
export async function addCardMethod(input: { token: string; last4: string; brand: string; label: string; scaToken?: string }) {
  if (!isScaToken(input.scaToken)) throw scaRequired();
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
export async function updatePayoutMethod(input: { iban: string; label: string; scaToken?: string }) {
  if (!isScaToken(input.scaToken)) throw scaRequired();
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
  // Auto-withdraw runs under the standing mandate the driver set up with SCA;
  // a per-run challenge would make the schedule useless.
  const { entry } = await requestWithdrawal(amount, method.id, 'sca_standing_mandate_0');
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
  store.set({ ledger: [...ensureLedger(), entry] });
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
  readonly code: 'NO_METHOD' | 'BELOW_MINIMUM' | 'INSUFFICIENT' | 'INVALID_AMOUNT' | 'SCA_REQUIRED';
  constructor(code: PayoutError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

/** Max cash-out for a method: amount + fee must fit the available balance. */
export function maxWithdrawalFor(available: number, fee: number): number {
  return Math.max(0, Math.floor((available - fee) * 100) / 100);
}

/** Prototype withdrawal through the PSP adapter: validates amount vs available
 *  balance + EUR 10 minimum + verified method, quotes fee/ETA per rail,
 *  executes via the provider, appends a `processing` ledger line.
 *  The fee counts toward the balance: amount + fee must fit available.
 *  No real money moves — the mock returns `mock_sepa_*` / `mock_card_*` refs. */
export async function requestWithdrawal(amount: number, methodId?: string, scaToken?: string) {
  if (!isScaToken(scaToken)) throw scaRequired();
  const rounded = Math.round(amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) throw new PayoutError('INVALID_AMOUNT', 'Enter an amount greater than EUR 0.');
  const methods = await getPayoutMethods();
  const method = (methodId ? methods.find(m => m.id === methodId) : methods.find(m => m.isDefault) ?? methods[0]) ?? null;
  if (!method) throw new PayoutError('NO_METHOD', 'Add a payout method first.');
  if (!method.verified) throw new PayoutError('NO_METHOD', 'Your payout method is still verifying — try again shortly.');
  if (rounded < PAYOUT_POLICY.minWithdrawal) throw new PayoutError('BELOW_MINIMUM', `Minimum withdrawal is EUR ${PAYOUT_POLICY.minWithdrawal}.`);
  const quote = quoteFor(method, rounded);
  const { available } = await getBalance();
  if (rounded + quote.fee > available) throw new PayoutError('INSUFFICIENT', 'Amount plus fee exceeds your available balance.');
  const result = await payoutProvider.execute(quote.rail, rounded, methodDestination(method));
  const now = new Date();
  const entry: LedgerEntry = {
    kind: 'withdrawal',
    id: result.providerRef,
    amount: rounded,
    fee: quote.fee,
    methodLabel: method.label || methodLabel(method),
    rail: quote.rail,
    status: 'processing',
    createdAt: now.toISOString(),
    expectedAt: quote.arrives,
    idempotencyKey: `${result.providerRef}`,
  };
  store.set({ ledger: [...ensureLedger(), entry] });
  return { entry, eta: quote.eta };
}

/**
 * Demo payout recovery (prototype concept logic, NOT real provider behaviour):
 * A. Processing → Delayed → Paid: the provider needs more time; no new withdrawal
 *    while the first outcome is unknown.
 * B. Processing → Failed → Funds returned: the reason is shown, amount + fee rule
 *    applied, driver fixes details and retries as a SEPARATE operation.
 * Idempotency: every transition is guarded by status + idempotencyKey — replays,
 * reloads and double clicks never debit or refund twice.
 */
export async function markWithdrawalDelayed(id: string, note = 'Provider needs more time') {
  const current = store.get();
  const entry = current.ledger.find((e) => e.kind === 'withdrawal' && e.id === id);
  if (!entry || entry.kind !== 'withdrawal') throw new Error('Withdrawal not found');
  if (entry.status !== 'processing') return entry;
  const next = { ...entry, status: 'delayed' as const, failReason: note };
  store.set({ ledger: current.ledger.map((e) => e.id === id ? next : e) });
  return next;
}

export async function markWithdrawalPaid(id: string) {
  const current = store.get();
  const entry = current.ledger.find((e) => e.kind === 'withdrawal' && e.id === id);
  if (!entry || entry.kind !== 'withdrawal') throw new Error('Withdrawal not found');
  if (entry.status === 'done') return entry;
  if (entry.status !== 'processing' && entry.status !== 'delayed') throw new Error('Only a pending payout can arrive');
  const next = { ...entry, status: 'done' as const };
  store.set({ ledger: current.ledger.map((e) => e.id === id ? next : e) });
  return next;
}

export async function markWithdrawalFailed(id: string, reason: string) {
  const current = store.get();
  const entry = current.ledger.find((e) => e.kind === 'withdrawal' && e.id === id);
  if (!entry || entry.kind !== 'withdrawal') throw new Error('Withdrawal not found');
  if (entry.status === 'failed' || entry.status === 'returned') return entry;
  if (entry.status !== 'processing' && entry.status !== 'delayed') throw new Error('Only a pending payout can fail');
  if (!reason.trim()) throw new Error('A failure needs a reason');
  const next = { ...entry, status: 'failed' as const, failReason: reason };
  store.set({ ledger: current.ledger.map((e) => e.id === id ? next : e) });
  return next;
}

/**
 * Funds-return rule (demo): the full amount returns to available; the fee is
 * refunded only when the failure is ours (wrong provider rail), never when the
 * destination details were wrong. Replays return the same entry — no double refund.
 */
export async function returnWithdrawalFunds(id: string, feeRefunded: boolean) {
  const current = store.get();
  const entry = current.ledger.find((e) => e.kind === 'withdrawal' && e.id === id);
  if (!entry || entry.kind !== 'withdrawal') throw new Error('Withdrawal not found');
  if (entry.status === 'returned') return entry;
  if (entry.status !== 'failed') throw new Error('Only a failed payout can be returned');
  const next = { ...entry, status: 'returned' as const, feeRefunded };
  store.set({ ledger: current.ledger.map((e) => e.id === id ? next : e) });
  return next;
}

/** One withdrawal by id — powers the permanent operation screen. */
export async function getWithdrawal(id: string) {
  await wait(150);
  const entry = store.get().ledger.find((e) => e.kind === 'withdrawal' && e.id === id);
  return entry?.kind === 'withdrawal' ? entry : null;
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

/** Driver v2: loads near the driver, sorted by net rate after the empty run. */
let loadsCache: Promise<V2Load[]> | null = null;
export async function getLoads(): Promise<V2Load[]> {
  loadsCache ??= wait(300).then(() => [...V2_LOADS].sort((a, b) => b.netPerKm - a.netPerKm));
  const loads = await loadsCache;
  // A live feed read is the natural point to reconcile deadlines. Without this,
  // an application whose approval window passed would still say "Awaiting".
  expireApplications();
  // Paid trips are not inventory. Seed the demo ledger here so BelRoute/Côte Fret
  // leave the feed even when the driver never opened Balance first.
  ensureLedger();
  return loads;
}

export async function searchLoads(route: { from: string; to: string }) {
  await wait(800); // keeps the “Searching loads…” screen real
  store.set({ route });
  return { count: 2 };
}

/** Commit a feed direction and remember it. Recent routes (max 5, most-recent-first,
 * case-insensitive dedup) power the Recent section of the direction sheet. */
export const MAX_RECENT_ROUTES = 5;

function sameRoute(a: { from: string; to: string }, b: { from: string; to: string }): boolean {
  return a.from.trim().toLocaleLowerCase() === b.from.trim().toLocaleLowerCase()
    && a.to.trim().toLocaleLowerCase() === b.to.trim().toLocaleLowerCase();
}

export async function commitRoute(route: { from: string; to: string }) {
  await wait(150);
  const clean = { from: route.from.trim(), to: route.to.trim() };
  const rest = store.get().recentRoutes.filter((r) => !sameRoute(r, clean));
  store.set({ route: clean, recentRoutes: [{ ...clean, at: new Date().toISOString() }, ...rest].slice(0, MAX_RECENT_ROUTES) });
  return clean;
}

export class AlreadyAppliedError extends Error {
  readonly code = 'ALREADY_APPLIED';
  constructor() { super('ALREADY_APPLIED'); }
}

export type ApplicationErrorCode =
  | 'NO_PAYOUT_METHOD'
  | 'PICKUP_CLOSED'
  | 'PICKUP_UNREACHABLE'
  | 'APPROVALS_CLOSED';

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  constructor(code: ApplicationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function getLoad(loadId: string): V2Load | null {
  return V2_LOADS.find((load) => load.id === loadId) ?? null;
}

const WAITING_STATUSES = [
  ApplicationStatus.SENT,
  ApplicationStatus.DISPATCHER_REVIEW,
  ApplicationStatus.CUSTOMER_REVIEW,
];

/**
 * Deadline reconciliation, called on every feed read. An application cannot stay
 * "awaiting" after both approvals are impossible. The deadline is snapshotted on
 * the application at apply time; legacy applications fall back to the load.
 */
export function expireApplications(now = Date.now()): number {
  const current = store.get();
  let changed = 0;
  let changedActive = false;
  const applications: Record<string, LoadApplication> = {};
  for (const application of Object.values(current.applications)) {
    if (!WAITING_STATUSES.includes(application.status)) continue;
    const deadline = application.approvalsDeadline ?? getLoad(application.loadId)?.approvalsAt;
    if (!deadline || Date.parse(deadline) > now) continue;
    applications[application.loadId] = {
      ...application,
      status: ApplicationStatus.EXPIRED,
      expiredAt: new Date(now).toISOString(),
    };
    changed += 1;
    if (current.loadId === application.loadId) changedActive = true;
  }
  if (changed > 0) {
    store.set({
      applications,
      ...(changedActive ? { status: ApplicationStatus.EXPIRED } : {}),
    });
  }
  return changed;
}

export async function submitApplication(loadId: string) {
  await wait(600);
  // Recheck after latency so simultaneous requests cannot create duplicates.
  const existing = store.getApplicationForLoad(loadId);
  // Re-apply after a cancelled trip starts fresh: the flag belongs to the old attempt.
  if (existing && !existing.dismissed && [ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW, ApplicationStatus.CONFIRMED].includes(existing.status) && !existing.cancelledAfterConfirm) {
    throw new AlreadyAppliedError();
  }
  const load = getLoad(loadId);
  if (!load) throw new ApplicationError('PICKUP_CLOSED', 'This load is no longer available.');
  if (Date.parse(load.approvalsAt) <= Date.now()) {
    throw new ApplicationError('APPROVALS_CLOSED', 'The application window has closed.');
  }
  if (isPickupClosed(load)) {
    throw new ApplicationError('PICKUP_CLOSED', 'The pickup window has closed.');
  }
  if (isPickupUnreachable(load)) {
    throw new ApplicationError('PICKUP_UNREACHABLE', 'You cannot reach this pickup before the window closes.');
  }
  // Money rule: no verified destination, no application. Confirming a trip we
  // cannot pay creates a support case, not a booking.
  if (!store.get().payoutMethods.some((method) => method.verified)) {
    throw new ApplicationError('NO_PAYOUT_METHOD', 'Add a verified payout method before applying.');
  }
  const submittedAtDate = new Date();
  const submittedAt = submittedAtDate.toISOString();
  const approvalsDeadline = new Date(submittedAtDate.getTime() + APPROVAL_WINDOW_MIN * 60_000).toISOString();
  store.set({
    loadId,
    status: ApplicationStatus.SENT,
    submittedAt,
    applications: {
      [loadId]: {
        loadId,
        status: ApplicationStatus.SENT,
        submittedAt,
        approvalsDeadline,
        autoAdvance: true,
      },
    },
  });
  return { loadId, status: ApplicationStatus.SENT };
}

/** Dismiss a load from the feed (decline before apply). Free, reversible, no score impact. */
export async function dismissLoad(loadId: string) {
  const existing = store.getApplicationForLoad(loadId);
  if (existing && !existing.dismissed && existing.status !== ApplicationStatus.CANCELLED && existing.status !== ApplicationStatus.REJECTED && existing.status !== ApplicationStatus.EXPIRED) {
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

/** Trip stage timeline for the TripDetails stepper (prototype-led, driver-confirmed milestones). */
export const TRIP_STAGE_STEPS = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'at-pickup', label: 'At pickup' },
  { id: 'loaded', label: 'Loaded' },
  { id: 'at-delivery', label: 'At delivery' },
  { id: 'delivered', label: 'Delivered' },
] as const;

export type TripStageStepId = (typeof TRIP_STAGE_STEPS)[number]['id'];

/** One confirmed-trip view model: load + application + trip id (screens never assemble this themselves). */
export async function getTripDetails(loadId: string) {
  await wait(300);
  const load = getLoad(loadId);
  if (!load) return null;
  const application = store.getApplicationForLoad(loadId);
  const isCancelledTrip = application?.status === ApplicationStatus.CANCELLED && application.cancelledAfterConfirm;
  if (!application || (application.status !== ApplicationStatus.CONFIRMED && !isCancelledTrip)) return null;
  return {
    load,
    application,
    tripId: application.tripId ?? `TR-${loadId}`,
    tripStage: (application.tripStage ?? 'confirmed') as TripStage,
    cancelled: application.cancelledAfterConfirm === true,
    enRouteTo: application.enRouteTo ?? null,
  };
}

/** Driver tapped Navigate — mark the trip en route so the arrival action appears in time. */
export async function setEnRoute(loadId: string, destination: 'pickup' | 'delivery') {
  await wait(150);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED || application.cancelledAfterConfirm) {
    throw new Error('This trip is not active');
  }
  store.set({ applications: { [loadId]: { ...application, enRouteTo: destination } } });
  return { loadId, enRouteTo: destination };
}

/** Preview-only cancellation consequence calculation, shared by confirmation UI and action. */
export function cancellationPenalty(application: LoadApplication, pickupTime?: string, now = Date.now()): CancelTripPenalty {
  // Grace is measured from confirmation, not from applying. Those can be hours apart.
  const confirmedAt = application.confirmedAt
    ? Date.parse(application.confirmedAt)
    : application.submittedAt ? Date.parse(application.submittedAt) : NaN;
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
export type TripStage = NonNullable<LoadApplication['tripStage']>;
const TRIP_STAGE_ORDER: TripStage[] = ['confirmed', 'at-pickup', 'loaded', 'at-delivery', 'delivered'];

/** Driver explicitly confirms each operational milestone. No demo timers or payment changes. */
export async function advanceTripStage(loadId: string, expected: TripStage, next: TripStage, handoverConfirmed = false) {
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED || application.cancelledAfterConfirm) {
    throw new Error('This trip is not active');
  }
  const actual = application.tripStage ?? 'confirmed';
  if (actual !== expected || TRIP_STAGE_ORDER.indexOf(next) !== TRIP_STAGE_ORDER.indexOf(actual) + 1) {
    throw new Error('Trip stage changed. Refresh and try again.');
  }
  if (next === 'delivered' && !handoverConfirmed) throw new Error('Confirm cargo handover before completing delivery');
  const deliveredAt = new Date().toISOString();
  // Arriving at a stop ends the en-route leg — the next Navigate starts a fresh one.
  const patch: Partial<typeof application> = { tripStage: next, enRouteTo: undefined, stageAt: deliveredAt };
  // Build on ensureLedger(): delivering on a fresh store must keep the seeded
  // €500 history — appending to the raw (empty) array would drop it.
  let ledger = ensureLedger();
  if (next === 'delivered') {
    patch.deliveryProofConfirmed = true;
    patch.deliveryCompletedAt = deliveredAt;
    // Delivered work becomes pending payout (net-7 style) — the Balance story starts here.
    // The demo invoice is created alongside so trip, ledger and invoice always agree.
    const load = getLoad(loadId);
    if (load && !current.ledger.some((entry) => entry.kind === 'trip' && entry.loadId === loadId)) {
      const tripId = application.tripId ?? `TR-${loadId}`;
      const dueAt = new Date(Date.parse(deliveredAt) + load.paymentTermDays * DAY_MS).toISOString();
      ledger = [
        ...ledger,
        {
          kind: 'trip' as const,
          id: `trip-${loadId}-${Date.parse(deliveredAt)}`,
          loadId,
          company: load.company,
          from: load.from,
          to: load.to,
          amount: load.rate,
          status: 'pending' as const,
          paidAt: null,
          day: new Date(deliveredAt).toLocaleDateString('en-GB', { weekday: 'short' }),
          paymentTermDays: load.paymentTermDays,
          dueAt,
        },
      ];
      await createDemoInvoice({
        loadId,
        tripId,
        company: load.company,
        from: load.from,
        to: load.to,
        amount: load.rate,
        paymentTermDays: load.paymentTermDays,
      });
    }
  }
  store.set({ ledger, applications: { [loadId]: { ...application, ...patch } } });
  return { loadId, tripStage: next };
}

/** Minutes elapsed since an ISO timestamp (0 when unknown) — powers "time at facility". */
export function minutesSince(iso: string | undefined, now = Date.now()): number {
  if (!iso) return 0;
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((now - at) / 60_000));
}

/**
 * Driver reports a delay so the dispatcher can be told.
 * Prototype: recorded on the trip and shown back to the driver; nothing is pushed anywhere.
 */
export async function reportDelay(loadId: string, minutes: number, reason: string) {
  await wait(200);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED || application.cancelledAfterConfirm) {
    throw new Error('This trip is not active');
  }
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('Enter how many minutes you are delayed.');
  if (!reason.trim()) throw new Error('Choose a reason for the delay.');
  const delayReport = { minutes: Math.round(minutes), reason: reason.trim(), at: new Date().toISOString() };
  store.set({ applications: { [loadId]: { ...application, delayReport } } });
  // The delay and the conversation are the same event: keep them in one place.
  appendSystemMessage(loadId, `Driver reported a ${delayReport.minutes} min delay — ${delayReport.reason.toLowerCase()}.`);
  return { loadId, delayReport };
}

/* ---------------- Dispatcher chat (one thread per trip) ---------------- */

const byChatTime = (a: ChatMessage, b: ChatMessage) => +new Date(a.at) - +new Date(b.at);

/** Dispatcher thread for one trip. Seeded on first open so it is never an empty screen. */
export async function getThread(loadId: string): Promise<ChatMessage[]> {
  await wait(200);
  const existing = store.get().chatMessages.filter((m) => m.loadId === loadId);
  if (existing.length > 0) return [...existing].sort(byChatTime);
  const load = getLoad(loadId);
  if (!load) return [];
  const seeded = seedThread(loadId, { from: load.from, to: load.to, gate: load.pickupSite.note });
  store.set({ chatMessages: [...store.get().chatMessages, ...seeded] });
  return [...seeded].sort(byChatTime);
}

/**
 * Driver sends a message. The AI dispatcher drafts an in-context reply right away
 * (vs a human dispatcher's minutes), and consequential topics are handed to a human.
 * Prototype: deterministic mock, no LLM, stored on this device, nothing is transmitted.
 */
export async function sendMessage(loadId: string, text: string): Promise<ChatMessage> {
  const body = text.trim();
  if (!body) throw new Error('Write a message first.');
  const message: ChatMessage = { id: chatId('msg'), loadId, author: 'driver' as const, text: body, at: new Date().toISOString() };
  store.set({ chatMessages: [...store.get().chatMessages, message] });

  // "AI is drafting": production replaces this wait with the real assistant round-trip.
  await wait(700);
  const load = getLoad(loadId);
  if (!load) return message;

  const reply = aiDispatcherReply({
    from: load.from, to: load.to, gate: load.pickupSite.note, window: load.window,
  }, body);
  const automated: ChatMessage = {
    id: chatId('ai'), loadId, author: 'dispatcher' as const, text: reply.text,
    at: new Date().toISOString(), automated: true,
  };
  store.set({ chatMessages: [...store.get().chatMessages, automated] });
  if (reply.escalate) {
    appendSystemMessage(loadId, 'Handed to a dispatcher — a human will reply shortly.');
  }
  return message;
}

/** System line in the thread — when an app action belongs in the conversation. */
function appendSystemMessage(loadId: string, text: string): ChatMessage {
  const message: ChatMessage = { id: chatId('sys'), loadId, author: 'system', text, at: new Date().toISOString() };
  store.set({ chatMessages: [...store.get().chatMessages, message] });
  return message;
}

/**
 * Demo payout pipeline (prototype concept logic, NOT real payment rules):
 * Delivered → POD submitted → POD accepted → Awaiting customer payment → Available.
 * Delivery, document review, invoice payment and money availability are separate states.
 * Transitions are driver- or demo-driven — never automatic timers.
 */
export type DemoEarningsState =
  | 'delivered-no-pod'
  | 'pod-submitted'
  | 'pod-accepted'
  | 'awaiting-payment'
  | 'available';

export function earningsStateFor(loadId: string): DemoEarningsState {
  const application = store.getApplicationForLoad(loadId);
  if (!application || application.status !== ApplicationStatus.CONFIRMED || application.cancelledAfterConfirm) {
    return 'delivered-no-pod';
  }
  if ((application.tripStage ?? 'confirmed') !== 'delivered') return 'delivered-no-pod';
  const podStatus = application.pod?.status;
  if (podStatus === 'rejected') return 'delivered-no-pod';
  if (podStatus === 'approved') {
    const entry = store.get().ledger.find((e) => e.kind === 'trip' && e.loadId === loadId);
    if (entry && entry.kind === 'trip' && entry.status === 'available') return 'available';
    return 'pod-accepted';
  }
  if (podStatus === 'submitted') return 'pod-submitted';
  return 'delivered-no-pod';
}

/** Demo control: customer accepts the POD → invoice moves toward payment. */
export async function acceptDemoPod(loadId: string) {
  const current = store.get();
  const application = current.applications[loadId];
  if (!application?.pod || application.pod.status !== 'submitted') {
    throw new Error('No submitted POD to accept');
  }
  store.set({ applications: { [loadId]: { ...application, pod: { ...application.pod, status: 'approved' } } } });
  return { loadId, status: 'approved' as const };
}

/** Demo control: customer rejects the POD with a reason → driver re-uploads. */
export async function rejectDemoPod(loadId: string, reason: string) {
  const current = store.get();
  const application = current.applications[loadId];
  if (!application?.pod || application.pod.status !== 'submitted') {
    throw new Error('No submitted POD to reject');
  }
  if (!reason.trim()) throw new Error('Rejection needs a reason');
  store.set({ applications: { [loadId]: { ...application, pod: { ...application.pod, status: 'rejected' } } } });
  return { loadId, status: 'rejected' as const, reason };
}

/** Demo control: customer pays the invoice → trip becomes available + invoice paid. */
export async function customerPaysDemoTrip(loadId: string) {
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.pod?.status !== 'approved') {
    throw new Error('POD must be accepted before the customer pays');
  }
  const paidAt = new Date().toISOString();
  const ledger = current.ledger.map((entry) =>
    entry.kind === 'trip' && entry.loadId === loadId && entry.status === 'pending'
      ? { ...entry, status: 'available' as const, paidAt }
      : entry,
  );
  store.set({ ledger });
  const { markDemoInvoicePaid } = await import('./invoices');
  await markDemoInvoicePaid(loadId);
  return { loadId, status: 'available' as const };
}

/** Local prototype attachment. A production app must upload to secure object storage. */
export async function submitProofOfDelivery(loadId: string, file: { filename: string; mimeType: string; dataUrl: string }) {
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED || application.tripStage !== 'delivered' || application.cancelledAfterConfirm) {
    throw new Error('Complete delivery before submitting POD');
  }
  if (!/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/.test(file.dataUrl)) throw new Error('Unsupported document format');
  if (file.dataUrl.length > 3_000_000) throw new Error('Document is too large (max 2 MB).');
  const pod = { ...file, uploadedAt: new Date().toISOString(), status: 'submitted' as const };
  store.set({ applications: { [loadId]: { ...application, pod } } });
  return { loadId, status: pod.status };
}

export async function cancelTrip(loadId: string, reason: NonNullable<LoadApplication['cancelReason']>) {
  await wait(300);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application || application.status !== ApplicationStatus.CONFIRMED) {
    throw new Error('No confirmed trip to cancel');
  }
  if (application.tripStage === 'delivered') {
    throw new Error('A delivered trip cannot be cancelled');
  }
  const load = getLoad(loadId);
  const penalty = cancellationPenalty(application, load?.pickupTime);
  // A cancelled trip never pays. Remove its pending line instead of leaving
  // phantom money in Balance, and void any invoice already generated.
  const ledger = current.ledger.filter((entry) => !(entry.kind === 'trip' && entry.loadId === loadId && entry.status === 'pending'));
  const { voidInvoiceForLoad } = await import('./invoices');
  await voidInvoiceForLoad(loadId);
  store.set({
    ledger,
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
  return { loadId, status: ApplicationStatus.CANCELLED, penalty, payout: 0 };
}

export async function cancelApplication(loadId: string) {
  await wait(300);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application) throw new Error('Application not found');
  if (!WAITING_STATUSES.includes(application.status)) {
    throw new Error('This application can no longer be cancelled');
  }
  store.set({
    ...(current.loadId === loadId ? { status: ApplicationStatus.CANCELLED } : {}),
    applications: {
      [loadId]: { ...application, status: ApplicationStatus.CANCELLED },
    },
  });
  return { loadId, status: ApplicationStatus.CANCELLED };
}

/**
 * Driver asks a human to review a declined or expired decision. Prototype: the
 * request is stored on the application and a system line is kept with the trip
 * conversation when one exists. Nothing is transmitted anywhere.
 */
export async function disputeApplication(loadId: string, message: string) {
  await wait(300);
  const current = store.get();
  const application = current.applications[loadId];
  if (!application) throw new Error('Application not found');
  if (![ApplicationStatus.REJECTED, ApplicationStatus.EXPIRED].includes(application.status)) {
    throw new Error('Only a declined or expired application can be disputed');
  }
  if (!message.trim()) throw new Error('Tell the dispatcher what to review.');
  const dispute = { message: message.trim(), at: new Date().toISOString(), status: 'sent' as const };
  store.set({ applications: { [loadId]: { ...application, dispute } } });
  return { loadId, dispute };
}

export async function getApplication() {
  await wait(200);
  return { loadId: store.get().loadId, status: store.get().status };
}

export async function advanceStatus(status: Status, loadId?: string, expectedStatus?: Status) {
  await wait(300);
  const current = store.get();
  const id = loadId ?? current.loadId;
  if (!id) throw new Error('No active application');
  const application = current.applications[id];
  if (!application) throw new Error('No active application');
  if (expectedStatus && application.status !== expectedStatus) {
    return { status: application.status, updated: false };
  }
  // The presenter can click after the deadline; the deadline still wins.
  const deadline = application.approvalsDeadline ?? getLoad(id)?.approvalsAt;
  if (WAITING_STATUSES.includes(application.status) && deadline && Date.parse(deadline) <= Date.now()) {
    store.set({
      ...(current.loadId === id ? { status: ApplicationStatus.EXPIRED } : {}),
      applications: {
        [id]: { ...application, status: ApplicationStatus.EXPIRED, expiredAt: new Date().toISOString() },
      },
    });
    return { status: ApplicationStatus.EXPIRED, updated: false };
  }
  store.set({
    ...(current.loadId === id ? { status } : {}),
    applications: { [id]: { ...application, status } },
  });
  return { status, updated: true };
}

/**
 * Demo scenario controls (prototype only): managed external events + clean reset.
 * Every scenario replays from a clean state and persists through reloads (localStorage).
 * New applications carry `autoAdvance` and run their own short review loop;
 * the presenter can still drive any transition explicitly.
 */
export type DemoScenarioId = 'book' | 'deliver' | 'cashout' | 'issue';

export async function resetDemoScenario(scenario: DemoScenarioId) {
  store.reset();
  const { resetDemoInvoices } = await import('./invoices');
  resetDemoInvoices();
  if (scenario === 'deliver' || scenario === 'cashout' || scenario === 'issue') {
    store.set({ loadId: DEMO_LOAD_ID, status: ApplicationStatus.CONFIRMED });
  }
  return { scenario, loadId: DEMO_LOAD_ID };
}

export async function demoDispatcherApprove(loadId: string = DEMO_LOAD_ID) {
  const current = store.get();
  if (!current.loadId || current.loadId !== loadId) {
    store.set({ loadId, status: ApplicationStatus.SENT });
  }
  await advanceStatus(ApplicationStatus.DISPATCHER_REVIEW, loadId);
  await advanceStatus(ApplicationStatus.CUSTOMER_REVIEW, loadId);
  return { loadId, status: ApplicationStatus.CUSTOMER_REVIEW };
}

export async function demoCustomerConfirm(loadId: string = DEMO_LOAD_ID) {
  await advanceStatus(ApplicationStatus.CONFIRMED, loadId);
  return { loadId, status: ApplicationStatus.CONFIRMED };
}

export async function demoTripToDelivered(loadId: string = DEMO_LOAD_ID) {
  const order: Array<[string, string]> = [
    ['confirmed', 'at-pickup'],
    ['at-pickup', 'loaded'],
    ['loaded', 'at-delivery'],
  ];
  for (const [from, to] of order) {
    await advanceTripStage(loadId, from as TripStage, to as TripStage);
  }
  await advanceTripStage(loadId, 'at-delivery', 'delivered', true);
  return { loadId, tripStage: 'delivered' as const };
}

/** Backload (PL): zlecenia po drodze. Mock data only; the screen applies the rules in `./bl/logic`. */
export async function getBlOrders(): Promise<BlOrder[]> {
  await wait(300);
  return BL_ORDERS;
}
