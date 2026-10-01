import { api } from "@/lib/api";
import type {
  StaffListResponse,
  StaffFilters,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffMutationResponse,
} from "@/types/staff.types";

export const fetchStaff = async (filters: StaffFilters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );
  const { data } = await api.get<StaffListResponse>("/staff", { params });
  return data;
};

export const createStaff = async (payload: CreateStaffPayload) => {
  const { data } = await api.post<StaffMutationResponse>("/staff", payload);
  return data;
};

export const updateStaff = async (id: number, payload: UpdateStaffPayload) => {
  const { data } = await api.patch<StaffMutationResponse>(`/staff/${id}`, payload);
  return data;
};

export const setStaffStatus = async (id: number, is_active: boolean) => {
  const { data } = await api.patch<StaffMutationResponse>(`/staff/${id}/status`, {
    is_active,
  });
  return data;
};

export const unlockStaff = async (id: number) => {
  const { data } = await api.patch<StaffMutationResponse>(`/staff/${id}/unlock`);
  return data;
};