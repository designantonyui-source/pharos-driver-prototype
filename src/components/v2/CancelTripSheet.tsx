/**
 * figma: prototype-led · CancelTripSheet — confirmed-trip cancellation (policy not approved).
 * within 15 min of confirm or >24 h before pickup → no penalty;
 * less than 24 h → reliability warning. Reason is recorded for the future score.
 * props: open, load, penalty, onConfirm, onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-status-warning-bg,
 *         color-status-warning-text, radius-md
 */
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Sheet } from './Sheet';
import type { LoadApplication } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import type { CancelTripPenalty } from '../../lib/api';

type Reason = NonNullable<LoadApplication['cancelReason']>;

const REASONS: { id: Reason; label: string }[] = [
  { id: 'breakdown', label: 'Vehicle breakdown' },
  { id: 'delay', label: 'Delayed on a previous load' },
  { id: 'better-load', label: 'Found another load' },
  { id: 'other', label: 'Other reason' },
];

export function CancelTripSheet({
  open,
  load,
  penalty,
  cancelling,
  error = null,
  onConfirm,
  onClose,
}: {
  open: boolean;
  load: V2Load;
  /** Computed live from confirm time + pickup window — shown BEFORE the driver commits. */
  penalty: CancelTripPenalty;
  cancelling: boolean;
  error?: string | null;
  onConfirm: (reason: Reason) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<Reason | null>(null);
  useEffect(() => {
    if (open) setReason(null);
  }, [open ]);

  return (
    <Sheet open={open} onClose={onClose} label={`Cancel trip ${load.from} to ${load.to}`}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Cancel this trip?</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">
        {load.from} → {load.to} · €{load.rate}
      </p>
      {penalty === 'none' ? (
        <p className="mt-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[var(--spacing-12)] text-body-14 text-[var(--color-text-primary)]">
          Demo preview: no reliability warning. Cancellation policy is not approved.
        </p>
      ) : (
        <p className="mt-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[var(--spacing-12)] text-body-14 text-[var(--color-status-warning-text)]" role="alert">
          Demo only: cancellation may affect reliability. The policy is not approved; no real penalty is applied.
        </p>
      )}

      {error && <p role="alert" className="text-body-14 text-[var(--color-text-danger)]">{error}</p>}
      <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]" role="radiogroup" aria-label="Cancel reason">
        {REASONS.map((r) => {
          const sel = reason === r.id;
          return (
            <label
              key={r.id}
              className={`flex min-h-[var(--size-control-mobile)] items-center rounded-[var(--radius-md)] border px-[var(--spacing-12)] text-left text-body-14 ${
                sel
                  ? 'border-[var(--color-action-primary)] bg-[var(--color-status-info-bg)] text-[var(--color-action-text)]'
                  : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]'
              }`}
            >
              <input type="radio" name="cancel-reason" checked={sel} disabled={cancelling} onChange={() => setReason(r.id)} className="mr-[var(--spacing-8)]" />
              {r.label}
            </label>
          );
        })}
      </div>

      <div className="mt-[var(--spacing-20)] flex flex-col gap-[var(--spacing-8)]">
        <Button label="Cancel trip" loading={cancelling} disabled={cancelling || !reason} onClick={() => { if (reason) onConfirm(reason); }} />
        <Button label="Keep trip" appearance="secondary" disabled={cancelling} onClick={onClose} />
      </div>
    </Sheet>
  );
}