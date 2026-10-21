import { useCallback, useEffect, useId, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApplicationProgress, type ApplicationStage } from '../../components/ApplicationProgress';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { CancelApplicationSheet } from '../../components/v2/CancelApplicationSheet';
import { Sheet } from '../../components/v2/Sheet';
import { Toast, useToast } from '../../components/v2/Toast';
import { V2Frame } from '../../components/v2/V2Frame';
import { cancelApplication, disputeApplication, getLoads } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore } from '../../lib/store';
import { dayLabel, deadlineLabel, type V2Load } from '../../lib/v2/loads';

/**
 * v2 · ApplicationTracker — one status screen for every application outcome (replaces Pending screens).
 * route: /application/:id · props: status, load, onCancel, onViewTrip, cancelling
 * tokens: color-bg-surface, color-bg-subtle, color-text-primary, color-text-secondary,
 *         color-action-primary, color-status-success-bg, color-status-warning-bg, radius-lg, shadow-card
 */
const STATUS_VIEW: Record<ApplicationStatus, { title: string; message: string; icon: 'clock' | 'circle-check' | 'circle-x'; stage?: ApplicationStage }> = {
  [ApplicationStatus.SENT]: {
    title: 'Application sent',
    message: 'Your application has been sent to the dispatcher.',
    icon: 'clock',
    stage: 'dispatcher',
  },
  [ApplicationStatus.DISPATCHER_REVIEW]: {
    title: 'Under review',
    message: 'The dispatcher is reviewing your application.',
    icon: 'clock',
    stage: 'dispatcher',
  },
  [ApplicationStatus.CUSTOMER_REVIEW]: {
    title: 'Under review',
    message: 'The dispatcher approved your application. Waiting for the customer.',
    icon: 'clock',
    stage: 'customer',
  },
  [ApplicationStatus.CONFIRMED]: {
    title: 'Load confirmed',
    message: 'Your load is confirmed. View your trip details for the next steps.',
    icon: 'circle-check',
    stage: 'assigned',
  },
  [ApplicationStatus.REJECTED]: {
    title: 'Application declined',
    message: 'The customer chose another carrier.',
    icon: 'circle-x',
  },
  [ApplicationStatus.EXPIRED]: {
    title: 'Application expired',
    message: 'No decision arrived in time.',
    icon: 'circle-x',
  },
  [ApplicationStatus.CANCELLED]: {
    title: 'Cancelled by you',
    message: 'You cancelled this application. You can apply for another load.',
    icon: 'circle-x',
  },
};

const CANCELLABLE = new Set<ApplicationStatus>([
  ApplicationStatus.SENT,
  ApplicationStatus.DISPATCHER_REVIEW,
  ApplicationStatus.CUSTOMER_REVIEW,
]);

