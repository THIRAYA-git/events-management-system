export interface RevenueOverTimePoint {
  month: string; // "YYYY-MM"
  revenue: string; // numeric string, per Postgres numeric type
}

export interface RevenueByEventType {
  event_type: string;
  revenue: string;
}

export interface HallUtilization {
  hall_id: number;
  hall_name: string;
  booking_count: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface TopCustomer {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  total_spend: string;
  booking_count: number;
}

export interface DashboardAnalytics {
  revenueOverTime: RevenueOverTimePoint[];
  revenueByEventType: RevenueByEventType[];
  hallUtilization: HallUtilization[];
  statusBreakdown: StatusBreakdown[];
  topCustomers: TopCustomer[];
  accommodationModuleImplemented: boolean;
  roomAccommodationsByEventType: RoomAccommodationByEventType[];
}

export interface DashboardAnalyticsParams {
  date_from?: string;
  date_to?: string;
}

export interface RoomAccommodationByEventType {
  event_type: string;
  total_rooms: number;
  bookings_with_rooms: number;
}