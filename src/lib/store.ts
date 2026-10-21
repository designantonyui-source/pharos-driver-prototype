import { useCallback, useEffect, useState } from 'react';
import { ApplicationStatus } from './models';
import { migrateLegacyMethod, normalizeContactProfile, normalizePayoutMethod, normalizeSchedule, type ContactProfile, type LedgerEntry, type PayoutMethod, type PayoutSchedule, type ScheduledRun } from './profile';
import { withApprovalWindow } from './approval';
import type { ChatMessage } from './chat';

export type Status = ApplicationStatus;

export type LoadApplication = {
  loadId: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  /** When both approvals landed. Cancellation grace is measured from here, not from apply. */
  confirmedAt?: string;
  /** The deadline snapshot taken at apply time, so a reload cannot move it. */
  approvalsDeadline?: string;
  /** Demo-only: advances a waiting application; `false` keeps it manual. */
  autoAdvance?: boolean;
  /** Terminal expiry timestamp. */
  expiredAt?: string;
  /** Driver asked the dispatcher to review a declined/expired decision. */
  dispute?: { message: string; at: string; status: 'sent' };
  tripId?: string;
  /** Driver-controlled operational milestone, separate from dispatcher approval and payment. */
  tripStage?: 'confirmed' | 'at-pickup' | 'loaded' | 'at-delivery' | 'delivered';
  deliveryProofConfirmed?: boolean;
  deliveryCompletedAt?: string;
  /** POD is a separate review process, not proof of payment. */
  pod?: { filename: string; mimeType: string; dataUrl: string; uploadedAt: string; status: 'submitted' | 'approved' | 'rejected' };
  /** Dismissed from the feed (decline before apply) — free, reversible, never touches the score. */
  dismissed?: boolean;
  /** Cancel reason after confirm (Uber Freight ladder input) — feeds the future reliability score. */
  cancelReason?: 'breakdown' | 'delay' | 'better-load' | 'other';
  /** Confirmed trip cancelled by the driver (vs application withdrawn before confirm). */
  cancelledAfterConfirm?: boolean;
  /** Driver tapped Navigate and is en route to a stop (survives reload while Maps is open). */
  enRouteTo?: 'pickup' | 'delivery';
  /** When the driver confirmed the current tripStage — powers "time at facility". */
  stageAt?: string;
  /** Driver-reported delay (prototype: recorded on the trip, not pushed to a dispatcher). */
  delayReport?: { minutes: number; reason: string; at: string };
};

export type AppState = {
  /** Prototype only; identity is deliberately not persisted or editable. */
  contactProfile: ContactProfile;
  /** Payout destinations (Wave 1: several IBANs + one card). Empty = not set. */
  payoutMethods: PayoutMethod[];
  /** Legacy Wave-0 single method (migrated on read). */
  payoutMethod?: PayoutMethod | { iban: string; label: string };
  /** Local ledger: paid/pending trips + withdrawals + adjustments. Prototype-only, never a real balance. */
  ledger: LedgerEntry[];
  /** Auto-withdraw rule (Wave 3). Off by default. */
  payoutSchedule: PayoutSchedule;
  /** Record of auto executions (Wave 3, prototype: evaluated on Balance open). */
  scheduledRuns: ScheduledRun[];
  /** Dispatcher threads, one per trip (prototype: local only, nothing is transmitted). */
  chatMessages: ChatMessage[];
  applications: Record<string, LoadApplication>;
  route: { from: string; to: string };
  /** Last applied directions, most-recent-first (max 5). Powers the Recent section. */
  recentRoutes: { from: string; to: string; at?: string }[];
  loadId: string | null;
  status: ApplicationStatus | null;
  submittedAt: string | null;
};

const KEY = 'pharos-driver-prototype';

const initial: AppState = {
  contactProfile: { phone: '', email: '' },
  // The demo driver has already been paid for two trips, so a verified destination
  // must exist. Starting with an empty wallet contradicted its own ledger and made
  // the first application impossible until the driver found Balance.
  payoutMethods: [{
    kind: 'iban',
    id: 'iban-demo-fr',
    iban: 'FR7630006000011234567890189',
    label: 'Business account',
    isDefault: true,
    verified: true,
  }],
  ledger: [],
  payoutSchedule: { mode: 'off' },
  scheduledRuns: [],
  chatMessages: [],
  applications: {},
  route: { from: '', to: '' },
  recentRoutes: [],
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
  expired: ApplicationStatus.EXPIRED,
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
      && (entry.rail === undefined || entry.rail === 'sepa' || entry.rail === 'instant-card')
      && (entry.status === 'processing' || entry.status === 'delayed' || entry.status === 'done' || entry.status === 'failed' || entry.status === 'returned');
  }
  if (entry.kind === 'adjustment') {
    return typeof entry.id === 'string' && typeof entry.amount === 'number'
      && (entry.reason === 'dispute' || entry.reason === 'damage' || entry.reason === 'bonus' || entry.reason === 'correction')
      && typeof entry.note === 'string' && entry.status === 'applied';
  }
  return false;
}

