import { api } from "@/lib/api";import type {
  Organizer,
  BookingOrganizerAssignment,
  AssignOrganizerPayload,
} from "@/types/organizer.types";

export const getAllOrganizers = async (params?: {
  specialty?: string;
  isAvailable?: boolean;
}): Promise<Organizer[]> => {
  const { data } = await api.get("/organizers", { params });
  return data.organizers;
};

export const getOrganizersForBooking = async (
  bookingId: number
): Promise<BookingOrganizerAssignment[]> => {
  const { data } = await api.get(
    `/bookings/${bookingId}/organizers`
  );
  return data.organizers;
};

export const assignOrganizerToBooking = async (
  bookingId: number,
  payload: AssignOrganizerPayload
): Promise<BookingOrganizerAssignment> => {
  const { data } = await api.post(
    `/bookings/${bookingId}/organizers`,
    payload
  );
  return data.assignment;
};