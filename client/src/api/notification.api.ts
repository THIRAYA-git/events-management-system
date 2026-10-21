import { api } from "@/lib/api";
import type { NotificationListResponse } from "@/types/notification.types";

export const listNotifications = async (
  limit = 20
): Promise<NotificationListResponse> => {
  const { data } = await api.get("/notifications", { params: { limit } });
  return data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};

export const clearNotifications = () => api.delete("/notifications");