function isRoute(value: unknown): value is { from: string; to: string; at?: string } {
  if (typeof value !== 'object' || value === null) return false;
  const route = value as Record<string, unknown>;
  return typeof route.from === 'string' && typeof route.to === 'string'
    && (route.at === undefined || typeof route.at === 'string');
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m.id === 'string' && typeof m.loadId === 'string'
    && (m.author === 'driver' || m.author === 'dispatcher' || m.author === 'system')
    && typeof m.text === 'string' && typeof m.at === 'string';
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
    for (const [id, application] of Object.entries(applications)) {
      applications[id] = withApprovalWindow(application);
    }
    let contactProfile = initial.contactProfile;
    try {
      if (saved.contactProfile) contactProfile = normalizeContactProfile(saved.contactProfile);
    } catch { /* Ignore malformed prototype contact data without losing the journey. */ }
    let payoutMethods = initial.payoutMethods;
    try {
      if (Array.isArray(saved.payoutMethods)) {
        payoutMethods = saved.payoutMethods.map(normalizePayoutMethod);
      } else if (saved.payoutMethod) {
        // Wave-0 shape { iban, label } migrates to a one-item verified list.
        const single = saved.payoutMethod as PayoutMethod | { iban: string; label: string };
        payoutMethods = 'kind' in single ? [normalizePayoutMethod(single)] : migrateLegacyMethod(single);
      }
    } catch { /* Ignore malformed prototype payout data without losing the journey. */ }
    const ledger = Array.isArray(saved.ledger) ? saved.ledger.filter(isLedgerEntry) : [];
    const chatMessages = Array.isArray(saved.chatMessages) ? saved.chatMessages.filter(isChatMessage) : [];
    const recentRoutes = Array.isArray(saved.recentRoutes) ? saved.recentRoutes.filter(isRoute).slice(0, 5) : [];
    const payoutSchedule = normalizeSchedule(saved.payoutSchedule);
    const scheduledRuns = Array.isArray(saved.scheduledRuns)
      ? saved.scheduledRuns.filter((r): r is ScheduledRun => typeof r === 'object' && r !== null && typeof (r as ScheduledRun).id === 'string')
      : [];
    return { ...initial, ...saved, applications, status, contactProfile, payoutMethods, payoutMethod: undefined, ledger, payoutSchedule, scheduledRuns, chatMessages, recentRoutes };
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
      const existing = next.applications[next.loadId];
      next.applications[next.loadId] = {
        ...existing,
        loadId: next.loadId,
        status: next.status,
        // A status advance must not erase the original submit time with a stale
        // top-level `submittedAt`; only an explicit patch may replace it.
        ...('submittedAt' in patch
          ? { submittedAt: next.submittedAt }
          : { submittedAt: existing?.submittedAt ?? next.submittedAt }),
        ...(next.status === ApplicationStatus.CONFIRMED
          ? {
              tripId: existing?.tripId ?? `TR-${next.loadId}`,
              confirmedAt: existing?.confirmedAt ?? new Date().toISOString(),
            }
          : {}),
      };
    }
    // A confirmed application gets its confirmation clock even when it arrives in
    // a bulk `applications` patch (demo controls, multi-application flows).
    for (const [id, application] of Object.entries(next.applications)) {
      if (application.status === ApplicationStatus.CONFIRMED && !application.confirmedAt) {
        next.applications[id] = { ...application, confirmedAt: new Date().toISOString() };
      }
    }
    next.contactProfile = normalizeContactProfile(next.contactProfile);
    if (Array.isArray(next.payoutMethods)) next.payoutMethods = next.payoutMethods.map(normalizePayoutMethod);
    else next.payoutMethods = [];
    delete (next as Partial<AppState>).payoutMethod;
    if (!Array.isArray(next.ledger)) next.ledger = [];
    try { next.payoutSchedule = normalizeSchedule(next.payoutSchedule); }
    catch { next.payoutSchedule = { mode: 'off' }; }
    if (!Array.isArray(next.scheduledRuns)) next.scheduledRuns = [];
    if (!Array.isArray(next.chatMessages)) next.chatMessages = [];
    if (!Array.isArray(next.recentRoutes)) next.recentRoutes = [];
    else next.recentRoutes = next.recentRoutes.filter(isRoute).slice(0, 5);
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

/**
 * The current ledger, as a stable reference.
 *
 * `store.set` keeps the same array instance unless the ledger itself changed,
 * so this can be used directly as an effect dependency: a money screen refetches
 * exactly when money moved, and not on unrelated store writes (chat, profile,
 * dismissed loads).
 *
 * Without it, a screen that mounts before the money arrives keeps showing the
 * old number — which is how "customer paid" could leave the balance card
 * stuck at EUR 500 with EUR 360 still pending.
 */
export function useLedger(): AppState['ledger'] {
  const [ledger, setLedger] = useState<AppState['ledger']>(memory.ledger);
  useEffect(() => store.subscribe((s) => setLedger(s.ledger)) as unknown as () => void, []);
  return ledger;
}

export function getApplicationForLoad(loadId: string): LoadApplication | null {
  const found = memory.applications[loadId] ?? null;
  if (!found) return null;
  // localStorage is untrusted input: drop anything outside the enum instead of
  // silently rendering it as available (same rule as the top-level status).
  return Object.values(ApplicationStatus).includes(found.status) ? found : null;
}
