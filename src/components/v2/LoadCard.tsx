import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationStatus } from '../../lib/models';
import { getApplicationForLoad, store, useStore, type LoadApplication } from '../../lib/store';
import { pickupTimestamp, type V2Load } from '../../lib/v2/loads';
import { Icon, type IconName } from '../Icon';
import { LoadCta } from './LoadCta';

/**
 * figma: prototype-led · stateful driver feed card (list and map)
 * props: load, isOnRoute, onOpen · status comes from getApplicationForLoad
 * tokens: color-bg-surface, color-status-*-bg, color-status-*-text, radius-lg, radius-pill, text-metric-28,
 *   text-heading-20, text-body-14, text-label-12/14, color-text-*, color-offer-*
 *
 * Header row: state badge left, live timer right (Decide in X before apply from
 * decideMin/S8, Pickup in X after confirm) — no X dismiss button; hiding is a
 * left swipe (iOS mail pattern, 88px Hide) + "Hide this load" text for AT.
 * Route carries EU country codes (Lille FR → Brussels BE); cross-border is a
 * quiet trust-line suffix, not a pill. Facts split decision (body-14: day+window+
 * deadhead, ≥40km warning) vs trust (label-14: Company semibold + rating + Verified + paid).
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

/** EU country codes for the demo feed (freight style: Lille FR → Brussels BE). */
const CITY_COUNTRY: Record<string, string> = {
  Lille: 'FR',
  Calais: 'FR',
  Brussels: 'BE',
  Ghent: 'BE',
  Antwerp: 'BE',
};

const COUNTRY_NAME: Record<string, string> = { FR: 'France', BE: 'Belgium' };

export function countryForCity(city: string): string | null {
  return CITY_COUNTRY[city] ?? null;
}

/** Cross-border signal (FR → BE) — shown only when the countries differ. */
export function crossBorder(from: string, to: string): string | null {
  const a = countryForCity(from);
  const b = countryForCity(to);
  return a && b && a !== b ? `${a} → ${b}` : null;
}

export function cityLabel(city: string): string {
  const code = countryForCity(city);
  return code ? `${city} ${code}` : city;
}

export function routeAriaLabel(from: string, to: string): string {
  const a = countryForCity(from);
  const b = countryForCity(to);
  const left = a && COUNTRY_NAME[a] ? `${from}, ${COUNTRY_NAME[a]}` : from;
  const right = b && COUNTRY_NAME[b] ? `${to}, ${COUNTRY_NAME[b]}` : to;
  return `${left} to ${right}. Open details.`;
}

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

