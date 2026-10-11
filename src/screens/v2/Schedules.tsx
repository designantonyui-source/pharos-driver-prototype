/**
 * figma: new Schedules proposal (Wave 3), not measured - reuses NavigationBar 586:33,
 *   Button 12:38, Input 12:166, Alert 575:9632, V2Frame shell
 * props: none (controller)
 * tokens: color-bg-*, color-text-*, color-action-*, color-alert-*, color-border-default,
 *   spacing-*, radius-md/sm/pill, text-heading-*, text-body-14, text-caption-12,
 *   nav-bar-h, tab-bar-h, home-indicator-h, size-control-mobile, size-icon-xl
 *
 * Payout discipline Wave 3: auto-withdraw rule (off / threshold / weekly Friday),
 * run history, accountant statement export. Prototype evaluates on Balance open;
 * production runs on cron/webhook. Policy is a placeholder (PAYMENTS-VISION.md §7).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Input } from '../../components/Input';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import {
  PAYOUT_POLICY, evaluateSchedule, getBalance, getLedger, getPayoutMethods,
  getSchedule, getScheduledRuns, ledgerToCsv, methodLabel, updateSchedule,
  type BalanceSummary, type PayoutMethod, type PayoutSchedule, type ScheduledRun,
} from '../../lib/api';
import { formatEuro } from './Balance';

function SchedulesFrame({ title, children }: { title: string; children: ReactNode }) {
  return <V2Frame active="Account">
    <div className="absolute inset-x-0 top-0 z-20">
      <V2BackBar title={title} fallback="/v2/account/balance" />
    </div>
    <main className="absolute inset-x-0 top-[var(--nav-bar-h)] bottom-[calc(var(--tab-bar-h)+var(--home-indicator-h))] overflow-y-auto px-[var(--spacing-16)] pb-[var(--spacing-24)] pt-[var(--spacing-8)] text-[var(--color-text-primary)]">
      <h1 className="sr-only">{title}</h1>
      {children}
    </main>
  </V2Frame>;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return <section aria-label={label} className="mt-[var(--spacing-16)]">
    <h2 className="px-[var(--spacing-12)] pb-[var(--spacing-8)] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</h2>
    <div className="overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]">{children}</div>
  </section>;
}

function StatusBlock({ error, retry, label }: { error: boolean; retry: () => void; label: string }) {
  if (error) {
    return <div className="mt-[var(--spacing-16)]"><Alert type="error" title={`Could not load ${label}`}>Check your connection and try again.<span className="mt-[var(--spacing-8)] block"><Button label="Retry" appearance="secondary" onClick={retry} /></span></Alert></div>;
  }
  return <div className="mt-[var(--spacing-8)]" role="status" aria-label={`Loading ${label}`}>
    <div className="h-[140px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <span className="sr-only">Loading {label}...</span>
  </div>;
}

export function Schedules() {
  const [schedule, setSchedule] = useState<PayoutSchedule | null>(null);
  const [methods, setMethods] = useState<PayoutMethod[] | null>(null);
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [runs, setRuns] = useState<ScheduledRun[] | null>(null);
  const [threshold, setThreshold] = useState('500');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'error' | 'success' | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  async function reload() {
    const [sched, meth, bal, history] = await Promise.all([getSchedule(), getPayoutMethods(), getBalance(), getScheduledRuns()]);
    setSchedule(sched);
    setMethods(meth);
    setBalance(bal);
    setRuns(history);
    if (sched.mode === 'threshold') setThreshold(String(sched.threshold));
  }
  useEffect(() => {
    let live = true;
    setError(false);
    reload().catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !schedule || !methods || !balance || !runs) {
    return <SchedulesFrame title="Auto-withdraw"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="auto-withdraw" /></SchedulesFrame>;
  }
  const methodFor = (id: string | null) => methods.find(m => m.id === id) ?? methods.find(m => m.isDefault) ?? methods[0] ?? null;
  function scheduleMethodId(): string | null {
    if (!schedule || schedule.mode === 'off') return null;
    return (schedule as { methodId?: string | null }).methodId ?? null;
  }
  async function pick(mode: PayoutSchedule['mode']) {
    setSaving(true);
    setMessage(null);
    try {
      const current = methodFor(scheduleMethodId());
      const next: PayoutSchedule = mode === 'off'
        ? { mode: 'off' }
        : mode === 'threshold'
          ? { mode: 'threshold', threshold: Math.max(Number(threshold) || 500, PAYOUT_POLICY.minWithdrawal), methodId: current?.id ?? null }
          : { mode: 'weekly', weekday: 'friday', methodId: current?.id ?? null };
      setSchedule(await updateSchedule(next));
      setMessage('success');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  }
  async function saveThreshold() {
    setSaving(true);
    setMessage(null);
    try {
      const current = methodFor(scheduleMethodId());
      setSchedule(await updateSchedule({ mode: 'threshold', threshold: Math.max(Number(threshold) || 500, PAYOUT_POLICY.minWithdrawal), methodId: current?.id ?? null }));
      setMessage('success');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  }
  async function pickMethod(id: string) {
    if (!schedule || schedule.mode === 'off') return;
    setSaving(true);
    try {
      setSchedule(await updateSchedule({ ...schedule, methodId: id }));
    } finally {
      setSaving(false);
    }
  }
  function exportStatement() {
    getLedger().then(ledger => {
      const blob = new Blob([ledgerToCsv(ledger)], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pharos-statement.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  const modes: Array<{ mode: PayoutSchedule['mode']; title: string; detail: string }> = [
    { mode: 'off', title: 'Manual only', detail: 'You cash out by hand' },
    { mode: 'threshold', title: `Auto at ${formatEuro(Number(threshold) || 500)}`, detail: 'Withdraw everything when balance reaches it' },
    { mode: 'weekly', title: 'Every Friday', detail: 'Withdraw everything available' },
  ];
  return <SchedulesFrame title="Auto-withdraw">
    <div className="mt-[var(--spacing-16)]"><Alert type="info" title="Prototype scheduler">Evaluated when you open Balance. Production runs on a server cron — the rule shape is identical.</Alert></div>
    <Section label="Rule">
      {modes.map((m, i) => <label key={m.mode} className={`flex min-h-[var(--size-control-mobile)] cursor-pointer items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === modes.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <input type="radio" name="schedule-mode" checked={schedule.mode === m.mode} onChange={() => void pick(m.mode)} disabled={saving} className="h-[20px] w-[20px] accent-[var(--color-action-primary)]" aria-label={m.title} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-14 text-[var(--color-text-primary)]">{m.title}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{m.detail}</span>
        </span>
      </label>)}
    </Section>
    {schedule.mode === 'threshold' && <div className="mt-[var(--spacing-16)]">
      <Input label="Threshold (EUR)" value={threshold} placeholder="500" state="empty" icon={false} hint={`Minimum ${formatEuro(PAYOUT_POLICY.minWithdrawal)}. Current available ${formatEuro(balance.available)}.`} onChange={v => setThreshold(v.replace(/[^\d.,]/g, ''))} />
      <div className="mt-[var(--spacing-8)]"><Button label={saving ? 'Saving...' : 'Save threshold'} loading={saving} onClick={() => void saveThreshold()} /></div>
    </div>}
    {schedule.mode !== 'off' && methods.length > 0 && <Section label="Destination">
      {methods.map((m, i) => <label key={m.id} className={`flex min-h-[var(--size-control-mobile)] cursor-pointer items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === methods.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <input type="radio" name="schedule-method" checked={(schedule.methodId ?? methods.find(x => x.isDefault)?.id ?? methods[0]?.id) === m.id} onChange={() => void pickMethod(m.id)} disabled={saving} className="h-[20px] w-[20px] accent-[var(--color-action-primary)]" aria-label={m.label || methodLabel(m)} />
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={m.kind === 'card' ? 'wallet' : 'landmark'} size="md" /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14 text-[var(--color-text-primary)]">{m.label || methodLabel(m)}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{m.kind === 'card' ? 'Instant' : 'SEPA'}</span>
        </span>
      </label>)}
    </Section>}
    {runs.length > 0 && <Section label={`${runs.length} auto runs`}>
      {runs.slice(0, 5).map((r, i) => <div key={r.id} className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === Math.min(runs.length, 5) - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="clock" size="md" /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14 text-[var(--color-text-primary)]">{formatEuro(r.amount)} to {r.methodLabel}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{r.trigger === 'weekly' ? 'Friday schedule' : 'Threshold reached'} - {new Date(r.at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}</span>
        </span>
      </div>)}
    </Section>}
    <Section label="Accountant">
      <div className="p-[var(--spacing-12)] flex flex-col gap-[var(--spacing-8)]">
        <Button label="Export monthly statement (CSV)" appearance="secondary" onClick={exportStatement} />
        <p className="text-caption-12 text-[var(--color-text-secondary)]">Every ledger line with running detail — trips, withdrawals, adjustments.</p>
      </div>
    </Section>
    {message === 'error' && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not save the rule">Check your connection and try again.</Alert></div>}
    {message === 'success' && <div className="mt-[var(--spacing-16)]" role="status"><Alert type="success" title="Rule saved">It applies from the next Balance open.</Alert></div>}
  </SchedulesFrame>;
}

export async function runScheduleIfDue(): Promise<void> {
  await evaluateSchedule();
}
