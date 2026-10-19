/**
 * figma: new Invoices proposal (Wave 2), not measured - reuses NavigationBar 586:33,
 *   Button 12:38, Alert 575:9632, V2Frame shell
 * props: none (controllers); InvoiceDetails takes id via route
 * tokens: color-bg-*, color-text-*, color-action-*, color-alert-*, color-border-default,
 *   color-status-*, spacing-*, radius-md/sm/pill, text-metric-28, text-heading-*,
 *   text-body-14, text-caption-12, nav-bar-h, tab-bar-h, home-indicator-h,
 *   size-control-mobile, size-icon-xl
 *
 * Platform-issued contractor invoices (Deel/Remote model): list (number/date/amount/
 * status) -> details (parties, lines, VAT + reverse charge, totals) -> print/PDF.
 * Prototype numbers only - VAT scheme is a human decision (PAYMENTS-VISION.md §7).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { V2BackBar } from '../../components/layout/NavigationBar';
import { V2Frame } from '../../components/v2/V2Frame';
import { getInvoice, getInvoices, invoicesToCsv, type Invoice, type InvoiceStatus } from '../../lib/invoices';
import { downloadInvoicePdf, formatEuro } from '../../lib/invoicePdf';
import { useLedger } from '../../lib/store';

function InvoiceFrame({ title, backTo, children }: { title: string; backTo?: string; children: ReactNode }) {
  return <V2Frame active="Account">
    <div className="absolute inset-x-0 top-0 z-20">
      {backTo
        ? <V2BackBar title={title} fallback={backTo} />
        : <V2BackBar title={title} fallback="/v2/account/balance" />}
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

const STATUS_TONE: Record<InvoiceStatus, string> = {
  paid: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
  pending: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
  overdue: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
};

function StatusChip({ status }: { status: InvoiceStatus }) {
  return <span className={`inline-flex shrink-0 items-center rounded-[var(--radius-pill)] px-[var(--spacing-8)] py-[var(--spacing-4)] text-caption-10 uppercase tracking-wide ${STATUS_TONE[status]}`}>{status}</span>;
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

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // An invoice flips to paid when the customer pays — that is a ledger change,
  // and the list must not keep showing the old status.
  const ledgerVersion = useLedger();
  useEffect(() => {
    let live = true;
    setError(false);
    getInvoices().then(v => { if (live) setInvoices(v); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt, ledgerVersion]);
  if (error || !invoices) {
    return <InvoiceFrame title="Invoices" backTo="/v2/account/balance"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="invoices" /></InvoiceFrame>;
  }
  const pending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0);
  function exportCsv() {
    const blob = new Blob([invoicesToCsv(invoices!)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pharos-invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  return <InvoiceFrame title="Invoices" backTo="/v2/account/balance">
    {pending > 0 && <div className="mt-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-nav-bg)] p-[var(--spacing-16)] text-[var(--color-nav-text)]">
      <p className="text-caption-12 uppercase tracking-wide opacity-80">Awaiting payment</p>
      <p className="mt-[var(--spacing-8)] text-metric-28 text-[var(--color-text-inverse)]">{formatEuro(pending)}</p>
    </div>}
    {invoices.length === 0 ? <div className="mt-[var(--spacing-16)] flex flex-col items-center gap-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] px-[var(--spacing-16)] py-[var(--spacing-24)] text-center">
      <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="history" size="md" /></span>
      <p className="text-heading-14 text-[var(--color-text-primary)]">No invoices yet</p>
      <p className="text-body-14 text-[var(--color-text-secondary)]">Completed trips generate an invoice automatically.</p>
    </div> : <Section label={`${invoices.length} invoices`}>
      {invoices.map((inv, i) => <Link key={inv.id} to={`/v2/account/balance/invoices/${inv.id}`} className={`flex min-h-[var(--size-control-mobile)] items-center gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus-ring)] focus-visible:-outline-offset-2 ${i === invoices.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <span className="flex h-[var(--size-icon-xl)] w-[var(--size-icon-xl)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] text-[var(--color-action-primary)]" aria-hidden><Icon name="history" size="md" /></span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-14 text-[var(--color-text-primary)]">{inv.number} - {inv.company}</span>
          <span className="truncate text-caption-12 text-[var(--color-text-secondary)]">{inv.from} - {inv.to} - {new Date(inv.issuedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-[var(--spacing-4)]">
          <span className="text-body-14 text-[var(--color-text-primary)]">{formatEuro(inv.total)}</span>
          <StatusChip status={inv.status} />
        </span>
      </Link>)}
    </Section>}
    {invoices.length > 0 && <div className="mt-[var(--spacing-16)]"><Button label="Export CSV for accountant" appearance="secondary" onClick={exportCsv} /></div>}
    <p className="mt-[var(--spacing-16)] px-[var(--spacing-12)] text-caption-12 text-[var(--color-text-secondary)]">Documents - confirm with accounting before use.</p>
  </InvoiceFrame>;
}

export function InvoiceDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setError(false);
    getInvoice(id).then(v => { if (live) setInvoice(v); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [id, attempt]);
  if (error || invoice === undefined) {
    return <InvoiceFrame title="Invoice" backTo="/v2/account/balance/invoices"><StatusBlock error={error} retry={() => setAttempt(v => v + 1)} label="invoice" /></InvoiceFrame>;
  }
  if (invoice === null) {
    return <InvoiceFrame title="Invoice" backTo="/v2/account/balance/invoices">
      <div className="mt-[var(--spacing-16)]"><Alert type="warning" title="Invoice not found">It may have been removed.<span className="mt-[var(--spacing-8)] block"><Button label="Back to invoices" appearance="secondary" onClick={() => navigate('/v2/account/balance/invoices')} /></span></Alert></div>
    </InvoiceFrame>;
  }
  return <InvoiceFrame title={invoice.number} backTo="/v2/account/balance/invoices">
    <div className="mt-[var(--spacing-8)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-[var(--spacing-16)]">
      <div className="flex items-center justify-between gap-[var(--spacing-8)]">
        <p className="sr-only">{invoice.number}</p>
      <p className="text-heading-20 text-[var(--color-text-primary)]" aria-hidden="true">{invoice.number}</p>
        <StatusChip status={invoice.status} />
      </div>
      <p className="mt-[var(--spacing-8)] text-body-14 text-[var(--color-text-secondary)]">Issued {new Date(invoice.issuedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })} - due {new Date(invoice.dueAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      <p className="mt-[var(--spacing-8)] text-metric-28">{formatEuro(invoice.total)}</p>
    </div>
    <Section label="Parties">
      <div className="px-[var(--spacing-12)] py-[var(--spacing-8)]">
        <p className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">From</p>
        <p className="mt-[var(--spacing-4)] text-body-14 text-[var(--color-text-primary)]">{invoice.seller.name} - {invoice.seller.address} - VAT {invoice.seller.vatId}</p>
      </div>
      <div className="border-t border-[var(--color-border-default)] px-[var(--spacing-12)] py-[var(--spacing-8)]">
        <p className="text-caption-12 uppercase tracking-wide text-[var(--color-text-secondary)]">Bill to</p>
        <p className="mt-[var(--spacing-4)] text-body-14 text-[var(--color-text-primary)]">{invoice.buyer.name} - {invoice.buyer.address} - VAT {invoice.buyer.vatId}</p>
      </div>
    </Section>
    <Section label="Lines">
      {invoice.lines.map((l, i) => <div key={i} className={`flex items-start justify-between gap-[var(--spacing-12)] px-[var(--spacing-12)] py-[var(--spacing-8)] ${i === invoice.lines.length - 1 ? '' : 'border-b border-[var(--color-border-default)]'}`}>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-body-14 text-[var(--color-text-primary)]">{l.description}</span>
          <span className="text-caption-12 text-[var(--color-text-secondary)]">{l.lane}</span>
        </span>
        <span className="shrink-0 text-body-14 text-[var(--color-text-primary)]">{formatEuro(l.amount)}</span>
      </div>)}
      <div className="border-t border-[var(--color-border-default)] px-[var(--spacing-12)] py-[var(--spacing-8)] text-body-14">
        <div className="flex justify-between py-[var(--spacing-4)]"><span className="text-[var(--color-text-secondary)]">Net</span><span>{formatEuro(invoice.amount)}</span></div>
        <div className="flex justify-between py-[var(--spacing-4)]"><span className="text-[var(--color-text-secondary)]">VAT ({Math.round(invoice.vatRate * 100)}%)</span><span>{formatEuro(invoice.vatAmount)}</span></div>
        <div className="flex justify-between py-[var(--spacing-8)] text-heading-20"><span>Total</span><span>{formatEuro(invoice.total)}</span></div>
      </div>
    </Section>
    <div className="mt-[var(--spacing-16)]"><Alert type="info" title="Reverse charge">{invoice.note}</Alert></div>
    <div className="mt-[var(--spacing-16)] flex flex-col gap-[var(--spacing-8)]">
      <Button label="Download PDF" onClick={() => downloadInvoicePdf(invoice)} />
      <Button label="Open trip" appearance="secondary" onClick={() => navigate(`/trip/${invoice.loadId}`)} />
    </div>
  </InvoiceFrame>;
}
