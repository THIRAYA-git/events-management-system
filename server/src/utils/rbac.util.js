// ─────────────────────────────────────────────────────────────
//  server/src/utils/rbac.util.js
//  NEW FILE — permissions for all 7 roles in your user_role enum
//  Roles: customer | front_desk | manager | admin |
//         organizer | sponsor | restaurant
// ─────────────────────────────────────────────────────────────
const PERMISSIONS = {
  // ── Bookings ──────────────────────────────────────────────
  "booking:create": ["admin", "manager", "front_desk", "customer"],
  "booking:read_own": ["admin", "manager", "front_desk", "customer"],
  "booking:read_all": ["admin", "manager", "front_desk"],
  "booking:update": ["admin", "manager", "front_desk"],
  "booking:delete": ["admin", "manager"],
  "booking:approve": ["admin", "manager"],
  "booking:cancel": ["admin", "manager", "front_desk"],
  "booking:read_upcoming": ["sponsor"],

  // ── Packages ──────────────────────────────────────────────
  "package:create": ["admin"],
  "package:read": [
    "admin",
    "manager",
    "front_desk",
    "customer",
    "organizer",
    "sponsor",
    "restaurant",
  ],
  "package:update": ["admin", "manager"],
  "package:delete": ["admin"],

  // ── Payments ──────────────────────────────────────────────
  "payment:create": ["admin", "manager", "front_desk", "customer"],
  "payment:read_own": ["admin", "manager", "front_desk", "customer"],
  "payment:read_all": ["admin", "manager"],
  "payment:refund": ["admin"],

  // ── Menu items ────────────────────────────────────────────
  "menu:create": ["admin", "restaurant"],
  "menu:read": ["admin", "manager", "front_desk", "customer", "restaurant"],
  "menu:update": ["admin", "restaurant"],
  "menu:delete": ["admin"],

  // ── Catering orders ───────────────────────────────────────
  "catering:create": [
    "admin",
    "manager",
    "front_desk",
    "customer",
    "restaurant",
  ],
  "catering:read": ["admin", "manager", "front_desk", "restaurant", "customer"],
  "catering:update": ["restaurant"],

  // ── Organizers ────────────────────────────────────────────
  "organizer:read": ["admin", "manager", "front_desk", "organizer"],
  "organizer:manage": ["admin", "manager"],
  "organizer:update_own": ["organizer"],

  // ── Sponsors ──────────────────────────────────────────────
  "sponsor:read": ["admin", "manager", "sponsor", "customer"],
  "sponsor:manage": ["admin", "manager"],
  "sponsor:update_own": ["sponsor"],
  "sponsor_offer:create": ["sponsor"],
  "sponsor_offer:respond": ["customer"],
    "sponsor_offer:read_own": ["customer"],

  // ── Event timelines ───────────────────────────────────────
  "timeline:read": ["admin", "manager", "front_desk", "customer", "organizer"],
  "timeline:manage": ["admin", "manager", "front_desk"],

  // ── Feedback ──────────────────────────────────────────────
  "feedback:create": ["customer"],
  "feedback:read": ["admin", "manager"],
  "feedback:manage": ["admin", "manager"],

  // ── Reports ───────────────────────────────────────────────
  "report:read": ["admin", "manager"],
  "report:export": ["admin", "manager"],

  // ── User management ───────────────────────────────────────
  "user:read": ["admin", "manager", "front_desk"],
  "user:manage": ["admin"],

  // ── Staff management (FR-003) ─────────────────────────────
  "staff:read": ["admin"],
  "staff:create": ["admin"],
  "staff:update": ["admin"],
  "staff:deactivate": ["admin"],

  // ── Notifications ─────────────────────────────────────────
  "notification:send": ["admin", "manager", "front_desk"],

  // ── Audit log ─────────────────────────────────────────────
  "audit:view": ["admin"],

  // ── Settings ──────────────────────────────────────────────
  "settings:manage": ["admin"],

  // ── Sponsor Requests ──────────────────────────────────────
  "sponsor_request:create": ["customer"],
  "sponsor_request:read_own": ["sponsor"],
  "sponsor_request:read_all": ["admin", "manager", "front_desk"],
  "sponsor_request:respond": ["admin", "manager", "sponsor"],
  "sponsor_request:withdraw": ["customer"],
};

// Check if a role has a specific permission
const can = (role, permission) =>
  (PERMISSIONS[permission] || []).includes(role);

// Get all permissions for a role (returned in login response)
const getPermissions = (role) =>
  Object.keys(PERMISSIONS).filter((p) => PERMISSIONS[p].includes(role));

module.exports = { can, getPermissions, PERMISSIONS };
