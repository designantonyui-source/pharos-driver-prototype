/**
 * figma: n/a · PSP adapter interface (Wave 1) — how a real payout provider plugs in.
 * props: n/a (interface + mock implementation)
 * tokens: n/a (no UI)
 *
 * Production shape: `PayoutProvider` mirrors Stripe Connect / Adyen for Platforms
 * (create destination → quote fee/ETA → execute payout → poll status).
 * The app only talks to this interface (via `src/lib/api.ts`) — swapping
 * `MockPayoutProvider` for `StripePayoutProvider` changes no screen.
 * PAN must NEVER reach this layer: cards arrive as one-time tokens
 * (Stripe PaymentMethod id / Adyen shopper reference pattern).
 */
export type Rail = 'sepa' | 'instant-card';

export type Destination =
  | { kind: 'iban'; iban: string; label: string }
  | { kind: 'card'; token: string; last4: string; brand: string; label: string };

export type PayoutQuote = { rail: Rail; fee: number; eta: string; arrives: string };

export type PayoutResult = { providerRef: string; status: 'processing' | 'done' };

export interface PayoutProvider {
  readonly name: string;
  quote(rail: Rail, amount: number): PayoutQuote;
  execute(rail: Rail, amount: number, destination: Destination): Promise<PayoutResult>;
}

/** Prototype fee table (NOT approved business rules — see PAYMENTS-VISION.md §7). */
export const PROTOTYPE_FEES: Record<Rail, { fee: number; eta: string }> = {
  sepa: { fee: 0, eta: '1–2 business days' },
  'instant-card': { fee: 1.5, eta: 'within 30 minutes' },
};

function etaDate(rail: Rail): string {
  const d = new Date();
  if (rail === 'sepa') d.setDate(d.getDate() + 2);
  else d.setMinutes(d.getMinutes() + 30);
  return d.toISOString();
}

/** Local mock: latency + provider-shaped refs (`mock_sepa_…` / `mock_card_…`). */
export class MockPayoutProvider implements PayoutProvider {
  readonly name = 'mock';
  quote(rail: Rail, _amount: number): PayoutQuote {
    const table = PROTOTYPE_FEES[rail];
    return { rail, fee: table.fee, eta: table.eta, arrives: etaDate(rail) };
  }
  async execute(rail: Rail, amount: number, _destination: Destination): Promise<PayoutResult> {
    await new Promise(r => setTimeout(r, 600));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
    const prefix = rail === 'sepa' ? 'mock_sepa' : 'mock_card';
    return { providerRef: `${prefix}_${Date.now().toString(36)}`, status: 'processing' };
  }
}

/**
 * Production sketch (NOT wired): how Stripe Connect would implement the same
 * interface — `stripe.payouts.create({ amount, currency: 'eur', destination })`
 * for SEPA, `stripe.payouts.create({ method: 'instant', destination: card })`
 * for cards. Tokenisation happens in Stripe.js / Adyen Drop-in before this layer.
 */
export const PROVIDER_WIRING_NOTE = 'Swap MockPayoutProvider for the PSP implementation; screens stay untouched.';
