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
 * so it renders as a dark hero (same language as the payout card): LIVE dot,
 * next action first, route + km second, trip step replaces the 4/4 bar.
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
    const tripId = application?.tripId ?? `TR-${load.id}`;
    const stage = application?.tripStage ?? 'confirmed';
    const enRoute = application?.enRouteTo;
    const where = enRoute === 'delivery' ? load.to : load.from;
    const km = enRoute === 'delivery' ? `${load.km} km` : `${load.pickupKm} km`;
    const headline = enRoute
      ? `En route to ${enRoute}`
      : stage === 'at-pickup' ? 'At pickup'
      : stage === 'loaded' ? 'Loaded · heading out'
      : stage === 'at-delivery' ? 'At delivery'
      : stage === 'delivered' ? 'Delivered'
      : 'Confirmed · ready to roll';
    const next = enRoute
      ? `${where} · ${km} to go`
      : stage === 'at-pickup' ? `${load.from} · confirm loading`
      : stage === 'loaded' ? `${load.to} · ${load.km} km loaded`
      : stage === 'at-delivery' ? `${load.to} · hand over cargo`
      : stage === 'delivered' ? `${load.payoutDate} payout`
      : `${load.from} · navigate to pickup`;
    const stepLabel =
      stage === 'delivered' ? 'Step 5 of 5'
      : stage === 'at-delivery' ? 'Step 4 of 5'
      : stage === 'loaded' ? 'Step 3 of 5'
      : stage === 'at-pickup' ? 'Step 2 of 5'
      : 'Step 1 of 5';
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-col gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-nav-bg)] p-[16px] text-left text-[var(--color-nav-text)] shadow-card"
      >
        <span className="flex items-center justify-between gap-[8px]">
          <span className="flex items-center gap-[8px] text-label-12">
            <span aria-hidden className="relative flex h-[8px] w-[8px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-status-success-bg)] opacity-60" />
              <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[var(--color-status-match-bg)]" />
            </span>
            ACTIVE TRIP · {tripId}
          </span>
          <span className="flex items-center gap-[4px] text-label-14 text-[var(--color-text-inverse)]">
            Open trip
            <Icon name="chevron-right" size="sm" />
          </span>
        </span>
        <span className="text-heading-20 text-[var(--color-text-inverse)]">
          {headline}
        </span>
        <span className="text-body-14 opacity-80">
          {next}
        </span>
        <span className="flex items-center justify-between text-caption-12 opacity-80">
          <span>{load.from} → {load.to} · €{load.rate}</span>
          <span>{stepLabel}</span>
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
