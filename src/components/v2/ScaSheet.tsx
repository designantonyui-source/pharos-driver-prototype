import { useEffect, useId, useState } from 'react';
import { authorizeSca, type ScaPurpose } from '../../lib/api';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';

/**
 * figma: prototype-led · SCA challenge sheet (PSD2)
 * props: open, purpose, summary, onAuthorized, onClose
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-bg-subtle,
 *         color-border-default, color-status-success-*, radius-md, radius-lg
 *
 * Strong customer authentication is an operation-scoped challenge, not a checkbox.
 * The sensitive API calls (add payout method, manual cash out) refuse a missing token.
 * This sheet is the prototype stand-in for the bank app / Face ID step: it asks the
 * bank, receives a single-use token and hands it to the caller. The standing mandate
 * for recurring auto-withdraw does not open this sheet.
 */
export function ScaSheet({
  open,
  purpose,
  title,
  summary,
  onAuthorized,
  onClose,
}: {
  open: boolean;
  purpose: ScaPurpose;
  title: string;
  summary: string;
  onAuthorized: (token: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setError(null);
    }
  }, [open]);

  async function approve() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const token = await authorizeSca(purpose);
      await onAuthorized(token);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'The bank could not confirm this change.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={busy ? () => undefined : onClose} label="Confirm with your bank">
      <div role="presentation">
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]" aria-hidden>
          <Icon name="shield" size="md" />
        </span>
        <h2 id={titleId} className="mt-[var(--spacing-12)] text-heading-20 text-[var(--color-text-primary)]">{title}</h2>
        <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">
          Your bank confirms this operation. Pharos never sees your bank credentials.
        </p>
        <p className="mt-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[var(--spacing-12)] text-label-14 text-[var(--color-text-primary)]" aria-labelledby={titleId}>
          {summary}
        </p>
        {error && <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-danger)]" role="alert">{error}</p>}
        <p className="mt-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">
          Prototype: no real bank challenge. In production this is a redirect or a bank-app approval bound to this exact operation.
        </p>
        <div className="mt-[var(--spacing-20)] flex flex-col gap-[var(--spacing-8)]">
          <Button label="Confirm with bank app" loading={busy} disabled={busy} onClick={() => void approve()} />
          <Button label="Cancel" appearance="secondary" disabled={busy} onClick={onClose} />
        </div>
      </div>
    </Sheet>
  );
}
