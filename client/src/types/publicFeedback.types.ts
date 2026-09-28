export interface PublicFeedback {
  feedback_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  customer_name: string;
  event_type: string;
  created_at: string;
}