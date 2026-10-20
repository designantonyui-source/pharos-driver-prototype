import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitApplication } from '../../lib/api';
import { store } from '../../lib/store';
import type { V2Load } from '../../lib/v2/loads';
import { dayLabel, isPickupClosed, isPickupUnreachable } from '../../lib/v2/loads';
import { Button } from '../Button';
import { Sheet } from './Sheet';

/**
 * figma: prototype-led · Quick Apply confirmation (Phase 2.2)
 * props: loadId, load, onCancel, onSubmitted
 * tokens: color-bg-surface, color-text-primary, color-text-secondary, color-status-success-bg,
 *         color-status-success-text, color-status-warning-bg, color-status-warning-text,
 *         color-border-default, radius-md
 *
 * This sheet states the deal, it does not congratulate the driver on checks the
 * prototype cannot perform. The old "Vehicle matches / schedule is free" rows were
 * always green because Account holds neither a vehicle nor availability. What is
 * real: delivery window, payment term + expected payout date, the approval deadline,
 * the travel time to pickup, and whether a verified payout destination exists.
 */
type QuickApplyModalProps = {
  loadId: string;
  load: V2Load | null;
  onCancel: () => void;
  onSubmitted: () => void;
  onAlreadyApplied?: () => void;
};

function errorCopy(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message === 'ALREADY_APPLIED') return 'You already applied for this load';
  if (message === 'NO_PAYOUT_METHOD') return 'Add a verified payout method before applying.';
  if (message === 'PICKUP_CLOSED') return 'The pickup window has closed. Find another load.';
  if (message === 'PICKUP_UNREACHABLE') return 'You cannot reach this pickup before the window closes.';
  return 'Could not send your application. Please try again.';
}

export function QuickApplyModal({ loadId, load, onCancel, onSubmitted, onAlreadyApplied }: QuickApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const navigate = useNavigate();
  const hasVerifiedMethod = store.get().payoutMethods.some((method) => method.verified);
  const closed = !!load && isPickupClosed(load);
  const unreachable = !!load && !closed && isPickupUnreachable(load);
  const timeBlock = closed ? 'Pickup window closed' : unreachable ? 'Can’t reach pickup in time' : null;

  async function sendApplication() {
    if (!load) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitApplication(loadId);
      onSubmitted();
    } catch (submitError) {
      if (submitError instanceof Error && submitError.message === 'ALREADY_APPLIED' && onAlreadyApplied) {
        onAlreadyApplied();
        return;
      }
      setError(errorCopy(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open onClose={submitting ? () => undefined : onCancel} label="Quick apply">
      <div role="presentation">
        <h2 id={titleId} className="text-heading-20 text-[var(--color-text-primary)]">
          Apply for {load ? `${load.from} → ${load.to}` : 'this load'}
        </h2>

        {load ? <dl className="mt-[16px] flex flex-col gap-[8px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Rate</dt>
            <dd className="text-right text-label-14 text-[var(--color-text-primary)]">€{load.rate} · €{load.netPerKm.toFixed(2)}/km net</dd>
          </div>
          <div className="flex items-start justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Pickup</dt>
            <dd className="text-right text-label-14 text-[var(--color-text-primary)]">{dayLabel(load.date)} · {load.window}</dd>
          </div>
          <div className="flex items-start justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Delivery</dt>
            <dd className="text-right text-label-14 text-[var(--color-text-primary)]">{dayLabel(load.deliveryDate)} · {load.deliveryWindow}</dd>
          </div>
          <div className="flex items-start justify-between gap-[12px]">
            <dt className="text-body-14 text-[var(--color-text-secondary)]">Payment</dt>
            <dd className="text-right text-label-14 text-[var(--color-text-primary)]">{load.paidIn} · expected {load.payoutDate}</dd>
          </div>
        </dl> : (
          <p className="mt-[16px] rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-secondary)]" role="status">
            Loading load details…
          </p>
        )}

        {load && (
          <p className="mt-[12px] text-body-14 text-[var(--color-text-secondary)]">
            Your dispatcher checks the schedule, then the customer confirms — both by {load.approvalsBy}.
            Applying does not reserve the load.
          </p>
        )}

        {timeBlock && (
          <p className="mt-[12px] rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[12px] text-body-14 text-[var(--color-status-warning-text)]" role="alert">
            {timeBlock}. This offer cannot be applied for.
          </p>
        )}

        {!hasVerifiedMethod && (
          <p className="mt-[12px] rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-[12px] text-body-14 text-[var(--color-status-warning-text)]" role="alert">
            Add a verified payout method first. Pharos cannot pay a trip to an unverified destination.
          </p>
        )}

        {error && (
          <p className="mt-[12px] text-body-14 text-[var(--color-text-danger)]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-[20px] flex flex-col gap-[8px]">
          {!hasVerifiedMethod ? (
            <Button
              label="Add payout method"
              disabled={submitting}
              onClick={() => { onCancel(); navigate('/v2/account/balance/method'); }}
            />
          ) : (
            <Button
              label={timeBlock ?? 'Send application'}
              loading={submitting}
              disabled={submitting || !load || !!timeBlock}
              onClick={sendApplication}
            />
          )}
          <Button label="Cancel" appearance="secondary" disabled={submitting} onClick={onCancel} />
        </div>
      </div>
    </Sheet>
  );
}
