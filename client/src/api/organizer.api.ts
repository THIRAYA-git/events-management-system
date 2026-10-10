import { api } from "@/lib/api";
import type {
  Organizer,
  BookingOrganizerAssignment,
  AssignOrganizerPayload,
  OrganizerAssignment,
  RespondAction,
  CustomerBookingOrganizer,
  BrowseOrganizer,
  CustomerAssignmentResult,
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
  const { data } = await api.get(`/bookings/${bookingId}/organizers`);
  return data.organizers;
};

export const assignOrganizerToBooking = async (
  bookingId: number,
  payload: AssignOrganizerPayload
): Promise<BookingOrganizerAssignment> => {
  const { data } = await api.post(`/bookings/${bookingId}/organizers`, payload);
  return data.assignment;
};

export const getMyOrganizerProfile = async (): Promise<Organizer> => {
  const { data } = await api.get("/organizers/me");
  return data.organizer;
};

export const getMyBookingAssignments = async (): Promise<OrganizerAssignment[]> => {
  const { data } = await api.get("/organizers/my-assignments");
  return data.assignments;
};

export const respondToAssignment = async (
  assignmentId: number,
  action: RespondAction,
  reason?: string
): Promise<OrganizerAssignment> => {
  const { data } = await api.patch(
    `/organizers/my-assignments/${assignmentId}/respond`,
    { action, reason }
  );
  return data.assignment;
};

/** Customer: organizers assigned to my own bookings */
export const getMyBookingOrganizers = async (): Promise<CustomerBookingOrganizer[]> => {
  const { data } = await api.get("/organizers/my-booking-organizers");
  return data.organizers;
};

/** Customer: available organizers to choose from */
export const browseOrganizers = async (): Promise<BrowseOrganizer[]> => {
  const { data } = await api.get("/organizers/browse");
  return data.organizers;
};

/** Customer: assign an organizer to one of my own bookings */
export const assignOrganizerToMyBooking = async (
  bookingId: number,
  payload: { organizerId: number; notes?: string }
): Promise<CustomerAssignmentResult> => {
  const { data } = await api.post(`/organizers/my-bookings/${bookingId}/assign`, payload);
  return data.assignment;
};

export const updateMyOrganizerProfile = async (
  payload: Partial<
    Pick<
      Organizer,
      | "business_name"
      | "specialty"
      | "portfolio_url"
      | "bio"
      | "service_areas"
      | "price_range"
      | "is_available"
    >
  >
): Promise<Organizer> => {
  const { data } = await api.patch("/organizers/me", payload);
  return data.organizer;
};
