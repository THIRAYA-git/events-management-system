import { api } from "@/lib/api";
import type {
  DashboardAnalytics,
  DashboardAnalyticsParams,
} from "@/types/analytics.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const getDashboardAnalytics = async (
  params: DashboardAnalyticsParams = {}
): Promise<DashboardAnalytics> => {
  const { data } = await api.get<ApiEnvelope<DashboardAnalytics>>(
    "/analytics/dashboard",
    { params }
  );
  return data.data;
};