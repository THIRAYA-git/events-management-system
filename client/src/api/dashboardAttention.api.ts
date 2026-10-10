import { api } from "@/lib/api";
import type { DashboardAttention } from "@/types/dashboardAttention.types";

export const getDashboardAttention = async (): Promise<DashboardAttention> => {
  const { data } = await api.get("/dashboard/attention");
  return data.attention;
};
