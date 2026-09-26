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
  event_date: string;
  customer_name: string;
}