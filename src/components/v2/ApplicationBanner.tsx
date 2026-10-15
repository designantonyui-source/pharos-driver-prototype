import { ApplicationStatus } from '../../lib/models';
import type { LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';

/**
 * Schematic route (delivery-app language): pickup dot → dashed leg → truck → pin.
 * Full-width with city labels; the solid mint leg grows with the stage.
 * Dark-card palette: dashed nav-text, progress match-bg, white truck badge.
 */
function RouteArt({ progress }: { progress: number }) {
  const x0 = 12;
  const x1 = 188;
  const y = 20;
  const tx = x0 + Math.min(0.92, Math.max(0.14, progress)) * (x1 - x0);
  return (
    <svg viewBox="0 0 200 32" className="h-[32px] w-full" aria-hidden focusable="false">
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="var(--color-nav-text)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
      <line x1={x0} y1={y} x2={Math.max(tx, x0)} y2={y} stroke="var(--color-status-match-bg)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={x0} cy={y} r="7" fill="none" stroke="var(--color-text-inverse)" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx={x0} cy={y} r="4" fill="var(--color-text-inverse)" />
      <g transform={`translate(${x1 - 10} ${y - 24})`}>
        <path d="M10 0C4.5 0 0 4.3 0 9.7 0 16.7 10 23.3 10 23.3s10-6.6 10-13.6C20 4.3 15.5 0 10 0z" fill="var(--color-status-match-bg)" />
        <circle cx="10" cy="9" r="3.8" fill="var(--color-nav-bg)" />
      </g>
      <g>
        <circle cx={tx} cy={y} r="12" fill="var(--color-text-inverse)" stroke="var(--color-border-default)" strokeWidth="1.5" />
        <g transform={`translate(${tx - 7} ${y - 7})`} stroke="var(--color-action-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M0.8 4.2h7.6v5.9H0.8zM8.4 6.8h3.4l2.5 2.5v.8H8.4z" />
          <circle cx="3.8" cy="11.4" r="1.3" />
          <circle cx="11.4" cy="11.4" r="1.3" />
        </g>
      </g>
    </svg>
  );
}

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
        className="flex w-full flex-col gap-[6px] rounded-[var(--radius-lg)] bg-[var(--color-nav-bg)] p-[12px] text-left text-[var(--color-nav-text)] shadow-card"
      >
        <span className="flex items-center justify-between gap-[8px]">
          <span className="flex items-center gap-[6px] text-caption-10">
            <span aria-hidden className="relative flex h-[8px] w-[8px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-status-success-bg)] opacity-60" />
              <span className="relative inline-flex h-[8px] w-[8px] rounded-full bg-[var(--color-status-match-bg)]" />
            </span>
            ACTIVE TRIP · {tripId}
          </span>
          <span className="flex items-center gap-[2px] text-label-12 text-[var(--color-text-inverse)]">
            Open trip
            <Icon name="chevron-right" size="sm" />
          </span>
        </span>
        <span className="flex items-center justify-between gap-[8px]">
          <span className="min-w-0 text-heading-14 text-[var(--color-text-inverse)]">
            {headline} · {next}
          </span>
        </span>
        <RouteArt progress={progress} />
        <span className="flex items-center justify-between text-caption-10 opacity-80">
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
