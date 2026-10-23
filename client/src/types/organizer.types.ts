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
  status: string; // "assigned" | "confirmed" | "in_progress" | "completed" | "declined"
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
  status: string; // "assigned" | "confirmed" | "in_progress" | "completed" | "declined"
  notes: string | null;
  assigned_at: string;
  booking_ref: string;
  event_type: string;
  event_date: string;
  customer_name: string;
  guest_count?: number;
  decline_reason?: string | null;
  responded_at?: string | null;
}

export type RespondAction = "accept" | "decline";

/** Organizer as shown to the customer on their own booking */
export interface CustomerBookingOrganizer {
  id: number;
  booking_id: number;
  role_in_event: string | null;
  status: string; // "assigned" | "confirmed" | "in_progress" | "completed"
  business_name: string;
  specialty: string;
  avg_rating: string | number | null;
  portfolio_url: string | null;
}

/** Organizer profile as shown to customers when picking one (no user id) */
export type BrowseOrganizer = Omit<Organizer, "user_id" | "avg_rating"> & {
  avg_rating: string | number | null; // numeric column comes back as string from pg
};

export interface CustomerAssignmentResult {
  id: number;
  booking_id: number;
  organizer_id: number;
  role_in_event: string | null;
  status: string;
  assigned_at: string;
}

export type ProgressStatus = "in_progress" | "completed";

export type ChecklistCategory = "decoration" | "seating" | "equipment" | "other";

export interface ChecklistItem {
  item_id: number;
  category: ChecklistCategory;
  item_name: string;
  is_done: boolean;
  done_at: string | null;
}

export interface AssignmentDetail {
  assignment: {
    id: number;
    booking_id: number;
    role_in_event: string | null;
    agreed_fee: string;
    notes: string | null;
    status: string;
    assigned_at: string;
  };
  booking: {
    booking_ref: string;
    event_type: string;
    event_date: string;
    event_start_time: string;
    event_end_time: string;
    guest_count: number;
    room_count: number;
    special_requests: string | null;
    status: string;
    customer_name: string;
    customer_phone: string | null; // only after the organizer accepts
  };
  halls: { hall_id: number; hall_name: string; capacity: number }[];
  catering: {
    order_id: number;
    status: string;
    guest_count: number;
    delivery_time: string | null;
    special_notes: string | null;
    menu_items: { item_name: string; quantity: number }[];
  }[];
  sponsors: { company_name: string; industry: string | null; proposed_amount: string | null }[];
  timeline: {
    timeline_id: number;
    activity_name: string;
    category: string;
    start_time: string;
    end_time: string;
    assigned_to: string | null;
    notes: string | null;
  }[];
  checklist: ChecklistItem[];
  canEditChecklist: boolean;
}
