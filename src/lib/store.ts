import { useCallback, useEffect, useState } from 'react';
import { ApplicationStatus } from './models';

export type Status = ApplicationStatus;

export type LoadApplication = { loadId: string; status: ApplicationStatus; submittedAt: string | null; tripId?: string };

export type AppState = {
  applications: Record<string, LoadApplication>;
  route: { from: string; to: string };
  loadId: string | null;
  status: ApplicationStatus | null;
  submittedAt: string | null;
};

const KEY = 'pharos-driver-prototype';

const initial: AppState = {
  applications: {},
  route: { from: '', to: '' },
  loadId: null,
  status: null,
  submittedAt: null,
};

const LEGACY_STATUS: Record<string, ApplicationStatus | null> = {
  none: null,
  sent: ApplicationStatus.SENT,
  'awaiting-dispatcher': ApplicationStatus.DISPATCHER_REVIEW,
  'awaiting-customer': ApplicationStatus.CUSTOMER_REVIEW,
  confirmed: ApplicationStatus.CONFIRMED,
  rejected: ApplicationStatus.REJECTED,
  cancelled: ApplicationStatus.CANCELLED,
};

function read(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const saved = JSON.parse(raw) as Partial<AppState> & { status?: string | null };
    const status = Object.values(ApplicationStatus).includes(saved.status as ApplicationStatus)
      ? saved.status as ApplicationStatus
      : LEGACY_STATUS[saved.status ?? 'none'] ?? null;
    const applications = { ...saved.applications };
    if (saved.loadId && status) applications[saved.loadId] = { loadId: saved.loadId, status, submittedAt: saved.submittedAt ?? null };
    return { ...initial, ...saved, applications, status };
  } catch {
    return initial;
  }
}

let memory = read();
const listeners = new Set<(s: AppState) => void>();

/** Tiny global store: one source of truth for the journey, persisted in localStorage. */
export const store = {
  get: () => memory,
  getApplicationForLoad: (loadId: string): LoadApplication | null => memory.applications[loadId] ?? null,
  set(patch: Partial<AppState>) {
    const next = { ...memory, ...patch, applications: { ...memory.applications, ...patch.applications } };
    if (next.loadId && next.status) {
      next.applications[next.loadId] = {
        loadId: next.loadId, status: next.status, submittedAt: next.submittedAt,
        ...(next.status === ApplicationStatus.CONFIRMED
          ? { tripId: next.applications[next.loadId]?.tripId ?? `TR-${next.loadId}` }
          : {}),
      };
    }
    memory = next;
    localStorage.setItem(KEY, JSON.stringify(memory));
    listeners.forEach((listener) => listener(memory));
  },
  reset() {
    memory = initial;
    localStorage.removeItem(KEY);
    listeners.forEach((listener) => listener(memory));
  },
  subscribe(listener: (s: AppState) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useStore() {
  const [state, setState] = useState<AppState>(memory);
  useEffect(() => store.subscribe(setState) as unknown as () => void, []);
  return {
    state,
    setStatus: useCallback((status: ApplicationStatus | null) => store.set({ status }), []),
    reset: useCallback(() => store.reset(), []),
  };
}

export const getApplicationForLoad = (loadId: string) => store.getApplicationForLoad(loadId);
