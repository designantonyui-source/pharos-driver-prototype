/**
 * Driver v2 — mock load feed. Only `src/lib/api.ts` imports this; screens go through the api.
 * Epic: pharos-driver-flow-stories.md (S2 details-v2 data, S8 two deadlines).
 */
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
  pickupKm: number;
  pickupMin: number;
  vehicle: string;
  paidIn: string;
  /** minutes the driver has to decide (S8: the main urgency) */
  decideMin: number;
  /** shared approvals deadline (S8: second deadline) */
  approvalsBy: string;
};

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
    pickupKm: 18,
    pickupMin: 25,
    vehicle: 'Curtainsider · 12.4 t · 18 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 80,
    approvalsBy: '11:00',
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
    pickupKm: 42,
    pickupMin: 45,
    vehicle: 'Curtainsider · 10 t · 14 pallets',
    paidIn: 'Paid in 14 days',
    decideMin: 125,
    approvalsBy: '12:30',
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
    pickupKm: 64,
    pickupMin: 55,
    vehicle: 'Curtainsider · 12 t · 16 pallets',
    paidIn: 'Paid in 7 days',
    decideMin: 600,
    approvalsBy: 'tomorrow 06:00',
  },
];
