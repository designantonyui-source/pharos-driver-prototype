/**
 * figma: n/a · Invoice types + mock data (Wave 2) — platform-issued contractor
 * paperwork per completed trip (Deel/Remote model).
 * props: n/a (types + mock API, screens in src/screens/v2/Invoices.tsx)
 * tokens: n/a (no UI)
 *
 * Legal identity: the operating carrier is a French SAS in Lille. A French address
 * under a Belgian SPRL was a contradiction, and "Customer BV" under a French buyer
 * was a second one. Buyer blocks come from a registry keyed by company, with the
 * legal form and VAT id of the buyer's own country.
 *
 * VAT is derived from the route, not hardcoded to reverse charge:
 *   FR → FR  French domestic 20%
 *   BE → BE  Belgian domestic 21% (seller is registered in BE for this service)
 *   cross-border EU B2B  0% with reverse charge (Article 196, 2006/112/EC)
 * The prototype note says the treatment is illustrative; accounting signs off.
 */
export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'void';

export type InvoiceLine = {
  description: string;
  lane: string;
  amount: number;
};

export type InvoiceParty = {
  name: string;
  address: string;
  vatId: string;
  country: 'FR' | 'BE' | 'NL';
};

export type Invoice = {
  id: string;
  number: string;
  /** The offer this invoice was raised for (feed identity). */
  loadId: string;
  /** The booked trip identity; survives after the load leaves the feed. */
  tripId: string;
  company: string;
  from: string;
  to: string;
  issuedAt: string;
  dueAt: string;
  paymentTermDays: number;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: 'EUR';
  status: InvoiceStatus;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  lines: InvoiceLine[];
  note: string;
};

const DAY_MS = 86_400_000;

export const SELLER = Object.freeze<InvoiceParty>({
  name: 'Northway Freight SAS',
  address: '42 rue de Lille, 59800 Lille, France',
  vatId: 'FR 12 345678901',
  country: 'FR',
});

const BUYERS: Record<string, InvoiceParty> = {
  BelRoute: {
    name: 'BelRoute BV',
    address: 'Havenlaan 5, 9000 Ghent, Belgium',
    vatId: 'BE 0456.123.789',
    country: 'BE',
  },
  'Côte Fret': {
    name: 'Côte Fret SARL',
    address: 'Zone Eurotunnel 8, 62100 Calais, France',
    vatId: 'FR 98 765432109',
    country: 'FR',
  },
  'Seine Freight': {
    name: 'Seine Freight SAS',
    address: '77 rue de Bercy, 75012 Paris, France',
    vatId: 'FR 45 678901234',
    country: 'FR',
  },
  NordCargo: {
    name: 'NordCargo BV',
    address: 'Rue du Port 48, 1000 Brussels, Belgium',
    vatId: 'BE 0987.654.321',
    country: 'BE',
  },
  'Lowlands Haul': {
    name: 'Lowlands Haul BV',
    address: 'Havenweg 30, 1041 Amsterdam, Netherlands',
    vatId: 'NL 123456789B01',
    country: 'NL',
  },
  'Flandre Express': {
    name: 'Flandre Express SAS',
    address: '12 rue des Champs, 59000 Lille, France',
    vatId: 'FR 67 890123456',
    country: 'FR',
  },
};

const CITY_COUNTRY: Record<string, 'FR' | 'BE' | 'NL'> = {
  Lille: 'FR',
  Calais: 'FR',
  Paris: 'FR',
  Brussels: 'BE',
  Ghent: 'BE',
  Antwerp: 'BE',
  Amsterdam: 'NL',
};

export function buyerFor(company: string): InvoiceParty {
  return BUYERS[company] ?? {
    name: `${company} SARL`,
    address: 'Customer address on file',
    vatId: 'FR 00 000000000',
    country: 'FR',
  };
}

function routeCountries(from: string, to: string): { from: 'FR' | 'BE' | 'NL'; to: 'FR' | 'BE' | 'NL' } {
  return { from: CITY_COUNTRY[from] ?? 'FR', to: CITY_COUNTRY[to] ?? 'FR' };
}

export type VatTreatment = { rate: number; note: string };

/** Route-driven VAT; the seller is a French carrier with a Belgian local registration. */
export function vatTreatmentFor(from: string, to: string): VatTreatment {
  const countries = routeCountries(from, to);
  if (countries.from === countries.to && countries.from === 'FR') {
    return {
      rate: 0.2,
      note: 'French domestic freight — TVA 20% applies. Seller VAT: FR 12 345678901.',
    };
  }
  if (countries.from === countries.to && countries.from === 'BE') {
    return {
      rate: 0.21,
      note: 'Belgian domestic freight — TVA 21% applies. Seller has a BE VAT registration for this service.',
    };
  }
  return {
    rate: 0,
    note: 'Intra-EU B2B freight — VAT reverse charge applies (Article 196, VAT Directive 2006/112/EC).',
  };
}

