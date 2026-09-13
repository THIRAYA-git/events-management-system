export interface TimelineActivity {
  timeline_id: number;
  booking_id: number;
  activity_name: string;
  start_time: string; // "08:00:00"
  end_time: string;
  assigned_to: string | null;
  notes: string | null;
  sequence_order: number;
  created_at: string;
}

export interface TimelineFormValues {
  activity_name: string;
  start_time: string; // HH:MM
  end_time: string;
  assigned_to: string;
  notes: string;
}