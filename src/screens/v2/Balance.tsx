/**
 * figma: new Balance proposal, not measured - reuses NavigationBar 586:33, Button 12:38,
 *   Input 12:166, Alert 575:9632, V2Frame shell
 * props: none (controllers); PayoutMethodScreen takes initialTab
 * tokens: color-bg-*, color-text-*, color-action-*, color-alert-*, color-border-default,
 *   color-status-success-*, color-nav-*, spacing-*, radius-md/sm/pill, text-metric-28,
 *   text-heading-*, text-body-14, text-caption-12, nav-bar-h, tab-bar-h, home-indicator-h,
 *   size-control-mobile, size-icon-xl
 *
 * Driver Balance Wave 1 (prototype only, no real money): Available vs Pending card,
 * rail picker (SEPA free / card instant), multi-method IBAN + card rows with
 * verifying states, ledger history. Policy is a prototype placeholder -
 * NOT approved business rules (see design/PAYMENTS-VISION.md).
 *
 * State discipline (A.1): loading = row skeletons shaped like the rows that follow
 * (StatusBlock, shared shape with Schedules/Invoices); error = inline Alert + Retry;
 * empty = icon + headline + one-sentence explainer, never a bare row.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { Input } from '../../components/Input';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { Toast, useToast } from '../../components/v2/Toast';
import { V2Frame } from '../../components/v2/V2Frame';
import { Sheet } from '../../components/v2/Sheet';
import { RemoveMethodSheet } from '../../components/v2/RemoveMethodSheet';
import {
  PAYOUT_POLICY, addCardMethod, addIbanMethod, adjustmentLabel, detectCardBrand, evaluateSchedule, formatCardExpiry,
  formatCardNumber, getBalance, getLedger, getPayoutMethods, getWithdrawal, maskCard,
  maskIban, maxWithdrawalFor, methodLabel, payoutProvider, quoteFor, removeMethod, requestWithdrawal,
  setDefaultMethod, tokeniseCard, validateCardCvc, validateCardExpiry,
  validateCardNumber, validateIban,
  type BalanceSummary, type LedgerEntry, type PayoutMethod,
} from '../../lib/api';
import { getInvoices } from '../../lib/invoices';
import { useLedger } from '../../lib/store';

export function formatEuro(amount: number): string {
  return `EUR ${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BalanceFrame({ title, backTo, toast, children }: { title: string; backTo?: string; toast?: ReactNode; children: ReactNode }) {
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
    {toast}
  </V2Frame>;
}

function Section({ label, children, scrollable = false }: { label: string; children: ReactNode; scrollable?: boolean }) {
  return <section aria-label={label} className="mt-[var(--spacing-16)]">
    <h2 className="px-[var(--spacing-12)] pb-[var(--spacing-8)] text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">{label}</h2>
    <div className={`overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)]${scrollable ? ' max-h-[280px] overflow-y-auto' : ''}`}>{children}</div>
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

function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return <div className="mt-[var(--spacing-16)] flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={icon} size="md" /></span>
    <p className="text-heading-14 text-[var(--color-text-primary)]">{title}</p>
    <p className="text-body-14 text-[var(--color-text-secondary)]">{body}</p>
  </div>;
}

function methodDetail(method: PayoutMethod): string {
  const base = method.kind === 'iban'
    ? `${maskIban(method.iban)} - SEPA, ${PAYOUT_POLICY.eta}`
    : `${maskCard(method.last4, method.brand)} - instant, ${PAYOUT_POLICY.cardEta}`;
  const verifying = method.verified ? '' : ' - verifying...';
  const def = method.isDefault ? ' - default' : '';
  return `${base}${verifying}${def}`;
}

export function LedgerLine({ entry, last = false, invoiceId }: { entry: LedgerEntry; last?: boolean; invoiceId?: string | null }) {
  const border = last ? '' : 'border-b border-[var(--color-border-default)]';
  if (entry.kind === 'trip') {
    const inner = <>
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="truck" size="md" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-14 text-[var(--color-text-primary)]">{entry.from} - {entry.to}</span>
        <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{entry.company} - {entry.day}{entry.status === 'pending' ? ' - pending payout' : ''}{invoiceId ? ' - invoice' : ''}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="text-body-14 text-[var(--color-text-primary)]">+{formatEuro(entry.amount)}</span>
        <span className={`text-caption-12 ${entry.status === 'available' ? 'text-[var(--color-status-success-text)]' : 'text-[var(--color-text-secondary)]'}`}>{entry.status === 'available' ? 'Paid' : 'Pending'}</span>
      </span>
    </>;
    const cls = `flex min-h-[var(--size-control-mobile)] w-full items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] text-left ${border}`;
    return invoiceId
      ? <Link to={`/v2/account/balance/invoices/${invoiceId}`} className={`${cls} focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:-outline-offset-2`}>{inner}<Icon name="chevron-right" size="sm" className="shrink-0 text-[var(--color-text-tertiary)]" /></Link>
      : <div className={cls}>{inner}</div>;
  }
  if (entry.kind === 'withdrawal') {
    const railNote = entry.rail === 'instant-card' ? 'instant' : PAYOUT_POLICY.eta;
    return <div className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${border}`}>
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="landmark" size="md" /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-14 text-[var(--color-text-primary)]">Cash out to {entry.methodLabel}</span>
        <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{new Date(entry.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })} - {railNote}{entry.fee > 0 ? ` - fee ${formatEuro(entry.fee)}` : ''}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="text-body-14 text-[var(--color-text-primary)]">-{formatEuro(entry.amount)}</span>
        <span className="text-caption-12 text-[var(--color-text-secondary)]">{entry.status === 'processing' ? 'Processing' : 'Done'}</span>
      </span>
    </div>;
  }
  const negative = entry.amount < 0;
  return <div className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${border}`}>
    <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="triangle-alert" size="md" /></span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-body-14 text-[var(--color-text-primary)]">{adjustmentLabel(entry.reason)}</span>
      <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{entry.note} - {new Date(entry.createdAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}</span>
    </span>
    <span className="flex shrink-0 flex-col items-end">
      <span className={`text-body-14 ${negative ? 'text-[var(--color-text-danger)]' : 'text-[var(--color-status-success-text)]'}`}>{negative ? '-' : '+'}{formatEuro(Math.abs(entry.amount))}</span>
      <span className="text-caption-12 text-[var(--color-text-secondary)]">Applied</span>
    </span>
  </div>;
}

export function Balance() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [methods, setMethods] = useState<PayoutMethod[] | null>(null);
  const [recent, setRecent] = useState<LedgerEntry[] | null>(null);
  const { toast, show, dismiss } = useToast();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  // Money moved somewhere else in the app (a payout outcome, the customer
  // paying) → this screen refetches instead of showing a stale number.
  const ledgerVersion = useLedger();
  useEffect(() => {
    let live = true;
    setError(false);
    // Prototype scheduler tick: evaluates the auto-withdraw rule on open
    // (production: server cron). Refreshes the balance when a run fires.
    evaluateSchedule()
      .then(run => { if (live && run) show({ tone: 'success', title: 'Scheduled withdrawal ran', detail: `Auto-withdraw ${formatEuro(run.amount)} to ${run.methodLabel} is on its way.` }); })
      .catch(() => {})
      .finally(() => {
        if (!live) return;
        Promise.all([getBalance(), getPayoutMethods(), getLedger()])
          .then(([balance, payoutMethods, ledger]) => {
            if (!live) return;
            setSummary(balance);
            setMethods(payoutMethods);
            setRecent(ledger.slice(-3).reverse());
          })
          .catch(() => { if (live) setError(true); });
      });
    return () => { live = false; };
  }, [attempt, ledgerVersion]);
  if (error || !summary || !methods || !recent) {
    return <BalanceFrame title="Balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="balance" /></BalanceFrame>;
  }
  const def = methods.find(m => m.isDefault) ?? methods[0];
  const hasMethod = !!def;
  return <BalanceFrame title="Balance" toast={<Toast toast={toast} onClose={dismiss} />}>
    <div className="mt-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)] text-[var(--color-nav-text)]">
      <div className="flex items-center gap-[var(--spacing-8)] text-caption-12 uppercase tracking-wide opacity-80">
        <Icon name="wallet" size="sm" />
        <span>Available balance</span>
      </div>
      <p className="mt-[var(--spacing-8)] text-metric-28 text-[var(--color-text-inverse)]">{formatEuro(summary.available)}</p>
      {summary.pending > 0 && <p className="mt-[var(--spacing-8)] text-body-14 opacity-90">{formatEuro(summary.pending)} pending - released when the customer pays</p>}
      <div className="mt-[var(--spacing-16)]">
        <Button label={hasMethod ? `Cash out - ${def.kind === 'card' ? PAYOUT_POLICY.cardEta : PAYOUT_POLICY.eta}` : 'Add payout method to cash out'} onClick={() => navigate(hasMethod ? '/v2/account/balance/cashout' : '/v2/account/balance/method')} />
      </div>
      {(!hasMethod || summary.available < PAYOUT_POLICY.minWithdrawal) && <p className="mt-[var(--spacing-8)] text-caption-12 opacity-80">
        {!hasMethod ? 'SEPA to your bank or instant to your card - add a method first.' : `Minimum withdrawal is ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`}
      </p>}
    </div>
    <Section label="Payout methods">
      {methods.length === 0 ? <RowLink to="/v2/account/balance/method" icon="landmark" title="Add payout method" detail={`IBAN (SEPA, free) or card (instant, ${formatEuro(PAYOUT_POLICY.cardFee)})`} last />
        : <>{methods.slice(0, 2).map((m, i) => <RowLink key={m.id} to="/v2/account/balance/method" icon={m.kind === 'card' ? 'wallet' : 'landmark'} title={m.label || (m.kind === 'card' ? maskCard(m.last4, m.brand) : 'Bank account')} detail={methodDetail(m)} last={i === Math.min(methods.length, 2) - 1 && methods.length <= 2} />)}
          {methods.length > 2 && <RowLink to="/v2/account/balance/method" icon="landmark" title={`See all ${methods.length} methods`} detail="Change default, remove" last />}</>}
    </Section>
    <Section label="Recent activity">
      {recent.length === 0 ? <div className="flex flex-col items-center gap-[var(--spacing-8)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="history" size="md" /></span>
        <p className="text-heading-14 text-[var(--color-text-primary)]">No activity yet</p>
        <p className="text-body-14 text-[var(--color-text-secondary)]">Completed trips will show here.</p>
      </div>
        : <>{recent.map(entry => <LedgerLine key={entry.id} entry={entry} />)}
          <RowLink to="/v2/account/balance/history" icon="history" title="See all activity" detail="Trips and withdrawals" last /></>}
    </Section>
    <Section label="Documents">
      <RowLink to="/v2/account/balance/invoices" icon="history" title="Invoices" detail="Per-trip paperwork with VAT, PDF export" />
      <RowLink to="/v2/account/balance/schedules" icon="clock" title="Auto-withdraw" detail="Schedules, runs, accountant export" last />
    </Section>
    <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">No real money moves. Provider: {payoutProvider.name}.</p>
  </BalanceFrame>;
}

export function PayoutMethodScreen({ initialTab = 'iban' }: { initialTab?: 'iban' | 'card' }) {
  const [methods, setMethods] = useState<PayoutMethod[] | null>(null);
  const [tab, setTab] = useState<'iban' | 'card'>(initialTab);
  const [iban, setIban] = useState('');
  const [ibanLabel, setIbanLabel] = useState('');
  const [ibanTouched, setIbanTouched] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardLabel, setCardLabel] = useState('');
  const [cardTouched, setCardTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Removing a payout method is destructive → confirm before it happens.
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const { toast, show, dismiss } = useToast();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  async function reload() {
    setMethods(await getPayoutMethods());
  }
  useEffect(() => {
    let live = true;
    setError(false);
    getPayoutMethods().then(v => { if (live) setMethods(v); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  if (error || !methods) {
    return <BalanceFrame title="Payout methods" backTo="/v2/account/balance" toast={<Toast toast={toast} onClose={dismiss} />}><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="payout methods" /></BalanceFrame>;
  }
  const ibanCompact = iban.replace(/[\s-]/g, '');
  const ibanValid = validateIban(iban);
  const ibanShowError = ibanTouched && ibanCompact !== '' && !ibanValid;
  async function saveIban() {
    if (saving || !ibanValid || !ibanCompact) return;
    setSaving(true);
    setSaveError(false);
    try {
      await addIbanMethod({ iban: ibanCompact, label: ibanLabel });
      await reload();
      setIban('');
      setIbanLabel('');
      setIbanTouched(false);
      show({ tone: 'success', title: 'Bank account saved', detail: 'Cash out will offer it right away.' });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }
  const brand = detectCardBrand(cardNumber);
  const cardValidNumber = validateCardNumber(cardNumber);
  const cardValidExpiry = validateCardExpiry(cardExpiry);
  const cardValidCvc = validateCardCvc(cardCvc, brand);
  const cardShowNumberError = cardTouched && cardNumber.replace(/\D/g, '') !== '' && !cardValidNumber;
  const cardReady = cardValidNumber && cardValidExpiry && cardValidCvc && cardHolder.trim() !== '';
  async function saveCard() {
    if (saving || !cardReady) return;
    setSaving(true);
    setSaveError(false);
    try {
      // PAN is tokenised and dropped here — only the token result (last4/brand) leaves this handler.
      const { token, last4, brand: tokBrand } = tokeniseCard(cardNumber);
      await addCardMethod({ token, last4, brand: tokBrand, label: cardLabel || cardHolder.trim() });
      await reload();
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardHolder('');
      setCardLabel('');
      setCardTouched(false);
      show({ tone: 'success', title: 'Card saved', detail: 'Instant cash out is now available.' });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }
  async function makeDefault(id: string) {
    setMethods(await setDefaultMethod(id));
  }
  /** Open the confirmation sheet — nothing is deleted on the first tap. */
  function askRemove(id: string) {
    setRemoveError(null);
    setRemovingId(id);
  }
  function closeRemove() {
    if (removing) return;
    setRemovingId(null);
    setRemoveError(null);
  }
  async function confirmRemove() {
    if (!removingId || removing) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const left = await removeMethod(removingId);
      setMethods(left);
      setRemovingId(null);
      show({ tone: 'success', title: 'Payout method removed' });
    } catch {
      setRemoveError('Could not remove this method. Please try again.');
    } finally {
      setRemoving(false);
    }
  }
  return <BalanceFrame title="Payout methods" backTo="/v2/account/balance">
    {methods.length === 0
      ? <EmptyState icon="landmark" title="No payout methods yet" body="Add your IBAN for free SEPA transfers or a card for instant payouts." />
      : <Section label={`${methods.length} saved`} scrollable={methods.length > 3}>
      {methods.map((m, i) => <div key={m.id} className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === methods.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={m.kind === 'card' ? 'wallet' : 'landmark'} size="md" /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14 text-[var(--color-text-primary)]">{m.label || methodLabel(m)}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{methodDetail(m)}</span>
        </span>
        {!m.isDefault && <button type="button" onClick={() => void makeDefault(m.id)} className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-action-border)] px-[var(--spacing-8)] py-[var(--spacing-8)] text-label-12 text-[var(--color-action-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">Default</button>}
        <button type="button" aria-label={`Remove ${m.label || methodLabel(m)}`} onClick={() => askRemove(m.id)} className="flex h-[var(--size-control-mobile)] w-[var(--size-control-mobile)] shrink-0 items-center justify-center text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]"><Icon name="x" size="sm" /></button>
      </div>)}
      </Section>}
    <Section label="Add method">
      <div className="flex gap-[var(--spacing-8)] p-[var(--spacing-12)]" role="group" aria-label="Method type">
        {(['iban', 'card'] as const).map(t => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`h-[var(--size-control-mobile)] flex-1 rounded-[var(--radius-sm)] border text-label-14 focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] ${tab === t ? 'border-[var(--color-action-primary)] bg-[var(--color-action-primary)] text-[var(--color-action-text-inverse)]' : 'border-[var(--color-action-border)] text-[var(--color-action-text)]'}`}>{t === 'iban' ? `Bank (SEPA, free)` : `Card (instant, ${formatEuro(PAYOUT_POLICY.cardFee)})`}</button>)}
      </div>
      {tab === 'iban' ? <form onSubmit={e => { e.preventDefault(); void saveIban(); }} noValidate className="flex flex-col gap-[var(--spacing-16)] p-[var(--spacing-12)]">
        <Input label="IBAN" value={iban} placeholder="DE89 3704 0044 0532 0130 00" state={ibanShowError ? 'error' : iban ? 'filled' : 'empty'} icon={false} hint={ibanShowError ? 'Check the IBAN - wrong check digits.' : 'We validate the check digits before saving.'} onChange={v => { setIban(v.toUpperCase()); setIbanTouched(true); setSaveError(false); }} />
        <Input label="Account nickname (optional)" value={ibanLabel} placeholder="My business account" state="empty" icon={false} hint={null} onChange={v => { setIbanLabel(v); setSaveError(false); }} />
        <Button label={saving ? 'Saving...' : 'Add bank account'} disabled={!ibanValid || !ibanCompact || saving} loading={saving} onClick={() => void saveIban()} />
      </form> : <form onSubmit={e => { e.preventDefault(); void saveCard(); }} noValidate className="flex flex-col gap-[var(--spacing-16)] p-[var(--spacing-12)]">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Card is tokenised in the form — the number never leaves this screen. Instant payout, {formatEuro(PAYOUT_POLICY.cardFee)} fee, {PAYOUT_POLICY.cardEta}.</div>
        <Input label="Card number" value={cardNumber} placeholder="4242 4242 4242 4242" state={cardShowNumberError ? 'error' : cardNumber ? 'filled' : 'empty'} icon={false} hint={cardShowNumberError ? 'Check the card number.' : brand ? `${brand} - detected automatically.` : 'Visa, Mastercard, Amex.'} onChange={v => { setCardNumber(formatCardNumber(v)); setCardTouched(true); setSaveError(false); }} />
        <div className="flex gap-[var(--spacing-8)]">
          <div className="flex-1"><Input label="Expiry" value={cardExpiry} placeholder="MM/YY" state={cardTouched && cardExpiry && !cardValidExpiry ? 'error' : cardExpiry ? 'filled' : 'empty'} icon={false} hint={cardTouched && cardExpiry && !cardValidExpiry ? 'Use a future date.' : null} onChange={v => { setCardExpiry(formatCardExpiry(v)); setCardTouched(true); setSaveError(false); }} /></div>
          <div className="flex-1"><Input label={brand === 'Amex' ? 'CID (4 digits)' : 'CVC'} value={cardCvc} placeholder={brand === 'Amex' ? '1234' : '123'} state={cardTouched && cardCvc && !cardValidCvc ? 'error' : cardCvc ? 'filled' : 'empty'} icon={false} hint={null} onChange={v => { setCardCvc(v.replace(/\D/g, '').slice(0, 4)); setCardTouched(true); setSaveError(false); }} /></div>
        </div>
        <Input label="Cardholder name" value={cardHolder} placeholder="Alexey K." state={cardHolder ? 'filled' : 'empty'} icon={false} hint={null} onChange={v => { setCardHolder(v); setSaveError(false); }} />
        <Input label="Card nickname (optional)" value={cardLabel} placeholder="Fuel card" state="empty" icon={false} hint={null} onChange={v => { setCardLabel(v); setSaveError(false); }} />
        <Button label={saving ? 'Saving...' : 'Add card'} disabled={!cardReady || saving} loading={saving} onClick={() => void saveCard()} />
      </form>}
    </Section>
    {saveError && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not save the method">Check your connection and try again.</Alert></div>}
    <RemoveMethodSheet
      open={removingId !== null}
      method={methods.find(m => m.id === removingId) ?? null}
      remainingCount={methods.filter(m => m.id !== removingId).length}
      removing={removing}
      error={removeError}
      onConfirm={() => void confirmRemove()}
      onClose={closeRemove}
    />
  </BalanceFrame>;
}