function eur(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Prototype seed: history invoices only — the demo trip invoice is created by the scenario. */
function seedInvoices(): Invoice[] {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const rows: Array<{
    id: string; number: string; loadId: string; tripId: string; company: string; from: string; to: string;
    issuedAgo: number; paymentTermDays: number; amount: number; status: InvoiceStatus;
  }> = [
    {
      id: 'inv-2026-0038', number: 'INV-2026-0038', loadId: 'belroute', tripId: 'TR-belroute-1184',
      company: 'BelRoute', from: 'Ghent', to: 'Antwerp', issuedAgo: 9, paymentTermDays: 14, amount: 290, status: 'paid',
    },
    {
      id: 'inv-2026-0031', number: 'INV-2026-0031', loadId: 'calais-lille', tripId: 'TR-calais-0932',
      company: 'Côte Fret', from: 'Calais', to: 'Lille', issuedAgo: 16, paymentTermDays: 7, amount: 430, status: 'paid',
    },
  ];
  return rows.map((row) => {
    const vat = vatTreatmentFor(row.from, row.to);
    const vatAmount = eur(row.amount * vat.rate);
    const issuedAt = iso(now - row.issuedAgo * DAY_MS);
    return {
      id: row.id,
      number: row.number,
      loadId: row.loadId,
      tripId: row.tripId,
      company: row.company,
      from: row.from,
      to: row.to,
      issuedAt,
      dueAt: iso(Date.parse(issuedAt) + row.paymentTermDays * DAY_MS),
      paymentTermDays: row.paymentTermDays,
      amount: row.amount,
      vatRate: vat.rate,
      vatAmount,
      total: eur(row.amount + vatAmount),
      currency: 'EUR' as const,
      status: row.status,
      seller: { ...SELLER },
      buyer: { ...buyerFor(row.company) },
      lines: [{ description: `Freight ${row.from} – ${row.to}`, lane: `${row.from} → ${row.to}`, amount: row.amount }],
      note: vat.note,
    };
  });
}

let cache: Invoice[] | null = null;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Demo-trip invoice: created once the delivery completes, id + route + amount
 * match the feed load and the pending ledger line. Status follows the money:
 * `pending` until the customer pays, `paid` when the trip becomes available.
 * The due date comes from the load's payment term, not a global +7 days.
 */
export async function createDemoInvoice(input: {
  loadId: string;
  tripId: string;
  company: string;
  from: string;
  to: string;
  amount: number;
  paymentTermDays: number;
}): Promise<Invoice> {
  const now = new Date();
  const vat = vatTreatmentFor(input.from, input.to);
  const amount = eur(input.amount);
  const vatAmount = eur(amount * vat.rate);
  const number = `INV-${now.getFullYear()}-0043`;
  cache ??= seedInvoices();
  const existing = cache.find((invoice) => invoice.loadId === input.loadId);
  if (existing) return existing;
  const invoice: Invoice = {
    id: `inv-${now.getFullYear()}-0043`,
    number,
    loadId: input.loadId,
    tripId: input.tripId,
    company: input.company,
    from: input.from,
    to: input.to,
    issuedAt: now.toISOString(),
    dueAt: new Date(now.getTime() + input.paymentTermDays * DAY_MS).toISOString(),
    paymentTermDays: input.paymentTermDays,
    amount,
    vatRate: vat.rate,
    vatAmount,
    total: eur(amount + vatAmount),
    currency: 'EUR',
    status: 'pending',
    seller: { ...SELLER },
    buyer: { ...buyerFor(input.company) },
    lines: [{ description: `Freight ${input.from} – ${input.to}`, lane: `${input.from} → ${input.to}`, amount }],
    note: vat.note,
  };
  cache = [...cache, invoice];
  return invoice;
}

/** Demo-trip invoice follows the payout: customer paid → invoice paid. */
export async function markDemoInvoicePaid(loadId: string): Promise<Invoice | null> {
  cache ??= seedInvoices();
  const invoice = cache.find((row) => row.loadId === loadId);
  if (!invoice) return null;
  if (invoice.status === 'paid') return invoice;
  const paid = { ...invoice, status: 'paid' as const };
  cache = cache.map((row) => row.id === invoice.id ? paid : row);
  return paid;
}

/** Cancellation voids the paperwork — never leave a live invoice on a trip that will not run. */
export async function voidInvoiceForLoad(loadId: string): Promise<Invoice | null> {
  cache ??= seedInvoices();
  const invoice = cache.find((row) => row.loadId === loadId);
  if (!invoice || invoice.status === 'void') return invoice ?? null;
  const voided = { ...invoice, status: 'void' as const };
  cache = cache.map((row) => row.id === invoice.id ? voided : row);
  return voided;
}

export async function getInvoices(): Promise<Invoice[]> {
  await wait(250);
  cache ??= seedInvoices();
  const today = Date.now();
  cache = cache.map((invoice) => (
    invoice.status === 'pending' && Date.parse(invoice.dueAt) < today
      ? { ...invoice, status: 'overdue' as const }
      : invoice
  ));
  return [...cache].sort((a, b) => +new Date(b.issuedAt) - +new Date(a.issuedAt));
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const all = await getInvoices();
  return all.find((invoice) => invoice.id === id) ?? null;
}

export async function getInvoiceForLoad(loadId: string): Promise<Invoice | null> {
  const all = await getInvoices();
  return all.find((invoice) => invoice.loadId === loadId) ?? null;
}

/** Demo reset: drop scenario-created invoices so each run starts clean. */
export function resetDemoInvoices() {
  cache = null;
}

/** Monthly CSV for the accountant: number,date,customer,lane,net,vat,total,status. */
export function invoicesToCsv(invoices: Invoice[]): string {
  const head = 'number,issued,trip_id,customer,lane,net_eur,vat_eur,total_eur,status';
  const rows = invoices.map((invoice) => [
    invoice.number,
    invoice.issuedAt.slice(0, 10),
    invoice.tripId,
    `"${invoice.company}"`,
    `"${invoice.from} - ${invoice.to}"`,
    invoice.amount.toFixed(2),
    invoice.vatAmount.toFixed(2),
    invoice.total.toFixed(2),
    invoice.status,
  ].join(','));
  return [head, ...rows].join('\n');
}
