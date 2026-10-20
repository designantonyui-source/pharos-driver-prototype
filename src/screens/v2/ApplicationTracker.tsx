import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApplicationProgress, type ApplicationStage } from '../../components/ApplicationProgress';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { CancelApplicationSheet } from '../../components/v2/CancelApplicationSheet';
import { Toast, useToast } from '../../components/v2/Toast';
import { V2Frame } from '../../components/v2/V2Frame';
import { advanceStatus, cancelApplication, getLoads } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { store, useStore } from '../../lib/store';
import { dayLabel, type V2Load } from '../../lib/v2/loads';

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
    title: 'Under dispatcher review',
    message: 'The dispatcher is reviewing your application.',
    icon: 'clock',
    stage: 'dispatcher',
  },
  [ApplicationStatus.CUSTOMER_REVIEW]: {
    title: 'Waiting for customer',
    message: 'The dispatcher approved your application. The customer is reviewing it.',
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
    message: 'Both approvals didn’t arrive in time.',
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
  onCancel,
  onViewTrip,
  onSimilarLoads,
  onContactDispatcher,
  listPath = '/v2',
  cancelling = false,
  cancelError = null,
  canCancel = true,
}: {
  status: ApplicationStatus;
  load: V2Load;
  onCancel: () => void;
  onViewTrip: () => void;
  onSimilarLoads: () => void;
  onContactDispatcher: () => void;
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
  const { toast, show, dismiss } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const closeCancel = useCallback(() => { if (!cancelling) setCancelOpen(false); }, [cancelling]);

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
              Average response time: ~15 min · Application closes unless both approve by {load.approvalsBy}.
            </p>
          ) : null}
          {expired ? (
            <p className="mt-[12px] rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] p-[12px] text-body-14 text-[var(--color-text-secondary)]">
              Needed both approvals by {load.approvalsBy}. You can apply again or find a similar load.
            </p>
          ) : null}
        </main>

        <div className="flex shrink-0 flex-col gap-[8px] pb-[8px] pt-[8px]">
          {rejected ? (
            <>
              <Button label="Back to loads" onClick={onSimilarLoads} />
              <Button label="Dispute decision" appearance="secondary" onClick={() => show({ tone: 'info', title: 'Disputing a decision is not connected yet.' })} />
            </>
          ) : null}
          {expired ? (
            <Button label="Back to loads" onClick={onSimilarLoads} />
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

  const status = state.applications[id]?.status ?? (state.loadId === id ? state.status : null);
  const load = loads?.find((item) => item.id === id);

  useEffect(() => {
    if (state.loadId !== id || !status) return;

    const nextStatus = status === ApplicationStatus.SENT
      ? ApplicationStatus.DISPATCHER_REVIEW
      : status === ApplicationStatus.DISPATCHER_REVIEW
        ? (scenario === 'reject' ? ApplicationStatus.REJECTED : ApplicationStatus.CONFIRMED)
        : null;
    if (!nextStatus) return;

    // Production integration point: replace this demo timer with a WebSocket/Firebase subscription.
    const timer = window.setTimeout(() => {
      const current = store.get();
      if (current.loadId !== id || current.status !== status) return;
      void advanceStatus(nextStatus, id, status);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [id, state.loadId, status, scenario]);

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
    return <ApplicationTrackerView status={status} load={load} onCancel={handleCancel} cancelError={cancelError} canCancel={state.loadId === id} listPath={listPath} onSimilarLoads={() => navigate(listPath)} onViewTrip={() => navigate(`/trip/${id}`)} onContactDispatcher={() => navigate(`/trip/${id}/chat`)} cancelling={cancelling} />;
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
