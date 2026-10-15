/**
 * Driver v2 — mock load feed. Only `src/lib/api.ts` imports this; screens go through the api.
 * Epic: pharos-driver-flow-stories.md (S2 details-v2 data, S8 two deadlines).
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
  perKm: number;
  km: number;
  from: string;
  to: string;
  day: 'today' | 'tomorrow';
  window: string;
  pickupTime?: string;
  onRoute?: boolean;
  deliveryDay: 'today' | 'tomorrow';
  deliveryWindow: string;
  pickupKm: number;
  pickupMin: number;
  vehicle: string;
  paidIn: string;
  /** minutes the driver has to decide (S8: the main urgency) */
  decideMin: number;
  /** shared approvals deadline (S8: second deadline) */
  approvalsBy: string;
  /** Prototype trip-site details (address, contact, gate note). */
  pickupSite: TripSite;
  deliverySite: TripSite;
  /** Concrete payout date for the trip summary (mock). */
  payoutDate: string;
  /** Payout destination label (mock). */
  payoutMethod: string;
  /** Trip documents attached to the load (mock). */
  documents: { id: string; name: string; detail: string }[];
};

export function pickupTimestamp(day: V2Load['day'], window: string): string {
  const date = new Date();
  if (day === 'tomorrow') date.setDate(date.getDate() + 1);
  const [hours, minutes] = window.split('–')[0].split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const V2_LOADS: V2Load[] = [
  {
    id: 'nordcargo',
    company: 'NordCargo',
    rating: 4.8,
    rate: 360,
    perKm: 3.24,
    km: 111,
    from: 'Lille',
    to: 'Brussels',
    day: 'today',
    window: '14:00–15:00',
    pickupTime: pickupTimestamp('today', '14:00–15:00'),
    deliveryDay: 'today',
    deliveryWindow: '17:00–18:00',
    pickupKm: 18,
    pickupMin: 25,
    vehicle: 'Curtainsider · 12.4 t · 18 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 80,
    approvalsBy: '11:00',
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
    payoutDate: '22 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 18 pallets' },
    ],
  },
  {
    id: 'belroute',
    company: 'BelRoute',
    rating: 4.6,
    rate: 210,
    perKm: 3.1,
    km: 68,
    from: 'Ghent',
    to: 'Antwerp',
    day: 'today',
    window: '16:00–17:00',
    pickupTime: pickupTimestamp('today', '16:00–17:00'),
    deliveryDay: 'today',
    deliveryWindow: '18:00–19:00',
    pickupKm: 42,
    pickupMin: 45,
    vehicle: 'Curtainsider · 10 t · 14 pallets',
    paidIn: 'Paid in 14 days',
    decideMin: 125,
    approvalsBy: '12:30',
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
    payoutDate: '29 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Side loading · 14 pallets' },
    ],
  },
  {
    id: 'calais-lille',
    company: 'Côte Fret',
    rating: 4.9,
    rate: 290,
    perKm: 2.85,
    km: 102,
    from: 'Calais',
    to: 'Lille',
    day: 'tomorrow',
    window: '08:00–09:00',
    pickupTime: pickupTimestamp('tomorrow', '08:00–09:00'),
    deliveryDay: 'tomorrow',
    deliveryWindow: '11:00–12:00',
    pickupKm: 64,
    pickupMin: 55,
    vehicle: 'Curtainsider · 12 t · 16 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 600,
    approvalsBy: 'tomorrow 06:00',
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
    payoutDate: '23 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 16 pallets' },
    ],
  },
  {
    id: 'paris-brussels',
    company: 'Seine Freight',
    rating: 4.7,
    rate: 420,
    perKm: 3.35,
    km: 125,
    from: 'Paris',
    to: 'Brussels',
    day: 'today',
    window: '10:00–11:00',
    pickupTime: pickupTimestamp('today', '10:00–11:00'),
    deliveryDay: 'today',
    deliveryWindow: '14:00–15:00',
    pickupKm: 12,
    pickupMin: 15,
    vehicle: 'Box · 8 t · 10 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 90,
    approvalsBy: '09:00',
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
    payoutDate: '22 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 10 pallets' },
    ],
  },
  {
    id: 'brussels-amsterdam',
    company: 'Lowlands Haul',
    rating: 4.5,
    rate: 380,
    perKm: 2.95,
    km: 129,
    from: 'Brussels',
    to: 'Amsterdam',
    day: 'tomorrow',
    window: '09:00–10:00',
    pickupTime: pickupTimestamp('tomorrow', '09:00–10:00'),
    deliveryDay: 'tomorrow',
    deliveryWindow: '13:00–14:00',
    pickupKm: 22,
    pickupMin: 30,
    vehicle: 'Curtainsider · 11 t · 15 pallets',
    paidIn: 'Paid in 14 days',
    decideMin: 300,
    approvalsBy: 'tomorrow 07:00',
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
    payoutDate: '30 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Side loading · 15 pallets' },
    ],
  },
  {
    id: 'lille-paris',
    company: 'Flandre Express',
    rating: 4.8,
    rate: 310,
    perKm: 3.05,
    km: 102,
    from: 'Lille',
    to: 'Paris',
    day: 'today',
    window: '18:00–19:00',
    pickupTime: pickupTimestamp('today', '18:00–19:00'),
    deliveryDay: 'today',
    deliveryWindow: '21:00–22:00',
    pickupKm: 8,
    pickupMin: 12,
    vehicle: 'Van · 3.5 t · 6 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 60,
    approvalsBy: '16:00',
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
    payoutDate: '22 Oct',
    payoutMethod: 'IBAN ••4821',
    documents: [
      { id: 'cmr', name: 'CMR consignment note', detail: 'Prefilled · Sign at pickup' },
      { id: 'instructions', name: 'Loading instructions', detail: 'Rear loading · 6 pallets' },
    ],
  },
];
