export interface Feedback {
  feedback_id: number;
  booking_id: number;
  user_id: number;
  customer_name?: string; // joined in, list view only
  event_type?: string; // joined in, list view only
  rating: number;
  title: string | null;
  comment: string | null;
  is_public: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface CreateFeedbackPayload {
  booking_id: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface FeedbackListParams {
  rating?: number;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface FeedbackListResponse {
  feedback: Feedback[];
  total: number;
}

export interface AdminFeedback {
  feedback_id: number;
  booking_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  is_public: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  customer_name: string;
  booking_ref: string;
  event_type: string;
  event_date: string;
  room_count: number;
}

export interface AdminFeedbackListResponse {
  feedback: AdminFeedback[];
  total: number;
}

export interface FeedbackSummary {
  total: number;
  avg_rating: number;
  star_1: number;
  star_2: number;
  star_3: number;
  star_4: number;
  star_5: number;
  awaiting_reply: number;
  hidden: number;
}

export interface AdminFeedbackQuery {
  rating?: number;
  is_public?: boolean;
  has_reply?: boolean;
  has_rooms?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}
