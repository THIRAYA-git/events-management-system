import { api } from "@/lib/api";
import type { AuthUser } from "@/types/auth.types";

export const updateProfile = async (payload: {
  full_name: string;
  phone?: string | null;
}): Promise<AuthUser> => {
  const { data } = await api.patch("/auth/me", payload);
  return data.user;
};

export const changePassword = async (payload: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> => {
  const { data } = await api.patch("/auth/me/password", payload);
  return data;
};