import { ApplicationStatus } from '../../lib/models';
import { TRIP_STAGE_STEPS } from '../../lib/api';
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
  [ApplicationStatus.EXPIRED]: { title: 'Application expired', step: 4 },
  [ApplicationStatus.CANCELLED]: { title: 'Cancelled by you', step: 4 },
};

/**
 * v2 · ApplicationBanner — live status under the filters after applying (flow stories S7). Tap opens the status sheet.
 * Applications read as a pale status banner. A confirmed trip is an active job,
 * so it renders as a slim sticky mini-player (Uber ETA-floater language):
 * ETA-first (km to go), status second, truck badge, hairline progress.
 * The route itself is NOT duplicated — the load card below already shows it.
 * Taps straight into the trip.
 *
 * Rule: live states ONLY (sent / dispatcher-review / customer-review / confirmed).
 * Ended states (rejected / expired / cancelled) render NOTHING here — the state
 * already lives on the card pill and in Trips → Past. A banner for a dead
 * application duplicates the card and its "Step 4 of 4" means nothing.
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
  const ended = status === ApplicationStatus.REJECTED || status === ApplicationStatus.CANCELLED || status === ApplicationStatus.EXPIRED;

  // Ended applications own no banner: card pill + Trips Past carry the state.
  if (ended) return null;

  if (done) {
    const stage = application?.tripStage ?? 'confirmed';
    const enRoute = application?.enRouteTo;
    // ETA-first (Uber floater): the one number the driver needs. Route is NOT
    // duplicated — the load card below already shows from → to.
    const eta = enRoute === 'delivery' ? `${load.km} km to go`
      : `${load.pickupKm} km to go`;
    // 5 trip stages double as the floater's ступеньки: filled = passed, rest dim.
    const stepIndex = Math.max(0, TRIP_STAGE_STEPS.findIndex((s) => s.id === stage));
    const stepLabel = TRIP_STAGE_STEPS[stepIndex]?.label ?? 'Confirmed';
    const sub = enRoute
      ? `En route to ${enRoute} · Step ${stepIndex + 1} of ${TRIP_STAGE_STEPS.length}`
      : `${stepLabel} · Step ${stepIndex + 1} of ${TRIP_STAGE_STEPS.length}`;
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
        <span aria-hidden className="flex w-full gap-[3px] px-[12px] pb-[8px]">
          {TRIP_STAGE_STEPS.map((s, i) => (
            // Same three states as the trip page list: passed solid, current
            // dimmed, upcoming faint. Done and current used to share one fill.
            <span key={s.id} className={`h-[4px] flex-1 rounded-full ${i < stepIndex ? 'bg-[var(--color-status-match-bg)]' : i === stepIndex ? 'bg-[var(--color-status-match-bg)] opacity-40' : 'bg-[var(--color-nav-text)] opacity-25'}`} />
          ))}
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
      className="flex w-full flex-col gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-status-info-bg)] p-[12px] text-left text-[var(--color-status-info-text)] shadow-card"
    >
      <span className="flex items-center justify-between text-label-14">
        <span className="flex items-center gap-[8px]">
          <Icon name="clock" size="sm" />
          {title}
        </span>
        <span className="text-label-12">{`Step ${step} of 4`}</span>
      </span>
      <span className="text-body-14">
        {detail}
      </span>
      <span className="flex gap-[4px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          // Passed solid, current dimmed, upcoming faint — the same three
          // states as the trip page list.
          <span
            key={i}
            className={`h-[4px] flex-1 rounded-[var(--radius-pill)] ${i < step ? 'bg-current' : i === step ? 'bg-current opacity-50' : 'bg-current opacity-20'}`}
          />
        ))}
      </span>
    </button>
  );
}
