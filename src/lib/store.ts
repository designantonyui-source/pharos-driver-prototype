import { useCallback, useEffect, useState } from 'react';
import { ApplicationStatus } from './models';
import { normalizeContactProfile, normalizePayoutMethod, type ContactProfile, type LedgerEntry, type PayoutMethod } from './profile';

export type Status = ApplicationStatus;

export type LoadApplication = {
  loadId: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  tripId?: string;
  /** Dismissed from the feed (decline before apply) — free, reversible, never touches the score. */
  dismissed?: boolean;
  /** Cancel reason after confirm (Uber Freight ladder input) — feeds the future reliability score. */
  cancelReason?: 'breakdown' | 'delay' | 'better-load' | 'other';
  /** Confirmed trip cancelled by the driver (vs application withdrawn before confirm). */
  cancelledAfterConfirm?: boolean;
};

export type AppState = {
  /** Prototype only; identity is deliberately not persisted or editable. */
  contactProfile: ContactProfile;
  /** Payout destination (SEPA IBAN). Empty iban = not set. */
  payoutMethod: PayoutMethod;
  /** Local ledger: paid/pending trips + withdrawals. Prototype-only, never a real balance. */
  ledger: LedgerEntry[];
  applications: Record<string, LoadApplication>;
  route: { from: string; to: string };
  loadId: string | null;
  status: ApplicationStatus | null;
  submittedAt: string | null;
};

const KEY = 'pharos-driver-prototype';

const initial: AppState = {
  contactProfile: { phone: '', email: '' },
  payoutMethod: { iban: '', label: '' },
  ledger: [],
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

function isLedgerEntry(value: unknown): value is LedgerEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  if (entry.kind === 'trip') {
    return typeof entry.id === 'string' && typeof entry.amount === 'number'
      && (entry.status === 'available' || entry.status === 'pending');
  }
  if (entry.kind === 'withdrawal') {
    return typeof entry.id === 'string' && typeof entry.amount === 'number'
      && typeof entry.fee === 'number'
      && (entry.status === 'processing' || entry.status === 'done');
  }
  return false;
}

function read(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const saved = JSON.parse(raw) as Partial<AppState> & { status?: string | null };
    const status = Object.values(ApplicationStatus).includes(saved.status as ApplicationStatus)
      ? saved.status as ApplicationStatus
      : LEGACY_STATUS[saved.status ?? 'none'] ?? null;
    const applications = { ...saved.applications };
    if (saved.loadId && status) applications[saved.loadId] = { ...applications[saved.loadId], loadId: saved.loadId, status, submittedAt: saved.submittedAt ?? null };
    let contactProfile = initial.contactProfile;
    try {
      if (saved.contactProfile) contactProfile = normalizeContactProfile(saved.contactProfile);
    } catch { /* Ignore malformed prototype contact data without losing the journey. */ }
    let payoutMethod = initial.payoutMethod;
    try {
      if (saved.payoutMethod) payoutMethod = normalizePayoutMethod(saved.payoutMethod);
    } catch { /* Ignore malformed prototype payout data without losing the journey. */ }
    const ledger = Array.isArray(saved.ledger) ? saved.ledger.filter(isLedgerEntry) : [];
    return { ...initial, ...saved, applications, status, contactProfile, payoutMethod, ledger };
  } catch {
    return initial;
  }
}

let memory = read();
const listeners = new Set<(s: AppState) => void>();

/** Tiny global store: one source of truth for the journey, persisted in localStorage. */
export const store = {
  get: () => memory,
  /** Validated read — use this, not `memory.applications[id]` directly. */
  getApplicationForLoad,
  set(patch: Partial<AppState>, removeApplicationIds: string[] = []) {
    const next = { ...memory, ...patch, applications: { ...memory.applications, ...patch.applications } };
    for (const id of removeApplicationIds) delete next.applications[id];
    if (next.loadId && next.status && !removeApplicationIds.includes(next.loadId)) {
      next.applications[next.loadId] = {
        ...next.applications[next.loadId],
        loadId: next.loadId, status: next.status, submittedAt: next.submittedAt,
        ...(next.status === ApplicationStatus.CONFIRMED
          ? { tripId: next.applications[next.loadId]?.tripId ?? `TR-${next.loadId}` }
          : {}),
      };
    }
    next.contactProfile = normalizeContactProfile(next.contactProfile);
    next.payoutMethod = normalizePayoutMethod(next.payoutMethod);
    if (!Array.isArray(next.ledger)) next.ledger = [];
    localStorage.setItem(KEY, JSON.stringify(next));
    memory = next;
    listeners.forEach((listener) => listener(memory));
  },
  reset() {
    localStorage.removeItem(KEY);
    memory = initial;
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

export function getApplicationForLoad(loadId: string): LoadApplication | null {
  const found = memory.applications[loadId] ?? null;
  if (!found) return null;
  // localStorage is untrusted input: drop anything outside the enum instead of
  // silently rendering it as available (same rule as the top-level status).
  return Object.values(ApplicationStatus).includes(found.status) ? found : null;
}
