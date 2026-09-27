import { api } from "@/lib/api";
import type { PublicUpcomingBooking } from "@/types/publicEvent.types";

export const getUpcomingConfirmedBookings = async (): Promise<PublicUpcomingBooking[]> => {
  const { data } = await api.get("/bookings/upcoming-public");
  return data.data; // {success, data} envelope, per booking.controller.js's style
};