import { api } from "@/lib/api";

export interface RecentBookingRow {
  booking_id: number;
  booking_ref: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  status: string;
  total_amount: string;
  customer_name: string;
  hall_name: string;
}

interface ListBookingsEnvelope {
  success: boolean;
  data: RecentBookingRow[];
  meta: { total: number; limit: number; offset: number };
}

export const getRecentBookings = async (limit = 5): Promise<RecentBookingRow[]> => {
  const { data } = await api.get<ListBookingsEnvelope>("/bookings", {
    params: { limit, offset: 0 },
  });
  return data.data;
};

// front_desk can't hit /analytics/dashboard (manager/admin only), so status
// counts for their view come from /bookings itself, which they can call —
// one lightweight request per status, reading meta.total off each.
export const getBookingStatusCounts = async (): Promise<Record<string, number>> => {
  const statuses = ["pending", "confirmed", "cancelled", "completed"];
  const results = await Promise.all(
    statuses.map((status) =>
      api.get<ListBookingsEnvelope>("/bookings", { params: { status, limit: 1 } })
    )
  );
  const counts: Record<string, number> = {};
  statuses.forEach((status, i) => {
    counts[status] = results[i].data.meta.total;
  });
  return counts;
};