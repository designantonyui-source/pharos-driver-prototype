import { useId, useState } from 'react';
import type { V2Load } from '../../lib/v2/loads';
import mapArt from '../../assets/maps/route-628x674.svg';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { LoadCard, getLoadCardState, sortLoadsByApplication } from './LoadCard';
import { LoadCardSkeleton } from './LoadCardSkeleton';
import { useStore } from '../../lib/store';

/**
 * figma: prototype-led · Smart List and Map tabs (Phase 2.1)
 * props: loads, loading, currentRoute, onOpen
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-status-match-bg, color-status-match-text, color-border-default, radius-lg
 *
 * List reuses the full LoadCard. Map answers "where": one 44px pin per load on the static
 * route artwork (PINS anchors the three demo loads; pin colour follows the application state),
 * tap scrolls the compact carousel (MapCard: rate + route + window + state pill, 280px wide)
 * to the load. Details always open in the LoadSheet — the carousel never duplicates the CTA.
 *
 * The List/Map segmented control shares its row with the Filters button (Home passes it as
 * `tabsPrefix`): 48px tall like the button, so the row reads as one control strip.
 * On Map the artwork bleeds edge-to-edge (`-mx` cancels the screen padding) and the
 * carousel floats as a bottom sheet over it; price pills (`€{rate}`, state colour) ride
 * the fixed demo anchors — a real backend needs clustering past a handful of loads.
 */
type SmartLoadListProps = {
  loads: V2Load[];
  loading?: boolean;
  currentRoute: { from: string; to: string };
  onOpen: (load: V2Load) => void;
  /** Empty-state recovery: the list owns the message, the screen owns the filters. */
  onClearFilters?: () => void;
  /** Empty-state recovery for the route: opens the direction sheet. */
  onOpenRoute?: () => void;
  /** Left slot of the List/Map row — Home renders the Filters button here. */
  tabsPrefix?: React.ReactNode;
  /** Decline (dismiss) affordance on available cards — free, reversible, no score impact. */
  onDismiss?: (load: V2Load) => void;
  /** Dismissed ids the screen wants back — renders the undo row instead of the feed. */
  dismissedIds?: string[];
  /** Toast notices from card CTAs (duplicate apply) — the screen owns the Toast. */
  onNotice?: (title: string, detail?: string) => void;
  onRestore?: (loadId: string) => void;
};

type View = 'list' | 'map';

const TABS: { id: View; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' },
];

/**
 * Demo pin layout on the 628x674 route artwork (fractions of width/height).
 * The artwork is static, so pins ride fixed anchors: the map answers "where"
 * (pickup spread along the corridor), the carousel answers "what".
 */
const PINS: Record<string, { x: number; y: number }> = {
  nordcargo: { x: 0.62, y: 0.42 },
  'calais-lille': { x: 0.3, y: 0.62 },
  belroute: { x: 0.78, y: 0.24 },
  'paris-brussels': { x: 0.5, y: 0.52 },
  'brussels-amsterdam': { x: 0.68, y: 0.3 },
  'lille-paris': { x: 0.45, y: 0.58 },
};

const PIN_TONE: Record<string, string> = {
  pending: 'bg-[var(--color-status-warning-text)]',
  booked: 'bg-[var(--color-status-success-text)]',
  rejected: 'bg-[var(--color-status-danger-text)]',
  cancelled: 'bg-[var(--color-status-neutral-text)]',
  available: 'bg-[var(--color-action-primary)]',
};

/** Pill faces for the compact map card — same pairs as the full card. */
const PIN_PILL: Record<string, string> = {
  pending: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
  booked: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
  rejected: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
  cancelled: 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-text)]',
  available: 'bg-[var(--color-status-match-bg)] text-[var(--color-status-match-text)]',
};

