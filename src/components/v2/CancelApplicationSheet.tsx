/**
 * figma: prototype-led · CancelApplicationSheet — withdraw a pending application (no penalty).
 * props: open, load, cancelling, error, onConfirm, onClose
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         radius-md
 */
import { Button } from '../Button';
import { Sheet } from './Sheet';
import type { V2Load } from '../../lib/v2/loads';

export function CancelApplicationSheet({
  open,
  load,
  cancelling,
  error = null,
  onConfirm,
  onClose,
}: {
  open: boolean;
  load: V2Load;
  cancelling: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`Cancel application ${load.from} to ${load.to}`}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Cancel this application?</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">
        {load.from} → {load.to} · €{load.rate}
      </p>
      <p className="mt-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[var(--spacing-12)] text-body-14 text-[var(--color-text-primary)]">
        The load will be open for other drivers. You can apply again later.
      </p>
      {error && <p role="alert" className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-danger)]">{error}</p>}
      <div className="mt-[var(--spacing-20)] flex flex-col gap-[var(--spacing-8)]">
        <Button label="Yes, cancel application" appearance="danger" loading={cancelling} disabled={cancelling} onClick={onConfirm} />
        <Button label="Keep application" appearance="secondary" disabled={cancelling} onClick={onClose} />
      </div>
    </Sheet>
  );
}
