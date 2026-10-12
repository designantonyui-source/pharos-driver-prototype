/**
 * v2 · RouteSheet — change the feed direction without leaving `/v2` (closes P2-1:
 * direction used to live only on `/search`). Two fields, live count, Apply commits.
 * City chips mirror the focused field (From/To label), carry the live match count
 * for the tap they would make, and go disabled at zero — a chip never promises a
 * feed it cannot show. Tapping a chip fills the field AND moves focus to the other
 * one, so origin → destination completes in two taps with no typing.
 * props: open, value, countFor, onApply, onClose, cities
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-text-disabled,
 *         color-action-primary, color-action-text-inverse, color-border-default, radius-md, radius-pill
 */
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Sheet } from './Sheet';

export function RouteSheet({
  open,
  value,
  countFor,
  onApply,
  onClose,
  cities = [],
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
}) {
  const [fromDraft, setFromDraft] = useState(value.from);
  const [toDraft, setToDraft] = useState(value.to);
  const [focused, setFocused] = useState<'from' | 'to'>('to');
  useEffect(() => {
    if (open) { setFromDraft(value.from); setToDraft(value.to); setFocused('to'); }
  }, [open, value.from, value.to]);
  const visible = countFor({ from: fromDraft, to: toDraft });
  const tapCity = (city: string) => {
    if (focused === 'from') { setFromDraft(city); setFocused('to'); }
    else { setToDraft(city); setFocused('from'); }
  };
  /** What tapping this chip would leave in the feed — 0 means the chip is dead weight. */
  const countForChip = (city: string) =>
    focused === 'from' ? countFor({ from: city, to: toDraft }) : countFor({ from: fromDraft, to: city });

  return (
    <Sheet open={open} onClose={onClose} label="Change direction">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Loads towards</h2>
      <div className="mt-[16px] flex flex-col gap-[12px]">
        <label className="block">
          <span className="text-label-14 text-[var(--color-text-secondary)]">Origin city</span>
          <input
            type="text"
            value={fromDraft}
            onChange={(event) => setFromDraft(event.target.value)}
            onFocus={() => setFocused('from')}
            placeholder="Lille"
            autoComplete="off"
            className="mt-[8px] flex min-h-[44px] w-full items-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
        </label>
        <label className="block">
          <span className="text-label-14 text-[var(--color-text-secondary)]">Destination city</span>
          <input
            type="text"
            value={toDraft}
            onChange={(event) => setToDraft(event.target.value)}
            onFocus={() => setFocused('to')}
            placeholder="Brussels"
            autoComplete="off"
            className="mt-[8px] flex min-h-[44px] w-full items-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
        </label>
      </div>
      <p className="mt-[12px] text-caption-12 text-[var(--color-text-secondary)]">
        Empty origin shows loads from anywhere — use it to browse a destination you are not at yet.
      </p>
      {cities.length > 0 && (
        <div className="mt-[12px]">
          <p id="route-cities-label" className="text-label-14 text-[var(--color-text-secondary)]">
            {focused === 'from' ? 'From' : 'To'} — {focused === 'from' ? fromDraft || 'pick an origin' : toDraft || 'pick a destination'}
          </p>
          <div className="mt-[8px] flex flex-wrap gap-[8px]" role="group" aria-labelledby="route-cities-label">
            {cities.map((city) => {
              const selected = (focused === 'from' ? fromDraft : toDraft).trim().toLocaleLowerCase() === city.trim().toLocaleLowerCase();
              const matches = countForChip(city);
              const dead = matches === 0;
              const side = focused === 'from' ? 'origin' : 'destination';
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => tapCity(city)}
                  disabled={dead}
                  aria-pressed={selected}
                  aria-label={dead ? `${city} — no loads as ${side}` : selected ? `${city}, ${matches} ${matches === 1 ? 'load' : 'loads'} as ${side}, selected. Activate to keep it.` : `Use ${city} as ${side}, ${matches} ${matches === 1 ? 'load' : 'loads'}`}
                  className={`min-h-[44px] rounded-[var(--radius-pill)] border px-[14px] text-label-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${
                    dead
                      ? 'cursor-not-allowed border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-disabled)] opacity-60'
                      : selected
                        ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-action-text)]'
                  }`}
                >
                  {city} · {matches}
                </button>
              );
            })}
          </div>
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