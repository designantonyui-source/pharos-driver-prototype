import { describe, expect, it } from 'vitest';
import { companyInitials, dayLabel, isoDayOffset, timeAgo } from './loads';

describe('dayLabel', () => {
  const now = new Date('2026-10-17T12:00:00');
  it('reads Today / Tomorrow off the real date', () => {
    expect(dayLabel(isoDayOffset(0, now), now)).toBe('Today');
    expect(dayLabel(isoDayOffset(1, now), now)).toBe('Tomorrow');
  });
  it('names later days Mon 20-style', () => {
    expect(dayLabel(isoDayOffset(3, now), now)).toMatch(/^\w{3} \d{1,2}$/);
  });
});

describe('timeAgo', () => {  const now = new Date('2026-10-17T12:00:00Z');
  it('reads just now / minutes / hours', () => {
    expect(timeAgo('2026-10-17T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-10-17T11:55:00Z', now)).toBe('5 min ago');
    expect(timeAgo('2026-10-17T09:00:00Z', now)).toBe('3 h ago');
  });
  it('falls back to the weekday past a day', () => {
    expect(timeAgo('2026-10-15T12:00:00Z', now)).toBe('Thu');
  });
});

describe('companyInitials', () => {
  it('reads CamelCase and multi-word names as two initials', () => {
    expect(companyInitials('NordCargo')).toBe('NC');
    expect(companyInitials('Flandre Express')).toBe('FE');
    expect(companyInitials('Seine Freight')).toBe('SF');
    expect(companyInitials('Kuehne+Nagel')).toBe('KN');
  });
  it('never exceeds two characters', () => {
    expect(companyInitials('Lowlands Haul International')).toBe('LH');
    expect(companyInitials('DHL')).toBe('DH');
  });
});
