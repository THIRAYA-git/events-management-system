import { api } from "@/lib/api";
import type { EventPricing, UpdateEventPricingPayload } from "@/types/pricing.types";

export const listAllEventPricing = async (): Promise<EventPricing[]> =>
  (await api.get("/pricing/event-types", { params: { include_inactive: true } })).data.data;

export const updateEventPricing = async (
  eventType: string,
  payload: UpdateEventPricingPayload
): Promise<EventPricing> =>
  (await api.put(`/pricing/event-types/${encodeURIComponent(eventType)}`, payload)).data.data;
