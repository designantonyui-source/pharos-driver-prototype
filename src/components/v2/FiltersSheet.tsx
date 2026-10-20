/**
 * v2 · FiltersSheet — the three feed filters behind one entry point (prototype-led:
 * no Figma screen, direction comes from the PL backload «Filtry»: sections, Clear, Apply).
 * props: open, active, countFor, onApply, onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-border-default,
 *         color-action-primary, color-action-text-inverse, radius-lg, radius-pill, shadow-card
 *
 * Draft semantics: opening snapshots `active` into a draft; Apply commits it, scrim/Escape
 * discards it. `countFor` previews how many loads a draft leaves, so the CTA reads
 * "Show N loads" (or "No loads match" when the draft kills the feed).
 */
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';

export type FilterId = 'rate' | 'near';

export const FILTERS: { id: FilterId; label: string; section: string }[] = [
  { id: 'rate', label: '€3+/km', section: 'Minimum rate' },
  { id: 'near', label: 'Under 30 km', section: 'Pickup distance' },
];

export function FiltersSheet({
  open,
  active,
  countFor,
  onApply,
  onClose,
}: {
  open: boolean;
  /** Committed filter ids — snapshotted into the draft on open, never mutated. */
  active: string[];
  /** Loads a given draft would leave — the CTA previews the CURRENT draft live. */
  countFor: (draft: string[]) => number;
  onApply: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<string[]>(active);
  useEffect(() => {
    if (open) setDraft(active);
  }, [open, active]);
  const toggle = (id: string) =>
    setDraft((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const visible = countFor(draft);

  return (
    <Sheet open={open} onClose={onClose} label="Filters">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-20 text-[var(--color-text-primary)]">Filters</h2>
        {draft.length > 0 && (
          <button
            type="button"
            onClick={() => setDraft([])}
            className="min-h-[44px] px-[8px] text-label-14 text-[var(--color-action-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-[16px] flex flex-col gap-[16px]">
        {FILTERS.map((f) => {
          const sel = draft.includes(f.id);
          return (
            <section key={f.id} aria-label={f.section}>
              <p className="text-label-14 text-[var(--color-text-secondary)]">{f.section}</p>
              <button
                type="button"
                onClick={() => toggle(f.id)}
                aria-pressed={sel}
                aria-label={sel ? `${f.label}, selected. Activate to remove.` : f.label}
                className={`mt-[8px] flex min-h-[44px] items-center gap-[8px] rounded-[var(--radius-pill)] border px-[14px] text-label-14 ${
                  sel
                    ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]'
                    : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
                }`}
              >
                {f.label}
                {sel && <Icon name="x" size={16} />}
              </button>
            </section>
          );
        })}
      </div>

      <div className="mt-[20px]">
        {visible === 0 && (
          // Say why the feed is empty and where the way out is — the "Clear"
          // action sits right above, but a disabled button alone reads as a bug.
          <div role="alert" className="mb-[12px] rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[12px]">
            <p className="text-body-14 text-[var(--color-status-warning-text)]">
              These filters match no loads on your route.
            </p>
            <p className="mt-[4px] text-body-14 text-[var(--color-status-warning-text)]">
              Clear them, or change the direction to see loads again.
            </p>
          </div>
        )}
        <Button
          label={visible === 0 ? 'No loads match' : `Show ${visible} ${visible === 1 ? 'load' : 'loads'}`}
          disabled={visible === 0}
          onClick={() => onApply(draft)}
        />
      </div>
    </Sheet>
  );
}