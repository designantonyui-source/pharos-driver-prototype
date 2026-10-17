/** Unified load data for the driver-facing offer card and its details view. */
export interface UnifiedLoadCard {
  id: string;
  cargo: {
    vehicle: string;
    pickupDay: 'today' | 'tomorrow';
    pickupWindow: string;
  };
  route: {
    origin: string;
    destination: string;
    loadedDistanceKm: number;
    distanceToPickupKm: number;
    minutesToPickup: number;
  };
  price: {
    amount: number;
    currency: 'EUR' | 'PLN';
    amountPerKm: number;
    paymentTerm: string;
  };
  carrier: {
    name: string;
    rating: number;
  };
  application: {
    decisionWindowMinutes: number;
    approvalsDeadline: string;
  };
}

export enum ApplicationStatus {
  SENT = 'SENT',
  DISPATCHER_REVIEW = 'DISPATCHER_REVIEW',
  CUSTOMER_REVIEW = 'CUSTOMER_REVIEW',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}
