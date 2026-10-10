import { useId, useState } from 'react';
import type { V2Load } from '../../lib/v2/loads';
import mapArt from '../../assets/maps/route-628x674.svg';
import { LoadCard, sortLoadsByApplication } from './LoadCard';
import { useStore } from '../../lib/store';

/**
 * figma: prototype-led · Smart List and Map tabs (Phase 2.1)
 * props: loads, loading, currentRoute, onOpen
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-status-match-bg, color-status-match-text, color-border-default, radius-lg
 */
type SmartLoadListProps = {
  loads: V2Load[];
  loading?: boolean;
  currentRoute: { from: string; to: string };
  onOpen: (load: V2Load) => void;
};

type View = 'list' | 'map';

const TABS: { id: View; label: string }[] = [
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' },
];

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
    />
  ));

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Matching loads">
      <div className="flex h-[44px] shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[4px]" role="tablist" aria-label="Load view">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-tab-${tab.id}`}
            aria-selected={view === tab.id}
            aria-controls={`${id}-view`}
            onClick={() => setView(tab.id)}
            className={`flex-1 rounded-[var(--radius-sm)] text-label-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
              view === tab.id
                ? 'bg-[var(--color-bg-subtle)] text-[var(--color-action-text)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id={`${id}-view`} role="tabpanel" aria-labelledby={`${id}-tab-${view}`} className="mt-[8px] min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <p className="px-[4px] py-[8px] text-body-14 text-[var(--color-text-secondary)]" role="status">Searching for loads…</p>
        ) : loads.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-secondary)]">No loads match these filters.</p>
        ) : view === 'list' ? (
          <div className="flex h-full flex-col gap-[8px] overflow-y-auto pb-[8px]" aria-label="Loads list">
            {cards}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col gap-[8px]">
            <div className="relative min-h-[120px] flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-map-land)]" role="img" aria-label={`Route map towards ${currentRoute.to}`}>
              <img src={mapArt} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute left-[12px] top-[12px] rounded-[var(--radius-pill)] bg-[var(--color-bg-surface)] px-[10px] py-[6px] text-label-12 text-[var(--color-text-primary)] shadow-[var(--shadow-card)]">
                Loads towards {currentRoute.to}
              </span>
            </div>
            <div className="flex min-h-[224px] shrink-0 snap-x snap-mandatory gap-[8px] overflow-x-auto pb-[4px]" aria-label="Loads on map">
              {cards.map((card, index) => <div key={sortedLoads[index].id} className="w-[340px] shrink-0 snap-center">{card}</div>)}
            </div>
          </div>
        )}
      </div>


    </section>
  );
}
