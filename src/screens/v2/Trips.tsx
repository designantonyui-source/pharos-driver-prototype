/**
 * figma: prototype-led · Trips = Applications + My day merged (V2Frame)
 * props: none (controller)
 * tokens: color-bg-*, color-text-*, color-action-*, color-alert-*, color-border-default,
 *   color-status-*, spacing-*, radius-md/sm/pill, text-metric-28,
 *   text-heading-*, text-body-14, text-caption-12, nav-bar-h, tab-bar-h, home-indicator-h,
 *   size-control-mobile, size-icon-xl
 *
 * in-review applications next, past (rejected / expired / cancelled / cancelled-after-confirm)
 * at the bottom. Data comes from store.applications + V2_LOADS via api.getLoads;
 * no new model. Dismissed loads stay out (they live in /v2/account/dismissed).
 *
 * State discipline: loading = row skeletons shaped like the rows that follow
 * (StatusBlock, shared shape with Balance/Schedules/Invoices); error = inline
 * Alert + Retry; empty = icon + headline + one-sentence explainer + CTA to /v2,
 * never a bare row.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { NavigationBar } from '../../components/layout/NavigationBar';
import { Toast, useToast } from '../../components/v2/Toast';
import { V2Frame } from '../../components/v2/V2Frame';
import { getLoads } from '../../lib/api';
import { ApplicationStatus } from '../../lib/models';
import { useStore, type LoadApplication } from '../../lib/store';
import { dayLabel, deadlineLabel, shortDate, type V2Load } from '../../lib/v2/loads';

function TripsFrame({ toast, children }: { toast?: ReactNode; children: ReactNode }) {
  return <V2Frame active="Trips">
    <div className="absolute inset-x-0 top-0 z-20">
      <NavigationBar type="home" title="Trips" />
    </div>
    <main className="absolute inset-x-0 top-[var(--nav-bar-h)] bottom-[calc(var(--tab-bar-h)+var(--home-indicator-h))] overflow-y-auto px-[var(--spacing-16)] pb-[var(--spacing-24)] pt-[var(--spacing-8)] text-[var(--color-text-primary)]">
      <h1 className="sr-only">Trips</h1>
      {children}
    </main>
    {toast}
  </V2Frame>;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return <section aria-label={label} className="mt-[var(--spacing-16)]">
    <h2 className="px-[var(--spacing-12)] pb-[var(--spacing-8)] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</h2>
    <div className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]">{children}</div>
  </section>;
}

function StatusBlock({ error, retry, label, rows = 3 }: { error: boolean; retry: () => void; label: string; rows?: number }) {
  if (error) {
    return <div className="mt-[var(--spacing-16)]"><Alert type="error" title={`Could not load ${label}`}>Check your connection and try again.<span className="mt-[var(--spacing-8)] block"><Button label="Retry" appearance="secondary" onClick={retry} /></span></Alert></div>;
  }
  return <div className="mt-[var(--spacing-8)] flex flex-col gap-[var(--spacing-12)]" role="status" aria-label={`Loading ${label}`}>
    {Array.from({ length: rows }).map((_, i) => <div key={i} aria-hidden className="flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-12)] py-[var(--spacing-8)]">
      <span className="h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]" />
      <span className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-4)]">
        <span className="h-[14px] w-2/3 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]" />
        <span className="h-[12px] w-1/3 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]" />
      </span>
      <span className="h-[14px] w-[64px] shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)]" />
    </div>)}
    <span className="sr-only">Loading {label}...</span>
  </div>;
}
const REVIEW = new Set([ApplicationStatus.SENT, ApplicationStatus.DISPATCHER_REVIEW, ApplicationStatus.CUSTOMER_REVIEW]);

function tripWindow(load: V2Load): string {
  return `${dayLabel(load.date)} · ${load.window}`;
}

function money(amount: number): string {
  return `EUR ${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Completed work comes from the ledger, not from an application record. */
