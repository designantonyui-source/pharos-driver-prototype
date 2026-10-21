import { TRIP_STAGE_STEPS } from '../../lib/api';
import type { LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';

/**
 * v2 · ApplicationBanner — the active-trip mini-player only.
 *
 * Waiting applications are not repeated here: the load card owns `In review`
 * and `View status`. A confirmed trip is an active job, so it renders as a slim
 * sticky mini-player (Uber ETA-floater language): ETA-first (km to go), status
 * second, truck badge, hairline progress. The route itself is NOT duplicated —
 * the load card below already shows it. Taps straight into the trip.
 *
 * props: load, application, onOpen
 * tokens: color-nav-bg/text, color-status-match-bg, radius-lg, shadow-card
 */
export function ApplicationBanner({
  load,
  application,
  onOpen,
}: {
  load: V2Load;
  /** Per-load application: drives the active-trip copy (stage + en-route). */
  application?: LoadApplication | null;
  onOpen: () => void;
}) {
  const stage = application?.tripStage ?? 'confirmed';
  const enRoute = application?.enRouteTo;
  // ETA-first (Uber floater): the one number the driver needs. Route is NOT
  // duplicated — the load card below already shows from → to.
  const eta = enRoute === 'delivery' ? `${load.km} km to go`
    : `${load.pickupKm} km to go`;
  // 5 trip stages double as the floater's steps: filled = passed, rest dim.
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
