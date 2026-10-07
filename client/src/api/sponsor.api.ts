import { api } from "@/lib/api";
import type { Sponsor, SponsorRequest } from "@/types/sponsor.types";
import type { SponsorOffer } from "@/types/sponsorOffer.types";


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

export const respondToSponsorOffer = async (
  requestId: number,
  action: "accepted" | "rejected"
): Promise<SponsorRequest> => {
  const { data } = await api.patch(`/sponsors/offers/${requestId}/respond`, { action });
  return data.sponsorRequest;
};

export const getMyReceivedOffers = async (): Promise<SponsorOffer[]> => {
  const { data } = await api.get("/sponsors/offers/mine");
  return data.sponsorOffers;
};

export const uploadMySponsorLogo = async (file: File): Promise<Sponsor> => {
  const formData = new FormData();
  formData.append("logo", file); // field name must be "logo" (matches singleImage("logo"))
  const { data } = await api.patch("/sponsors/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.sponsor;
};