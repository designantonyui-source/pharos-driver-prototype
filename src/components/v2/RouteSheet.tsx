/**
 * v2 · RouteSheet — change the feed direction without leaving `/v2` (closes P2-1:
 * direction used to live only on `/search`). From/To live in ONE grouped box:
 * two-line rows (small label over the value), markers joined by a route line
 * (filled origin dot, hollow destination ring — one neutral hue, red would read
 * as an error), hairline divider inset to the text. Inline suggestion lists
 * (count included) — no chip rows, no dead options.
 * Below: Recent (last applied, current excluded, with relative time) — tap fills the
 * draft fields, Show commits. One commit path: the sheet never applies behind your back
 * (Mobbin: Lyft/Grab recents fill, Transit quick actions).
 *
 * Tapping a field opens a PICKER, not a catalogue: the towns that actually carry loads
 * for that half of the route, each with its live count. The earlier "no catalog on a
 * bare focus" rule measured 5 of 6 alphabetical options dead — a list of towns with
 * nothing behind them. A list of towns with loads is the opposite of that: every row
 * changes the direction to something real. Typing narrows the same list and may show a
 * town with no loads (greyed, "No loads") — the driver asked for it by name.
 * No Popular block: the feed behind the sheet is already the supply list (measured: its
 * top row equalled the current direction — a no-op tap).
 * Day is NOT picked here: pickup dates live on the loads themselves
 * (`V2Load.date`, shown on every card) — the feed shows all days.
 * props: open, value, countFor, onApply, onClose, cities, recentRoutes
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-text-disabled, color-action-primary, color-action-text-inverse,
 *         color-border-default, radius-md, radius-pill
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';
import { timeAgo } from '../../lib/v2/loads';
import { KNOWN_CITIES } from '../../lib/v2/cities';
import { directionLabel } from '../../lib/v2/feed';

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
  onPickAnywhere,
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
  /** Only one suggestion list at a time; lists appear while typing, never on a bare focus. */
  open: boolean;
  onOpen: () => void;
  /** Scoped to this field: a stale blur timer of the other field must be a no-op. */
  onClose: () => void;
  onChange: (value: string) => void;
  onPick: (city: string) => void;
  /** "Anywhere" — back to no origin. Only the origin field has one. */
  onPickAnywhere?: () => void;
  /** Route marker: filled origin dot, hollow destination ring (one neutral hue — red reads as an error). */
  marker: 'from' | 'to';
  /** Each row owns its connector half: top row extends below its dot, bottom row above its ring — they always meet. */
  edge: 'top' | 'bottom';
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // Tapping a field is not typing. The two lists are different: a tap opens the
  // picker (what you can change to), typing narrows by what you wrote.
  const [typing, setTyping] = useState(false);

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
  }, [open, onClose]);

  const query = value.trim().toLocaleLowerCase();
  const scored = cities.map((city) => ({ city, matches: countFor(city) }));
  // A query that exactly equals a known city resolves itself: the CTA already carries
  // the count, and an option floating over the commit button would steal its tap.
  const exactCity = query !== '' && cities.some((city) => city.trim().toLocaleLowerCase() === query);

  // Typed: everything the query can reach. Live towns first, dead ones after — the
  // driver asked for them by name, so "No loads" is information, not a dead row.
  const typed = typing && query !== '' && !exactCity
    ? scored
      .filter((c) => c.city.toLocaleLowerCase().includes(query))
      .sort((a, b) => (b.matches > 0 ? 1 : 0) - (a.matches > 0 ? 1 : 0) || a.city.localeCompare(b.city))
      .slice(0, 6)
    : [];

  // Tapped: the picker. Only towns that carry loads for this half of the route —
  // every row is a direction change to something real. The town already selected is
  // left out: tapping it would be a no-op.
  const picker = !typing
    ? scored
      .filter((c) => c.matches > 0)
      .filter((c) => c.city.trim().toLocaleLowerCase() !== query)
      .sort((a, b) => b.matches - a.matches || a.city.localeCompare(b.city))
    : [];

  const options = typing ? typed : picker;
  const showPickerLabel = !typing && picker.length > 0;

  return (
    <div ref={boxRef} className="relative">
      {/* Connector half: runs from this row's marker centre to its shared edge — the two halves always meet at the divider. */}
      <span aria-hidden className={`absolute left-[17px] w-[2px] bg-[var(--color-border-default)] ${edge === 'top' ? 'bottom-0 top-1/2' : 'bottom-1/2 top-0'}`} />
      {/* relative: markers paint ABOVE the absolute line (positioned later in the paint order) — the line must never pierce a dot or ring. */}
      <div className="relative flex min-h-[60px] items-center gap-[8px] px-[12px]">
        <span
          aria-hidden
          className={`h-[12px] w-[12px] shrink-0 rounded-full ${
            marker === 'from'
              ? 'bg-[var(--color-action-primary)]'
              : 'border-2 border-[var(--color-action-primary)] bg-[var(--color-bg-surface)]'
          }`}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center py-[6px]">
          <label htmlFor={id} className="text-caption-12 leading-tight text-[var(--color-text-secondary)]">{label}</label>
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={options.length > 0 && open}
            aria-autocomplete="list"
            aria-controls={`${id}-suggestions`}
            value={value}
            onChange={(event) => { setTyping(true); onChange(event.target.value); onOpen(); }}
            onFocus={(event) => {
              // Cancel a stale close from this field's earlier blur — refocusing must not
              // kill the list the driver is about to read.
              if (closeTimer.current !== undefined) {
                window.clearTimeout(closeTimer.current);
                closeTimer.current = undefined;
              }
              // A tap opens the picker. Selecting the text means typing replaces the
              // town instead of appending to it.
              setTyping(false);
              event.currentTarget.select();
              onOpen();
            }}
            onBlur={() => {
              // Let the option tap land first (pointerdown fires before blur).
              closeTimer.current = window.setTimeout(() => onClose(), 150);
            }}
            onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
            placeholder={placeholder}
            autoComplete="off"
            // The browser's default placeholder is 50% alpha of the text colour, which made the
            // optional (empty) origin look like a disabled field next to the filled destination.
            // --color-text-secondary keeps it visibly editable without pretending to be a value.
            className="w-full bg-transparent text-body-16 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
        </div>
        {value.trim() !== '' && (
          <button
            type="button"
            onClick={() => { onChange(''); onClose(); }}
            aria-label={`Clear ${label}`}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <Icon name="x" size="sm" />
          </button>
        )}
      </div>
      {open && (options.length > 0 || (onPickAnywhere && value.trim() !== '' && !typing)) && (
        <ul
          id={`${id}-suggestions`}
          data-testid={`${id}-suggestions`}
          role="listbox"
          aria-label={`${label} options`}
          className="absolute inset-x-0 top-full z-10 mt-[4px] max-h-[216px] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-[4px] shadow-card"
        >
          {showPickerLabel && (
            <li role="presentation" className="px-[12px] pb-[4px] pt-[6px] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">
              Towns with loads
            </li>
          )}
          {!typing && onPickAnywhere && value.trim() !== '' && (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={false}
                aria-label="Anywhere, any origin"
                onClick={() => { onPickAnywhere(); onClose(); }}
                className="flex min-h-[44px] w-full items-center justify-between gap-[8px] px-[12px] text-left text-body-14 text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-subtle)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
              >
                <span aria-hidden>Anywhere</span>
                <span aria-hidden className="shrink-0 text-caption-12 text-[var(--color-text-secondary)]">Any origin</span>
              </button>
            </li>
          )}
          {options.map(({ city, matches }) => {
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
  cities = [...KNOWN_CITIES],
  recentRoutes = [],
}: {
  open: boolean;
  /** Committed direction — snapshotted into the draft on open, never mutated. */
  value: { from: string; to: string };
  /** Loads a given route would match. */
  countFor: (route: { from: string; to: string }) => number;
  onApply: (route: { from: string; to: string }) => void;
  onClose: () => void;
  /** Known cities for the picker and the type-ahead — predefined, plus the feed's own. */
  cities?: string[];
  /** Last applied directions, most-recent-first — current route is excluded. */
  recentRoutes?: { from: string; to: string; at?: string }[];
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
  // countFor is re-created by the owner each render; Recent mirrors the draft snapshot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [open, recentRoutes, value.from, value.to]);

  // A zero count used to be a dead end: a disabled "No loads match" button and no
  // way out except clearing a field by hand. The sheet now says what does not
  // match and offers the one tap that recovers — drop the origin, or fall back
  // to the default direction.
  const fromLabel = fromDraft.trim() || 'Anywhere';
  const toLabel = toDraft.trim() || value.to;
  const withoutOrigin = countFor({ from: '', to: toDraft });
  const defaultRoute = countFor({ from: '', to: value.to });
  // When the active filters make even the destination empty, dropping both
  // fields is the only honest way back to inventory — and the button has to say
  // so, not promise loads toward a town with none.
  const anywhere = countFor({ from: '', to: '' });
  const recovery = withoutOrigin > 0
    ? { label: `Show ${withoutOrigin} ${withoutOrigin === 1 ? 'load' : 'loads'} toward ${toLabel}`, route: { from: '', to: toDraft.trim() || value.to } }
    : value.to.trim() && defaultRoute > 0
      ? { label: `Show ${defaultRoute} ${defaultRoute === 1 ? 'load' : 'loads'} toward ${value.to}`, route: { from: '', to: value.to } }
      : anywhere > 0
        ? { label: `Show ${anywhere} ${anywhere === 1 ? 'load' : 'loads'} anywhere`, route: { from: '', to: '' } }
        : null;

  return (
    <Sheet open={open} onClose={onClose} label="Change direction">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Change direction</h2>
      <div className="relative mt-[16px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <CityField
          id="route-origin"
          label="From"
          value={fromDraft}
          placeholder="Anywhere"
          cities={cities}
          countFor={(city) => countFor({ from: city, to: toDraft })}
          open={openField === 'from'}
          onOpen={() => setOpenField('from')}
          onClose={() => setOpenField((cur) => (cur === 'from' ? null : cur))}
          onChange={setFromDraft}
          onPick={setFromDraft}
          onPickAnywhere={() => setFromDraft('')}
          marker="from"
          edge="top"
        />
        <div aria-hidden className="ml-[32px] h-px bg-[var(--color-border-default)]" />
        <CityField
          id="route-destination"
          label="To"
          value={toDraft}
          // An empty draft keeps the current destination on apply
          // (toDraft.trim() || value.to) — so the placeholder says what empty
          // means, the way "Anywhere" does for the origin. Untouched, the sheet
          // reads "Anywhere → Brussels", exactly like the header behind it.
          placeholder={value.to.trim() || 'Search city'}
          cities={cities}
          countFor={(city) => countFor({ from: fromDraft, to: city })}
          open={openField === 'to'}
          onOpen={() => setOpenField('to')}
          onClose={() => setOpenField((cur) => (cur === 'to' ? null : cur))}
          onChange={setToDraft}
          onPick={setToDraft}
          marker="to"
          edge="bottom"
        />
      </div>
      {recents.length > 0 && (
        <section aria-label="Recent directions" className="mt-[16px]">
          <h3 className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Recent</h3>
          <ul className="mt-[8px] flex flex-col gap-[4px]">
            {recents.map(({ route, matches }) => {
              const dead = matches === 0;
              const label = directionLabel(route.from, route.to);
              return (
                <li key={`${route.from}→${route.to}`}>
                  <button
                    type="button"
                    disabled={dead}
                    onClick={() => { setFromDraft(route.from); setToDraft(route.to); closeSuggestions(); }}
                    aria-label={`${label}, ${dead ? 'no loads' : `${matches} ${matches === 1 ? 'load' : 'loads'}`}${route.at ? `, ${timeAgo(route.at)}` : ''}`}
                    className={`flex min-h-[44px] w-full items-center gap-[8px] rounded-[var(--radius-md)] px-[12px] text-left text-body-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                      dead
                        ? 'cursor-not-allowed text-[var(--color-text-disabled)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] active:bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    <Icon name="clock" size="sm" className="shrink-0 text-[var(--color-text-secondary)]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{label}</span>
                      {route.at && <span className="text-caption-12 text-[var(--color-text-secondary)]">{timeAgo(route.at)}</span>}
                    </span>
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
      {visible === 0 ? (
        // Dead-end with a way out: say what does not match, and offer the tap that recovers.
        <div className="mt-[20px] flex flex-col gap-[12px]">
          <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[12px]">
            <p className="text-body-14 text-[var(--color-status-warning-text)]">
              No loads on {fromLabel} → {toLabel}.
            </p>
            {recovery && (
              <p className="mt-[4px] text-body-14 text-[var(--color-status-warning-text)]">
                Nothing is lost — drop the origin and keep the direction.
              </p>
            )}
          </div>
          {recovery && (
            <Button label={recovery.label} onClick={() => onApply(recovery.route)} />
          )}
        </div>
      ) : (
        <div className="mt-[20px]">
          <Button
            label={`Show ${visible} ${visible === 1 ? 'load' : 'loads'}`}
            onClick={() => onApply({ from: fromDraft.trim(), to: toDraft.trim() || value.to })}
          />
        </div>
      )}
    </Sheet>
  );
}