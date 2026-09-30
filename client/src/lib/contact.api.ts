import { api } from "@/lib/api";

export const CONTACT_TOPICS = [
  "Booking enquiry",
  "Catering",
  "Accommodation",
  "Event organizers and sponsors",
  "Payment or invoice",
  "Other",
] as const;

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: (typeof CONTACT_TOPICS)[number];
  message: string;
}

export const sendContactMessage = async (payload: ContactPayload) => {
  await api.post("/contact", payload);
};