/** Prototype only: local contact storage, not an authenticated or verified driver record. */
export type ContactProfile = { phone: string; email: string };

/* ------------------------------------------------------------------ */
/* Balance & payouts (prototype only, local mock — see src/lib/api.ts) */
/* ------------------------------------------------------------------ */

/** Payout destination: EU bank via SEPA IBAN, or debit card for instant payout (Wave 1). */
export type PayoutMethod =
  | { kind: 'iban'; id: string; iban: string; label: string; isDefault: boolean; verified: boolean }
  | { kind: 'card'; id: string; last4: string; brand: string; label: string; isDefault: boolean; verified: boolean };

/** One ledger line: a paid trip, a pending trip, or a withdrawal. */
export type LedgerEntry =
  | { kind: 'trip'; id: string; loadId: string; company: string; from: string; to: string; amount: number; status: 'available' | 'pending'; paidAt: string | null; day: string }
  | { kind: 'withdrawal'; id: string; amount: number; fee: number; methodLabel: string; rail: 'sepa' | 'instant-card'; status: 'processing' | 'done'; createdAt: string };

const IBAN_COMPACT = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

/** Accepts spaced/grouped IBAN input; validates shape + mod-97 checksum. Empty = not set. */
export function validateIban(iban: string): boolean {
  const compact = iban.replace(/[\s-]/g, '').toUpperCase();
  if (compact === '') return true;
  if (!IBAN_COMPACT.test(compact)) return false;
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const digits = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

/** Groups an IBAN in fours for display: "FR76 … …". Never truncates — full value stays visible. */
export function formatIban(iban: string): string {
  const compact = iban.replace(/[\s-]/g, '').toUpperCase();
  return compact.replace(/(.{4})(?=.)/g, '$1 ');
}

export function maskIban(compact: string): string {
  const value = compact.replace(/[\s-]/g, '').toUpperCase();
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}

export function normalizePayoutMethod(value: PayoutMethod): PayoutMethod {
  if (typeof value.label !== 'string') throw new Error('Invalid label');
  if (typeof value.id !== 'string') throw new Error('Invalid id');
  const base = { id: value.id, label: value.label.trim(), isDefault: !!value.isDefault, verified: !!value.verified };
  if (value.kind === 'card') {
    if (!/^\d{4}$/.test(value.last4)) throw new Error('Invalid last4');
    if (typeof value.brand !== 'string' || !value.brand) throw new Error('Invalid brand');
    return { ...base, kind: 'card', last4: value.last4, brand: value.brand };
  }
  const iban = value.iban.replace(/[\s-]/g, '').toUpperCase();
  if (iban !== '' && !validateIban(iban)) throw new Error('Invalid IBAN');
  return { ...base, kind: 'iban', iban };
}

/** Legacy single-IBAN shape (Wave 0 store) → Wave 1 method list. */
export function migrateLegacyMethod(value: unknown): PayoutMethod[] {
  if (typeof value !== 'object' || value === null) return [];
  const legacy = value as { iban?: unknown; label?: unknown };
  if (typeof legacy.iban !== 'string' || !legacy.iban) return [];
  try {
    const iban = legacy.iban.replace(/[\s-]/g, '').toUpperCase();
    if (!validateIban(iban)) return [];
    return [{
      kind: 'iban', id: 'migrated-iban', iban,
      label: typeof legacy.label === 'string' ? legacy.label : '',
      isDefault: true, verified: true,
    }];
  } catch { return []; }
}

/* ---------------- card helpers (PAN never stored — only token + last4) ---------------- */

const CARD_BIN_BRANDS: [RegExp, string][] = [
  [/^4/, 'Visa'],
  [/^(51|52|53|54|55|2221|2720)/, 'Mastercard'],
  [/^(34|37)/, 'Amex'],
  [/^(60|65)/, 'Discover'],
];

/** Luhn checksum — the same gate every card form (Stripe/Adyen included) applies first. */
export function validateCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(number: string): string {
  const digits = number.replace(/\D/g, '');
  for (const [re, brand] of CARD_BIN_BRANDS) if (re.test(digits)) return brand;
  return digits ? 'Card' : '';
}

/** Groups a PAN in fours while typing: `4242 4242 …`. Display only — never persisted. */
export function formatCardNumber(number: string): string {
  return number.replace(/\D/g, '').slice(0, 19).replace(/(.{4})(?=.)/g, '$1 ');
}

export function maskCard(last4: string, brand: string): string {
  return `${brand} •••• ${last4}`;
}

export function validateCardExpiry(expiry: string): boolean {
  const m = expiry.replace(/\D/g, '');
  if (m.length !== 4) return false;
  const month = Number(m.slice(0, 2));
  const year = 2000 + Number(m.slice(2));
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
}

export function formatCardExpiry(expiry: string): string {
  const m = expiry.replace(/\D/g, '').slice(0, 4);
  return m.length > 2 ? `${m.slice(0, 2)}/${m.slice(2)}` : m;
}

export function validateCardCvc(cvc: string, brand: string): boolean {
  const digits = cvc.replace(/\D/g, '');
  return brand === 'Amex' ? digits.length === 4 : digits.length === 3;
}

/**
 * Prototype tokeniser — stands in for Stripe.js/Adyen Drop-in: the PAN goes in,
 * a one-time token comes out, and only `last4 + brand` ever reach the store.
 * NEVER persist the return of anything but `token`.
 */
export function tokeniseCard(number: string): { token: string; last4: string; brand: string } {
  const digits = number.replace(/\D/g, '');
  if (!validateCardNumber(number)) throw new Error('Invalid card number');
  return {
    token: `tok_mock_${Date.now().toString(36)}${digits.slice(-4)}`,
    last4: digits.slice(-4),
    brand: detectCardBrand(number),
  };
}

/** Blank contact fields are allowed. Phone accepts international digits and common separators. */
export function validatePhone(phone: string): boolean {
  const value = phone.trim();
  return value === '' || (/^\+?[\d ()-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, '')));
}

export function validateEmail(email: string): boolean {
  const value = email.trim();
  return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeContactProfile(value: ContactProfile): ContactProfile {
  if (typeof value.phone !== 'string' || !validatePhone(value.phone)) throw new Error('Invalid phone');
  if (typeof value.email !== 'string' || !validateEmail(value.email)) throw new Error('Invalid email');
  return { phone: value.phone.trim(), email: value.email.trim() };
}
