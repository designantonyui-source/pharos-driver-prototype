/**
 * Backload (PL) — application state and every user action in one place.
 * Screens never mutate data directly: they call `bl.*`. Persisted in localStorage like `lib/store.ts`.
 * Journey: register → onboarding → add trip → unload → search → list → details → book → load → unload → finish
 *          → profile (history). Cancel before loading. Offline blocks booking and cancelling; progress is kept.
 */
import { useSyncExternalStore } from 'react';
import { BL_ORDERS, PROFILE_DEFAULT, blockOf, type BlContext, type Body, type Profile } from './logic';

export type Trip = {
  id: number;
  from: string;
  to: string;
  cargo: string;
  unloadBy: number;
  status: 'unloading' | 'unloaded';
};

export type Booked = { orderId: number; stage: 0 | 1 | 2 };

export type HistoryItem = {
  id: string;
  route: string;
  amount: number;
  date: string;
  kind: 'backload' | 'penalty';
  pending: boolean;
};

export type Search = { city: string; deadlineH: number | null; radius: number; onlyProfitable: boolean };

export type BlState = {
  registered: boolean;
  role: string | null;
  profile: Profile;
  clock: number; // minutes from midnight, refreshed from real time every 15 s
  clockBase: number; // demo start: 581 = 09:41
  startedAt: number; // epoch ms when the demo clock started
  shift: number; // minutes added by the demo button
  trip: Trip | null;
  booked: Booked | null;
  takenIds: number[];
  offline: boolean;
  search: Search | null;
  history: HistoryItem[];
};

export const INITIAL: BlState = {
  registered: false,
  role: null,
  profile: PROFILE_DEFAULT,
  clock: 581, // 09:41
  clockBase: 581,
  startedAt: 0,
  shift: 0,
  trip: null,
  booked: null,
  takenIds: [],
  offline: false,
  search: null,
  history: [
    { id: 'h2', route: 'Wrocław → Opole', amount: 280, date: '5 paź', kind: 'backload', pending: false },
    { id: 'h1', route: 'Warszawa → Poznań', amount: 350, date: '2 paź', kind: 'backload', pending: false },
  ],
};

const KEY = 'backload-pl-v1';

/** Demo clock: starts at clockBase and runs in real time, plus the minutes added by the demo button. */
function computeClock(s: BlState): number {
  return s.clockBase + Math.floor((Date.now() - s.startedAt) / 60000) + s.shift;
}

function read(): BlState {
  try {
    const raw = localStorage.getItem(KEY);
    const s: BlState = raw ? { ...INITIAL, ...(JSON.parse(raw) as BlState) } : { ...INITIAL };
    if (!s.startedAt) s.startedAt = Date.now();
    s.clock = computeClock(s);
    return s;
  } catch {
    return { ...INITIAL, startedAt: Date.now() };
  }
}

let memory: BlState = read();
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.setInterval(() => {
    const c = computeClock(memory);
    if (c !== memory.clock) commit({ ...memory, clock: c });
  }, 15000);
}

function commit(next: BlState) {
  memory = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
  listeners.forEach((l) => l());
}

export function getBl(): BlState {
  return memory;
}

