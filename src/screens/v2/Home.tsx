import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dismissLoad, getLoads, restoreLoad, commitRoute } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { mergeCities } from '../../lib/v2/cities';
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
 *
 * The direction header states the feed (`Direction: {from → to}, {visible} of {total} loads`);
 * origin empty reads "Anywhere", never a bare city; the subline names active
 * filters (or "No filters") — counts, not prices. The empty state
 * offers both Clear filters and Change direction, so a dead-end route recovers in one tap.
 */
const FILTER_TESTS: Record<string, (l: V2Load) => boolean> = {
  rate: (l) => l.perKm >= 3,
  near: (l) => l.pickupKm < 30,
};

/**
 * The feed is always scoped to a destination. An empty one means "the default
 * destination", not "every destination".
 *
 * This exists because the two readings used to disagree: the feed resolved an
 * empty destination to Brussels, while the direction sheet counted an empty
 * destination as all six loads. So the sheet's button promised "Show 6 loads"
 * and the feed then showed 2. The count is a promise — it has to be computed
 * with the same rule the feed applies.
 */
export const DEFAULT_DESTINATION = 'Brussels';

export function resolveDestination(to: string): string {
  return to.trim() || DEFAULT_DESTINATION;
}

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get('scenario');
  const scenarioSearch = scenario === 'reject' || scenario === 'approve' ? `?scenario=${scenario}` : '';
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [on, setOn] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const { toast, show, dismiss } = useToast();

  useEffect(() => {
    let active = true;
    setLoadError(false);
    setLoads(null);
    getLoads()
      .then((items) => { if (active) setLoads(items); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  // Dismissed loads leave the feed but stay restorable (decline is free, never a score input).
  const dismissedIds = useMemo(
    () => Object.values(state.applications).filter((a) => a.dismissed).map((a) => a.loadId),
    [state.applications],
  );
  const origin = state.route.from.trim();
  const destination = resolveDestination(state.route.to);
  const originLabel = origin || 'Anywhere';
  const routeLabel = `${originLabel} → ${destination}`;
  const routeMatch = (l: V2Load) =>
    (destination === '' || l.to.trim().toLocaleLowerCase() === destination.toLocaleLowerCase()) &&
    (origin === '' || l.from.trim().toLocaleLowerCase() === origin.toLocaleLowerCase());
  /**
   * How many loads a filter draft would leave in the feed.
   *
   * Scoped to the committed direction and to loads that are still in the feed —
   * the same set the feed shows. Counting every load in the catalogue made the
   * button promise "Show 4 loads" and then hand over a feed of 2: the count is a
   * promise, so it has to be computed with the rules the feed applies.
   */
  const countFor = (ids: string[]) =>
    (loads ?? [])
      .filter((l) => !dismissedIds.includes(l.id))
      .filter(routeMatch)
      .filter((l) => FILTERS.every((f) => !ids.includes(f.id) || FILTER_TESTS[f.id](l))).length;
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
  const activeLabels = FILTERS.filter((f) => on.includes(f.id)).map((f) => f.label);
  /**
   * Loads the app still holds — the catalogue minus the ones the driver dismissed.
   * The direction badge says "N of M": the denominator has to be the number of loads
   * that actually exist. It used to be the raw catalogue, so dismissing one load left
   * the badge reading "1 of 6" while five loads remained.
   */
  const inFeed = useMemo(
    () => (loads ?? []).filter((l) => !dismissedIds.includes(l.id)),
    [loads, dismissedIds],
  );

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-[8px] bottom-[117px] z-20 flex flex-col gap-[8px] px-[16px]">
        <button
          type="button"
          onClick={() => setRouteOpen(true)}
          aria-label={`Direction: ${routeLabel}, ${visible.length} of ${inFeed.length} loads. Activate to change.`}
          className="flex items-center justify-between gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] text-left shadow-card focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <span className="flex min-w-0 items-start gap-[8px] text-[var(--color-text-primary)]">
            <Icon name="map-pin" className="mt-[2px] text-[var(--color-action-primary)]" />
            <span className="flex min-w-0 flex-col">
              <span className="flex min-w-0 items-center gap-[8px]">
                <span className="text-heading-14 truncate">{routeLabel}</span>
                <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-[8px] py-[2px] text-label-12 text-[var(--color-action-text-inverse)]">
                  {loads ? `${visible.length} of ${inFeed.length}` : '…'}
                </span>
              </span>
              <span className="text-caption-12 truncate text-[var(--color-text-secondary)]">
                {activeLabels.length > 0 ? activeLabels.join(' · ') : 'No filters'}
              </span>
            </span>
          </span>
          <span className="flex min-h-[44px] shrink-0 items-center">
            <Icon name="chevron-down" size="sm" className="text-[var(--color-action-primary)]" />
          </span>
        </button>

        {applied && status && <ApplicationBanner load={applied} status={status} application={state.applications[applied.id]} onOpen={() => navigate(status === ApplicationStatus.CONFIRMED ? `/trip/${applied.id}` : `/application/${applied.id}${scenarioSearch}`)} />}

        {loadError ? (
          <div role="alert" className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-primary)]">
            <p>Could not load available loads. Check your connection and try again.</p>
            <button type="button" onClick={() => setLoadAttempt((n) => n + 1)} className="mt-[12px] min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-[16px] text-[var(--color-action-text-inverse)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">Retry</button>
          </div>
        ) : <SmartLoadList
          loads={visible}
          loading={loads === null}
          currentRoute={{ from: state.route.from, to: destination }}
          onOpen={(load) => setOpenId(load.id)}
          onClearFilters={on.length > 0 ? () => setOn([]) : undefined}
          onOpenRoute={() => setRouteOpen(true)}
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
        />}
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
        cities={mergeCities([...new Set((loads ?? []).flatMap((l) => [l.from, l.to]))])}
        recentRoutes={state.recentRoutes}
        // An empty draft keeps the committed destination on apply
        // (toDraft.trim() || value.to) — so the count must do the same.
        // Resolving '' to the global default here promised Brussels loads
        // while Show applied Amsterdam ("Show 2 loads" over a "1 of 6" feed).
        countFor={(route) => {
          const to = route.to.trim() || destination;
          const from = route.from.trim();
          return (loads ?? []).filter((l) =>
            l.to.trim().toLocaleLowerCase() === to.toLocaleLowerCase() &&
            (from === '' || l.from.trim().toLocaleLowerCase() === from.toLocaleLowerCase()),
          ).length;
        }}
        onApply={(route) => {
          void commitRoute({ from: route.from, to: route.to });
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
