import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  Search,
  HandshakeIcon,
  UtensilsCrossed,
  ClipboardList,
  ClipboardCheck,
  Settings,
} from "lucide-react";

export type PartnerRole = "organizer" | "sponsor" | "restaurant";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const partnerNavByRole: Record<PartnerRole, NavItem[]> = {
  organizer: [
    { label: "Dashboard", path: "/organizer", icon: LayoutDashboard },
    { label: "Event Requests", path: "/organizer/requests", icon: CalendarCheck },
    { label: "Manage Confirmed Events", path: "/organizer/events", icon: ClipboardCheck },
    { label: "My Portfolio", path: "/organizer/portfolio", icon: Briefcase },
    { label: "Settings", path: "/organizer/settings", icon: Settings },
  ],
  sponsor: [
    { label: "Dashboard", path: "/sponsor", icon: LayoutDashboard },
    { label: "Browse Events", path: "/sponsor/events", icon: Search },
    { label: "My Sponsorships", path: "/sponsor/sponsorships", icon: HandshakeIcon },
    { label: "Settings", path: "/sponsor/settings", icon: Settings },
  ],
  restaurant: [
    { label: "Dashboard", path: "/restaurant", icon: LayoutDashboard },
    { label: "Menu Items", path: "/restaurant/menu", icon: UtensilsCrossed },
    { label: "Catering Orders", path: "/restaurant/orders", icon: ClipboardList },
    { label: "Settings", path: "/restaurant/settings", icon: Settings },
  ],
};