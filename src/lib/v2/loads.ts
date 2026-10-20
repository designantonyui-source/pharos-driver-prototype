/**
 * Driver v2 — mock load feed. Only `src/lib/api.ts` imports this; screens go through the api.
 * Epic: pharos-driver-flow-stories.md (S2 details-v2 data, S8 two deadlines).
 *
 * Time discipline: a feed load is a live offer, not a calendar fixture. Pickup and
 * delivery windows are generated relative to the moment the prototype boots, so a
 * 10:00 window can never still accept applications at 16:49. Deadlines are ISO
 * instants (`approvalsAt`), and the display copy is derived from them.
 *
 * Money discipline: `perKm` is the loaded rate; `netPerKm` includes the deadhead to
 * pickup. The feed filter and the cards use `netPerKm`, because that is the number
 * that reaches the driver's bank account.
 */
export type TripSite = {
  address: string;
  contact: string;
  note: string;
};

export type V2Load = {
  id: string;
  company: string;
  rating: number;
  rate: number;
  /** Loaded rate per km (rate / km). */
  perKm: number;
  /** Rate per km after the empty run to pickup (rate / (km + pickupKm)). */
  netPerKm: number;
  km: number;
  from: string;
  to: string;
  /** Pickup day as an ISO date (yyyy-mm-dd). The driver plans real days, not "today". */
  date: string;
  window: string;
  pickupTime?: string;
  /** ISO instant the pickup window opens and closes. */
  pickupAt: string;
  pickupEndsAt: string;
  onRoute?: boolean;
  /** Delivery day as an ISO date. */
  deliveryDate: string;
  deliveryWindow: string;
  /** ISO instant the delivery window opens. */
  deliveryAt: string;
  pickupKm: number;
  pickupMin: number;
  vehicle: string;
  /** Contractual payment term after delivery. */
  paymentTermDays: number;
  /** Human label for the term: "Paid in 7 days". */
  paidIn: string;
  /** Expected payout date, derived from delivery + term. */
  payoutDate: string;
  /** minutes the driver has to decide (S8: the main urgency) */
  decideMin: number;
  /** ISO instant both approvals must be in. */
  approvalsAt: string;
  /** Display label for `approvalsAt`: "18:30", "tomorrow 09:00". */
  approvalsBy: string;
  /** Prototype trip-site details (address, contact, gate note). */
  pickupSite: TripSite;
  deliverySite: TripSite;
  /** Payout destination label (mock). */
  payoutMethod: string;
  /** Trip documents attached to the load (mock). */
  documents: { id: string; name: string; detail: string }[];
};

/** ISO date (yyyy-mm-dd) N days from today — anchors fixtures to real days. */
export function isoDayOffset(offset: number, now: Date = new Date()): string {
  const date = new Date(now);
  date.setDate(date.getDate() + offset);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Relative recency for recent routes: just now / 5 min ago / 3 h ago / Tue. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - Date.parse(iso);
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
}

/** Short day label for a pickup ISO date: Today / Tomorrow / Mon 20. */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso + 'T00:00:00');
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}

export function pickupTimestamp(isoDate: string, window: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const [hours, minutes] = window.split('–')[0].split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * Company mark initials: first letters of the words, splitting CamelCase, max two.
 * NordCargo → NC · Flandre Express → FE · Kuehne+Nagel → KN.
 * Used for the square company mark — circle means a person in this app.
 */
export function companyInitials(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const starts = words.flatMap((w) => w.split(/(?=[A-Z])/)).filter((p) => p.length > 0);
  return starts
    .map((p) => p[0].toLocaleUpperCase())
    .join('')
    .slice(0, 2);
}


/** Local clock label for an ISO instant: 18:30. */
export function clockLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Deadline label in the driver's local time: 18:30 / tomorrow 09:00 / Mon 21, 09:00. */
export function deadlineLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return clockLabel(iso);
  if (diff === 1) return `tomorrow ${clockLabel(iso)}`;
  return `${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}, ${clockLabel(iso)}`;
}

/** Short payout date: 27 Oct (with the year only when it is not this year). */
export function shortDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

export function paymentTermsLabel(days: number): string {
  return `Paid in ${days} ${days === 1 ? 'day' : 'days'}`;
}

function roundUpToQuarter(date: Date): Date {
  const quarter = 15 * 60_000;
  return new Date(Math.ceil(date.getTime() / quarter) * quarter);
}

function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function windowLabel(start: Date, durationMin: number): string {
  const end = new Date(start.getTime() + durationMin * 60_000);
  return `${clockLabel(start.toISOString())}–${clockLabel(end.toISOString())}`;
}

