import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDriverProfile, updateDriverProfile, validateEmail, validatePhone } from './api';
import { store } from './store';

const KEY = 'pharos-driver-prototype';
const contact = { phone: '+48 123 456 789', email: 'driver@example.com' };

beforeEach(() => store.reset());
afterEach(() => { vi.restoreAllMocks(); store.reset(); });

describe('prototype contact profile API', () => {
  it('uses the existing DriverProfile identity and empty contact defaults', async () => {
    expect(await getDriverProfile()).toEqual({ title: 'Driver', keyFact: 'Alexey K.', body: 'Northway Freight · driver', initials: 'AK', verified: false, phone: '', email: '' });
  });

  it('persists trimmed contacts, ignores identity input, and preserves journey data', async () => {
    store.set({ route: { from: 'A', to: 'B' } });
    const input = { phone: ` ${contact.phone} `, email: ` ${contact.email} `, keyFact: 'Someone else', verified: true };
    expect(await updateDriverProfile(input)).toMatchObject({ ...contact, keyFact: 'Alexey K.', verified: false });
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.contactProfile).toEqual(contact);
    expect(saved.route).toEqual({ from: 'A', to: 'B' });
    vi.resetModules();
    const reloaded = await import('./store');
    expect(reloaded.store.get().contactProfile).toEqual(contact);
    const result = await getDriverProfile();
    result.phone = 'changed';
    expect((await getDriverProfile()).phone).toBe(contact.phone);
  });

  it.each([{ phone: 'abc', email: contact.email }, { phone: contact.phone, email: 'invalid@' }])('rejects invalid contacts without changes', async (input) => {
    const before = store.get();
    await expect(updateDriverProfile(input)).rejects.toThrow('Invalid');
    expect(store.get()).toBe(before);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('rejects storage failure without changing memory or notifying subscribers', async () => {
    const before = store.get();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await expect(updateDriverProfile(contact)).rejects.toThrow('quota');
    expect(store.get()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('exports phone and email validation including blank optional fields', () => {
    expect(validatePhone(contact.phone)).toBe(true);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('+1234567+')).toBe(false);
    expect(validateEmail(contact.email)).toBe(true);
    expect(validateEmail('a b@example.com')).toBe(false);
    expect(validatePhone('')).toBe(true);
    expect(validateEmail('')).toBe(true);
  });
});

describe('store persistence ordering', () => {
  it.each(['set', 'reset'] as const)('%s leaves memory and persisted data intact when storage fails', (operation) => {
    store.set({ contactProfile: contact });
    const before = store.get();
    const saved = localStorage.getItem(KEY);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    vi.spyOn(localStorage, operation === 'set' ? 'setItem' : 'removeItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    expect(() => operation === 'set' ? store.set({ route: { from: 'X', to: 'Y' } }) : store.reset()).toThrow('storage unavailable');
    expect(store.get()).toBe(before);
    expect(localStorage.getItem(KEY)).toBe(saved);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('reset clears persisted contacts and memory', async () => {
    await updateDriverProfile(contact);
    store.reset();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(await getDriverProfile()).toMatchObject({ phone: '', email: '' });
  });
});

import { formatIban, maskIban, normalizePayoutMethod, validateIban } from './profile';

describe('prototype payout method (IBAN)', () => {
  it('accepts empty as not-set and validates real IBANs with mod-97', () => {
    expect(validateIban('')).toBe(true);
    expect(validateIban('DE89370400440532013000')).toBe(true);
    expect(validateIban('de89 3704 0044 0532 0130 00')).toBe(true);
    expect(validateIban('BE68539007547034')).toBe(true);
    expect(validateIban('FR7630004028379876543210985')).toBe(false);
    expect(validateIban('FR00 0000')).toBe(false);
    expect(validateIban('not-an-iban')).toBe(false);
  });
  it('normalizes to compact uppercase and formats in groups of four', () => {
    expect(normalizePayoutMethod({ iban: 'de89 3704 0044 0532 0130 00', label: ' Business ' })).toEqual({ iban: 'DE89370400440532013000', label: 'Business' });
    expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
    expect(maskIban('DE89370400440532013000')).toBe('DE89 \u2022\u2022\u2022\u2022 3000');
    expect(() => normalizePayoutMethod({ iban: 'bad', label: '' })).toThrow('Invalid IBAN');
  });
});
