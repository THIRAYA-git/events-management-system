import { api } from "@/lib/api";
import type { Hall } from "@/types/hall.types";

export const getAllHalls = async (): Promise<Hall[]> => {
  const { data } = await api.get("/halls");
  return data.data;
};

export interface CalendarAvailability {
  total_halls: number;
  dates: { date: string; booked_halls: number }[];
}

export const getCalendarAvailability = async (
  from: string,
  to: string
): Promise<CalendarAvailability> => {
  const { data } = await api.get("/halls/calendar", { params: { from, to } });
  return data.data;
};