type LoadSeed = Omit<
  V2Load,
  | 'date'
  | 'window'
  | 'pickupTime'
  | 'pickupAt'
  | 'pickupEndsAt'
  | 'deliveryDate'
  | 'deliveryWindow'
  | 'deliveryAt'
  | 'payoutDate'
  | 'paidIn'
  | 'approvalsAt'
  | 'approvalsBy'
  | 'perKm'
  | 'netPerKm'
> & {
  /** Minutes from the prototype boot to the pickup window's rounded start. */
  pickupOffsetMin: number;
  /** Minutes from the prototype boot to the delivery window's rounded start. */
  deliveryOffsetMin: number;
  pickupDurationMin?: number;
  deliveryDurationMin?: number;
  decideMin: number;
};

/**
 * Build a load from relative offsets. The pickup is rounded up to a quarter hour,
 * the delivery window starts at its own offset, and both approvals are due before
 * the pickup window opens (never after it).
 */
function makeLoad(seed: LoadSeed, now: Date): V2Load {
  const {
    pickupOffsetMin,
    deliveryOffsetMin,
    pickupDurationMin = 60,
    deliveryDurationMin = 60,
    decideMin,
    ...rest
  } = seed;
  const pickupStart = roundUpToQuarter(new Date(now.getTime() + pickupOffsetMin * 60_000));
  const pickupEnd = new Date(pickupStart.getTime() + pickupDurationMin * 60_000);
  const deliveryStart = roundUpToQuarter(new Date(now.getTime() + deliveryOffsetMin * 60_000));
  const deliveryEnd = new Date(deliveryStart.getTime() + deliveryDurationMin * 60_000);
  const payout = new Date(deliveryEnd.getTime() + rest.paymentTermDays * 86_400_000);
  const decisionDeadline = new Date(now.getTime() + decideMin * 60_000);
  const beforePickup = new Date(pickupStart.getTime() - 30 * 60_000);
  const approvals = new Date(Math.min(decisionDeadline.getTime(), Math.max(now.getTime() + 15 * 60_000, beforePickup.getTime())));

  return {
    ...rest,
    decideMin,
    perKm: Math.round((rest.rate / rest.km) * 100) / 100,
    netPerKm: Math.round((rest.rate / (rest.km + rest.pickupKm)) * 100) / 100,
    date: localDateKey(pickupStart),
    window: windowLabel(pickupStart, pickupDurationMin),
    pickupTime: pickupStart.toISOString(),
    pickupAt: pickupStart.toISOString(),
    pickupEndsAt: pickupEnd.toISOString(),
    deliveryDate: localDateKey(deliveryStart),
    deliveryWindow: windowLabel(deliveryStart, deliveryDurationMin),
    deliveryAt: deliveryStart.toISOString(),
    paymentTermDays: rest.paymentTermDays,
    paidIn: paymentTermsLabel(rest.paymentTermDays),
    payoutDate: shortDate(payout.toISOString(), now),
    approvalsAt: approvals.toISOString(),
    approvalsBy: deadlineLabel(approvals.toISOString(), now),
  };
}

/**
 * The six demo offers. Deadhead distances are measured from the driver's current
 * base near Lille, which is why Paris is 225 km away and Lille is 8 km away.
 * Net rates include the empty run; the feed filter uses them.
 */