function MapPin({ load, selected, onSelect }: { load: V2Load; selected: boolean; onSelect: () => void }) {
  const { state } = useStore();
  const cardState = getLoadCardState(state.applications[load.id] ?? null);
  const anchor = PINS[load.id] ?? { x: 0.5, y: 0.5 };
  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      aria-label={`${load.from} to ${load.to}, €${load.rate}${cardState === 'available' ? '' : `, ${cardState}`}`}
      aria-pressed={selected}
      className={`absolute flex h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[4px] rounded-[var(--radius-pill)] px-[10px] text-label-14 text-[var(--color-text-inverse)] shadow-card focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${selected ? 'outline-2 outline-[var(--color-text-inverse)] outline-offset-2' : ''} ${PIN_TONE[cardState]}`}
      style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }}
    >
      <span aria-hidden>€{load.rate}</span>
    </button>
  );
}

function matchesRoute(load: V2Load, route: { from: string; to: string }) {
  const from = route.from.trim().toLocaleLowerCase();
  const to = route.to.trim().toLocaleLowerCase();
  if (from && to) return load.from.trim().toLocaleLowerCase() === from && load.to.trim().toLocaleLowerCase() === to;
  if (from) return load.from.trim().toLocaleLowerCase() === from;
  return to.length > 0 && load.to.trim().toLocaleLowerCase() === to;
}