export function ApplicationTrackerView({
  status,
  load,
  approvalsBy,
  disputeSent = false,
  onCancel,
  onViewTrip,
  onSimilarLoads,
  onContactDispatcher,
  onDispute = async () => undefined,
  listPath = '/v2',
  cancelling = false,
  cancelError = null,
  canCancel = true,
}: {
  status: ApplicationStatus;
  load: V2Load;
  /** Snapshot taken at apply time; falls back to the load for legacy applications. */
  approvalsBy?: string;
  disputeSent?: boolean;
  onCancel: () => void;
  onViewTrip: () => void;
  onSimilarLoads: () => void;
  onContactDispatcher: () => void;
  onDispute?: (message: string) => Promise<void>;
  listPath?: string;
  cancelling?: boolean;
  cancelError?: string | null;
  canCancel?: boolean;
}) {
  const view = STATUS_VIEW[status];
  const waiting = CANCELLABLE.has(status);
  const positive = status === ApplicationStatus.CONFIRMED;
  const rejected = status === ApplicationStatus.REJECTED;
  const expired = status === ApplicationStatus.EXPIRED;
  const deadline = approvalsBy ?? deadlineLabel(load.approvalsAt);
  const { toast, show, dismiss } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');
  const [disputeSending, setDisputeSending] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const disputeId = useId();
  const closeCancel = useCallback(() => { if (!cancelling) setCancelOpen(false); }, [cancelling]);

  async function sendDispute() {
    if (disputeSending) return;
    setDisputeError(null);
    setDisputeSending(true);
    try {
      await onDispute(disputeText);
      setDisputeOpen(false);
      setDisputeText('');
      show({ tone: 'success', title: 'Dispute sent', detail: 'A dispatcher will review the decision.' });
    } catch (error) {
      setDisputeError(error instanceof Error ? error.message : 'Could not send the dispute.');
    } finally {
      setDisputeSending(false);
    }
  }

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-0 z-20">
        <V2BackBar title="Application status" fallback={listPath} />
      </div>
      <div className="absolute inset-x-0 top-[var(--nav-bar-back-h)] bottom-[117px] flex flex-col px-[16px]">
        <h1 className="sr-only">Application status</h1>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[12px]">
          <section className="rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-[12px]">
              <span className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full ${positive ? 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]' : waiting ? 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]' : 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'}`}>
                <Icon name={view.icon} />
              </span>
              <div className="min-w-0">
                <h2 className="text-heading-20 text-[var(--color-text-primary)]">{view.title}</h2>
                <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">{view.message}</p>
              </div>
            </div>
            <div className="mt-[16px] border-t border-[var(--color-border-default)] pt-[12px]">
              <p className="text-label-14 text-[var(--color-text-primary)]">{load.from} → {load.to}</p>
              <p className="mt-[4px] text-body-14 text-[var(--color-text-secondary)]">€{load.rate} · {dayLabel(load.date)} · {load.window}</p>
            </div>
          </section>

          {view.stage ? (
            <div className="mt-[12px]"><ApplicationProgress stage={view.stage} /></div>
          ) : null}

          {waiting ? (
            <p className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-secondary)]">
              Typical reply: ~15 min · Decision by {deadline}.
            </p>
          ) : null}
          {expired ? (
            <p className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-secondary)]">
              No decision by {deadline}. This application is closed; the load itself is no longer available.
              You can find a similar load.
            </p>
          ) : null}
          {disputeSent ? (
            <p className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-status-success-bg)] p-[12px] text-body-14 text-[var(--color-status-success-text)]" role="status">
              Dispute sent. A dispatcher will review the decision.
            </p>
          ) : null}
        </main>

        <div className="flex shrink-0 flex-col gap-[8px] pb-[8px] pt-[8px]">
          {rejected ? (
            <>
              <Button label="Back to loads" onClick={onSimilarLoads} />
              {!disputeSent && <Button label="Dispute decision" appearance="secondary" onClick={() => setDisputeOpen(true)} />}
            </>
          ) : null}
          {expired ? (
            <>
              <Button label="Find similar loads" onClick={onSimilarLoads} />
              {!disputeSent && <Button label="Dispute decision" appearance="secondary" onClick={() => setDisputeOpen(true)} />}
            </>
          ) : null}
          {positive ? <Button label="View trip" onClick={onViewTrip} /> : null}
          <Button
            label="Message dispatcher"
            appearance="secondary"
            icon={<Icon name="user-round" size="sm" />}
            onClick={onContactDispatcher}
          />
          {canCancel && CANCELLABLE.has(status) ? (
            <Button
              label="Cancel application"
              appearance="secondary"
              loading={cancelling}
              disabled={cancelling}
              onClick={() => {
                if (cancelling) return;
                setCancelOpen(true);
              }}
            />
          ) : null}
        </div>
      </div>
      <CancelApplicationSheet
        open={cancelOpen}
        load={load}
        cancelling={cancelling}
        error={cancelError}
        onConfirm={onCancel}
        onClose={closeCancel}
      />
      <Sheet open={disputeOpen} onClose={() => { if (!disputeSending) setDisputeOpen(false); }} label="Dispute decision">
        <h2 className="text-heading-20 text-[var(--color-text-primary)]">Dispute this decision</h2>
        <p className="mt-[8px] text-body-14 text-[var(--color-text-secondary)]">
          Tell the dispatcher what should be reviewed. This does not reopen the load or change the decision by itself.
        </p>
        <label htmlFor={disputeId} className="mt-[16px] block text-label-14 text-[var(--color-text-primary)]">
          What should the dispatcher review?
        </label>
        <textarea
          id={disputeId}
          value={disputeText}
          onChange={(event) => setDisputeText(event.target.value)}
          rows={4}
          placeholder="For example: the dispatcher approved but the customer never confirmed."
          className="mt-[8px] w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-[12px] text-body-14 text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"
        />
        {disputeError && <p className="mt-[8px] text-body-14 text-[var(--color-text-danger)]" role="alert">{disputeError}</p>}
        <div className="mt-[20px] flex flex-col gap-[8px]">
          <Button label="Send dispute" loading={disputeSending} disabled={disputeSending || !disputeText.trim()} onClick={sendDispute} />
          <Button label="Cancel" appearance="secondary" disabled={disputeSending} onClick={() => setDisputeOpen(false)} />
        </div>
      </Sheet>
      <Toast toast={toast} onClose={dismiss} />
    </V2Frame>
  );
}

