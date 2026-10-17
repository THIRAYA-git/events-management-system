import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCog,
  Settings,
  CalendarClock,
  MessageSquare,
  FileText,
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
    label: "Schedule Event",
    path: "/admin/schedule",
    icon: CalendarClock,
    roles: ["admin", "manager", "front_desk"],
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
    roles: ["front_desk", "manager", "admin"],
  },
  {
    label: "Feedback",
    path: "/admin/feedback",
    icon: MessageSquare,
    roles: ["admin", "manager"],
  },
  {
    label: "Manage Staffs",
    path: "/admin/staff",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
    roles: ["front_desk", "manager", "admin"],
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: FileText,
    roles: ["manager", "admin"],
  },
];
