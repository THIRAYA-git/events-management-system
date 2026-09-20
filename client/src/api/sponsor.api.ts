import { api } from "@/lib/api";
import type { Sponsor } from "@/types/sponsor.types";

export const getAllSponsors = async (params?: {
  industry?: string;
  status?: string;
}): Promise<Sponsor[]> => {
  const { data } = await api.get("/sponsors", { params });
  return data.sponsors;
};