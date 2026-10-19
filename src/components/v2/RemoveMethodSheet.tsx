/**
 * figma: prototype-led · RemoveMethodSheet — confirmation before deleting a saved
 *        payout method.
 * props: open, method, remainingCount, removing, error, onConfirm, onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary,
 *         color-status-warning-bg, color-status-warning-text, color-bg-subtle,
 *         color-text-danger, color-border-danger, radius-md
 *
 * Why this exists: removing a payout method is a destructive, hard-to-undo
 * action on the one screen where a driver manages where their money goes. The X
 * button used to delete the method on a single tap, with no confirmation and no
 * warning about what breaks — including the case where the removed method was
 * the only one, which silently left the driver unable to cash out.
 *
 * The sheet states the consequence before the driver commits, the same way
 * `CancelTripSheet` states the cancellation penalty. The confirm button is a
 * danger button, and the escape hatch is the primary-looking "Keep method".
 */
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';
import { maskCard, maskIban, type PayoutMethod } from '../../lib/profile';

function describe(method: PayoutMethod): string {
  if (method.kind === 'iban') return `${maskIban(method.iban)} · SEPA`;
  return `${maskCard(method.last4, method.brand)} · instant card`;
}

export function RemoveMethodSheet({
  open,
  method,
  remainingCount,
  removing,
  error = null,
  onConfirm,
  onClose,
}: {
  open: boolean;
  /** The method about to be removed. */
  method: PayoutMethod | null;
  /** How many other methods stay after the removal. */
  remainingCount: number;
  removing: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!method) return null;

  const isLast = remainingCount === 0;
  const name = method.label || (method.kind === 'iban' ? 'Bank account' : 'Card');

  return (
    <Sheet open={open} onClose={onClose} label={`Remove payout method ${name}`}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Remove this payout method?</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">
        {name} · {describe(method)}
      </p>

      {/* Consequences block — what breaks, stated before the driver commits. */}
      <div
        className="mt-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[var(--spacing-12)]"
        role="alert"
      >
        {isLast ? (
          <>
            <p className="text-body-14 text-[var(--color-status-warning-text)]">
              This is your only payout method.
            </p>
            <p className="mt-[var(--spacing-4)] text-body-14 text-[var(--color-status-warning-text)]">
              You will not be able to cash out until you add another one. Your balance and
              earnings are not affected.
            </p>
          </>
        ) : method.isDefault ? (
          <>
            <p className="text-body-14 text-[var(--color-status-warning-text)]">
              This is your default method.
            </p>
            <p className="mt-[var(--spacing-4)] text-body-14 text-[var(--color-status-warning-text)]">
              Another saved method becomes the default, and you keep the ability to cash out.
            </p>
          </>
        ) : (
          <>
            <p className="text-body-14 text-[var(--color-status-warning-text)]">
              Your other saved methods stay available.
            </p>
            <p className="mt-[var(--spacing-4)] text-body-14 text-[var(--color-status-warning-text)]">
              You can add this method again later, but you will have to verify it once more.
            </p>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-[var(--spacing-12)] text-body-14 text-[var(--color-text-danger)]">
          {error}
        </p>
      )}

      <div className="mt-[var(--spacing-20)] flex flex-col gap-[var(--spacing-8)]">
        <Button
          label="Remove method"
          appearance="danger"
          icon={<Icon name="x" size="sm" />}
          loading={removing}
          disabled={removing}
          onClick={onConfirm}
        />
        <Button label="Keep method" appearance="secondary" disabled={removing} onClick={onClose} />
      </div>
    </Sheet>
  );
}
