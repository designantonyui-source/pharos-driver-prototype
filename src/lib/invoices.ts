/**
 * figma: n/a · Invoice types + mock data (Wave 2) — platform-issued contractor
 * paperwork per completed trip (Deel/Remote model).
 * props: n/a (types + mock API, screens in src/screens/v2/Invoices.tsx)
 * tokens: n/a (no UI)
 *
 * EU B2B: each invoice carries seller (carrier) + buyer (customer) company blocks,
 * one line item (the trip), VAT line + reverse-charge note. Prototype numbers are
 * placeholders — real VAT scheme is a human decision (PAYMENTS-VISION.md §7).
 */
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type InvoiceLine = {
  description: string;
  lane: string;
  amount: number;
};

export type Invoice = {
  id: string;
  number: string;
  loadId: string;
  company: string;
  from: string;
  to: string;
  issuedAt: string;
  dueAt: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: 'EUR';
  status: InvoiceStatus;
  seller: { name: string; address: string; vatId: string };
  buyer: { name: string; address: string; vatId: string };
  lines: InvoiceLine[];
  note: string;
};

const DAY_MS = 86_400_000;

const SELLER = Object.freeze({
  name: 'Northway Freight SPRL',
  address: 'Rue de Lille 42, 59800 Lille, France',
  vatId: 'FR 12 345678901',
});

function eur(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Prototype seed: one invoice per settled/pending trip in the mock feed. */
function seedInvoices(): Invoice[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const rows: Array<{
    id: string; number: string; loadId: string; company: string; from: string; to: string;
    issuedAgo: number; dueIn: number; amount: number; status: InvoiceStatus; buyerVat: string;
  }> = [
    { id: 'inv-2026-0042', number: 'INV-2026-0042', loadId: 'nordcargo', company: 'NordCargo', from: 'Lille', to: 'Brussels', issuedAgo: 4, dueIn: 3, amount: 360, status: 'pending', buyerVat: 'BE 0987.654.321' },
    { id: 'inv-2026-0038', number: 'INV-2026-0038', loadId: 'belroute', company: 'BelRoute', from: 'Ghent', to: 'Antwerp', issuedAgo: 9, dueIn: -2, amount: 210, status: 'paid', buyerVat: 'BE 0456.123.789' },
    { id: 'inv-2026-0031', number: 'INV-2026-0031', loadId: 'calais-lille', company: 'Côte Fret', from: 'Calais', to: 'Lille', issuedAgo: 16, dueIn: -9, amount: 290, status: 'paid', buyerVat: 'FR 98 765432109' },
  ];
  return rows.map(r => {
    // EU B2B intra-community supply: 0% with reverse charge (prototype default).
    const vatRate = 0;
    const vatAmount = eur(r.amount * vatRate);
    return {
      id: r.id,
      number: r.number,
      loadId: r.loadId,
      company: r.company,
      from: r.from,
      to: r.to,
      issuedAt: iso(now - r.issuedAgo * DAY_MS),
      dueAt: iso(now + r.dueIn * DAY_MS),
      amount: r.amount,
      vatRate,
      vatAmount,
      total: eur(r.amount + vatAmount),
      currency: 'EUR' as const,
      status: r.status,
      seller: { ...SELLER },
      buyer: { name: `${r.company} BV`, address: 'Customer address on file', vatId: r.buyerVat },
      lines: [{ description: `Freight ${r.from} – ${r.to}`, lane: `${r.from} → ${r.to}`, amount: r.amount }],
      note: 'Intra-EU supply — VAT reverse charge applies (Article 196, VAT Directive 2006/112/EC).',
    };
  });
}

let cache: Invoice[] | null = null;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getInvoices(): Promise<Invoice[]> {
  await wait(250);
  cache ??= seedInvoices();
  return [...cache].sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const all = await getInvoices();
  return all.find(i => i.id === id) ?? null;
}

export async function getInvoiceForLoad(loadId: string): Promise<Invoice | null> {
  const all = await getInvoices();
  return all.find(i => i.loadId === loadId) ?? null;
}

/** Monthly CSV for the accountant: number,date,customer,lane,net,vat,total,status. */
export function invoicesToCsv(invoices: Invoice[]): string {
  const head = 'number,issued,customer,lane,net_eur,vat_eur,total_eur,status';
  const rows = invoices.map(i => [
    i.number,
    i.issuedAt.slice(0, 10),
    `"${i.company}"`,
    `"${i.from} - ${i.to}"`,
    i.amount.toFixed(2),
    i.vatAmount.toFixed(2),
    i.total.toFixed(2),
    i.status,
  ].join(','));
  return [head, ...rows].join('\n');
}
