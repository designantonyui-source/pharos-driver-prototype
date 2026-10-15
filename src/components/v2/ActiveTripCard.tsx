import { TRIP_STAGE_STEPS } from '../../lib/api';
import type { LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';

/**
 * v2 · ActiveTripCard — the confirmed-trip hero on the Trips hub.
 * Sampled from the live frame (no invented values): navy `--color-nav-bg #173647`,
 * mint `--color-status-match-bg #bce5d5`, `--radius-md 12px`, `--radius-pill 999px`,
 * typeface unchanged (Manrope/DM Sans utilities only).
 * Layout per redesign brief: header (mint dot + ACTIVE TRIP · TR–{FROM}–{TO}, Open trip ›
 * pinned right) → 18px semibold status + 13px white-60 secondary (`city · km · ~min`) →
 * route line (solid mint done @2px round caps + dashed white-40 remainder, truck marker at
 * leg progress, 8px white-40 origin, mint pin destination) → € price pill → 5-segment
 * step bar pinned to the card bottom (4px h, 4px gap, full width, mint done / white-15 rest).
 * Contrast (navy #173647 bg): white ≈ 13.5:1, mint #bce5d5 ≈ 9.6:1, white-60 ≈ 5.4:1 —
 * all pass WCAG AA 4.5:1. Spacing on the 8px grid (chip padding 6/10 per brief).
 * props: load, application, stepIndex, progress, onOpen, interactive, showStepCaption
 * tokens: color-nav-bg, color-nav-hover, color-status-match-bg, color-text-inverse,
 *   radius-md, radius-pill, shadow-card
 */
export const ACTIVE_TRIP_STEPS = TRIP_STAGE_STEPS;

export function stepIndexForStage(stage: LoadApplication['tripStage']): number {
  const i = ACTIVE_TRIP_STEPS.findIndex((s) => s.id === (stage ?? 'confirmed'));
  return Math.max(0, i);
}

const ROUTE_LINE_W = 320;
const ROUTE_LINE_H = 40;

/** Mock ETA math for the hero card only (prototype-led): city legs ~40 km/h. */
export function activeTripEtaMinutes(km: number): number {
  return Math.max(1, Math.round((km / 40) * 60));
}

function RouteProgress({ progress }: { progress: number }) {
  const p = Math.min(1, Math.max(0, progress));
  const x0 = 12;
  const x1 = ROUTE_LINE_W - 12;
  const y = ROUTE_LINE_H / 2;
  const doneX = x0 + (x1 - x0) * p;
  const truckX = x0 + (x1 - x0) * Math.min(0.98, Math.max(0.02, p));
  return (
    <svg
      viewBox={`0 0 ${ROUTE_LINE_W} ${ROUTE_LINE_H}`}
      className="block h-[40px] w-full"
      role="img"
      aria-label={`Route progress ${Math.round(p * 100)} percent`}
    >
      <line x1={x0} y1={y} x2={x1} y2={y} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="5 5" strokeLinecap="round" />
      {p > 0.01 && (
        <line x1={x0} y1={y} x2={doneX} y2={y} stroke="#bce5d5" strokeWidth={2} strokeLinecap="round" />
      )}
      <circle cx={x0} cy={y} r={4} fill="#ffffff" fillOpacity={0.4} />
      <g transform={`translate(${x1 - 7} ${y - 12})`}>
        <path d="M7 0C3.1 0 0 3.1 0 7c0 5.2 7 11 7 11s7-5.8 7-11c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 7 4.5a2.5 2.5 0 0 1 0 5z" fill="#bce5d5" />
      </g>
      <g transform={`translate(${truckX} ${y})`}>
        <circle r={13} fill="#ffffff" />
        <circle r={13} fill="none" stroke="#bce5d5" strokeWidth={2} />
        <g transform="translate(-7 -7)">
          <path d="M1 3.5h7v5H1zM8 5.5h2.6l2 2v1H8z" fill="none" stroke="#173647" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={3.6} cy={10.4} r={1.2} fill="#173647" />
          <circle cx={10.6} cy={10.4} r={1.2} fill="#173647" />
        </g>
      </g>
    </svg>
  );
}

export function ActiveTripCard({
  load,
  application,
  stepIndex,
  progress,
  onOpen,
  interactive = false,
  showStepCaption = false,
}: {
  load: V2Load;
  application?: LoadApplication | null;
  /** 0-based stage; defaults from the stored trip stage. */
  stepIndex?: number;
  /** Route-line fill 0–1; defaults to index/(total-1) so the mock 25% needs no wiring. */
  progress?: number;
  onOpen: () => void;
  /** Hover variant: mint link text + chevron nudge. */
  interactive?: boolean;
  /** Keep the `Step N of 5` caption (default off — the bar is self-explanatory). */
  showStepCaption?: boolean;
}) {
  const stage = application?.tripStage ?? 'confirmed';
  const enRoute = application?.enRouteTo;
  const index = stepIndex ?? stepIndexForStage(stage);
  const total = ACTIVE_TRIP_STEPS.length;
  const fill = progress ?? (total <= 1 ? 1 : index / (total - 1));
  const tripCode = `TR–${load.from}–${load.to}`.toUpperCase();
  const heading = enRoute ? `En route to ${enRoute}` : (ACTIVE_TRIP_STEPS[index]?.label ?? 'Confirmed');
  const legKm = enRoute === 'delivery' ? load.km : load.pickupKm;
  const legCity = enRoute === 'delivery' ? load.to : load.from;
  const secondary = `${legCity} · ${legKm} km · ~${activeTripEtaMinutes(legKm)} min`;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open trip ${tripCode}`}
      className={`group flex w-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] text-left text-[var(--color-text-inverse)] shadow-card ${interactive ? 'transition-colors hover:bg-[var(--color-nav-hover)]' : ''}`}
    >
      <span className="flex flex-col gap-[8px] p-[16px] pb-[8px]">
        <span className="flex items-center justify-between gap-[8px]">
          <span className="flex min-w-0 items-center gap-[8px] text-caption-12 font-medium uppercase tracking-wide">
            <span aria-hidden className="h-[8px] w-[8px] shrink-0 rounded-full bg-[var(--color-status-match-bg)]" />
            <span className="truncate opacity-90">Active trip · {tripCode}</span>
          </span>
          <span className={`flex shrink-0 items-center gap-[2px] text-label-14 ${interactive ? 'text-[var(--color-text-inverse)] group-hover:text-[var(--color-status-match-bg)]' : 'text-[var(--color-text-inverse)]'}`}>
            Open trip
            <Icon name="chevron-right" size="sm" className={interactive ? 'transition-transform group-hover:translate-x-[2px]' : undefined} />
          </span>
        </span>
        <span className="flex flex-col gap-[2px]">
          <span className="text-[18px] font-semibold leading-[24px]">{heading}</span>
          <span className="text-[13px] leading-[18px] text-white/60">{secondary}</span>
          {showStepCaption && (
            <span className="text-caption-12 text-white/60">Step {index + 1} of {total}</span>
          )}
        </span>
        <RouteProgress progress={fill} />
        <span className="flex items-center">
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-match-bg)]/12 px-[10px] py-[6px] text-[12px] font-semibold leading-[16px] text-[var(--color-status-match-bg)]">
            €{load.rate}
          </span>
        </span>
      </span>
      <span aria-hidden className="flex w-full gap-[4px] px-[16px] pb-[16px]">
        {ACTIVE_TRIP_STEPS.map((s, i) => (
          <span key={s.id} className={`h-[4px] flex-1 rounded-full ${i <= index ? 'bg-[var(--color-status-match-bg)]' : 'bg-white/15'}`} />
        ))}
      </span>
    </button>
  );
}
