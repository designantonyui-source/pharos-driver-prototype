import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dismissLoad, getLoads, restoreLoad } from '../../lib/api';
import { store, useStore } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { Icon } from '../../components/Icon';
import { V2Frame } from '../../components/v2/V2Frame';
import { LoadSheet } from '../../components/v2/LoadSheet';
import { Toast, useToast } from '../../components/v2/Toast';
import { ApplicationBanner } from '../../components/v2/ApplicationBanner';
import { FiltersButton } from '../../components/FiltersButton';
import { FILTERS, FiltersSheet } from '../../components/v2/FiltersSheet';
import { RouteSheet } from '../../components/v2/RouteSheet';
import { SmartLoadList } from '../../components/v2/SmartLoadList';

/**
 * v2 · Home — unified list/map «Loads» (route `/v2`). Replaces search → list → map → details → review with ONE screen.
 * props: none (state from `useStore`, data from `api.getLoads`)
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-action-primary, color-action-text-inverse,
 *         color-border-default, radius-lg, radius-pill, shadow-card
 * epic: pharos-driver-flow-stories.md — S2 (tile → sheet), S4 (CTA), S6/S7 (banner + status), S8 (two deadlines)
 *
 * No form first: the feed is already there; direction + three quick filters narrow it. Applying is one tap and the
 * driver stays on the current view with a live banner. Status moves with the Demo panel (→ dispatcher approved, → confirmed).
 */
const FILTER_TESTS: Record<string, (l: V2Load) => boolean> = {
  today: (l) => l.day === 'today',
  rate: (l) => l.perKm >= 3,
  near: (l) => l.pickupKm < 30,
};

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get('scenario');
  const scenarioSearch = scenario === 'reject' || scenario === 'approve' ? `?scenario=${scenario}` : '';
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);
  const [on, setOn] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    getLoads().then(setLoads);
  }, []);

  const countFor = (ids: string[]) =>
    (loads ?? []).filter((l) => FILTERS.every((f) => !ids.includes(f.id) || FILTER_TESTS[f.id](l))).length;
  // Dismissed loads leave the feed but stay restorable (decline is free, never a score input).
  const dismissedIds = useMemo(
    () => Object.values(state.applications).filter((a) => a.dismissed).map((a) => a.loadId),
    [state.applications],
  );
  const origin = state.route.from.trim();
  const destination = state.route.to.trim() || 'Brussels';
  const routeLabel = origin ? `${origin} → ${destination}` : destination;
  const routeMatch = (l: V2Load) =>
    (destination === '' || l.to.trim().toLocaleLowerCase() === destination.toLocaleLowerCase()) &&
    (origin === '' || l.from.trim().toLocaleLowerCase() === origin.toLocaleLowerCase());
  const visible = useMemo(
    () => (loads ?? [])
      .filter((l) => !dismissedIds.includes(l.id))
      .filter(routeMatch)
      .filter((l) => FILTERS.every((f) => !on.includes(f.id) || FILTER_TESTS[f.id](l))),
    // routeMatch reads origin/destination — keep them as explicit deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loads, on, dismissedIds, origin, destination],
  );
  const applied = loads?.find((l) => l.id === state.loadId) ?? null;
  const status = state.status;
  const open = loads?.find((l) => l.id === openId) ?? null;
  const minPerKm = visible.length > 0 ? Math.min(...visible.map((l) => l.perKm)) : null;

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-[8px] bottom-[117px] z-20 flex flex-col gap-[8px] px-[16px]">
        <button
          type="button"
          onClick={() => setRouteOpen(true)}
          aria-label={`Direction: ${routeLabel}, ${visible.length} loads. Activate to change.`}
          className="flex items-center justify-between gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] text-left shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <span className="flex min-w-0 items-start gap-[8px] text-[var(--color-text-primary)]">
            <Icon name="map-pin" className="mt-[2px] text-[var(--color-action-primary)]" />
            <span className="flex min-w-0 flex-col">
              <span className="flex min-w-0 items-center gap-[8px]">
                <span className="text-heading-14 truncate">{routeLabel}</span>
                <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-[8px] py-[2px] text-label-12 text-[var(--color-action-text-inverse)]">
                  {loads ? `${visible.length} trips` : '…'}
                </span>
              </span>
              <span className="text-caption-12 truncate text-[var(--color-text-secondary)]">
                Loads · Today{minPerKm !== null ? ` · from €${minPerKm.toFixed(2)}/km` : ''}{on.length > 0 ? ` · ${on.length} filter${on.length === 1 ? '' : 's'}` : ''}
              </span>
            </span>
          </span>
          <span className="flex min-h-[44px] shrink-0 items-center">
            <Icon name="chevron-down" size="sm" className="text-[var(--color-action-primary)]" />
          </span>
        </button>

        {applied && status && <ApplicationBanner load={applied} status={status} onOpen={() => navigate(`/application/${applied.id}${scenarioSearch}`)} />}

        <SmartLoadList
          loads={visible}
          loading={loads === null}
          currentRoute={{ from: state.route.from, to: destination }}
          onOpen={(load) => setOpenId(load.id)}
          onClearFilters={on.length > 0 ? () => setOn([]) : undefined}
          onDismiss={(load) => { void dismissLoad(load.id); }}
          dismissedIds={dismissedIds}
          onRestore={(loadId) => { void restoreLoad(loadId); }}
          onNotice={(title, detail) => show({ tone: 'info', title, detail })}
          tabsPrefix={
            <FiltersButton
              count={on.length > 0 ? on.length : undefined}
              onClick={() => setFiltersOpen(true)}
              className="shrink-0"
            />
          }
        />
      </div>

      <FiltersSheet
        open={filtersOpen}
        active={on}
        countFor={countFor}
        onApply={(ids) => { setOn(ids); setFiltersOpen(false); }}
        onClose={() => setFiltersOpen(false)}
      />
      <RouteSheet
        open={routeOpen}
        value={{ from: state.route.from, to: destination }}
        cities={[...new Set((loads ?? []).flatMap((l) => [l.from, l.to]))].sort()}
        countFor={(route) => (loads ?? []).filter((l) =>
          (route.to.trim() === '' || l.to.trim().toLocaleLowerCase() === route.to.trim().toLocaleLowerCase()) &&
          (route.from.trim() === '' || l.from.trim().toLocaleLowerCase() === route.from.trim().toLocaleLowerCase()),
        ).length}
        onApply={(route) => {
          store.set({ route });
          setRouteOpen(false);
        }}
        onClose={() => setRouteOpen(false)}
      />
      {open && (
        <LoadSheet
          load={open}
          open
          onClose={() => setOpenId(null)}
          onNotice={(title, detail) => show({ tone: 'info', title, detail })}
        />
      )}
      <Toast toast={toast} onClose={dismiss} />
    </V2Frame>
  );
}
