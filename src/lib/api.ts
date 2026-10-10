/**
 * Mock API — the ONLY place that knows where data comes from.
 * Swap the bodies for real fetch() calls and every screen keeps working.
 *
 * Levels:
 *  1. now: localStorage-backed store + artificial latency (skeletons, timers work)
 *  2. later: real backend — replace these functions, nothing else changes
 */
import { ApplicationStatus } from './models';
import { store, type Status } from './store';
import { V2_LOADS, type V2Load } from './v2/loads';
import { BL_ORDERS, type BlOrder } from './bl/logic';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Driver v2: loads near the driver, already sorted by what pays best per km. */
export async function getLoads(): Promise<V2Load[]> {
  await wait(300);
  return [...V2_LOADS].sort((a, b) => b.perKm - a.perKm);
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
  if (existing && [ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW, ApplicationStatus.CONFIRMED].includes(existing.status)) {
    throw new AlreadyAppliedError();
  }
  store.set({ loadId, status: ApplicationStatus.SENT, submittedAt: new Date().toISOString() });
  return { loadId, status: ApplicationStatus.SENT };
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
