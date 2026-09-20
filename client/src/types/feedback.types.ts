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