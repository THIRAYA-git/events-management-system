import type { UserRole } from "@/types/auth.types";

export interface AdminCustomer {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  profile_image: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
  booking_count?: number;
}

export interface ListUsersParams {
  role?: UserRole;
  page?: number;
  limit?: number;
}

export interface ListUsersResponse {
  users: AdminCustomer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}