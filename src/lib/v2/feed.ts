/**
 * v2 · feed — one source of truth for direction, filters, counts and feed eligibility.
 *
 * Before this module the header counted all six loads, the filters sheet counted
 * without the direction, the route sheet counted without the filters, and paid trips
 * stayed on sale. Every surface now asks the same function.
 *
 * The query is intentionally plain data so sheets can preview a draft without
 * mutating the committed route or filters.
 */
import { ApplicationStatus } from '../models';
import type { AppState, LoadApplication } from '../store';
import { isPickupClosed, type V2Load } from './loads';

export type FeedQuery = {
  from: string;
  to: string;
  /** Active FilterId values. */
  filters: string[];
};

export type FeedFilterId = 'rate' | 'near';

/** The only place a filter predicate is defined. `netPerKm` includes the deadhead. */
export const FEED_FILTER_TESTS: Record<FeedFilterId, (load: V2Load) => boolean> = {
  rate: (load) => load.netPerKm >= 2.5,
  near: (load) => load.pickupKm < 30,
};

export const FEED_FILTER_LABELS: Record<FeedFilterId, string> = {
  rate: '€2.50+/km net',
  near: 'Under 30 km',
};

const norm = (value: string) => value.trim().toLocaleLowerCase();

/** Direction label used by every header, map tab and sheet. Empty means Anywhere, never a hidden city. */
export function directionLabel(from: string, to: string): string {
  return `${from.trim() || 'Anywhere'} → ${to.trim() || 'Anywhere'}`;
}

/** True when a direction was explicitly chosen (used for the "On your route" badge). */
export function hasDirection(query: { from: string; to: string }): boolean {
  return query.from.trim() !== '' || query.to.trim() !== '';
}

export function matchesDirection(load: V2Load, from: string, to: string): boolean {
  const origin = norm(from);
  const destination = norm(to);
  return (origin === '' || norm(load.from) === origin)
    && (destination === '' || norm(load.to) === destination);
}

export function matchesFilters(load: V2Load, filters: string[]): boolean {
  return filters.every((id) => {
    const test = FEED_FILTER_TESTS[id as FeedFilterId];
    return !test || test(load);
  });
}

/** A completed trip is history, not inventory. Paid and pending ledger trips both qualify. */
export function isCompletedLoad(loadId: string, state: Pick<AppState, 'ledger' | 'applications'>): boolean {
  if (state.ledger.some((entry) => entry.kind === 'trip' && entry.loadId === loadId)) return true;
  const application = state.applications[loadId];
  return application?.tripStage === 'delivered';
}

export function isDismissed(application: LoadApplication | undefined): boolean {
  return application?.dismissed === true;
}

/**
 * Feed candidates: not completed, not dismissed, not a dead offer (pickup window
 * closed) unless the driver already has an application on it. Ended applications
 * stay on their card, exactly as the state model requires.
 */
export function isFeedCandidate(
  load: V2Load,
  state: Pick<AppState, 'ledger' | 'applications'>,
  now: Date = new Date(),
): boolean {
  const application = state.applications[load.id];
  if (isCompletedLoad(load.id, state)) return false;
  if (isDismissed(application)) return false;
  if (!application && isPickupClosed(load, now)) return false;
  return true;
}

export type FeedSlice = {
  /** Every offer the feed can show, before direction and filters. */
  eligible: V2Load[];
  /** Offers matching the direction, before filters. This is the header denominator. */
  towards: V2Load[];
  /** Offers actually rendered. This is the header numerator. */
  visible: V2Load[];
};

export function feedSlice(
  loads: V2Load[],
  state: Pick<AppState, 'ledger' | 'applications'>,
  query: FeedQuery,
  now: Date = new Date(),
): FeedSlice {
  const eligible = loads.filter((load) => isFeedCandidate(load, state, now));
  const towards = eligible.filter((load) => matchesDirection(load, query.from, query.to));
  const visible = towards.filter((load) => matchesFilters(load, query.filters));
  return { eligible, towards, visible };
}

/** Count for a draft from any sheet — used by both the route and filters CTAs. */
export function feedCount(
  loads: V2Load[],
  state: Pick<AppState, 'ledger' | 'applications'>,
  query: FeedQuery,
  now: Date = new Date(),
): number {
  return feedSlice(loads, state, query, now).visible.length;
}

/** Live applications only: waiting or confirmed, not cancelled/expired/rejected/dismissed. */
export function isLiveApplication(application: LoadApplication | undefined): application is LoadApplication {
  if (!application || application.dismissed) return false;
  return [
    ApplicationStatus.SENT,
    ApplicationStatus.DISPATCHER_REVIEW,
    ApplicationStatus.CUSTOMER_REVIEW,
    ApplicationStatus.CONFIRMED,
  ].includes(application.status);
}

/**
 * Banner selection: the newest live application, not the legacy single `state.loadId`.
 * Multiple applications are allowed; the banner shows the latest and the rest live in Trips.
 */
export function liveApplications(state: Pick<AppState, 'applications'>): LoadApplication[] {
  return Object.values(state.applications)
    .filter(isLiveApplication)
    .sort((a, b) => Date.parse(b.submittedAt ?? '') - Date.parse(a.submittedAt ?? ''));
}
