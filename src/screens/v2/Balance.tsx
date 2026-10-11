/**
 * figma: new Balance proposal, not measured - reuses NavigationBar 586:33, Button 12:38,
 *   Input 12:166, Alert 575:9632, V2Frame shell
 * props: none (Balance controller); view props per section below
 * tokens: color-bg-*, color-text-*, color-action-*, color-alert-*, color-border-default,
 *   color-status-success-*, color-nav-*, spacing-*, radius-md/sm/pill, text-metric-28,
 *   text-heading-*, text-body-14, text-caption-12, nav-bar-h, tab-bar-h, home-indicator-h,
 *   size-control-mobile, size-icon-xl
 *
 * Driver Balance (prototype only, no real money): Available vs Pending card, Cash out
 * CTA, SEPA/IBAN payout method row, ledger history. Policy (min 10 EUR, 1-2 days, no fee)
 * is a prototype placeholder - NOT approved business rules.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { Input } from '../../components/Input';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { Sheet } from '../../components/v2/Sheet';
import {
  PAYOUT_POLICY, formatIban, getBalance, getLedger, getPayoutMethod, maskIban,
  requestWithdrawal, updatePayoutMethod, validateIban,
  type BalanceSummary, type LedgerEntry, type PayoutMethod,
} from '../../lib/api';

export function formatEuro(amount: number): string {
  return `EUR ${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BalanceFrame({ title, backTo, children }: { title: string; backTo?: string; children: ReactNode }) {
  return <V2Frame active="Account">
    <div className="absolute inset-x-0 top-0 z-20">
      {backTo
        ? <V2BackBar title={title} fallback={backTo} />
        : <V2BackBar title={title} fallback="/v2/account" />}
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

function RowLink({ to, icon, title, detail, last = false }: { to: string; icon: IconName; title: string; detail?: string; last?: boolean }) {
  return <Link to={to} className={`flex min-h-[var(--size-control-mobile)] w-full items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] text-left focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:-outline-offset-2 ${last ? '' : 'border-b border-[var(--color-border-default)]'}`}>
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={icon} size="md" /></span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-body-14 text-[var(--color-text-primary)]">{title}</span>
      {detail && <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{detail}</span>}
    </span>
    <Icon name="chevron-right" size="sm" className="shrink-0 text-[var(--color-text-tertiary)]" />
  </Link>;
}

function StatusBlock({ error, retry, label }: { error: boolean; retry: () => void; label: string }) {
  if (error) {
    return <div className="mt-[var(--spacing-16)]"><Alert type="error" title={`Could not load ${label}`}>Check your connection and try again.<span className="mt-[var(--spacing-8)] block"><Button label="Retry" appearance="secondary" onClick={retry} /></span></Alert></div>;
  }
  return <div className="mt-[var(--spacing-8)] flex flex-col gap-[var(--spacing-12)]" role="status" aria-label={`Loading ${label}`}>
    <div className="h-[140px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <div className="h-[96px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]" />
    <span className="sr-only">Loading {label}...</span>
  </div>;
}

export function LedgerLine({ entry, last = false }: { entry: LedgerEntry; last?: boolean }) {
  const border = last ? '' : 'border-b border-[var(--color-border-default)]';
  if (entry.kind === 'trip') {
    return <div className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${border}`}>
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="truck" size="md" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-14 text-[var(--color-text-primary)]">{entry.from} - {entry.to}</span>
        <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{entry.company} - {entry.day}{entry.status === 'pending' ? ' - pending payout' : ''}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="text-body-14 text-[var(--color-text-primary)]">+{formatEuro(entry.amount)}</span>
        <span className={`text-caption-12 ${entry.status === 'available' ? 'text-[var(--color-status-success-text)]' : 'text-[var(--color-text-secondary)]'}`}>{entry.status === 'available' ? 'Paid' : 'Pending'}</span>
      </span>
    </div>;
  }
  return <div className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${border}`}>
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="landmark" size="md" /></span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-body-14 text-[var(--color-text-primary)]">Cash out to {entry.methodLabel}</span>
      <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{new Date(entry.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })} - {PAYOUT_POLICY.eta}</span>
    </span>
    <span className="flex shrink-0 flex-col items-end">
      <span className="text-body-14 text-[var(--color-text-primary)]">-{formatEuro(entry.amount)}</span>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">{entry.status === 'processing' ? 'Processing' : 'Done'}</span>
    </span>
  </div>;
}

export function Balance() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [recent, setRecent] = useState<LedgerEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let live = true;
    setError(false);
    Promise.all([getBalance(), getPayoutMethod(), getLedger()])
      .then(([balance, payoutMethod, ledger]) => {
        if (!live) return;
        setSummary(balance);
        setMethod(payoutMethod);
        setRecent(ledger.slice(-3).reverse());
      })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !summary || !method || !recent) {
    return <BalanceFrame title="Balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="balance" /></BalanceFrame>;
  }
  return <BalanceFrame title="Balance">
    <div className="mt-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)] text-[var(--color-nav-text)]">
      <div className="flex items-center gap-[var(--spacing-8)] text-caption-12 uppercase tracking-wide opacity-80">
        <Icon name="wallet" size="sm" />
        <span>Available balance</span>
      </div>
      <p className="mt-[var(--spacing-8)] text-metric-28 text-[var(--color-text-inverse)]">{formatEuro(summary.available)}</p>
      {summary.pending > 0 && <p className="mt-[var(--spacing-8)] text-body-14 opacity-90">{formatEuro(summary.pending)} pending - released when the customer pays</p>}
      <div className="mt-[var(--spacing-16)]">
        <Button label={method.iban ? `Cash out - ${PAYOUT_POLICY.eta}` : 'Add bank account to cash out'} onClick={() => navigate(method.iban ? '/v2/account/balance/cashout' : '/v2/account/balance/method')} />
      </div>
      {(!method.iban || summary.available < PAYOUT_POLICY.minWithdrawal) && <p className="mt-[var(--spacing-8)] text-caption-12 opacity-80">
        {!method.iban ? 'SEPA transfer to your bank - add an IBAN first.' : `Minimum withdrawal is ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`}
      </p>}
    </div>
    <Section label="Payout method">
      <RowLink to="/v2/account/balance/method" icon="landmark" title={method.iban ? (method.label || 'Bank account') : 'Add bank account'} detail={method.iban ? `${maskIban(method.iban)} - ${PAYOUT_POLICY.rail}` : `IBAN - ${PAYOUT_POLICY.rail} - ${PAYOUT_POLICY.eta}`} last />
    </Section>
    <Section label="Recent activity">
      {recent.length === 0 ? <p className="px-[var(--spacing-12)] py-[var(--spacing-16)] text-body-14 text-[var(--color-text-secondary)]">No activity yet - completed trips will show here.</p>
        : <>{recent.map(entry => <LedgerLine key={entry.id} entry={entry} />)}
          <RowLink to="/v2/account/balance/history" icon="history" title="See all activity" detail="Trips and withdrawals" last /></>}
    </Section>
    <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Prototype only - no real money moves. {PAYOUT_POLICY.rail} - {PAYOUT_POLICY.eta} - no fee.</p>
  </BalanceFrame>;
}

export function PayoutMethodScreen() {
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [iban, setIban] = useState('');
  const [label, setLabel] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'error' | 'success' | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError(false);
    getPayoutMethod().then(value => {
      if (!live) return;
      setMethod(value);
      setIban(formatIban(value.iban));
      setLabel(value.label);
    }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !method) {
    return <BalanceFrame title="Bank account" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="bank account" /></BalanceFrame>;
  }
  const compact = iban.replace(/[\s-]/g, '');
  const valid = validateIban(iban);
  const showError = touched && compact !== '' && !valid;
  const dirty = compact.toUpperCase() !== method.iban || label.trim() !== method.label;
  async function save() {
    if (saving || !dirty || !valid) return;
    setSaving(true);
    setMessage(null);
    try {
      const saved = await updatePayoutMethod({ iban: compact, label });
      setMethod(saved);
      setIban(formatIban(saved.iban));
      setLabel(saved.label);
      setMessage('success');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  }
  return <BalanceFrame title="Bank account" backTo="/v2/account/balance">
    <div className="mt-[var(--spacing-16)]"><Alert type="info" title="SEPA transfer">Payouts go to your EU bank account in {PAYOUT_POLICY.eta}. No fee in this prototype. Instant card payout is not supported.</Alert></div>
    <form onSubmit={e => { e.preventDefault(); void save(); }} noValidate className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-16)]">
      <Input label="IBAN" value={iban} placeholder="FR76 3000 4028 3798 7654 3210 985" state={showError ? 'error' : iban ? 'filled' : 'empty'} icon={false} hint={showError ? 'Check the IBAN - wrong check digits.' : 'We validate the check digits before saving.'} onChange={v => { setIban(v.toUpperCase()); setTouched(true); setMessage(null); }} />
      <Input label="Account nickname (optional)" value={label} placeholder="My business account" state="empty" icon={false} hint={null} onChange={v => { setLabel(v); setMessage(null); }} />
      <Button label={saving ? 'Saving...' : method.iban ? 'Save bank account' : 'Add bank account'} disabled={!dirty || !valid || saving} loading={saving} onClick={() => void save()} />
      <p className="text-center text-caption-12 text-[var(--color-text-secondary)]">{method.iban ? `Current: ${maskIban(method.iban)} - payouts arrive in ${PAYOUT_POLICY.eta}.` : 'No bank account yet - add one to enable cash out.'}</p>
    </form>
    {message === 'error' && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not save bank account">Check your connection and try again.</Alert></div>}
    {message === 'success' && <div className="mt-[var(--spacing-16)]" role="status"><Alert type="success" title="Bank account saved">Cash out is now enabled.</Alert></div>}
  </BalanceFrame>;
}

export function CashOut() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState<{ amount: number } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let live = true;
    setError(false);
    Promise.all([getBalance(), getPayoutMethod()])
      .then(([balance, payoutMethod]) => { if (!live) return; setSummary(balance); setMethod(payoutMethod); })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !summary || !method) {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="cash out" /></BalanceFrame>;
  }
  if (!method.iban) {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance">
      <div className="mt-[var(--spacing-16)]"><Alert type="warning" title="Add a bank account first">Cash out needs an IBAN destination.<span className="mt-[var(--spacing-8)] block"><Button label="Add bank account" onClick={() => navigate('/v2/account/balance/method')} /></span></Alert></div>
    </BalanceFrame>;
  }
  const parsed = Number(amount.replace(',', '.'));
  const validNumber = Number.isFinite(parsed) && parsed > 0;
  const belowMin = validNumber && parsed < PAYOUT_POLICY.minWithdrawal;
  const overBalance = validNumber && parsed > summary.available;
  const showError = touched && (!validNumber || belowMin || overBalance);
  const hint = !touched ? `Available ${formatEuro(summary.available)} - minimum ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`
    : !validNumber ? 'Enter an amount greater than 0.'
    : belowMin ? `Minimum withdrawal is ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`
    : overBalance ? 'Amount exceeds your available balance.'
    : `${formatEuro(summary.available - parsed)} will remain available.`;
  function openConfirm() {
    setTouched(true);
    setFailure(null);
    if (!validNumber || belowMin || overBalance || sending) return;
    setConfirmOpen(true);
  }
  async function confirm() {
    setSending(true);
    setFailure(null);
    try {
      await requestWithdrawal(parsed);
      setConfirmOpen(false);
      setDone({ amount: Math.round(parsed * 100) / 100 });
      const balance = await getBalance();
      setSummary(balance);
      setAmount('');
      setTouched(false);
    } catch (e) {
      setConfirmOpen(false);
      setFailure(e instanceof Error ? e.message : 'Could not request the withdrawal.');
    } finally {
      setSending(false);
    }
  }
  function quick(v: number) { setAmount(String(v)); setTouched(true); setFailure(null); }
  return <BalanceFrame title="Cash out" backTo="/v2/account/balance">
    {done && <div className="mt-[var(--spacing-16)]" role="status"><Alert type="success" title={`${formatEuro(done.amount)} is on its way`}>SEPA transfer to {method.label || maskIban(method.iban)} - arrives in {PAYOUT_POLICY.eta}.<span className="mt-[var(--spacing-8)] block"><Button label="See activity" appearance="secondary" onClick={() => navigate('/v2/account/balance/history')} /></span></Alert></div>}
    <div className="mt-[var(--spacing-16)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <p className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Available</p>
      <p className="mt-[var(--spacing-8)] text-metric-28">{formatEuro(summary.available)}</p>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">To {method.label || 'Bank account'} - {maskIban(method.iban)} - {PAYOUT_POLICY.rail}, {PAYOUT_POLICY.eta}, no fee.</p>
    </div>
    <form onSubmit={e => { e.preventDefault(); openConfirm(); }} noValidate className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-12)]">
      <Input label="Amount (EUR)" value={amount} placeholder="100.00" state={showError ? 'error' : amount ? 'filled' : 'empty'} icon={false} hint={hint} onChange={v => { setAmount(v.replace(/[^\d.,]/g, '')); setTouched(true); setFailure(null); }} />
      <div className="flex gap-[var(--spacing-8)]" role="group" aria-label="Quick amounts">
        {[50, 100, 200].filter(v => v <= summary.available).map(v => <button key={v} type="button" onClick={() => quick(v)} className="h-[var(--size-control-mobile)] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-action-border)] text-label-14 text-[var(--color-action-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">EUR {v}</button>)}
        <button type="button" onClick={() => quick(Math.floor(summary.available * 100) / 100)} disabled={summary.available < PAYOUT_POLICY.minWithdrawal} className="h-[var(--size-control-mobile)] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-action-border)] text-label-14 text-[var(--color-action-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-50">Max</button>
      </div>
      <Button label={sending ? 'Sending...' : `Cash out ${validNumber && !belowMin && !overBalance ? formatEuro(parsed) : ''}`.trim()} disabled={!validNumber || belowMin || overBalance || sending} loading={sending} onClick={openConfirm} />
    </form>
    {failure && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not request the withdrawal">{failure}</Alert></div>}
    <Sheet open={confirmOpen} label="Confirm cash out" onClose={() => { if (!sending) setConfirmOpen(false); }}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Cash out {validNumber ? formatEuro(parsed) : ''}?</h2>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">SEPA transfer to {method.label || maskIban(method.iban)}. Arrives in {PAYOUT_POLICY.eta}. No fee. Prototype only - no real money moves.</p>
      <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
        <Button label={sending ? 'Sending...' : `Confirm - ${validNumber ? formatEuro(parsed) : ''}`.trim()} loading={sending} onClick={() => void confirm()} />
        <Button label="Keep editing" appearance="secondary" disabled={sending} onClick={() => setConfirmOpen(false)} />
      </div>
    </Sheet>
  </BalanceFrame>;
}

export function BalanceHistory() {
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError(false);
    getLedger().then(v => { if (live) setLedger([...v].reverse()); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !ledger) {
    return <BalanceFrame title="Activity" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="activity" /></BalanceFrame>;
  }
  return <BalanceFrame title="Activity" backTo="/v2/account/balance">
    {ledger.length === 0 ? <div className="mt-[var(--spacing-16)] flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="history" size="md" /></span>
      <p className="text-heading-14 text-[var(--color-text-primary)]">No activity yet</p>
      <p className="text-body-14 text-[var(--color-text-secondary)]">Completed trips and withdrawals will show here.</p>
    </div> : <Section label={`${ledger.length} entries`}>
      {ledger.map((entry, i) => <LedgerLine key={entry.id} entry={entry} last={i === ledger.length - 1} />)}
    </Section>}
    <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Prototype ledger - stored on this device only.</p>
  </BalanceFrame>;
}
