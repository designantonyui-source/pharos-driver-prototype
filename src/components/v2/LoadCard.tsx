import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store, useStore, type LoadApplication } from '../../lib/store';
import { pickupTimestamp, type V2Load } from '../../lib/v2/loads';
import { Icon } from '../Icon';
import { LoadCta } from './LoadCta';

/**
 * figma: prototype-led · stateful driver feed card (list and map)
 * props: load, isOnRoute, onOpen · status comes from getApplicationForLoad
 * tokens: color-load-state-*, color-bg-surface, color-status-*-text, radius-lg
 */
export const CARD_STATE_STYLES = {
  available: { container: 'bg-[var(--color-bg-surface)]', badge: 'bg-[var(--color-status-match-bg)] text-[var(--color-status-match-text)]' },
  pending: { container: 'bg-[var(--color-load-state-pending-bg)] border-l-4 border-l-[var(--color-load-state-pending-accent)]', badge: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]' },
  booked: { container: 'bg-[var(--color-load-state-booked-bg)] border-l-4 border-l-[var(--color-load-state-booked-accent)]', badge: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]' },
  rejected: { container: 'bg-[var(--color-load-state-rejected-bg)] border-l-4 border-l-[var(--color-load-state-rejected-accent)]', badge: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]' },
  cancelled: { container: 'bg-[var(--color-load-state-cancelled-bg)] border-l-4 border-l-[var(--color-load-state-cancelled-accent)]', badge: 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-text)]' },
} as const;
export type LoadCardState = keyof typeof CARD_STATE_STYLES;

export function getLoadCardState(application: LoadApplication | null): LoadCardState {
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
  const minutes = Math.max(0, Math.ceil((Date.parse(pickupTime) - now) / 60_000));
  return <p className="text-label-14 text-[var(--color-status-success-text)]">{Number.isFinite(minutes) ? `Pickup in ${Math.floor(minutes / 60)}h ${minutes % 60}m` : 'Pickup time unavailable'}</p>;
}

export function LoadCard({ load, isOnRoute = false, onOpen }: { load: V2Load; isOnRoute?: boolean; onOpen: (load: V2Load) => void }) {
  useStore();
  const application = getApplicationForLoad(load.id);
  const state = getLoadCardState(application);
  const styles = CARD_STATE_STYLES[state];
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const scenario = params.get('scenario');
  const search = scenario === 'approve' || scenario === 'reject' ? `?scenario=${scenario}` : '';
  const pickupTime = useMemo(() => load.pickupTime ?? pickupTimestamp(load.day, load.window), [load.pickupTime, load.day, load.window]);
  const badge = state === 'pending' ? '⏳ In review'
    : state === 'booked' ? `✓ Booked · ${application?.tripId ?? `TR-${load.id}`}`
      : state === 'rejected' ? '✕ Rejected'
        : state === 'cancelled' ? '○ Cancelled'
          : (load.onRoute ?? isOnRoute) ? 'On your route' : null;

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
      {badge && <div className="flex justify-end"><span className={`rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${styles.badge}`}>{badge}</span></div>}
      <p className="text-heading-20 text-[var(--color-offer-text-price)]">€{load.rate}{' '}<span className="text-body-14 text-[var(--color-text-secondary)]">€{load.perKm.toFixed(2)}/km</span></p>
      <button type="button" onClick={open} className="flex items-center gap-[6px] text-left text-heading-14 text-[var(--color-text-primary)]">
        <span className="truncate">{load.from}</span><Icon name="arrow-right" size="sm" /><span className="truncate">{load.to}</span>
      </button>
      {state === 'booked' && <PickupCountdown pickupTime={pickupTime} />}
      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] text-body-14 text-[var(--color-text-secondary)]">
        <span>{load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window}</span>
        <span className="flex items-center gap-[4px]"><Icon name="map-pin" size="sm" />{load.pickupKm} km to pickup · {load.pickupMin} min</span>
        <span>{load.km} km loaded</span>
      </div>
      <p className="text-body-14 text-[var(--color-text-secondary)]">{load.company} · {load.rating.toFixed(1)} ★ · {load.paidIn}</p>
      <LoadCta loadId={load.id} />
    </article>
  );
}
