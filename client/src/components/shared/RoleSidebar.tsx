import { useState } from "react";
import { NavLink } from "react-router-dom";
import { X, PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import type { NavItem } from "@/config/partnerNav.config";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/common/UserAvatar";
import Logo from "./../Logo";

interface Props {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

const RoleSidebar = ({ items, isOpen, onClose }: Props) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false); // desktop only
  const hideWhenCollapsed = collapsed ? "lg:hidden" : "";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-white/15
        bg-violet-700 text-white transition-[transform,width] duration-200 ease-in-out dark:border-white/10 dark:bg-slate-900
        lg:static lg:z-auto lg:translate-x-0 ${
          collapsed ? "lg:w-[72px]" : "lg:w-64"
        }
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div
          className={`flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4 dark:border-white/10 ${
            collapsed ? "lg:justify-center" : ""
          }`}
        >
          {collapsed ? (
  <Logo variant="icon" className="h-9 w-9" />
) : (
  <Logo variant="lockup" tone="light" className="" iconClassName="h-9 w-9" />
)}
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map(({ label, path, icon: Icon }, index) => (
            <NavLink
              key={path}
              to={path}
              end={index === 0} // first item is the role's home
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-white text-purple-700 font-semibold shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={hideWhenCollapsed}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer: collapse toggle + user card */}
        <div className="shrink-0 space-y-2 border-t border-white/15 p-3 dark:border-white/10">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`hidden w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70
            hover:bg-white/10 hover:text-white lg:flex ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 shrink-0" />
            ) : (
              <PanelLeftClose className="h-5 w-5 shrink-0" />
            )}
            <span className={hideWhenCollapsed}>Collapse</span>
          </button>

          <div
            className={`flex items-center gap-3 rounded-md bg-white/10 p-2 dark:bg-white/5 ${
              collapsed ? "lg:justify-center lg:bg-transparent lg:p-0" : ""
            }`}
          >
            <UserAvatar src={user?.profile_image} name={user?.name} size={36} />
            <div className={`min-w-0 flex-1 ${hideWhenCollapsed}`}>
              <p className="truncate text-sm font-medium">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-white/60">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className={`rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white ${hideWhenCollapsed}`}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default RoleSidebar;
