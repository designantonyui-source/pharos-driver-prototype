/**
 * Backload (PL) — logic port of the prototype (backload-prototype/index-pl.html, spec v2 §4–§6).
 * Pure functions only: no React, no storage. The screens read data through `src/lib/api.ts`.
 * All times are minutes from 00:00 today; a value ≥ 1440 means tomorrow.
 */

export type Requirement = 'palety' | 'chłodnia' | 'ADR';
export type Body = 'Plandeka' | 'Chłodnia' | 'Kontener' | 'Platforma';

export type BlOrder = {
  id: number;
  from: string;
  to: string;
  loadedKm: number;
  detourKm: number;
  toPickupMin: number;
  dropToMainMin: number;
  pickupAt: number;
  dropAt: number;
  payout: number;
  tolls: number;
  weight: string;
  cargo: string;
  reqs: Requirement[];
  shipperRating: number;
  shipperJobs: number;
  cancelFreeUntil: number;
  cancelPenalty: number;
};

export type Profile = { body: Body; adr: boolean };

export const PROFILE_DEFAULT: Profile = { body: 'Plandeka', adr: false };
export const MAIN_CITY = 'Poznań';

export const BL_ORDERS: BlOrder[] = [
  { id: 1, from: 'Łódź', to: 'Poznań', loadedKm: 215, detourKm: 18, toPickupMin: 120, dropToMainMin: 0,
    pickupAt: 960, dropAt: 1230, payout: 420, tolls: 24, weight: '3.2 t', cargo: 'Palety: sprzęt AGD',
    reqs: ['palety'], shipperRating: 4.8, shipperJobs: 156, cancelFreeUntil: 840, cancelPenalty: 50 },
  { id: 2, from: 'Łódź', to: 'Gniezno', loadedKm: 180, detourKm: 34, toPickupMin: 120, dropToMainMin: 45,
    pickupAt: 1110, dropAt: 1350, payout: 310, tolls: 22, weight: '1.8 t', cargo: 'Chłodnia: mrożonki',
    reqs: ['chłodnia'], shipperRating: 4.6, shipperJobs: 89, cancelFreeUntil: 960, cancelPenalty: 40 },
  { id: 3, from: 'Łódź', to: 'Konin', loadedKm: 125, detourKm: 52, toPickupMin: 120, dropToMainMin: 105,
    pickupAt: 900, dropAt: 1260, payout: 190, tolls: 40, weight: '800 kg', cargo: 'Ładunek ogólny: sanitariaty',
    reqs: [], shipperRating: 4.2, shipperJobs: 12, cancelFreeUntil: 780, cancelPenalty: 30 },
  { id: 4, from: 'Sieradz', to: 'Poznań', loadedKm: 190, detourKm: 12, toPickupMin: 105, dropToMainMin: 0,
    pickupAt: 1020, dropAt: 1260, payout: 380, tolls: 19, weight: '2.4 t', cargo: 'ADR: butle z gazem (klasa 2)',
    reqs: ['ADR'], shipperRating: 4.9, shipperJobs: 201, cancelFreeUntil: 900, cancelPenalty: 50 },
  { id: 5, from: 'Łódź', to: 'Kalisz', loadedKm: 115, detourKm: 26, toPickupMin: 120, dropToMainMin: 130,
    pickupAt: 750, dropAt: 960, payout: 240, tolls: 24, weight: '1.5 t', cargo: 'Palety: napoje',
    reqs: ['palety'], shipperRating: 4.5, shipperJobs: 67, cancelFreeUntil: 630, cancelPenalty: 35 },
];

/** freeAt: minute the driver can start the next load (null without a trip). deadlineH: null = no timing check. */
export type BlContext = { clock: number; freeAt: number | null; deadlineH: number | null; profile: Profile };

export function tm(m: number): string {
  const x = ((m % 1440) + 1440) % 1440;
  return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`;
}

export function hm(m: number): string {
  return (m >= 1440 ? 'jutro ' : '') + tm(m);
}

export function dur(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h} godz.${r ? ` ${r} min` : ''}` : `${r} min`;
}

export function netOf(o: BlOrder): number {
  return o.payout - o.tolls;
}

export function eurPerKm(o: BlOrder): number {
  return Math.round((netOf(o) / (o.loadedKm + o.detourKm)) * 100) / 100;
}

export function isProfitable(o: BlOrder): boolean {
  return eurPerKm(o) >= 1;
}

/** Spec §6.2–6.3: conflict and buffer, only when the driver is free and a deadline is set. */
export function check(o: BlOrder, c: BlContext) {
  const freeAt = c.freeAt;
  const deadlineAt = freeAt != null && c.deadlineH != null ? freeAt + c.deadlineH * 60 : null;
  if (freeAt == null || deadlineAt == null)
    return { conflict: null as null | 'pickup' | 'deadline', arrive: 0, mainArrive: 0, buffer: null as number | null, deadlineAt: null as number | null };
  const arrive = freeAt + o.toPickupMin;
  const mainArrive = o.dropAt + o.dropToMainMin;
  if (arrive > o.pickupAt) return { conflict: 'pickup' as const, arrive, mainArrive, buffer: null, deadlineAt };
  if (mainArrive > deadlineAt) return { conflict: 'deadline' as const, arrive, mainArrive, buffer: null, deadlineAt };
  return { conflict: null, arrive, mainArrive, buffer: deadlineAt - mainArrive, deadlineAt };
}

/** Spec §6.7: body and ADR requirements. Polish labels are the product copy. */
export function reqBlock(o: BlOrder, p: Profile): { short: string; msg: string } | null {
  if (o.reqs.includes('ADR') && !p.adr)
    return { short: 'wymagane ADR', msg: 'Nie pasuje: wymagane uprawnienie ADR' };
  if (o.reqs.includes('chłodnia') && p.body !== 'Chłodnia')
    return { short: 'wymagana chłodnia', msg: `Nie pasuje: wymagana chłodnia, w profilu ${p.body}` };
  if (o.reqs.includes('palety') && !['Plandeka', 'Chłodnia', 'Platforma'].includes(p.body))
    return { short: 'wymagany kuzow na palety', msg: 'Nie pasuje: na palety potrzebna plandeka, chłodnia lub platforma' };
  return null;
}

/** Spec §6.4: first matching block wins. */
export function blockOf(o: BlOrder, c: BlContext, takenIds: number[] = [], offline = false, hasBooking = false) {
  const ch = check(o, c);
  if (takenIds.includes(o.id)) return { key: 'taken', msg: 'Zlecenie zajęte przez innego kierowcę' };
  if (offline) return { key: 'offline', msg: 'Brak sieci: rezerwacja niedostępna' };
  if (hasBooking) return { key: 'booked', msg: 'Najpierw zakończ lub anuluj bieżące zlecenie' };
  const rq = reqBlock(o, c.profile);
  if (rq) return { key: 'req', msg: rq.msg };
  if (ch.conflict === 'pickup') return { key: 'conflict', msg: `Nie zdążysz na załadunek: przyjedziesz o ${hm(ch.arrive)}, załadunek o ${hm(o.pickupAt)}` };
  if (ch.conflict === 'deadline') return { key: 'conflict', msg: `Nie zdążysz na główny załadunek: przyjedziesz o ${hm(ch.mainArrive)}, termin ${hm(ch.deadlineAt ?? 0)}` };
  return null;
}
