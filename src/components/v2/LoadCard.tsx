import { memo, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store, useStore, type LoadApplication } from '../../lib/store';
import { pickupTimestamp, type V2Load } from '../../lib/v2/loads';
import { Icon, type IconName } from '../Icon';
import { LoadCta } from './LoadCta';

/**
 * figma: prototype-led · stateful driver feed card (list and map)
 * props: load, isOnRoute, onOpen · status comes from getApplicationForLoad
 * tokens: color-bg-surface, color-status-*-bg, color-status-*-text, radius-lg, radius-pill, text-metric-28
 *
 * Application state is carried by ONE palette, `color-status-*`: the pill takes the `-bg`/`-text`
 * pair. The former `color-load-state-*` group was a second, off-Figma palette for the same five
 * meanings — it double-encoded the state (card fill and pill both said "pending"), left the pill
 * invisible on its own card (#fffbeb vs #fff4df = 1.05:1) and its accents failed contrast on their
 * own fill (2.07:1 pending, 2.43:1 cancelled, 3.15:1 booked). Every pair now measures >= 5.2:1.
 * The 4px left accent was removed at the client's request (deviation from §4.11): the pill is now
 * the only state signal. See design/UI-REVIEW.md P1-1.
 */
/** Per-state pill faces. `container` keeps the shared surface (badge rule: state lives in the pill). */
export const CARD_STATE_STYLES = {
  available: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-match-bg)] text-[var(--color-status-match-text)]' },
  pending: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]' },
  booked: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]' },
  rejected: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]' },
  cancelled: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-text)]' },
} as const;
export type LoadCardState = keyof typeof CARD_STATE_STYLES;

/** The state pill: one lucide glyph plus a label. `icon: null` keeps the route-match badge text-only. */
type Badge = { icon: IconName | null; label: string };

export function getLoadCardState(application: LoadApplication | null): LoadCardState {
  if (application?.dismissed) return 'available';
  switch (application?.status) {
    case ApplicationStatus.SENT:
    case ApplicationStatus.DISPATCHER_REVIEW:
    case ApplicationStatus.CUSTOMER_REVIEW: return 'pending';
    case ApplicationStatus.CONFIRMED: return 'booked';
    case ApplicationStatus.REJECTED: return 'rejected';
    case ApplicationStatus.CANCELLED: return 'cancelled';
    default: return 'available';
  }
}

export function sortLoadsByApplication(loads: V2Load[], applications: Record<string, LoadApplication>): V2Load[] {
  const priority: Record<LoadCardState, number> = { booked: 0, pending: 1, available: 2, rejected: 3, cancelled: 3 };
  return [...loads].sort((a, b) => priority[getLoadCardState(applications[a.id] ?? null)] - priority[getLoadCardState(applications[b.id] ?? null)]);
}

function PickupCountdown({ pickupTime }: { pickupTime: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const diffMin = Math.ceil((Date.parse(pickupTime) - now) / 60_000);
  if (!Number.isFinite(diffMin) || diffMin <= 0) return null;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return (
    <p className="text-label-14 text-[var(--color-status-success-text)]" role="timer">
      {hours > 0 ? `Pickup in ${hours}h ${mins}m` : `Pickup in ${mins} min`}
    </p>
  );
}

const PickupCountdownMemo = memo(PickupCountdown);

export function LoadCard({ load, isOnRoute = false, onOpen, onDismiss, onNotice }: { load: V2Load; isOnRoute?: boolean; onOpen: (load: V2Load) => void; onDismiss?: (load: V2Load) => void; onNotice?: (title: string, detail?: string) => void }) {
  // NOTE (open R2): this still subscribes to the WHOLE store — `useStore()` re-renders the card on
  // any store write, it only *reads* one slot here. A real fix needs a per-load selector
  // (useSyncExternalStore in store.ts) or React.memo + a loadId prop. Do not claim otherwise.
  const { state: { applications } } = useStore();
  const application = applications[load.id] ?? getApplicationForLoad(load.id);
  const state = getLoadCardState(application);
  const styles = CARD_STATE_STYLES[state];
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenario = params.get('scenario');
  const search = scenario === 'approve' || scenario === 'reject' ? `?scenario=${scenario}` : '';
  const pickupTime = useMemo(() => load.pickupTime ?? pickupTimestamp(load.day, load.window), [load.pickupTime, load.day, load.window]);
  const badge: Badge | null = state === 'pending' ? { icon: 'clock', label: 'In review' }
    : state === 'booked' ? { icon: 'circle-check', label: `Booked · ${application?.tripId ?? `TR-${load.id}`}` }
      : state === 'rejected' ? { icon: 'circle-x', label: 'Rejected' }
        : state === 'cancelled' ? { icon: 'x', label: 'Cancelled by you' }
          : (load.onRoute ?? isOnRoute) ? { icon: null, label: 'On your route' } : null;

  function open() {
    if (state === 'booked' || state === 'rejected' || state === 'pending') {
      if (application) store.set(application);
      navigate(state === 'booked' ? `/trip/${load.id}` : `/application/${load.id}${search}`);
    } else onOpen(load);
  }

  return (
    <article aria-label={`Load ${load.id}`} data-state={state}
      onClick={(event) => { if (!(event.target as HTMLElement).closest('button, a')) open(); }}
      className={`flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-lg)] border border-[var(--color-offer-border)] p-[12px] shadow-[var(--shadow-card)] ${styles.container}`}>
      <div className="flex items-start justify-end gap-[8px]">
        {badge && <span role="status" className={`flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${styles.badge}`}>{badge.icon && <Icon name={badge.icon} size={12} />}{badge.label}</span>}
        {onDismiss && (state === 'available' || state === 'cancelled' || state === 'rejected') && (
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onDismiss(load); }}
            aria-label={`Not interested in load ${load.id}. Activate to hide it.`}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <Icon name="x" size="sm" />
          </button>
        )}
      </div>
      <p className="flex items-baseline gap-[8px]">
        <span className="text-metric-28 text-[var(--color-offer-text-price)]">€{load.rate}</span>
        <span className="text-label-14 text-[var(--color-text-secondary)]">€{load.perKm.toFixed(2)}/km</span>
      </p>
      <button type="button" onClick={open} className="flex min-h-[44px] items-center gap-[6px] text-left text-heading-14 text-[var(--color-text-primary)]">
        <span className="truncate">{load.from}</span><Icon name="arrow-right" size="sm" /><span className="truncate">{load.to}</span>
      </button>
      {state === 'booked' && <PickupCountdownMemo pickupTime={pickupTime} />}
      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] text-body-14 text-[var(--color-text-secondary)]">
        <span>{load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window}</span>
        <span className="flex items-center gap-[4px]"><Icon name="map-pin" size="sm" />{load.pickupKm} km to pickup · {load.pickupMin} min</span>
        <span>{load.km} km loaded</span>
      </div>
      <p className="flex flex-wrap items-center gap-x-[6px] text-body-14 text-[var(--color-text-secondary)]">
        <span>{load.company} ·</span>
        <span className="flex items-center gap-[2px]"><Icon name="star" size={12} />{load.rating.toFixed(1)} ·</span>
        <span>{load.paidIn}</span>
      </p>
      <LoadCta loadId={load.id} onNotice={onNotice} />
    </article>
  );
}
