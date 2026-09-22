export type UserRole =
  | "customer"
  | "front_desk"
  | "manager"
  | "admin"
  | "sponsor"
  | "organizer"
  | "restaurant";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_verified?: boolean;
  profile_image?: string | null;
  last_login?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  permissions: string[];
}

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
  booking_count: number;
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