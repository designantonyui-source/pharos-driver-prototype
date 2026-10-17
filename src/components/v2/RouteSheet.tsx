/**
 * v2 · RouteSheet — change the feed direction without leaving `/v2` (closes P2-1:
 * direction used to live only on `/search`). From/To live in ONE grouped box
 * (Grab/Lyft pattern: blue origin dot, red destination dot, shared border) with
 * inline suggestion lists (count included) — no chip rows, no dead options.
 * Below: When (pickup day: Any day / Today / Tomorrow) — where + when in one
 * place, the day filter moved out of FiltersSheet. Recent (last applied,
 * current excluded) and Popular (top feed destinations) apply in one tap
 * (Mobbin: Transit quick actions + Recent, Lyft recents, Eventbrite picks).
 * props: open, value, countFor, onApply, onClose, cities, recentRoutes
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-text-disabled, color-action-primary, color-action-text-inverse,
 *         color-border-default, radius-md, radius-pill
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';

export type RouteDay = '' | 'today' | 'tomorrow';

export type RouteValue = { from: string; to: string; day?: RouteDay };

function matchesFor(cities: string[], query: string): string[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return cities;
  return cities.filter((city) => city.toLocaleLowerCase().includes(q));
}

function CityField({
  id,
  label,
  value,
  placeholder,
  cities,
  countFor,
  open,
  onOpen,
  onClose,
  onChange,
  onPick,
  marker,
  edge,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  cities: string[];
  /** Loads the route would match if this city were committed. */
  countFor: (city: string) => number;
  /** Only one suggestion list is open at a time. */
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
  onPick: (city: string) => void;
  /** Grab-style dot: blue origin, red destination. */
  marker: 'from' | 'to';
  /** Joined pair: top keeps only the top rounding, bottom only the bottom. */
  edge: 'top' | 'bottom';
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) onClose();
    };
    const onScroll = () => onClose();
    const sheet = boxRef.current?.closest('[role="dialog"]');
    document.addEventListener('pointerdown', onPointerDown);
    sheet?.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      sheet?.removeEventListener('scroll', onScroll, true);
    };
  }, [open, onClose ]);

  const options = matchesFor(cities, value).slice(0, 6);

  return (
    <div ref={boxRef} className="relative">
      <label className="sr-only" htmlFor={id}>{label}</label>
      <span
        aria-hidden
        className={`absolute left-[12px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full ${
          marker === 'from' ? 'bg-[var(--color-action-primary)]' : 'bg-[var(--color-status-danger-text)]'
        }`}
      />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={options.length > 0 && open}
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        value={value}
        onChange={(event) => { onChange(event.target.value); onOpen(); }}
        onFocus={onOpen}
        onBlur={() => {
          // Let the option tap land first (pointerdown fires before blur).
          window.setTimeout(() => onClose(), 150);
        }}
        onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
        placeholder={placeholder}
        autoComplete="off"
        className={`flex min-h-[48px] w-full items-center bg-[var(--color-bg-surface)] pl-[32px] pr-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
          edge === 'top' ? 'rounded-t-[var(--radius-md)] border-b border-[var(--color-border-default)]' : 'rounded-b-[var(--radius-md)]'
        }`}
      />
      {open && options.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          data-testid={`${id}-suggestions`}
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-[4px] max-h-[216px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-[4px] shadow-card"
        >
          {options.map((city) => {
            const matches = countFor(city);
            const dead = matches === 0;
            return (
              <li key={city} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value.trim().toLocaleLowerCase() === city.trim().toLocaleLowerCase()}
                  aria-label={`${city}, ${dead ? 'no loads' : `${matches} ${matches === 1 ? 'load' : 'loads'}`}`}
                  disabled={dead}
                  onClick={() => { onPick(city); onClose(); }}
                  className={`flex min-h-[44px] w-full items-center justify-between gap-[8px] px-[12px] text-left text-body-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    dead
                      ? 'cursor-not-allowed text-[var(--color-text-disabled)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-subtle)]'
                  }`}
                >
                  <span aria-hidden>{city}</span>
                  <span aria-hidden className="shrink-0 text-caption-12 text-[var(--color-text-secondary)]">
                    {dead ? 'No loads' : `${matches} ${matches === 1 ? 'load' : 'loads'}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function RouteSheet({
  open,
  value,
  countFor,
  onApply,
  onClose,
  cities = [],
  recentRoutes = [],
}: {
  open: boolean;
  /** Committed direction + day — snapshotted into the draft on open, never mutated. */
  value: { from: string; to: string; day?: RouteDay };
  /** Loads a given route would match. */
  countFor: (route: { from: string; to: string; day?: RouteDay }) => number;
  onApply: (route: { from: string; to: string; day: RouteDay }) => void;
  onClose: () => void;
  /** Known cities for one-tap suggestions — derived from the feed. */
  cities?: string[];
  /** Last applied directions, most-recent-first — current route is excluded. */
  recentRoutes?: { from: string; to: string }[];
}) {
  const [fromDraft, setFromDraft] = useState(value.from);
  const [toDraft, setToDraft] = useState(value.to);
  const [dayDraft, setDayDraft] = useState<RouteDay>(value.day ?? '');
  const [openField, setOpenField] = useState<'from' | 'to' | null>(null);
  const closeSuggestions = useCallback(() => setOpenField(null), []);
  useEffect(() => {
    if (open) { setFromDraft(value.from); setToDraft(value.to); setDayDraft(value.day ?? ''); setOpenField(null); }
  }, [open, value.from, value.to, value.day]);
  const visible = countFor({ from: fromDraft, to: toDraft, day: dayDraft });

  const norm = (s: string) => s.trim().toLocaleLowerCase();
  const recents = useMemo(() => recentRoutes
    .filter((r) => !(norm(r.from) === norm(value.from) && norm(r.to) === norm(value.to)))
    .map((route) => ({ route, matches: countFor({ ...route, day: dayDraft }) })),
  // countFor is re-created by the owner each render; sections mirror the draft snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, recentRoutes, value.from, value.to, dayDraft]);
  const popular = useMemo(() => cities
    .map((city) => ({ city, matches: countFor({ from: '', to: city, day: dayDraft }) }))
    .filter((p) => p.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 3),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, cities, dayDraft]);

  const DAYS: { id: RouteDay; label: string }[] = [
    { id: '', label: 'Any day' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
  ];

  return (
    <Sheet open={open} onClose={onClose} label="Change direction">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Loads towards</h2>
      <div className="mt-[16px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <CityField
          id="route-origin"
          label="From"
          value={fromDraft}
          placeholder="Anywhere"
          cities={cities}
          countFor={(city) => countFor({ from: city, to: toDraft, day: dayDraft })}
          open={openField === 'from'}
          onOpen={() => setOpenField('from')}
          onClose={closeSuggestions}
          onChange={setFromDraft}
          onPick={setFromDraft}
          marker="from"
          edge="top"
        />
        <CityField
          id="route-destination"
          label="To"
          value={toDraft}
          placeholder="Brussels"
          cities={cities}
          countFor={(city) => countFor({ from: fromDraft, to: city, day: dayDraft })}
          open={openField === 'to'}
          onOpen={() => setOpenField('to')}
          onClose={closeSuggestions}
          onChange={setToDraft}
          onPick={setToDraft}
          marker="to"
          edge="bottom"
        />
      </div>
      <div className="mt-[16px]" role="group" aria-label="Pickup day">
        <div className="flex gap-[8px]" role="presentation">
          {DAYS.map((d) => {
            const selected = dayDraft === d.id;
            return (
              <button
                key={d.id || 'any'}
                type="button"
                aria-pressed={selected}
                aria-label={selected ? `${d.label}, selected. Activate to remove.` : d.label}
                onClick={() => setDayDraft(d.id)}
                className={`flex min-h-[44px] flex-1 items-center justify-center rounded-[var(--radius-pill)] border px-[14px] text-label-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                  selected
                    ? 'border-transparent bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                    : 'border-[var(--color-action-border)] bg-[var(--color-action-secondary)] text-[var(--color-action-text)]'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
      {(recents.length > 0 || popular.length > 0) && (
        <div className="mt-[16px] flex flex-col gap-[16px]">
          {recents.length > 0 && (
            <section aria-label="Recent directions">
              <h3 className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Recent</h3>
              <ul className="mt-[8px] flex flex-col gap-[4px]">
                {recents.map(({ route, matches }) => {
                  const dead = matches === 0;
                  const fromLabel = route.from.trim() || 'Anywhere';
                  return (
                    <li key={`${route.from}→${route.to}`}>
                      <button
                        type="button"
                        disabled={dead}
                        onClick={() => onApply({ from: route.from, to: route.to, day: dayDraft })}
                        aria-label={`${fromLabel} to ${route.to}, ${dead ? 'no loads' : `${matches} ${matches === 1 ? 'load' : 'loads'}`}`}
                        className={`flex min-h-[44px] w-full items-center gap-[8px] rounded-[var(--radius-md)] px-[12px] text-left text-body-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                          dead
                            ? 'cursor-not-allowed text-[var(--color-text-disabled)]'
                            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-subtle)]'
                        }`}
                      >
                        <Icon name="clock" size="sm" className="shrink-0 text-[var(--color-text-secondary)]" />
                        <span className="min-w-0 flex-1 truncate">{fromLabel} → {route.to}</span>
                        <span className="shrink-0 text-caption-12 text-[var(--color-text-secondary)]">
                          {dead ? 'No loads' : `${matches} ${matches === 1 ? 'load' : 'loads'}`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {popular.length > 0 && (
            <section aria-label="Popular destinations">
              <h3 className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Popular</h3>
              <ul className="mt-[8px] flex flex-col gap-[4px]">
                {popular.map(({ city, matches }) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => onApply({ from: '', to: city, day: dayDraft })}
                      aria-label={`Anywhere to ${city}, ${matches} ${matches === 1 ? 'load' : 'loads'}`}
                      className="flex min-h-[44px] w-full items-center gap-[8px] rounded-[var(--radius-md)] px-[12px] text-left text-body-14 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] active:bg-[var(--color-bg-subtle)]"
                    >
                      <Icon name="map-pin" size="sm" className="shrink-0 text-[var(--color-action-primary)]" />
                      <span className="min-w-0 flex-1 truncate">Anywhere → {city}</span>
                      <span className="shrink-0 text-caption-12 text-[var(--color-text-secondary)]">
                        {matches} {matches === 1 ? 'load' : 'loads'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
      <div className="mt-[20px]">
        <Button
          label={visible === 0 ? 'No loads match' : `Show ${visible} ${visible === 1 ? 'load' : 'loads'}`}
          disabled={visible === 0}
          onClick={() => onApply({ from: fromDraft.trim(), to: toDraft.trim() || value.to, day: dayDraft })}
        />
      </div>
    </Sheet>
  );
}