const SEEDS: LoadSeed[] = [
  {
    id: 'nordcargo',
    company: 'NordCargo',
    rating: 4.8,
    rate: 435,
    km: 111,
    pickupKm: 12,
    pickupMin: 18,
    from: 'Lille',
    to: 'Brussels',
    pickupOffsetMin: 120,
    deliveryOffsetMin: 240,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Curtainsider · 12.4 t · 18 pallets',
    paymentTermDays: 7,
    decideMin: 240,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Rue des Champs 12, 59000 Lille',
      contact: '+33 3 20 11 22 33',
      note: 'Gate B · Bay 4 · Report at reception',
    },
    deliverySite: {
      address: 'Rue du Port 48, 1000 Brussels',
      contact: '+32 2 555 01 48',
      note: 'Dock 7 · Ring before entering',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 18 pallets' },
    ],
  },
  {
    id: 'belroute',
    company: 'BelRoute',
    rating: 4.6,
    rate: 290,
    km: 60,
    pickupKm: 65,
    pickupMin: 70,
    from: 'Ghent',
    to: 'Antwerp',
    pickupOffsetMin: 180,
    deliveryOffsetMin: 330,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Curtainsider · 10 t · 14 pallets',
    paymentTermDays: 14,
    decideMin: 300,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Havenlaan 5, 9000 Ghent',
      contact: '+32 9 210 44 55',
      note: 'Gate A · Bay 2',
    },
    deliverySite: {
      address: 'Kattendijkdok 21, 2000 Antwerp',
      contact: '+32 3 540 78 90',
      note: 'Dock 3 · Report at gate',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Side loading · 14 pallets' },
    ],
  },
  {
    id: 'calais-lille',
    company: 'Côte Fret',
    rating: 4.9,
    rate: 430,
    km: 110,
    pickupKm: 105,
    pickupMin: 110,
    from: 'Calais',
    to: 'Lille',
    pickupOffsetMin: 1_560,
    deliveryOffsetMin: 1_680,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Curtainsider · 12 t · 16 pallets',
    paymentTermDays: 7,
    decideMin: 720,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Zone Eurotunnel 8, 62100 Calais',
      contact: '+33 3 21 46 78 90',
      note: 'Gate C · Bay 1',
    },
    deliverySite: {
      address: 'Rue des Champs 12, 59000 Lille',
      contact: '+33 3 20 11 22 33',
      note: 'Gate B · Bay 4',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 16 pallets' },
    ],
  },
  {
    id: 'paris-brussels',
    company: 'Seine Freight',
    rating: 4.7,
    rate: 1_150,
    km: 310,
    pickupKm: 225,
    pickupMin: 210,
    from: 'Paris',
    to: 'Brussels',
    pickupOffsetMin: 420,
    deliveryOffsetMin: 660,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Box · 8 t · 10 pallets',
    paymentTermDays: 7,
    decideMin: 480,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Rue de Bercy 77, 75012 Paris',
      contact: '+33 1 44 20 55 66',
      note: 'Gate D · Bay 6 · Call on arrival',
    },
    deliverySite: {
      address: 'Rue du Port 48, 1000 Brussels',
      contact: '+32 2 555 01 48',
      note: 'Dock 7 · Ring before entering',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 10 pallets' },
    ],
  },
  {
    id: 'brussels-amsterdam',
    company: 'Lowlands Haul',
    rating: 4.5,
    rate: 760,
    km: 210,
    pickupKm: 115,
    pickupMin: 120,
    from: 'Brussels',
    to: 'Amsterdam',
    pickupOffsetMin: 3_060,
    deliveryOffsetMin: 3_240,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Curtainsider · 11 t · 15 pallets',
    paymentTermDays: 14,
    decideMin: 1_440,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Rue du Port 48, 1000 Brussels',
      contact: '+32 2 555 01 48',
      note: 'Dock 7 · Ring before entering',
    },
    deliverySite: {
      address: 'Havenweg 30, 1041 Amsterdam',
      contact: '+31 20 488 12 34',
      note: 'Gate E · Bay 5',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Side loading · 15 pallets' },
    ],
  },
  {
    id: 'lille-paris',
    company: 'Flandre Express',
    rating: 4.8,
    rate: 520,
    km: 225,
    pickupKm: 8,
    pickupMin: 12,
    from: 'Lille',
    to: 'Paris',
    pickupOffsetMin: 1_620,
    deliveryOffsetMin: 1_800,
    pickupDurationMin: 60,
    deliveryDurationMin: 60,
    vehicle: 'Van · 3.5 t · 6 pallets',
    paymentTermDays: 7,
    decideMin: 720,
    payoutMethod: 'IBAN ••4821',
    pickupSite: {
      address: 'Rue des Champs 12, 59000 Lille',
      contact: '+33 3 20 11 22 33',
      note: 'Gate B · Bay 4',
    },
    deliverySite: {
      address: 'Rue de Bercy 77, 75012 Paris',
      contact: '+33 1 44 20 55 66',
      note: 'Gate D · Bay 6 · Call on arrival',
    },
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 6 pallets' },
    ],
  },
];

const BOOT = new Date();
export const V2_LOADS: V2Load[] = SEEDS.map((seed) => makeLoad(seed, BOOT));

/** True once the offer cannot be picked up any more. */
export function isPickupClosed(load: V2Load, now: Date = new Date()): boolean {
  return Date.parse(load.pickupEndsAt) <= now.getTime();
}

/** True when the driver cannot physically reach the pickup before the window closes. */
export function isPickupUnreachable(load: V2Load, now: Date = new Date()): boolean {
  return now.getTime() + load.pickupMin * 60_000 > Date.parse(load.pickupEndsAt);
}

/** True once both approvals are impossible — the application must expire. */
export function isApprovalClosed(load: V2Load, now: Date = new Date()): boolean {
  return Date.parse(load.approvalsAt) <= now.getTime();
}
