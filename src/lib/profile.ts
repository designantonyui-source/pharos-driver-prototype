/** Prototype only: local contact storage, not an authenticated or verified driver record. */
export type ContactProfile = { phone: string; email: string };

/* ------------------------------------------------------------------ */
/* Balance & payouts (prototype only, local mock — see src/lib/api.ts) */
/* ------------------------------------------------------------------ */

/** Payout destination: EU bank via SEPA IBAN. Instant card payout is out of scope. */
export type PayoutMethod = { iban: string; label: string };

/** One ledger line: a paid trip, a pending trip, or a withdrawal. */
export type LedgerEntry =
  | { kind: 'trip'; id: string; loadId: string; company: string; from: string; to: string; amount: number; status: 'available' | 'pending'; paidAt: string | null; day: string }
  | { kind: 'withdrawal'; id: string; amount: number; fee: number; methodLabel: string; status: 'processing' | 'done'; createdAt: string };

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
  const iban = value.iban.replace(/[\s-]/g, '').toUpperCase();
  if (iban !== '' && !validateIban(iban)) throw new Error('Invalid IBAN');
  if (typeof value.label !== 'string') throw new Error('Invalid label');
  return { iban, label: value.label.trim() };
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
