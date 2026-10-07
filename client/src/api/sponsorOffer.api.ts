import { api } from "@/lib/api";
import type { CreateSponsorOfferPayload } from "@/types/sponsorOffer.types";

export const createSponsorOffer = async (payload: CreateSponsorOfferPayload) => {
  const res = await api.post("/sponsors/offers", payload);
  return res.data;
};