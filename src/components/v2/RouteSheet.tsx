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
  value: { from: string; to: string };
  /** Loads a given route would match. */
  countFor: (route: { from: string; to: string }) => number;
  onApply: (route: { from: string; to: string }) => void;
  onClose: () => void;
}) {
  const [fromDraft, setFromDraft] = useState(value.from);
  const [toDraft, setToDraft] = useState(value.to);
  useEffect(() => {
    if (open) { setFromDraft(value.from); setToDraft(value.to); }
  }, [open, value.from, value.to]);
  const visible = countFor({ from: fromDraft, to: toDraft });

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
            placeholder="Brussels"
            autoComplete="off"
            className="mt-[8px] flex min-h-[44px] w-full items-center rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-[12px] text-body-16 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
          />
        </label>
      </div>
      <p className="mt-[12px] text-caption-12 text-[var(--color-text-secondary)]">
        Empty origin shows loads from anywhere — use it to browse a destination you are not at yet.
      </p>
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