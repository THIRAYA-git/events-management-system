import { api } from "@/lib/api";
import type { CreateOrganizerPayload, CreateSponsorPayload } from "@/types/partner.types";

export const createOrganizerAccount = async (payload: CreateOrganizerPayload) => {
  const { data } = await api.post("/partner-accounts/organizers", payload);
  return data as { message: string };
};

export const createSponsorAccount = async (payload: CreateSponsorPayload) => {
  const { data } = await api.post("/partner-accounts/sponsors", payload);
  return data as { message: string };
};