/** Decide-by countdown (S8 urgency): minutes left to apply, ticking each minute. */
function DecideCountdown({ decideMin }: { decideMin: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  void now;
  const left = decideMin;
  const urgent = left <= 120;
  return (
    <p role="status" className={`flex items-center gap-[4px] text-label-12 ${urgent ? 'font-semibold text-[var(--color-status-warning-text)]' : 'text-[var(--color-text-secondary)]'}`}>
      <Icon name="clock" size={12} />{left >= 60 ? `Decide in ${Math.floor(left / 60)}h ${left % 60}m` : `Decide in ${left} min`}
    </p>
  );
}

const DecideCountdownMemo = memo(DecideCountdown);

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

  const canDismiss = !!onDismiss && (state === 'available' || state === 'cancelled' || state === 'rejected');
  const cross = crossBorder(load.from, load.to);
  const farPickup = load.pickupKm >= 40;
  // Swipe-to-hide (iOS mail pattern): track horizontal drag, reveal Hide action past 72px.
  const [swipeX, setSwipeX] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = swipeX <= -72;

  function open() {
    if (state === 'booked' || state === 'rejected' || state === 'pending') {
      if (application) store.set(application);
      navigate(state === 'booked' ? `/trip/${load.id}` : `/application/${load.id}${search}`);
    } else onOpen(load);
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
      {canDismiss && (
        <button
          type="button"
          onClick={() => onDismiss!(load)}
          aria-label={`Hide load ${load.id}. You can restore it later.`}
          className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-[var(--color-status-danger-text)] text-label-14 font-semibold text-[var(--color-text-inverse)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          Hide
        </button>
      )}
      <article aria-label={`Load ${load.id}`} data-state={state}
        onClick={(event) => { if (!(event.target as HTMLElement).closest('button, a')) open(); }}
        onTouchStart={(event) => { const t = event.touches[0]; touchStart.current = { x: t.clientX, y: t.clientY }; }}
        onTouchMove={(event) => {
          if (!canDismiss || !touchStart.current) return;
          const t = event.touches[0];
          const dx = t.clientX - touchStart.current.x;
          const dy = t.clientY - touchStart.current.y;
          if (Math.abs(dy) > Math.abs(dx)) return;
          setSwipeX(Math.min(0, dx));
        }}
        onTouchEnd={() => { touchStart.current = null; setSwipeX(swiped ? -88 : 0); }}
        style={swipeX !== 0 ? { transform: `translateX(${swipeX}px)` } : undefined}
        className={`relative flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-lg)] border border-[var(--color-offer-border)] bg-[var(--color-bg-surface)] p-[12px] shadow-[var(--shadow-card)] transition-transform ${styles.container}`}>
      {badge ? (
      <div className="flex min-h-[24px] items-center justify-between gap-[8px]">
        <span role="status" className={`flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${styles.badge}`}>{badge.icon && <Icon name={badge.icon} size={12} />}{badge.label}</span>
        {(state === 'available' || state === 'cancelled' || state === 'rejected') && <DecideCountdownMemo decideMin={load.decideMin} />}
        {state === 'booked' && <PickupCountdownMemo pickupTime={pickupTime} />}
      </div>
      ) : (
      <div className="flex min-h-[24px] items-center justify-end gap-[8px]">
        {(state === 'available' || state === 'cancelled' || state === 'rejected') && <DecideCountdownMemo decideMin={load.decideMin} />}
        {state === 'booked' && <PickupCountdownMemo pickupTime={pickupTime} />}
      </div>
      )}
      <p className="flex items-baseline gap-[8px]">
        <span className="text-metric-28 text-[var(--color-offer-text-price)]">€{load.rate}</span>
        <span className="text-label-14 text-[var(--color-text-secondary)]">€{load.perKm.toFixed(2)}/km</span>
      </p>
      <button type="button" onClick={open} aria-label={routeAriaLabel(load.from, load.to)} className="flex min-h-[44px] items-center gap-[8px] text-left text-heading-20 text-[var(--color-text-primary)]">
        <span className="truncate">{load.from} <span className="text-caption-12 font-normal text-[var(--color-text-tertiary)]">{countryForCity(load.from)}</span></span><Icon name="arrow-right" size="md" /><span className="truncate">{load.to} <span className="text-caption-12 font-normal text-[var(--color-text-tertiary)]">{countryForCity(load.to)}</span></span>
      </button>
      <p className="text-body-14 text-[var(--color-text-primary)]">
        {load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window} · <span className={farPickup ? 'font-semibold text-[var(--color-status-warning-text)]' : undefined}>{load.pickupKm} km / {load.pickupMin} min to pickup</span> · {load.km} km loaded
      </p>
      <p className="text-label-14 text-[var(--color-text-primary)]">
        <span className="font-semibold">{load.company}</span>
        <span className="font-normal text-[var(--color-text-secondary)]"> · <span className="inline-flex items-center gap-[2px]"><Icon name="star" size={12} />{load.rating.toFixed(1)}</span> Verified · {load.paidIn}{cross ? ' · cross-border' : ''}</span>
      </p>
      <LoadCta loadId={load.id} onNotice={onNotice} />
      {canDismiss && (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onDismiss!(load); }}
          className="self-end px-[8px] text-label-12 text-[var(--color-text-tertiary)] underline focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          Hide this load
        </button>
      )}
      </article>
    </div>
  );
}
