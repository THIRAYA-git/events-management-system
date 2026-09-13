import { api } from "@/lib/api";
import type {
  AvailableHallsResponse,
  EventPricingOption,
  PriceCalculation,
  CreateBookingPayload,
  BookingResult,
  SlotSelection,
  AdminBooking,
  ListBookingsParams,
  BookingStatus,
} from "@/types/booking.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

// listBookings' response has a `meta` block alongside `data`, unlike the
// other endpoints here — extending ApiEnvelope so callers can still read
// pagination info without breaking the shared envelope shape.
interface PaginatedApiEnvelope<T> extends ApiEnvelope<T> {
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const fetchAvailableHalls = async (slot: SlotSelection) => {
  const { data } = await api.get<ApiEnvelope<AvailableHallsResponse>>("/halls/available", {
    params: {
      event_date: slot.event_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      guest_count: slot.guest_count,
    },
  });
  return data.data;
};

export const fetchEventPricing = async () => {
  const { data } = await api.get<ApiEnvelope<EventPricingOption[]>>("/pricing/event-types");
  return data.data;
};

export const calculatePrice = async (payload: {
  event_type: string;
  room_count?: number;
  extra_addons?: number;
  discount_amount?: number;
  tax_amount?: number;
}) => {
  const { data } = await api.post<ApiEnvelope<PriceCalculation>>("/pricing/calculate", payload);
  return data.data;
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const { data } = await api.post<ApiEnvelope<BookingResult>>("/bookings", payload);
  return data.data;
};

// ── Admin booking management ──────────────────────────────────────────

export const listBookings = async (params: ListBookingsParams = {}) => {
  const { data } = await api.get<PaginatedApiEnvelope<AdminBooking[]>>("/bookings", { params });
  return { bookings: data.data, meta: data.meta };
};

export const updateBookingStatus = async (
  bookingId: number,
  payload: { status: BookingStatus; cancel_reason?: string }
) => {
  const { data } = await api.patch<ApiEnvelope<AdminBooking>>(
    `/bookings/${bookingId}/status`,
    payload
  );
  return data.data;
};