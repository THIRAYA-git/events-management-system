import { api } from "@/lib/api";
import type { PublicFeedback } from "@/types/publicFeedback.types";

export const getPublicFeedback = async (limit = 6): Promise<PublicFeedback[]> => {
  const { data } = await api.get("/feedback/public", { params: { limit } });
  return data.feedback;
};