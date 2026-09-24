export const STAFF_ROLES = ["front_desk", "manager", "admin"] as const;
export const PARTNER_ROLES = ["organizer", "sponsor", "restaurant"] as const;

export const isStaffRole = (role?: string | null): boolean =>
  !!role && (STAFF_ROLES as readonly string[]).includes(role);

export const isPartnerRole = (role?: string | null): boolean =>
  !!role && (PARTNER_ROLES as readonly string[]).includes(role);

// Where each role lands (also use this for the post-login redirect)
export const getHomePath = (role?: string | null): string => {
  if (isStaffRole(role)) return "/admin";
  if (isPartnerRole(role)) return `/${role}`;
  return "/";
};

// Each layout keeps its own sidebar, so settings lives inside it
export const getSettingsPath = (role?: string | null): string => {
  if (isStaffRole(role)) return "/admin/settings";
  if (isPartnerRole(role)) return `/${role}/settings`;
  return "/settings";
};