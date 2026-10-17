/**
 * v2 · RouteSheet — change the feed direction without leaving `/v2` (closes P2-1:
 * direction used to live only on `/search`). Two fields, live count, Apply commits.
 * Each field filters the known cities as the driver types and offers them as an
 * inline suggestion list (count included) — no chip rows, no dead options.
 * Below the fields: Recent (last applied directions, current excluded) and Popular
 * (top feed destinations from Anywhere) — one tap applies, no typing (Mobbin:
 * Transit quick actions + Recent, Lyft recents, Eventbrite destination picks).
 * props: open, value, countFor, onApply, onClose, cities, recentRoutes
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, color-action-text-inverse, color-border-default, radius-md, radius-pill
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';

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
      <label className="block" htmlFor={id}>
        <span className="text-label-14 text-[var(--color-text-secondary)]">{label}</span>
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
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
        className="mt-[8px] flex min-h-[44px] w-full items-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
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
  /** Committed destination — snapshotted into the draft on open, never mutated. */
  value: { from: string; to: string };
  /** Loads a given route would match. */
  countFor: (route: { from: string; to: string }) => number;
  onApply: (route: { from: string; to: string }) => void;
  onClose: () => void;
  /** Known cities for one-tap suggestions — derived from the feed. */
  cities?: string[];
  /** Last applied directions, most-recent-first — current route is excluded. */
  recentRoutes?: { from: string; to: string }[];
}) {
  const [fromDraft, setFromDraft] = useState(value.from);
  const [toDraft, setToDraft] = useState(value.to);
  const [openField, setOpenField] = useState<'from' | 'to' | null>(null);
  const closeSuggestions = useCallback(() => setOpenField(null), []);
  useEffect(() => {
    if (open) { setFromDraft(value.from); setToDraft(value.to); setOpenField(null); }
  }, [open, value.from, value.to]);
  const visible = countFor({ from: fromDraft, to: toDraft });

  const norm = (s: string) => s.trim().toLocaleLowerCase();
  const recents = useMemo(() => recentRoutes
    .filter((r) => !(norm(r.from) === norm(value.from) && norm(r.to) === norm(value.to)))
    .map((route) => ({ route, matches: countFor(route) })),
  // countFor is re-created by the owner each render; sections mirror the draft snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, recentRoutes, value.from, value.to]);
  const popular = useMemo(() => cities
    .map((city) => ({ city, matches: countFor({ from: '', to: city }) }))
    .filter((p) => p.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 3),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, cities]);

  return (
    <Sheet open={open} onClose={onClose} label="Change direction">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Loads towards</h2>
      <div className="mt-[16px] flex flex-col gap-[12px]">
        <CityField
          id="route-origin"
          label="Origin city"
          value={fromDraft}
          placeholder="Anywhere"
          cities={cities}
          countFor={(city) => countFor({ from: city, to: toDraft })}
          open={openField === 'from'}
          onOpen={() => setOpenField('from')}
          onClose={closeSuggestions}
          onChange={setFromDraft}
          onPick={setFromDraft}
        />
        <CityField
          id="route-destination"
          label="Destination city"
          value={toDraft}
          placeholder="Brussels"
          cities={cities}
          countFor={(city) => countFor({ from: fromDraft, to: city })}
          open={openField === 'to'}
          onOpen={() => setOpenField('to')}
          onClose={closeSuggestions}
          onChange={setToDraft}
          onPick={setToDraft}
        />
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
                        onClick={() => onApply({ from: route.from, to: route.to })}
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
                      onClick={() => onApply({ from: '', to: city })}
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
          onClick={() => onApply({ from: fromDraft.trim(), to: toDraft.trim() || value.to })}
        />
      </div>
    </Sheet>
  );
}