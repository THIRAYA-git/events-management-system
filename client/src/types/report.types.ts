export type ReportPeriod = "daily" | "weekly" | "monthly" | "annual";

export interface ReportSummary {
  total_bookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total_guests: number;
  total_revenue: number;
  hall_revenue: number;
  room_revenue: number;
  addon_other_revenue: number;
  tax_total: number;
  discount_total: number;
  rooms_booked: number;
  previous_revenue: number;
  previous_bookings: number;
  revenue_change_pct: number | null;
}

export interface ReportEventTypeRow {
  event_type: string;
  bookings: number;
  guests: number;
  revenue: number;
}

export interface ReportHallRow {
  hall_id: number;
  hall_name: string;
  booking_count: number;
  complimentary_count: number;
}

export interface ReportRoomRow {
  event_type: string;
  total_rooms: number;
  bookings_with_rooms: number;
  revenue: number;
}

export interface ReportRooms {
  total_rooms: number;
  bookings_with_rooms: number;
  revenue: number;
  rate_per_day: number;
  by_event_type: ReportRoomRow[];
}

export interface ReportBreakdownRow {
  bucket: string; // YYYY-MM-DD (first day of the day/month bucket)
  total_bookings: number;
  confirmed_bookings: number;
  revenue: number;
}

export interface ReportBookingRow {
  booking_id: number;
  booking_ref: string;
  customer_name: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  room_count: number;
  status: string;
  total_amount: string;
  halls: string;
}

export interface Report {
  period: ReportPeriod;
  range: { from: string; to: string };
  previous_range: { from: string; to: string };
  summary: ReportSummary;
  by_event_type: ReportEventTypeRow[];
  by_hall: ReportHallRow[];
  rooms: ReportRooms;
  breakdown: ReportBreakdownRow[];
  bookings: ReportBookingRow[];
  bookings_truncated: boolean;
}