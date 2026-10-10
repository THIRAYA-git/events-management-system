export interface Organizer {
  organizer_id: number;
  user_id: number;
  business_name: string;
  specialty: string;
  experience_years: number;
  portfolio_url: string | null;
  bio: string | null;
  service_areas: string | null;
  price_range: string | null;
  avg_rating: number | null;
  total_reviews: number;
  is_verified: boolean;
  is_available: boolean;
}

export interface BookingOrganizerAssignment {
  id: number; // was assignment_id
  booking_id: number;
  organizer_id: number;
  business_name: string;
  specialty: string;
  role_in_event: string;
  agreed_fee: string; // numeric column comes back as string from pg
  status: string; // "assigned" | "confirmed" | "completed" | "declined"
  notes: string | null;
  assigned_at: string; // was created_at
  avg_rating?: string;
}

export interface AssignOrganizerPayload {
  organizerId: number;
  roleInEvent: string;
  agreedFee: number;
  notes?: string;
}

export interface OrganizerAssignment {
  id: number;
  booking_id: number;
  organizer_id: number;
  role_in_event: string;
  agreed_fee: string; // numeric column comes back as string from pg
  status: string; // "assigned" | "confirmed" | "completed" | "declined"
  notes: string | null;
  assigned_at: string;
  booking_ref: string;
  event_type: string;
  event_date: string;
  customer_name: string;
  decline_reason?: string | null;
  responded_at?: string | null;
}

export type RespondAction = "accept" | "decline";

/** Organizer as shown to the customer on their own booking */
export interface CustomerBookingOrganizer {
  id: number;
  booking_id: number;
  role_in_event: string | null;
  status: string; // "assigned" | "confirmed" | "completed"
  business_name: string;
  specialty: string;
  avg_rating: string | number | null;
  portfolio_url: string | null;
}
