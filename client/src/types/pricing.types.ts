export interface EventPricing {
  eventType: string;
  basePrice: number;
  bothHallsPrice: number | null;
  description: string | null;
  isActive: boolean;
}

export interface UpdateEventPricingPayload {
  base_price: number;
  both_halls_price: number | null;
  description: string | null;
  is_active: boolean;
}
