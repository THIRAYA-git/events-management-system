import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/common/UserAvatar";
import NotificationBell from "@/components/common/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import { getSettingsPath, isStaffRole } from "@/utils/navigation";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

  const BELL_CLASS =
    "text-muted-foreground hover:bg-muted hover:text-foreground";

  const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];
// const links = [
//   ...(!user ? publicLinks : []),
//   { to: "/book", label: "Book a Hall" },
//   ...(user?.role === "customer"
//     ? [
//         { to: "/rooms", label: "Book a Room" },
//         { to: "/my-bookings", label: "My Bookings" },
//         { to: "/my-rooms", label: "My Rooms" },
//         { to: "/dashboard", label: "Dashboard" },
//       ]
//     : []),
//   ...(isStaff ? [{ to: "/admin", label: "Dashboard" }] : []),
// ];
const links = [
  ...(!user ? publicLinks : []),
  { to: "/book", label: "Book a Hall" },
  ...(user ? [{ to: "/rooms", label: "Book a Room" }] : []),
  ...(user?.role === "customer"
    ? [
        { to: "/my-bookings", label: "My Bookings" },
        { to: "/my-rooms", label: "My Rooms" },
        // { to: "/rooms", label: "Book a Room" },
        { to: "/dashboard", label: "Dashboard" },
      ]
    : []),
  ...(isStaff ? [{ to: "/admin", label: "Dashboard" }] : []),
];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link
  to={user ? (isStaff ? "/admin" : "/book") : "/"}
  className="text-lg font-semibold text-foreground"
>
  Aazath Plaza
</Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

       <div className="hidden items-center gap-3 md:flex">
  <ThemeToggle />
  {user ? (
    <>
      <NotificationBell buttonClassName={BELL_CLASS} />
      <Link
        to={settingsPath}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted"
        title="Account settings"
      >
        <UserAvatar src={user.profile_image} name={user.name} size={32} />
        <span className="font-medium">{user.name ?? user.email}</span>
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-red-600"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  ) : (
    <Link
      to="/login"
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
    >
      Sign in
    </Link>
  )}
</div>

        {/* Mobile bell + menu toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          {user && <NotificationBell buttonClassName={BELL_CLASS} />}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-md p-2 hover:bg-muted"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
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
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
  {user ? (
    <>
      <Link
        to={settingsPath}
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2 text-sm text-foreground"
      >
        <UserAvatar src={user.profile_image} name={user.name} size={28} />
        <span className="font-medium">{user.name ?? user.email}</span>
      </Link>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-red-600"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  ) : (
    <Link
      to="/login"
      onClick={() => setMobileOpen(false)}
      className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
    >
      Sign in
    </Link>
  )}
</div>
        </nav>
      )}
    </header>
  );
};

export default CustomerNavbar;
