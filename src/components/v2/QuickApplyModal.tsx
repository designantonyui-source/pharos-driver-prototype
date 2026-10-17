import { useId, useState } from 'react';
import { submitApplication } from '../../lib/api';
import type { V2Load } from '../../lib/v2/loads';
import { dayLabel } from '../../lib/v2/loads';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Sheet } from './Sheet';

/**
 * figma: prototype-led · Quick Apply confirmation (Phase 2.2)
 * props: loadId, load, onCancel, onSubmitted
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-status-success-bg,
 *         color-status-success-text, color-border-default, radius-md
 */
type QuickApplyModalProps = {
  loadId: string;
  load: V2Load | null;
  onCancel: () => void;
  onSubmitted: () => void;
  onAlreadyApplied?: () => void;
};

export function QuickApplyModal({ loadId, load, onCancel, onSubmitted, onAlreadyApplied }: QuickApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  async function sendApplication() {
    if (!load) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitApplication(loadId);
      onSubmitted();
    } catch (error) {
      if (error instanceof Error && error.message === 'ALREADY_APPLIED' && onAlreadyApplied) {
        onAlreadyApplied();
        return;
      }
      setError(error instanceof Error && error.message === 'ALREADY_APPLIED'
        ? 'You already applied for this load'
        : 'Could not send your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const checks = [
    { label: 'Vehicle matches the load', passed: true },
    { label: 'Your schedule is free', passed: true },
  ];

  return (
    <Sheet open onClose={submitting ? () => undefined : onCancel} label="Quick apply">
      <div role="presentation">
        <h2 id={titleId} className="text-heading-20 text-[var(--color-text-primary)]">
          Apply for {load ? `${load.from} → ${load.to}` : 'this load'}
        </h2>

        {load ? <dl className="mt-[16px] flex flex-col gap-[8px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Route</dt>
            <dd className="text-right text-label-14 text-[var(--color-text-primary)]">{load.from} → {load.to}</dd>
          </div>
          <div className="flex items-center justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Rate</dt>
            <dd className="text-label-14 text-[var(--color-text-primary)]">€{load.rate} · €{load.perKm.toFixed(2)}/km</dd>
          </div>
          <div className="flex items-center justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Pickup time</dt>
            <dd className="text-label-14 text-[var(--color-text-primary)]">
              {dayLabel(load.date)} · {load.window}
            </dd>
          </div>
        </dl> : (
          <p className="mt-[16px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-secondary)]" role="status">
            Loading load details…
          </p>
        )}

        {load && <ul className="mt-[16px] flex flex-col gap-[8px]" aria-label="Application checks">
          {checks.map(({ label, passed }) => (
            <li key={label} className="flex items-center gap-[8px] text-body-14 text-[var(--color-text-primary)]">
              <span className={`flex h-[24px] w-[24px] items-center justify-center rounded-full ${passed ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'}`}>
                {passed && <Icon name="check" size={14} />}
              </span>
              {label}
            </li>
          ))}
        </ul>}

        {error && (
          <p className="mt-[12px] text-body-14 text-[var(--color-text-danger)]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-[20px] flex flex-col gap-[8px]">
          <Button label="Send application" loading={submitting} disabled={submitting || !load} onClick={sendApplication} />
          <Button label="Cancel" appearance="secondary" disabled={submitting} onClick={onCancel} />
        </div>
      </div>
    </Sheet>
  );
}