export function subscribeBl(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useBl(): BlState {
  return useSyncExternalStore(subscribeBl, getBl, getBl);
}

/** Free-from minute: with an unloaded trip it is now; with an unloading trip, the later of now and unload time. */
export function freeAtOf(s: BlState): number | null {
  if (!s.trip) return null;
  return s.trip.status === 'unloaded' ? s.clock : Math.max(s.clock, s.trip.unloadBy);
}

export function ctxOf(s: BlState): BlContext {
  return {
    clock: s.clock,
    freeAt: freeAtOf(s),
    deadlineH: s.search?.deadlineH ?? null,
    profile: s.profile,
  };
}

export function orderById(id: number) {
  return BL_ORDERS.find((o) => o.id === id) ?? null;
}

/** Minutes past the pickup time while the driver has not loaded yet (0 when on time or no booking). */
export function lateMinutes(s: BlState): number {
  if (!s.booked || s.booked.stage !== 0) return 0;
  const o = orderById(s.booked.orderId);
  return o ? Math.max(0, s.clock - o.pickupAt) : 0;
}

/** Actions. Each returns what happened so screens can show the right message. */
export const bl = {
  register(role: string, body: Body, adr: boolean) {
    commit({ ...memory, registered: true, role, profile: { body, adr } });
  },

  addTrip() {
    commit({
      ...memory,
      trip: { id: 2041, from: 'Łódź', to: 'Częstochowa', cargo: 'Palety: części · 12 t', unloadBy: 840, status: 'unloading' },
    });
  },

  unload() {
    if (memory.trip) commit({ ...memory, trip: { ...memory.trip, status: 'unloaded' } });
  },

  setSearch(search: Search) {
    commit({ ...memory, search });
  },

  /** Returns null on success or the reason the booking is blocked (spec §6.4). */
  book(orderId: number): string | null {
    const o = orderById(orderId);
    if (!o) return 'Zlecenie nie istnieje';
    const block = blockOf(o, ctxOf(memory), memory.takenIds, memory.offline, memory.booked != null);
    if (block) return block.msg;
    const rival = orderId === 5 ? 2 : 5; // spec §6.7: another driver takes the neighbouring order
    commit({
      ...memory,
      booked: { orderId, stage: 0 },
      takenIds: memory.takenIds.includes(rival) ? memory.takenIds : [...memory.takenIds, rival],
    });
    return null;
  },

  /** Stage 0 → 1 (loaded). Stage 1 → 2 (unloaded): writes the payout to history. Works offline.
   *  Loading needs the current cargo unloaded first (trip status 'unloaded' or no trip). */
  advance() {
    const b = memory.booked;
    if (!b) return;
    if (b.stage === 0) {
      if (memory.trip?.status === 'unloading') return;
      return commit({ ...memory, booked: { ...b, stage: 1 } });
    }
    if (b.stage === 1) {
      const o = orderById(b.orderId)!;
      commit({
        ...memory,
        booked: { ...b, stage: 2 },
        history: [
          { id: `n${Date.now()}`, route: `${o.from} → ${o.to}`, amount: o.payout, date: 'dziś', kind: 'backload', pending: memory.offline },
          ...memory.history,
        ],
      });
    }
  },

  /** Returns the penalty charged (0 = free). Not allowed offline or after loading (screens check that). */
  cancel(): number {
    const b = memory.booked;
    if (!b) return 0;
    const o = orderById(b.orderId)!;
    const penalty = memory.clock <= o.cancelFreeUntil ? 0 : o.cancelPenalty;
    commit({
      ...memory,
      booked: null,
      history:
        penalty > 0
          ? [{ id: `p${Date.now()}`, route: `Anulowanie · ${o.from} → ${o.to}`, amount: -penalty, date: 'dziś', kind: 'penalty', pending: false }, ...memory.history]
          : memory.history,
    });
    return penalty;
  },

  /** Returns the amount synchronised when the connection comes back (0 if nothing was pending). */
  setOffline(offline: boolean): number {
    if (offline) {
      commit({ ...memory, offline: true });
      return 0;
    }
    const pending = memory.history.filter((h) => h.pending).reduce((a, h) => a + h.amount, 0);
    commit({ ...memory, offline: false, history: memory.history.map((h) => (h.pending ? { ...h, pending: false } : h)) });
    return pending;
  },

  clearHistory() {
    commit({ ...memory, history: [] });
  },

  /** After a finished load the driver starts a new cycle: trip and booking are cleared. */
  clearTrip() {
    commit({ ...memory, trip: null, booked: null });
  },

  /** Driver edits role, body and ADR after registration. Lists and blocks update at once. */
  updateProfile(role: string, body: Body, adr: boolean) {
    commit({ ...memory, role, profile: { body, adr } });
  },

  /** Demo only: moves the clock forward by minutes on top of real time. */
  shiftClock(minutes: number) {
    const shift = memory.shift + minutes;
    commit({ ...memory, shift, clock: computeClock({ ...memory, shift }) });
  },

  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    commit({ ...INITIAL, history: INITIAL.history, startedAt: Date.now(), clock: INITIAL.clockBase });
  },
};