type CompletedEntry = {
  loadId: string;
  company: string;
  from: string;
  to: string;
  amount: number;
  status: 'available' | 'pending';
  paidAt: string | null;
  dueAt?: string;
};

const STATE_TONE: Record<'booked' | 'pending' | 'past' | 'rejected', string> = {
  booked: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
  pending: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
  past: 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-text)]',
  rejected: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
};

function StateChip({ tone, label }: { tone: keyof typeof STATE_TONE; label: string }) {
  return <span className={`inline-flex shrink-0 items-center rounded-[var(--radius-pill)] px-[var(--spacing-8)] py-[var(--spacing-4)] text-caption-10 uppercase tracking-wide ${STATE_TONE[tone]}`}>{label}</span>;
}

function TripRow({ to, icon, tone, chip, title, detail, amount, last = false }: {
  to: string; icon: 'truck' | 'clock' | 'circle-x' | 'x'; tone: keyof typeof STATE_TONE; chip: string;
  title: string; detail: string; amount: string; last?: boolean;
}) {
  return <Link to={to} className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:-outline-offset-2 ${last ? '' : 'border-b border-[var(--color-border-default)]'}`}>
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={icon} size="md" /></span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-body-14 text-[var(--color-text-primary)]">{title}</span>
      <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{detail}</span>
    </span>
    <span className="flex shrink-0 flex-col items-end gap-[var(--spacing-4)]">
      <span className="text-body-14 text-[var(--color-text-primary)]">{amount}</span>
      <StateChip tone={tone} label={chip} />
    </span>
  </Link>;
}

type TripEntry = { load: V2Load; application: LoadApplication };

function pastLook(application: LoadApplication): { chip: string; tone: 'past' | 'rejected'; icon: 'circle-x' | 'x' } {
  if (application.status === ApplicationStatus.REJECTED) return { chip: 'Declined', tone: 'rejected', icon: 'x' };
  if (application.status === ApplicationStatus.EXPIRED) return { chip: 'Expired', tone: 'past', icon: 'circle-x' };
  if (application.cancelledAfterConfirm) return { chip: 'Cancelled trip', tone: 'past', icon: 'circle-x' };
  return { chip: 'Cancelled', tone: 'past', icon: 'circle-x' };
}

function pastTo(load: V2Load, application: LoadApplication): string {
  return application.cancelledAfterConfirm ? `/trip/${load.id}` : `/application/${load.id}`;
}

export function Trips() {
  const navigate = useNavigate();
  const { state } = useStore();
  const [loads, setLoads] = useState<V2Load[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { toast, dismiss } = useToast();
  useEffect(() => {
    let live = true;
    setError(false);
    getLoads().then(items => { if (live) setLoads(items); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !loads) {
    return <TripsFrame toast={<Toast toast={toast} onClose={dismiss} />}><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="trips" /></TripsFrame>;
  }
  const byId = new Map(loads.map(l => [l.id, l]));
  const entries: TripEntry[] = Object.values(state.applications)
    .filter(a => byId.has(a.loadId) && (!a.dismissed || a.cancelledAfterConfirm || (a.submittedAt !== null && (a.status === ApplicationStatus.CANCELLED || a.status === ApplicationStatus.REJECTED || a.status === ApplicationStatus.EXPIRED))))
    .map(a => ({ load: byId.get(a.loadId)!, application: a }));
  const active = entries.filter(e => e.application.status === ApplicationStatus.CONFIRMED && !e.application.cancelledAfterConfirm);
  const review = entries.filter(e => REVIEW.has(e.application.status));
  const past = entries.filter(e =>
    e.application.status === ApplicationStatus.REJECTED
    || e.application.status === ApplicationStatus.EXPIRED
    || e.application.status === ApplicationStatus.CANCELLED
    || e.application.cancelledAfterConfirm === true,
  );
  // Paid and pending deliveries are completed trips, not applications. Keeping
  // them in their own section stops Past from mixing "declined" with "earned".
  const completed: CompletedEntry[] = state.ledger
    .filter((entry): entry is Extract<typeof entry, { kind: 'trip' }> => entry.kind === 'trip')
    .sort((a, b) => Date.parse(b.paidAt ?? b.dueAt ?? '') - Date.parse(a.paidAt ?? a.dueAt ?? ''));
  if (entries.length === 0 && completed.length === 0) {
    return <TripsFrame toast={<Toast toast={toast} onClose={dismiss} />}>
      <div className="mt-[var(--spacing-16)] flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="truck" size="md" /></span>
        <p className="text-heading-14 text-[var(--color-text-primary)]">No trips yet</p>
        <p className="text-body-14 text-[var(--color-text-secondary)]">Apply for a load and it will show up here — confirmed, in review and past.</p>
        <Button label="Find loads" onClick={() => navigate('/v2')} />
      </div>
    </TripsFrame>;
  }
  return <TripsFrame toast={<Toast toast={toast} onClose={dismiss} />}>
    {active.length > 0 && <div className="mt-[var(--spacing-8)] flex flex-col gap-[var(--spacing-12)]">
      <p className="px-[var(--spacing-12)] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Active trip{active.length > 1 ? 's' : ''}</p>
      {active.map(({ load }) => <div key={load.id} className="rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)] text-[var(--color-nav-text)]">
        <p className="text-metric-28 text-[var(--color-text-inverse)]">{money(load.rate)}</p>
        <p className="mt-[var(--spacing-4)] text-body-14 opacity-90">{load.from} to {load.to} · {tripWindow(load)}</p>
        <p className="mt-[var(--spacing-4)] text-caption-12 opacity-80">{load.paidIn} · expected {load.payoutDate}</p>
        <div className="mt-[var(--spacing-16)]"><Button label="Open trip" onClick={() => navigate(`/trip/${load.id}`)} /></div>
      </div>)}
    </div>}
    {review.length > 0 && <Section label={review.length === 1 ? 'In review' : `${review.length} in review`}>
      {review.map(({ load, application }, i) => <TripRow key={load.id} to={`/application/${load.id}`} icon="clock" tone="pending" chip="In review"
        title={`${load.from} to ${load.to}`} detail={`${application.status === ApplicationStatus.CUSTOMER_REVIEW ? 'Waiting for customer' : 'With the dispatcher'} · decided by ${deadlineLabel(application.approvalsDeadline ?? load.approvalsAt)}`}
        amount={money(load.rate)} last={i === review.length - 1} />)}
    </Section>}
    {completed.length > 0 && <Section label="Completed">
      {completed.map((entry, i) => <TripRow key={entry.loadId} to={`/v2/account/invoices`} icon="truck" tone={entry.status === 'available' ? 'booked' : 'pending'} chip={entry.status === 'available' ? 'Paid' : 'Pending'}
        title={`${entry.from} to ${entry.to}`}
        detail={entry.status === 'available'
          ? `Paid ${entry.paidAt ? shortDate(entry.paidAt) : '—'} · ${entry.company}`
          : `Due ${entry.dueAt ? shortDate(entry.dueAt) : '—'} · ${entry.company}`}
        amount={money(entry.amount)} last={i === completed.length - 1} />)}
    </Section>}
    {past.length > 0 && <Section label="Past applications">
      {past.map(({ load, application }, i) => { const look = pastLook(application); return <TripRow key={load.id} to={pastTo(load, application)} icon={look.icon} tone={look.tone} chip={look.chip}
        title={`${load.from} to ${load.to}`} detail={`${tripWindow(load)} · €${load.netPerKm.toFixed(2)}/km net`}
        amount={application.cancelledAfterConfirm || application.status === ApplicationStatus.CANCELLED ? 'EUR 0.00' : '—'} last={i === past.length - 1} />; })}
    </Section>}
    {active.length === 0 && review.length === 0 && <div className="mt-[var(--spacing-16)]"><Button label="Find loads" appearance="secondary" onClick={() => navigate('/v2')} /></div>}
  </TripsFrame>;
}
