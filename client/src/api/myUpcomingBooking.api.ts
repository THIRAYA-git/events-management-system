import { api } from "@/lib/api";

export interface UpcomingBookingSummary {
  booking_id: number;
  booking_ref: string;
  event_date: string;
  event_type: string;
  status: string;
  hall_name: string;
}

interface MyBookingsEnvelope {
  success: boolean;
  data: UpcomingBookingSummary[];
}

export const getMyNextUpcomingBooking = async (): Promise<UpcomingBookingSummary | null> => {
  const { data } = await api.get<MyBookingsEnvelope>("/bookings/mine", {
    params: { limit: 20, offset: 0 },
  });
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.data
    .filter((b) => ["pending", "confirmed"].includes(b.status) && b.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  return upcoming[0] ?? null;
};