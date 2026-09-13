import { api } from "@/lib/api";
import type { TimelineActivity, TimelineFormValues } from "@/types/timeline.types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const fetchTimeline = async (bookingId: number) => {
  const { data } = await api.get<ApiEnvelope<TimelineActivity[]>>(
    `/bookings/${bookingId}/timeline`
  );
  return data.data;
};

export const createTimelineActivity = async (
  bookingId: number,
  values: TimelineFormValues
) => {
  const { data } = await api.post<ApiEnvelope<TimelineActivity>>(
    `/bookings/${bookingId}/timeline`,
    {
      activity_name: values.activity_name,
      start_time: values.start_time,
      end_time: values.end_time,
      assigned_to: values.assigned_to || undefined,
      notes: values.notes || undefined,
    }
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
    {
      activity_name: values.activity_name,
      start_time: values.start_time,
      end_time: values.end_time,
      assigned_to: values.assigned_to || undefined,
      notes: values.notes || undefined,
    }
  );
  return data.data;
};

export const deleteTimelineActivity = async (bookingId: number, timelineId: number) => {
  await api.delete(`/bookings/${bookingId}/timeline/${timelineId}`);
};