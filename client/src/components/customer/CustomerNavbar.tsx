import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/common/UserAvatar";
import NotificationBell from "@/components/common/NotificationBell";
import { getSettingsPath, isStaffRole } from "@/utils/navigation";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-gray-100 text-gray-900"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  }`;

const CustomerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStaff = isStaffRole(user?.role);
  const settingsPath = getSettingsPath(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/book", label: "Book a Hall" },
  ...(user?.role === "customer" ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
  ...(isStaff ? [{ to: "/admin", label: "Dashboard" }] : []),
];

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <span className="text-lg font-semibold text-gray-900">Aazath Plaza</span>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={NAV_LINK_CLASS}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && <NotificationBell />}
          <Link
            to={settingsPath}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
            title="Account settings"
          >
            <UserAvatar src={user?.profile_image} name={user?.name} size={32} />
            <span className="font-medium">{user?.name ?? user?.email}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile bell + menu toggle */}
        <div className="flex items-center gap-1 md:hidden">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={NAV_LINK_CLASS}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <Link
              to={settingsPath}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <UserAvatar src={user?.profile_image} name={user?.name} size={28} />
              <span className="font-medium">{user?.name ?? user?.email}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default CustomerNavbar;