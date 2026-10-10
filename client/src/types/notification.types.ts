export type NotificationType =
  | "booking_confirmation"
  | "payment_receipt"
  | "event_reminder"
  | "catering_update"
  | "cancellation"
  | "general";

export interface AppNotification {
  notification_id: number;
  type: NotificationType;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  booking_id: number | null;
  booking_ref: string | null;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
