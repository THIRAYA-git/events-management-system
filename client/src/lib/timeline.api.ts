import { api } from "@/lib/api";
import type {
  TimelineActivity,
  TimelineBookingSummary,
  TimelineFormValues,
} from "@/types/timeline.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface TimelineListResponse extends ApiEnvelope<TimelineActivity[]> {
  meta: { booking: TimelineBookingSummary };
}

// null (not undefined) so clearing a field on edit actually clears it server-side
const toPayload = (values: TimelineFormValues) => ({
  activity_name: values.activity_name.trim(),
  category: values.category,
  hall_id: values.hall_id ? Number(values.hall_id) : null,
  start_time: values.start_time,
  end_time: values.end_time,
  assigned_to: values.assigned_to.trim() || null,
  notes: values.notes.trim() || null,
});

export const fetchTimeline = async (bookingId: number) => {
  const { data } = await api.get<TimelineListResponse>(
    `/bookings/${bookingId}/timeline`
  );
  return { activities: data.data, booking: data.meta.booking };
};

export const createTimelineActivity = async (
  bookingId: number,
  values: TimelineFormValues
) => {
  const { data } = await api.post<ApiEnvelope<TimelineActivity>>(
    `/bookings/${bookingId}/timeline`,
    toPayload(values)
  );
  return data.data;
};

export const updateTimelineActivity = async (
  bookingId: number,
  timelineId: number,
  values: TimelineFormValues
) => {
  const { data } = await api.patch<ApiEnvelope<TimelineActivity>>(
    `/bookings/${bookingId}/timeline/${timelineId}`,
    toPayload(values)
  );
  return data.data;
};

export const deleteTimelineActivity = async (
  bookingId: number,
  timelineId: number
) => {
  await api.delete(`/bookings/${bookingId}/timeline/${timelineId}`);
};