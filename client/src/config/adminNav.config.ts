import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  HandshakeIcon,
  UtensilsCrossed,
  Settings,
} from "lucide-react";

export type AdminRole = "front_desk" | "manager" | "admin";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: AdminRole[];
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    roles: ["front_desk", "manager", "admin"],
  },
  {
    label: "Bookings",
    path: "/admin/bookings",
    icon: CalendarCheck,
    roles: ["front_desk", "manager", "admin"],
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
    roles: ["front_desk", "manager", "admin"],
  },
  {
    label: "Organizers & Sponsors",
    path: "/admin/organizers-sponsors",
    icon: HandshakeIcon,
    roles: ["manager", "admin"],
  },
  {
    label: "Catering Orders",
    path: "/admin/catering",
    icon: UtensilsCrossed,
    roles: ["manager", "admin"],
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
    roles: ["manager", "admin"],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
    roles: ["front_desk", "manager", "admin"],
  },
];