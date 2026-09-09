export interface Hall {
  hall_id: number;
  hall_name: string;
  floor_number: number;
  capacity: number;
  base_price: number;
  amenities?: string[];
  image_url?: string | null;
}

export interface AvailableHallsResponse {
  eventDate: string;
  startTime: string;
  endTime: string;
  bufferMinutes: number;
  totalAvailable: number;
  totalUnavailable: number;
  available: Hall[];
  unavailable: Hall[];
}

export interface EventPricingOption {
  eventType: string;
  basePrice: number;
  description: string | null;
  isActive: boolean;
}

export interface PriceCalculation {
  eventType: string;
  baseAmount: number;
  roomCount: number;
  roomCost: number;
  addonAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateBookingPayload {
  hall_id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  guest_count: number;
  room_count?: number;
  extra_addons?: number;
  discount_amount?: number;
  tax_amount?: number;
  special_requests?: string;
}

export interface BookingResult {
  bookingId: number;
  bookingRef: string;
  hallBookingId: number;
  hallId: number;
  hallName: string;
  status: string;
  eventType: string;
  guestCount: number;
  pricing: PriceCalculation;
}

export interface SlotSelection {
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
}