import { api } from "@/lib/api";
import type { Hall } from "@/types/hall.types";

export const getAllHalls = async (): Promise<Hall[]> => {
  const { data } = await api.get("/halls");
  return data.data;
};