import { api } from "@/lib/api";
import type {
  AdminCustomer,
  ListUsersParams,
  ListUsersResponse,
} from "@/types/user.types";

export const listUsers = async (
  params: ListUsersParams = {}
): Promise<ListUsersResponse> => {
  const { data } = await api.get<ListUsersResponse>("/users", { params });
  return data;
};

export const getUser = async (userId: number): Promise<AdminCustomer> => {
  const { data } = await api.get<{ user: AdminCustomer }>(`/users/${userId}`);
  return data.user;
};