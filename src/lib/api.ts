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

import { normalizeContactProfile, normalizePayoutMethod, maskIban, type ContactProfile, type LedgerEntry, type PayoutMethod } from './profile';
export { validatePhone, validateEmail, validateIban, formatIban, maskIban } from './profile';
export type { ContactProfile, LedgerEntry, PayoutMethod } from './profile';

/** Prototype payout policy (NOT approved business rules — see PORT-LOG): SEPA 1–2 business
 *  days, no fee in prototype. Instant card payout is out of scope. Minimum withdrawal €10. */
export const PAYOUT_POLICY = Object.freeze({
  rail: 'SEPA transfer',
  eta: '1–2 business days',
  fee: 0,
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

/** Available = settled trips minus withdrawals; pending = unsettled trips. */
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
    }
  }
  return { available: Math.max(0, available), pending, currency: 'EUR' };
}

export async function getLedger(): Promise<LedgerEntry[]> {
  await wait(250);
  return [...ensureLedger()];
}

export async function getPayoutMethod(): Promise<PayoutMethod> {
  return { ...store.get().payoutMethod };
}

/** Only IBAN + label are accepted; stored compact-uppercase. Empty IBAN clears the method. */
export async function updatePayoutMethod(method: PayoutMethod) {
  await wait(300);
  const payoutMethod = normalizePayoutMethod(method);
  store.set({ payoutMethod });
  return getPayoutMethod();
}

export class PayoutError extends Error {
  readonly code: 'NO_METHOD' | 'BELOW_MINIMUM' | 'INSUFFICIENT' | 'INVALID_AMOUNT';
  constructor(code: PayoutError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

/** Prototype withdrawal: validates amount vs available balance + €10 minimum + IBAN set,
 *  appends a `processing` ledger line. No real money moves. */
export async function requestWithdrawal(amount: number) {
  await wait(600);
  const rounded = Math.round(amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) throw new PayoutError('INVALID_AMOUNT', 'Enter an amount greater than €0.');
  const method = store.get().payoutMethod;
  if (!method.iban) throw new PayoutError('NO_METHOD', 'Add a bank account (IBAN) first.');
  if (rounded < PAYOUT_POLICY.minWithdrawal) throw new PayoutError('BELOW_MINIMUM', `Minimum withdrawal is €${PAYOUT_POLICY.minWithdrawal}.`);
  const { available } = await getBalance();
  if (rounded > available) throw new PayoutError('INSUFFICIENT', 'Amount exceeds your available balance.');
  const entry: LedgerEntry = {
    kind: 'withdrawal',
    id: `wd-${Date.now()}`,
    amount: rounded,
    fee: PAYOUT_POLICY.fee,
    methodLabel: method.label || maskIban(method.iban),
    status: 'processing',
    createdAt: new Date().toISOString(),
  };
  store.set({ ledger: [...store.get().ledger, entry] });
  return { entry, eta: PAYOUT_POLICY.eta };
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
  // Prototype restriction: rebooking a cancelled confirmed trip is blocked; expiry policy is not approved.
  if (existing?.cancelledAfterConfirm) {
    throw new AlreadyAppliedError();
  }
  if (existing && !existing.dismissed && [ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW, ApplicationStatus.CONFIRMED].includes(existing.status)) {
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
  if (existing?.cancelledAfterConfirm) throw new Error("A cancelled trip cannot be dismissed");
  store.set({
    applications: {
      [loadId]: { loadId, status: ApplicationStatus.CANCELLED, submittedAt: null, dismissed: true },
    },
  });
  return { loadId, dismissed: true };
}

/** Bring a dismissed load back into the feed. */
export async function restoreLoad(loadId: string) {
  const current = store.get();
  if (current.applications[loadId]?.dismissed) {
    store.set(current.loadId === loadId
      ? { loadId: null, status: null, submittedAt: null }
      : {}, [loadId]);
  }
  return { loadId, dismissed: false };
}

export type CancelTripPenalty = 'none' | 'warning';

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
  const confirmedAt = application.submittedAt ? Date.parse(application.submittedAt) : Date.now();
  const pickupAt = load?.pickupTime ? Date.parse(load.pickupTime) : NaN;
  const minsSinceConfirm = (Date.now() - confirmedAt) / 60_000;
  const hoursToPickup = Number.isFinite(pickupAt) ? (pickupAt - Date.now()) / 3_600_000 : NaN;
  const penalty: CancelTripPenalty =
    minsSinceConfirm <= 15 || (Number.isFinite(hoursToPickup) && hoursToPickup >= 24) ? 'none' : 'warning';
  store.set({
    loadId,
    status: ApplicationStatus.CANCELLED,
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
