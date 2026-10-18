// ─────────────────────────────────────────────────────────────
//  server/src/utils/rbac.util.js
//  Permissions for all 6 roles in your user_role enum
//  Roles: customer | front_desk | admin |
//         organizer | sponsor | restaurant
// ─────────────────────────────────────────────────────────────
const PERMISSIONS = {
  // ── Bookings ──────────────────────────────────────────────
  "booking:create": ["admin", "front_desk", "customer"],
  "booking:read_own": ["admin", "front_desk", "customer"],
  "booking:read_all": ["admin", "front_desk"],
  "booking:update": ["admin", "front_desk"],
  "booking:delete": ["admin"],
  "booking:approve": ["admin"],
  "booking:cancel": ["admin", "front_desk"],
  "booking:read_upcoming": ["sponsor"],

  // ── Packages ──────────────────────────────────────────────
  "package:create": ["admin"],
  "package:read": [
    "admin",
    "front_desk",
    "customer",
    "organizer",
    "sponsor",
    "restaurant",
  ],
  "package:update": ["admin"],
  "package:delete": ["admin"],

  // ── Payments ──────────────────────────────────────────────
  "payment:create": ["admin", "front_desk", "customer"],
  "payment:read_own": ["admin", "front_desk", "customer"],
  "payment:read_all": ["admin"],
  "payment:refund": ["admin"],

  // ── Menu items ────────────────────────────────────────────
  "menu:create": ["admin", "restaurant"],
  "menu:read": ["admin", "front_desk", "customer", "restaurant"],
  "menu:update": ["admin", "restaurant"],
  "menu:delete": ["admin"],

  // ── Catering orders ───────────────────────────────────────
  "catering:create": [
    "admin",
    "front_desk",
    "customer",
    "restaurant",
  ],
  "catering:read": ["admin", "front_desk", "restaurant", "customer"],
  "catering:update": ["restaurant"],

  // ── Organizers ────────────────────────────────────────────
  "organizer:read": ["admin", "front_desk", "organizer"],
  "organizer:manage": ["admin"],
  "organizer:update_own": ["organizer"],
  "organizer:respond": ["organizer"],
  "organizer:read_own_bookings": ["customer"],
  "organizer:browse": ["customer"],
  "organizer:assign_own": ["customer"],

  // ── Sponsors ──────────────────────────────────────────────
  "sponsor:read": ["admin", "sponsor", "customer"],
  "sponsor:manage": ["admin"],
  "sponsor:update_own": ["sponsor"],
  "sponsor_offer:create": ["sponsor"],
  "sponsor_offer:respond": ["customer"],
  "sponsor_offer:read_own": ["customer"],

  // ── Event timelines ───────────────────────────────────────
  "timeline:read": ["admin", "front_desk", "customer", "organizer"],
  "timeline:manage": ["admin", "front_desk"],

  // ── Feedback ──────────────────────────────────────────────
  "feedback:create": ["customer"],
  "feedback:read": ["admin"],
  "feedback:manage": ["admin"],

  // ── Reports ───────────────────────────────────────────────
  "report:read": ["admin"],
  "report:export": ["admin"],

  // ── User management ───────────────────────────────────────
  "user:read": ["admin", "front_desk"],
  "user:manage": ["admin"],

  // ── Staff management (FR-003) ─────────────────────────────
  "staff:read": ["admin"],
  "staff:create": ["admin"],
  "staff:update": ["admin"],
  "staff:deactivate": ["admin"],

  // ── Notifications ─────────────────────────────────────────
  "notification:send": ["admin", "front_desk"],

  // ── Admin dashboard ───────────────────────────────────────
  "dashboard:attention": ["admin", "front_desk"],

  // ── Audit log ─────────────────────────────────────────────
  "audit:view": ["admin"],

  // ── Settings ──────────────────────────────────────────────
  "settings:manage": ["admin"],

  // ── Sponsor Requests ──────────────────────────────────────
  "sponsor_request:create": ["customer"],
  "sponsor_request:read_own": ["sponsor"],
  "sponsor_request:read_all": ["admin", "front_desk"],
  "sponsor_request:respond": ["admin", "sponsor"],
  "sponsor_request:withdraw": ["customer"],

    // ── Room reservations (FR-009) ────────────────────────────
  "room:browse": ["admin", "front_desk", "customer"],
  "room:create": ["customer"],
  "room:read_own": ["customer"],
  "room:cancel_own": ["customer"],
  "room:read_all": ["admin", "front_desk"],
  "room:manage": ["admin", "front_desk"],
};

// Check if a role has a specific permission
const can = (role, permission) =>
  (PERMISSIONS[permission] || []).includes(role);

// Get all permissions for a role (returned in login response)
const getPermissions = (role) =>
  Object.keys(PERMISSIONS).filter((p) => PERMISSIONS[p].includes(role));

module.exports = { can, getPermissions, PERMISSIONS };