export function CashOut() {
  const [summary, setSummary] = useState<BalanceSummary | null>(null);
  const [methods, setMethods] = useState<PayoutMethod[] | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const { toast, show, dismiss } = useToast();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  // The withdrawable amount can change while this screen is open (a payout
  // landed, a fee was charged) — the cap must never be stale.
  const ledgerVersion = useLedger();
  useEffect(() => {
    let live = true;
    setError(false);
    Promise.all([getBalance(), getPayoutMethods()])
      .then(([balance, payoutMethods]) => {
        if (!live) return;
        setSummary(balance);
        setMethods(payoutMethods);
        setMethodId(prev => prev ?? payoutMethods.find(m => m.isDefault)?.id ?? payoutMethods[0]?.id ?? null);
      })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt, ledgerVersion]);
  if (error || !summary || !methods) {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="cash out" /></BalanceFrame>;
  }
  if (methods.length === 0) {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance">
      <div className="mt-[var(--spacing-16)]"><Alert type="warning" title="Add a payout method first">Cash out needs a bank account or a card.<span className="mt-[var(--spacing-8)] block"><Button label="Add payout method" onClick={() => navigate('/v2/account/balance/method')} /></span></Alert></div>
    </BalanceFrame>;
  }
  const method = methods.find(m => m.id === methodId) ?? methods.find(m => m.isDefault) ?? methods[0];
  const quote = quoteFor(method, Number(amount.replace(',', '.')) || 0);
  const parsed = Number(amount.replace(',', '.'));
  const validNumber = Number.isFinite(parsed) && parsed > 0;
  const belowMin = validNumber && parsed < PAYOUT_POLICY.minWithdrawal;
  // Amount + fee must fit the balance — the fee is part of the debit, not on top.
  const overBalance = validNumber && parsed + quote.fee > summary.available;
  const showError = touched && (!validNumber || belowMin || overBalance);
  const net = validNumber && !belowMin && !overBalance ? parsed : 0;
  const maxForMethod = maxWithdrawalFor(summary.available, quote.fee);
  const hint = !touched ? `Available ${formatEuro(summary.available)} - minimum ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`
    : !validNumber ? 'Enter an amount greater than 0.'
    : belowMin ? `Minimum withdrawal is ${formatEuro(PAYOUT_POLICY.minWithdrawal)}.`
    : overBalance ? 'Amount plus fee exceeds your available balance.'
    : quote.fee > 0 ? `Fee ${formatEuro(quote.fee)} - arrives ${quote.eta}.` : `${formatEuro(summary.available - parsed)} will remain available.`;
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
      const result = await requestWithdrawal(parsed, method.id);
      setConfirmOpen(false);
      setSummary(await getBalance());
      setAmount('');
      setTouched(false);
      show({ tone: 'success', title: `${formatEuro(Math.round(parsed * 100) / 100)} is on its way`, detail: `Arrives ${result.eta}.` });
      try {
        navigate(`/v2/account/balance/withdrawals/${encodeURIComponent(result.entry.id)}`);
      } catch {
        // Unit tests render CashOut without the withdrawals route — the toast confirms it.
      }
    } catch (e) {
      setConfirmOpen(false);
      setFailure(e instanceof Error ? e.message : 'Could not request the withdrawal.');
    } finally {
      setSending(false);
    }
  }
  function quick(v: number) { setAmount(String(v)); setTouched(true); setFailure(null); }
  return <BalanceFrame title="Cash out" backTo="/v2/account/balance" toast={<Toast toast={toast} onClose={dismiss} />}>
    <Section label="Destination">
      {methods.map((m, i) => <label key={m.id} className={`flex min-h-[var(--size-control-mobile)] cursor-pointer items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === methods.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <input type="radio" name="payout-method" checked={m.id === method.id} onChange={() => setMethodId(m.id)} className="h-[20px] w-[20px] accent-[var(--color-action-primary)]" aria-label={m.label || methodLabel(m)} />
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name={m.kind === 'card' ? 'wallet' : 'landmark'} size="md" /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14 text-[var(--color-text-primary)]">{m.label || methodLabel(m)}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{m.kind === 'card' ? `Instant - ${PAYOUT_POLICY.cardEta} - fee ${formatEuro(PAYOUT_POLICY.cardFee)}` : `SEPA - ${PAYOUT_POLICY.eta} - no fee`}{m.verified ? '' : ' - verifying...'}</span>
        </span>
      </label>)}
    </Section>
    <div className="mt-[var(--spacing-16)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <p className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Available</p>
      <p className="mt-[var(--spacing-8)] text-metric-28">{formatEuro(summary.available)}</p>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">Via {method.label || methodLabel(method)} - {quote.fee > 0 ? `fee ${formatEuro(quote.fee)}, ` : ''}arrives {quote.eta}.</p>
    </div>
    <form onSubmit={e => { e.preventDefault(); openConfirm(); }} noValidate className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-12)]">
      <Input label="Amount (EUR)" value={amount} placeholder="100.00" state={showError ? 'error' : amount ? 'filled' : 'empty'} icon={false} hint={hint} onChange={v => { setAmount(v.replace(/[^\d.,]/g, '')); setTouched(true); setFailure(null); }} />
      <div className="flex gap-[var(--spacing-8)]" role="group" aria-label="Quick amounts">
        {[50, 100, 200].filter(v => v <= maxForMethod).map(v => <button key={v} type="button" onClick={() => quick(v)} className="h-[var(--size-control-mobile)] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-action-border)] text-label-14 text-[var(--color-action-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)]">EUR {v}</button>)}
        <button type="button" onClick={() => quick(maxForMethod)} disabled={maxForMethod < PAYOUT_POLICY.minWithdrawal} className="h-[var(--size-control-mobile)] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-action-border)] text-label-14 text-[var(--color-action-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] disabled:opacity-50">Max</button>
      </div>
      <Button label={sending ? 'Sending...' : `Cash out ${net ? formatEuro(net) : ''}`.trim()} disabled={!validNumber || belowMin || overBalance || sending} loading={sending} onClick={openConfirm} />
    </form>
    {failure && <div className="mt-[var(--spacing-16)]" role="alert"><Alert type="error" title="Could not request the withdrawal">{failure}</Alert></div>}
    <Sheet open={confirmOpen} label="Confirm cash out" onClose={() => { if (!sending) setConfirmOpen(false); }}>
      <h2 className="text-heading-20 text-[var(--color-text-primary)]">Cash out {validNumber ? formatEuro(parsed) : ''}?</h2>
      <dl className="mt-[var(--spacing-12)] flex flex-col gap-[var(--spacing-8)] text-body-14">
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">To</dt>
          <dd className="text-right text-[var(--color-text-primary)]">{method.label || methodLabel(method)} via {method.kind === 'card' ? 'instant card payout' : 'SEPA transfer'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">You receive</dt>
          <dd className="text-right font-medium text-[var(--color-text-primary)]">{validNumber ? formatEuro(parsed) : '—'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">Fee</dt>
          <dd className="text-right text-[var(--color-text-primary)]">{quote.fee > 0 ? formatEuro(quote.fee) : 'No fee'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">Total debit</dt>
          <dd className="text-right text-[var(--color-text-primary)]">{validNumber ? formatEuro(Math.round((parsed + quote.fee) * 100) / 100) : '—'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">Remaining</dt>
          <dd className="text-right text-[var(--color-text-primary)]">{validNumber ? formatEuro(Math.max(0, Math.round((summary.available - parsed - quote.fee) * 100) / 100)) : formatEuro(summary.available)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <dt className="text-[var(--color-text-secondary)]">Expected arrival</dt>
          <dd className="text-right text-[var(--color-text-primary)]">{quote.eta}</dd>
        </div>
      </dl>
      <p className="mt-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">No real money moves.</p>
      <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
        <Button label={sending ? 'Sending...' : `Confirm - ${validNumber ? formatEuro(parsed) : ''}`.trim()} loading={sending} onClick={() => void confirm()} />
        <Button label="Keep editing" appearance="secondary" disabled={sending} onClick={() => setConfirmOpen(false)} />
      </div>
    </Sheet>
  </BalanceFrame>;
}

export function BalanceHistory() {
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null);
  const [invoiceByLoad, setInvoiceByLoad] = useState<Record<string, string>>({});
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ledgerVersion = useLedger();
  useEffect(() => {
    let live = true;
    setError(false);
    Promise.all([getLedger(), getInvoices()])
      .then(([entries, invoices]) => {
        if (!live) return;
        setLedger([...entries].reverse());
        const map: Record<string, string> = {};
        for (const inv of invoices) map[inv.loadId] = inv.id;
        setInvoiceByLoad(map);
      })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt, ledgerVersion]);
  if (error || !ledger) {
    return <BalanceFrame title="Activity" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="activity" /></BalanceFrame>;
  }
  return <BalanceFrame title="Activity" backTo="/v2/account/balance">
    {ledger.length === 0 ? <div className="mt-[var(--spacing-16)] flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="history" size="md" /></span>
      <p className="text-heading-14 text-[var(--color-text-primary)]">No activity yet</p>
      <p className="text-body-14 text-[var(--color-text-secondary)]">Completed trips and withdrawals will show here.</p>
    </div> : <Section label={`${ledger.length} entries`}>
      {ledger.map((entry, i) => <LedgerLine key={entry.id} entry={entry} last={i === ledger.length - 1} invoiceId={entry.kind === 'trip' ? invoiceByLoad[entry.loadId] ?? null : null} />)}
    </Section>}
    <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Ledger - stored on this device only.</p>
  </BalanceFrame>;
}

/**
 * figma: prototype-led · WithdrawalDetails — permanent operation screen; route /v2/account/balance/withdrawals/:id
 * props: none (route id + api.getWithdrawal)
 * tokens: color-bg-*, color-text-*, radius-md, text-metric-28, text-heading-20, text-body-14
 *
 * "Request accepted" is not "money arrived": the screen shows the operation number,
 * amount + fee, destination, creation time, live status, expected arrival and a history link.
 */
export function WithdrawalDetails() {
  const { id = '' } = useParams();
  const withdrawalId = decodeURIComponent(id);
  const [entry, setEntry] = useState<LedgerEntry | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  // The payout outcome (delayed → failed → refunded) changes the ledger, and
  // this screen is the place the driver reads it.
  const ledgerVersion = useLedger();
  useEffect(() => {
    let live = true;
    setError(false);
    setEntry(undefined);
    getWithdrawal(withdrawalId).then((w) => { if (live) setEntry(w); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [withdrawalId, attempt, ledgerVersion]);
  if (error || entry === undefined) {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance/history"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="withdrawal" /></BalanceFrame>;
  }
  if (entry === null || entry.kind !== 'withdrawal') {
    return <BalanceFrame title="Cash out" backTo="/v2/account/balance/history">
      <div className="mt-[var(--spacing-16)]"><Alert type="error" title="Withdrawal not found">This operation does not exist on this device.</Alert></div>
    </BalanceFrame>;
  }
  const statusCopy: Record<string, { title: string; detail: string }> = {
    processing: { title: 'Request accepted', detail: 'The payout provider accepted the request. Money has not arrived yet.' },
    delayed: { title: 'Delayed', detail: 'The provider needs more time. Do not start a new withdrawal until this one resolves.' },
    done: { title: 'Money arrived', detail: 'The provider confirms the payout reached your account.' },
    failed: { title: 'Failed', detail: entry.failReason ?? 'The provider could not complete the payout.' },
    returned: { title: 'Funds returned', detail: entry.feeRefunded ? 'Amount and fee are back on your available balance.' : 'Amount is back on your available balance. The fee stays debited.' },
  };
  const status = statusCopy[entry.status] ?? statusCopy.processing;
  const pendingOutcome = entry.status === 'processing' || entry.status === 'delayed';
  const needsFix = entry.status === 'failed' || entry.status === 'returned';
  return <BalanceFrame title="Cash out" backTo="/v2/account/balance/history" toast={undefined}>
    <div className="mt-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)] text-[var(--color-nav-text)]">
      <p className="text-caption-12 uppercase tracking-wide opacity-80">Withdrawal {entry.id}</p>
      <p className="mt-[var(--spacing-8)] text-metric-28 text-[var(--color-text-inverse)]">{formatEuro(entry.amount)}</p>
      <p className="mt-[var(--spacing-8)] text-body-14 opacity-90">{status.title} — {status.detail}</p>
    </div>
    <Section label="Operation">
      <div className="flex flex-col gap-[var(--spacing-8)] p-[var(--spacing-12)] text-body-14">
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">To</span>
          <span className="text-right text-[var(--color-text-primary)]">{entry.methodLabel} via {entry.rail === 'instant-card' ? 'instant card payout' : 'SEPA transfer'}</span>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">Fee</span>
          <span className="text-right text-[var(--color-text-primary)]">{entry.fee > 0 ? formatEuro(entry.fee) : 'No fee'}</span>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">Total debit</span>
          <span className="text-right text-[var(--color-text-primary)]">{formatEuro(Math.round((entry.amount + entry.fee) * 100) / 100)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">Created</span>
          <span className="text-right text-[var(--color-text-primary)]">{new Date(entry.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">Expected arrival</span>
          <span className="text-right text-[var(--color-text-primary)]">{entry.expectedAt ? new Date(entry.expectedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
        </div>
        <div className="flex items-baseline justify-between gap-[var(--spacing-12)]">
          <span className="text-[var(--color-text-secondary)]">Status</span>
          <span className="text-right text-[var(--color-text-primary)]">{entry.status}</span>
        </div>
      </div>
    </Section>
    <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
      {pendingOutcome && (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-12)] text-body-14 text-[var(--color-text-secondary)]" role="note">
          Outcome unknown — wait for this operation before starting a new withdrawal.
        </p>
      )}
      {needsFix && (
        <>
          <Button label="Fix payout details" onClick={() => navigate('/v2/account/balance/method')} />
          <Button label="Retry as a new withdrawal" appearance="secondary" onClick={() => navigate('/v2/account/balance/cashout')} />
        </>
      )}
      <Button label="View in history" appearance="secondary" onClick={() => navigate('/v2/account/balance/history')} />
      <Button label="Back to Balance" appearance="secondary" onClick={() => navigate('/v2/account/balance')} />
    </div>
  </BalanceFrame>;
}
