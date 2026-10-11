/**
 * v2 · RouteSheet — change the feed direction without leaving `/v2` (closes P2-1:
 * direction used to live only on `/search`). One field, live count, Apply commits.
 * props: open, value, countFor, onApply, onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, radius-lg
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
}: {
  open: boolean;
  /** Committed destination — snapshotted into the draft on open, never mutated. */
  value: string;
  /** Loads a given destination would match. */
  countFor: (destination: string) => number;
  onApply: (destination: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);
  const visible = countFor(draft);

  return (
    <Sheet open={open} onClose={onClose} label="Change direction">
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Loads towards</h2>
      <label className="mt-[16px] block">
        <span className="text-label-14 text-[var(--color-text-secondary)]">Destination city</span>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Brussels"
          autoComplete="off"
          className="mt-[8px] flex min-h-[44px] w-full items-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        />
      </label>
      <div className="mt-[20px]">
        <Button
          label={visible === 0 ? 'No loads match' : `Show ${visible} ${visible === 1 ? 'load' : 'loads'}`}
          disabled={visible === 0}
          onClick={() => onApply(draft.trim() || value)}
        />
      </div>
    </Sheet>
  );
}