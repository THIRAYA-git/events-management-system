export const TIMELINE_CATEGORIES = [
  "setup",
  "catering",
  "decoration",
  "cleanup",
  "other",
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TimelineCategory, string> = {
  setup: "Setup",
  catering: "Catering",
  decoration: "Decoration",
  cleanup: "Cleanup",
  other: "Other",
};

export interface TimelineActivity {
  timeline_id: number;
  booking_id: number;
  activity_name: string;
  category: TimelineCategory;
  hall_id: number | null;
  hall_name: string | null;
  start_time: string; // "08:00:00"
  end_time: string;
  assigned_to: string | null;
  notes: string | null;
  sequence_order: number;
  created_at: string;
}

export interface TimelineHall {
  hall_id: number;
  hall_name: string;
  is_complimentary: boolean;
}

export interface TimelineBookingSummary {
  booking_id: number;
  booking_ref: string;
  event_date: string; // "2026-11-21"
  event_start_time: string;
  event_end_time: string;
  event_type: string;
  custom_event_type: string | null;
  guest_count: number;
  status: string;
  halls: TimelineHall[];
}

export interface TimelineFormValues {
  activity_name: string;
  category: TimelineCategory;
  hall_id: string; // "" = all halls / whole event
  start_time: string; // HH:MM
  end_time: string;
  assigned_to: string;
  notes: string;
}