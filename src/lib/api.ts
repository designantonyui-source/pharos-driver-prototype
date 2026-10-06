/**
 * Mock API — the ONLY place that knows where data comes from.
 * Swap the bodies for real fetch() calls and every screen keeps working.
 *
 * Levels:
 *  1. now: localStorage-backed store + artificial latency (skeletons, timers work)
 *  2. later: real backend — replace these functions, nothing else changes
 */
import { store, type Status } from './store';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function searchLoads(route: { from: string; to: string }) {
  await wait(800); // keeps the “Searching loads…” screen real
  store.set({ route });
  return { count: 2 };
}

export async function submitApplication(loadId: string) {
  await wait(600);
  store.set({ loadId, status: 'awaiting-dispatcher', submittedAt: new Date().toISOString() });
  return { loadId, status: 'awaiting-dispatcher' as Status };
}

export async function getApplication() {
  await wait(200);
  return { loadId: store.get().loadId, status: store.get().status };
}

export async function advanceStatus(status: Status) {
  await wait(300);
  store.set({ status });
  return { status };
}
