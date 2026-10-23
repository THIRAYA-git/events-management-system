export interface Sponsor {
  sponsor_id: number;
  user_id: number;
  company_name: string;
  industry: string;
  website_url: string | null;
  logo_url: string | null;
  budget_range: string | null;
  preferred_events: string | null;
  description: string | null;
  status: "active" | "inactive" | string;
}

export interface SponsorRequest {
  id: number;
  booking_id: number;
  sponsor_id: number;
  proposed_amount: number | null;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  responded_by: number | null;
  responded_at: string | null;
  requested_at: string;
  booking_ref: string;
  event_type: string;
  event_date: string; // YYYY-MM-DD
  event_start_time: string; // HH:MM
  event_end_time: string; // HH:MM
  guest_count: number;
  hall_names: string | null;
  booking_status: string;
  special_requests: string | null;
  customer_name: string;
  payment_status: "unpaid" | "paid";
  paid_at: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  direction: "customer_to_sponsor" | "sponsor_to_customer";
}

export interface SponsorPaymentStatus {
  id: number;
  payment_status: "unpaid" | "paid";
  paid_at: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  amount: number;
}