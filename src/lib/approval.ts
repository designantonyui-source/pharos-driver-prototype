import { ApplicationStatus } from './models';

/**
 * Dispatcher decision window. The clock starts when the driver applies, never
 * when the load was created: a load for tomorrow must not become a 24-hour wait.
 * Twenty minutes leaves room for the ~15-minute typical reply.
 */
export const APPROVAL_WINDOW_MIN = 20;
export const APPROVAL_WINDOW_MS = APPROVAL_WINDOW_MIN * 60_000;

const WAITING = new Set<ApplicationStatus>([
  ApplicationStatus.SENT,
  ApplicationStatus.DISPATCHER_REVIEW,
  ApplicationStatus.CUSTOMER_REVIEW,
]);

/**
 * Legacy states stored the load's apply window as the application deadline,
 * which could be tomorrow. Cap waiting applications at their own submit time
 * plus the approval window so old localStorage cannot resurrect a 24-hour wait.
 */
export function withApprovalWindow<T extends {
  status: ApplicationStatus;
  submittedAt?: string | null;
  approvalsDeadline?: string;
}>(application: T): T {
  if (!WAITING.has(application.status) || !application.submittedAt) return application;
  const submitted = Date.parse(application.submittedAt);
  if (!Number.isFinite(submitted)) return application;
  const latest = submitted + APPROVAL_WINDOW_MS;
  const stored = application.approvalsDeadline ? Date.parse(application.approvalsDeadline) : NaN;
  if (Number.isFinite(stored) && stored <= latest) return application;
  return { ...application, approvalsDeadline: new Date(latest).toISOString() };
}
