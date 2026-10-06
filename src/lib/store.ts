import { useCallback, useEffect, useState } from 'react';

/** Application lifecycle in the prototype (mirrors the Figma status screens). */
export type Status = 'none' | 'awaiting-dispatcher' | 'awaiting-customer' | 'confirmed';

export type AppState = {
  route: { from: string; to: string };
  loadId: string | null;
  status: Status;
  submittedAt: string | null;
};

const KEY = 'pharos-driver-prototype';

const initial: AppState = {
  route: { from: '', to: '' },
  loadId: null,
  status: 'none',
  submittedAt: null,
};

function read(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...(JSON.parse(raw) as AppState) } : initial;
  } catch {
    return initial;
  }
}

let memory = read();
const listeners = new Set<(s: AppState) => void>();

/** Tiny store: one source of truth for the whole journey, persisted in localStorage. */
export const store = {
  get: () => memory,
  set(patch: Partial<AppState>) {
    memory = { ...memory, ...patch };
    localStorage.setItem(KEY, JSON.stringify(memory));
    listeners.forEach((l) => l(memory));
  },
  reset() {
    memory = initial;
    localStorage.removeItem(KEY);
    listeners.forEach((l) => l(memory));
  },
  subscribe(l: (s: AppState) => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore() {
  const [state, setState] = useState<AppState>(memory);
  useEffect(() => store.subscribe(setState) as unknown as () => void, []);
  return {
    state,
    setStatus: useCallback((status: Status) => store.set({ status }), []),
    reset: useCallback(() => store.reset(), []),
  };
}