export function ApplicationTracker() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get('scenario') === 'reject' ? 'reject' : 'approve';
  const listPath = searchParams.has('scenario') ? `/v2?scenario=${scenario}` : '/v2';
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    getLoads().then((items) => { if (active) setLoads(items); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [loadAttempt]);

  const application = state.applications[id] ?? null;
  const status = application?.status ?? (state.loadId === id ? state.status : null);
  const load = loads?.find((item) => item.id === id);
  // Status moves only through the presenter controls (Demo panel) or a real
  // dispatcher event. The old 5-second timer confirmed a load while the driver
  // was still reading the screen — a prototype artifact, not a product behaviour.

  async function handleCancel() {
    if (cancelling) return;
    setCancelError(null);
    setCancelling(true);
    try {
      await cancelApplication(id);
      navigate(listPath);
    } catch {
      setCancelError('Could not cancel this application. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  if (status && load) {
    return <ApplicationTrackerView
      status={status}
      load={load}
      approvalsBy={application?.approvalsDeadline ? deadlineLabel(application.approvalsDeadline) : load.approvalsBy}
      disputeSent={application?.dispute?.status === 'sent'}
      onCancel={handleCancel}
      cancelError={cancelError}
      canCancel
      listPath={listPath}
      onSimilarLoads={() => navigate(listPath)}
      onViewTrip={() => navigate(`/trip/${id}`)}
      onContactDispatcher={() => navigate(`/trip/${id}/chat`)}
      onDispute={(message) => disputeApplication(id, message).then(() => undefined)}
      cancelling={cancelling}
    />;
  }

  return (
    <V2Frame active="Loads">
      <div className="absolute inset-x-0 top-0 z-20">
        <V2BackBar title="Application status" fallback={listPath} />
      </div>
      <div className="absolute inset-x-0 top-[var(--nav-bar-back-h)] px-[16px]">
        <h1 className="sr-only">Application status</h1>
        <p className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] p-[16px] text-body-14 text-[var(--color-text-secondary)]" role="status">
          {loadError ? 'Could not load application details. Check your connection and try again.' : loads === null ? 'Loading application…' : 'This application is no longer available.'}
        </p>
        {loadError && <div className="mt-[16px]"><Button label="Retry" onClick={() => setLoadAttempt((n) => n + 1)} /></div>}
        <div className="mt-[16px]"><Button label="Back to loads" appearance="secondary" onClick={() => navigate(listPath)} /></div>
      </div>
    </V2Frame>
  );
}
