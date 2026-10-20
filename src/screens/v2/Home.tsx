import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dismissLoad, getLoads, restoreLoad, commitRoute } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { mergeCities } from '../../lib/v2/cities';
import { directionLabel, feedCount, feedSlice, liveApplications } from '../../lib/v2/feed';
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
 * The direction header states the feed (`Direction: {from → to}, {visible} of {towards} loads`);
 * both sides empty reads "Anywhere → Anywhere", never a hidden city; the subline
 * names active filters (or "No filters") — counts, not prices. One `feedSlice`
 * answers the header, both sheets and the rendered list, so 2 of 6 can no longer
 * coexist with "Show 6 loads" on the same query. The empty state offers both
 * Clear filters and Change direction, so a dead-end route recovers in one tap.
 */
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

  const route = { from: state.route.from, to: state.route.to };
  const feed = useMemo(
    () => feedSlice(loads ?? [], state, { ...route, filters: on }),
    // The state slices that decide eligibility are explicit; the whole object would
    // re-run on every payout change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loads, state.applications, state.ledger, state.route.from, state.route.to, on],
  );
  const countForFilters = (ids: string[]) =>
    feedCount(loads ?? [], state, { ...route, filters: ids });
  const countForRoute = (draft: { from: string; to: string }) =>
    // An empty To draft keeps the committed destination on apply
    // (toDraft.trim() || value.to), so the count must resolve it the same way.
    feedCount(loads ?? [], state, { ...draft, to: draft.to.trim() || state.route.to, filters: on });
  // Dismissed loads leave the feed but stay restorable (decline is free, never a score input).
  const dismissedIds = useMemo(
    () => Object.values(state.applications).filter((a) => a.dismissed).map((a) => a.loadId),
    [state.applications],
  );
  const routeLabel = directionLabel(state.route.from, state.route.to);
  const visible = feed.visible;
  const live = liveApplications(state);
  const latestApplication = live[0] ?? null;
  const applied = latestApplication ? loads?.find((l) => l.id === latestApplication.loadId) ?? null : null;
  const status = latestApplication?.status ?? null;
  const open = loads?.find((l) => l.id === openId) ?? null;
  const activeLabels = FILTERS.filter((f) => on.includes(f.id)).map((f) => f.label);

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-[8px] bottom-[117px] z-20 flex flex-col gap-[8px] px-[16px]">
        <button
          type="button"
          onClick={() => setRouteOpen(true)}
          aria-label={`Direction: ${routeLabel}, ${visible.length} of ${feed.towards.length} loads. Activate to change.`}
          className="flex items-center justify-between gap-[8px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[12px] text-left shadow-card focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        >
          <span className="flex min-w-0 items-start gap-[8px] text-[var(--color-text-primary)]">
            <Icon name="map-pin" className="mt-[2px] text-[var(--color-action-primary)]" />
            <span className="flex min-w-0 flex-col">
              <span className="flex min-w-0 items-center gap-[8px]">
                <span className="text-heading-14 truncate">{routeLabel}</span>
                <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-[8px] py-[2px] text-label-12 text-[var(--color-action-text-inverse)]">
                  {loads ? `${visible.length} of ${feed.towards.length}` : '…'}
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

        {applied && status && latestApplication && <ApplicationBanner
          load={applied}
          status={status}
          application={latestApplication}
          more={live.length - 1}
          onOpen={() => navigate(status === ApplicationStatus.CONFIRMED ? `/trip/${applied.id}` : `/application/${applied.id}${scenarioSearch}`)}
        />}

        {loadError ? (
          <div role="alert" className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-primary)]">
            <p>Could not load available loads. Check your connection and try again.</p>
            <button type="button" onClick={() => setLoadAttempt((n) => n + 1)} className="mt-[12px] min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-action-primary)] px-[16px] text-[var(--color-action-text-inverse)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">Retry</button>
          </div>
        ) : <SmartLoadList
          loads={visible}
          loading={loads === null}
          currentRoute={route}
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
        countFor={countForFilters}
        onApply={(ids) => { setOn(ids); setFiltersOpen(false); }}
        onClose={() => setFiltersOpen(false)}
      />
      <RouteSheet
        open={routeOpen}
        value={route}
        cities={mergeCities([...new Set((loads ?? []).flatMap((l) => [l.from, l.to]))])}
        recentRoutes={state.recentRoutes}
        countFor={countForRoute}
        onApply={(nextRoute) => {
          void commitRoute({ from: nextRoute.from, to: nextRoute.to });
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