export function SmartLoadList({
  loads,
  loading = false,
  currentRoute,
  onOpen,
  onClearFilters,
  onOpenRoute,
  tabsPrefix,
  onDismiss,
  dismissedIds = [],
  onNotice,
  onRestore,
}: SmartLoadListProps) {
  const { state } = useStore();
  const sortedLoads = sortLoadsByApplication(loads, state.applications);
  const [view, setView] = useState<View>('list');
  const id = useId();

  const cards = sortedLoads.map((load) => (
    <LoadCard
      key={load.id}
      load={load}
      isOnRoute={matchesRoute(load, currentRoute)}
      onOpen={onOpen}
      onDismiss={onDismiss}
      onNotice={onNotice}
    />
  ));
  // The map answers "where": one pin per load, tap scrolls the carousel to its card.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedLoad = sortedLoads.find((load) => load.id === selectedId) ?? sortedLoads[0] ?? null;

  /** Compact carousel face: rate + route + window + state pill. Details live in the sheet. */
  function MapCard({ load }: { load: V2Load }) {
    const { state } = useStore();
    const application = state.applications[load.id] ?? null;
    const cardState = getLoadCardState(application);
    const pill: { icon: 'clock' | 'circle-check' | 'circle-x' | 'x' | null; label: string } | null =
      cardState === 'pending' ? { icon: 'clock', label: 'In review' }
        : cardState === 'booked' ? { icon: 'circle-check', label: `Booked · ${application?.tripId ?? `TR-${load.id}`}` }
          : cardState === 'rejected' ? { icon: 'circle-x', label: 'Rejected' }
            : cardState === 'cancelled' ? { icon: 'x', label: 'Cancelled by you' }
              : null;
    return (
      <article aria-label={`Load ${load.id}`}>
        <button
          type="button"
          onClick={() => onOpen(load)}
          aria-label={`${load.from} to ${load.to}, €${load.rate}. Open details.`}
          className="flex w-full flex-col gap-[6px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] text-left shadow-card focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <span className="flex items-center justify-between gap-[8px]">
            <span className="text-heading-20 text-[var(--color-offer-text-price)]">€{load.rate}</span>
            {pill && (
              <span className={`flex items-center gap-[4px] rounded-[var(--radius-pill)] px-[8px] py-[4px] text-label-12 ${PIN_PILL[cardState]}`}>
                {pill.icon && <Icon name={pill.icon} size={12} />}{pill.label}
              </span>
            )}
          </span>
          <span className="flex items-center gap-[6px] text-heading-14 text-[var(--color-text-primary)]">
            <span className="truncate">{load.from}</span><Icon name="arrow-right" size="sm" /><span className="truncate">{load.to}</span>
          </span>
          <span className="text-body-14 text-[var(--color-text-secondary)]">
            {load.day === 'today' ? 'Today' : 'Tomorrow'} · {load.window} · {load.pickupKm} km to pickup
          </span>
        </button>
      </article>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Matching loads">
      <div className="flex shrink-0 gap-[8px]">
        {tabsPrefix}
        <div className="flex h-[48px] min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[4px]" role="tablist" aria-label="Load view">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.id}`}
              aria-selected={view === tab.id}
              aria-controls={`${id}-view`}
              onClick={() => setView(tab.id)}
              className={`flex-1 rounded-[var(--radius-sm)] text-label-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] min-h-[36px] ${
                view === tab.id
                  ? 'bg-[var(--color-bg-subtle)] text-[var(--color-action-text)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div id={`${id}-view`} role="tabpanel" aria-labelledby={`${id}-tab-${view}`} className={`mt-[8px] min-h-0 ${view === 'map' ? 'flex-1 overflow-visible' : 'flex-1 overflow-hidden'}`}>
        {loading ? (
          <LoadCardSkeleton count={3} />
        ) : loads.length === 0 ? (
          <div className="flex flex-col gap-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-card">
            <p className="text-body-14 text-[var(--color-text-secondary)]">
              No loads match{onClearFilters || onOpenRoute ? ' — try widening the search.' : '.'}
            </p>
            <div className="flex flex-col gap-[8px]">
              {onClearFilters && <Button label="Clear filters" appearance="secondary" onClick={onClearFilters} />}
              {onOpenRoute && <Button label="Change direction" appearance="secondary" onClick={onOpenRoute} />}
            </div>
          </div>
        ) : view === 'list' ? (
          <>
            {dismissedIds.length > 0 && onRestore && (
              <div className="mb-[8px] flex shrink-0 items-center justify-between gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] px-[12px] py-[8px] shadow-card">
                <p className="text-body-14 text-[var(--color-text-secondary)]">
                  {dismissedIds.length === 1 ? '1 load hidden' : `${dismissedIds.length} loads hidden`}
                </p>
                <button
                  type="button"
                  onClick={() => dismissedIds.forEach(onRestore)}
                  className="min-h-[44px] px-[8px] text-label-14 text-[var(--color-action-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
                >
                  Show again
                </button>
              </div>
            )}
            <div className="flex h-full flex-col gap-[8px] overflow-y-auto pb-[8px]" aria-label="Loads list">
              {cards}
            </div>
          </>
        ) : (
          <div className="relative -mx-[16px] -mt-[8px] h-full min-h-[300px]">
            <div className="absolute inset-0 overflow-hidden bg-[var(--color-map-land)]" role="group" aria-label={`Route map towards ${currentRoute.to}: ${sortedLoads.length} loads pinned`}>
              <img src={mapArt} alt="" className="absolute inset-0 h-full w-full object-cover" />
              {sortedLoads.map((load) => (
                <MapPin
                  key={load.id}
                  load={load}
                  selected={selectedLoad?.id === load.id}
                  onSelect={() => {
                    setSelectedId(load.id);
                    document.getElementById(`map-card-${load.id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }}
                />
              ))}
            </div>
            <span className="absolute left-[28px] top-[12px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] px-[10px] py-[6px] text-label-12 text-[var(--color-text-primary)] shadow-card">
              {sortedLoads.length} {sortedLoads.length === 1 ? 'load' : 'loads'} towards {currentRoute.to}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex snap-x snap-mandatory gap-[8px] overflow-x-auto px-[16px] pb-[12px] pt-[24px]" aria-label="Loads on map">
              {sortedLoads.map((load) => <div key={load.id} id={`map-card-${load.id}`} className="w-[280px] shrink-0 snap-center"><MapCard load={load} /></div>)}
            </div>
          </div>
        )}
      </div>


    </section>
  );
}
