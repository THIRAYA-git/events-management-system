export type StaffRole = "admin" | "manager" | "front_desk";

export interface StaffMember {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  is_active: boolean;
  is_verified: boolean;
  login_attempts: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
}

export interface StaffListResponse {
  staff: StaffMember[];
  summary: { activeStaff: number; limit: number };
}

export interface StaffFilters {
  search?: string;
  role?: StaffRole | "";
  status?: "active" | "inactive" | "";
}

export interface CreateStaffPayload {
  full_name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  password: string;
}

export interface UpdateStaffPayload {
  full_name?: string;
  phone?: string;
  role?: StaffRole;
}

export interface StaffMutationResponse {
  message: string;
  user: StaffMember;
  warning?: string;
}