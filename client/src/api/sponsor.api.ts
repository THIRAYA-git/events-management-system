import { api } from "@/lib/api";
import type { Sponsor, SponsorRequest } from "@/types/sponsor.types";

export const getAllSponsors = async (params?: {
  industry?: string;
  status?: string;
}): Promise<Sponsor[]> => {
  const { data } = await api.get("/sponsors", { params });
  return data.sponsors;
};

export const getMySponsorRequests = async (): Promise<SponsorRequest[]> => {
  const { data } = await api.get("/sponsors/my-requests");
  return data.sponsorRequests;
};

export const respondToSponsorRequest = async (
  requestId: number,
  action: "accepted" | "rejected"
): Promise<SponsorRequest> => {
  const { data } = await api.patch(`/sponsors/requests/${requestId}/respond`, { action });
  return data.sponsorRequest;
};

export const getMySponsorProfile = async (): Promise<Sponsor> => {
  const { data } = await api.get("/sponsors/me");
  return data.sponsor;
};