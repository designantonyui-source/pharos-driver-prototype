import { ApplicationStatus } from '../../lib/models';
import type { LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';

/** Banner copy per status (flow stories S6: one status, two waiting states). */
export const STATUS_COPY: Record<ApplicationStatus, { title: string; step: number }> = {
  [ApplicationStatus.SENT]: { title: 'Application sent', step: 1 },
  [ApplicationStatus.DISPATCHER_REVIEW]: { title: 'Awaiting dispatcher', step: 2 },
  [ApplicationStatus.CUSTOMER_REVIEW]: { title: 'Dispatcher approved · awaiting customer', step: 3 },
  [ApplicationStatus.CONFIRMED]: { title: 'Confirmed · Trip TR-4821', step: 4 },
  [ApplicationStatus.REJECTED]: { title: 'Application declined', step: 4 },
  [ApplicationStatus.CANCELLED]: { title: 'Cancelled by you', step: 4 },
};

/**
 * v2 · ApplicationBanner — live status under the filters after applying (flow stories S7). Tap opens the status sheet.
 * Applications read as a pale status banner. A confirmed trip is an active job,
 * so it renders as a slim sticky mini-player (Uber ETA-floater language):
 * ETA-first (km to go), status second, truck badge, hairline progress.
 * The route itself is NOT duplicated — the load card below already shows it.
 * Taps straight into the trip.
 * props: load, status, application, onOpen
 * tokens: color-nav-bg/text, color-status-info/warning-bg/text, radius-lg, shadow-card
 */
export function ApplicationBanner({
  load,
  status,
  application,
  onOpen,
}: {
  load: V2Load;
  status: ApplicationStatus;
  /** Per-load application: drives the confirmed-trip copy (stage + en-route). */
  application?: LoadApplication | null;
  onOpen: () => void;
}) {
  const { step } = STATUS_COPY[status];
  const done = status === ApplicationStatus.CONFIRMED;
  const ended = status === ApplicationStatus.REJECTED || status === ApplicationStatus.CANCELLED;

  if (done) {
    const stage = application?.tripStage ?? 'confirmed';
    const enRoute = application?.enRouteTo;
    // ETA-first (Uber floater): the one number the driver needs. Route is NOT
    // duplicated — the load card below already shows from → to.
    const eta = enRoute === 'delivery' ? `${load.km} km to go`
      : `${load.pickupKm} km to go`;
    const sub = enRoute
      ? `En route to ${enRoute} · ${stage === 'delivered' ? 'Step 5 of 5' : enRoute === 'delivery' ? 'Step 3 of 5' : 'Step 1 of 5'}`
      : stage === 'at-pickup' ? 'At pickup · Step 2 of 5'
      : stage === 'loaded' ? 'Loaded · Step 3 of 5'
      : stage === 'at-delivery' ? 'At delivery · Step 4 of 5'
      : stage === 'delivered' ? 'Delivered · Step 5 of 5'
      : 'Confirmed · Step 1 of 5';
    const progress =
      stage === 'delivered' ? 1
      : stage === 'at-delivery' ? 0.85
      : stage === 'loaded' || enRoute === 'delivery' ? 0.55
      : stage === 'at-pickup' ? 0.2
      : 0.05;
    return (
      <button
        type="button"
        onClick={onOpen}
        className="sticky top-0 z-10 flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-nav-bg)] text-left text-[var(--color-nav-text)] shadow-card"
      >
        <span className="flex min-h-[48px] items-center gap-[10px] px-[12px] py-[6px]">
          <span aria-hidden className="relative flex h-[8px] w-[8px] shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-status-success-bg)] opacity-60" />
            <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[var(--color-status-match-bg)]" />
          </span>
          <span aria-hidden className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[var(--color-text-inverse)]">
            <span className="block h-[16px] w-[16px] text-[var(--color-action-primary)]">
              <svg viewBox="0 0 16 16" className="h-full w-full" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M1 5h9v7H1zM10 8h4l3 3v1h-7z" />
                <circle cx="4.5" cy="13.5" r="1.4" />
                <circle cx="13" cy="13.5" r="1.4" />
              </svg>
            </span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-heading-20 text-[var(--color-text-inverse)]">
              {eta}
            </span>
            <span className="truncate text-caption-12 opacity-80">
              {sub}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-[2px] text-label-14 text-[var(--color-text-inverse)]">
            Open
            <Icon name="chevron-right" size="sm" />
          </span>
        </span>
        <span aria-hidden className="h-[3px] w-full bg-[var(--color-nav-text)] opacity-20">
          <span className="block h-full rounded-r-full bg-[var(--color-status-match-bg)]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      </button>
    );
  }

  const { title } = STATUS_COPY[status];
  const detail = `${load.from} → ${load.to} · €${load.rate} · by ${load.approvalsBy}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full flex-col gap-[8px] rounded-[var(--radius-lg)] p-[12px] text-left shadow-card ${
        ended
          ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'
          : 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]'
      }`}
    >
      <span className="flex items-center justify-between text-label-14">
        <span className="flex items-center gap-[8px]">
          <Icon name={ended ? 'circle-x' : 'clock'} size="sm" />
          {title}
        </span>
        <span className="text-label-12">{`Step ${step} of 4`}</span>
      </span>
      <span className="text-body-14">
        {detail}
      </span>
      <span className="flex gap-[4px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-[4px] flex-1 rounded-[var(--radius-pill)] ${i <= step ? 'bg-current' : 'bg-current opacity-20'}`}
          />
        ))}
      </span>
    </button>
  );
}
