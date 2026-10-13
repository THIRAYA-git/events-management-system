import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { adminNavItems } from "../../config/adminNav.config";
import { useAuth } from "../../context/AuthContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const { user } = useAuth();

  const visibleItems = adminNavItems.filter((item) =>
    user?.role ? item.roles.includes(user.role as any) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-violet-800 border-r border-white/15
  transition-transform duration-200 ease-in-out
  lg:static lg:translate-x-0 lg:z-auto
  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/15">
          <span className="text-lg font-semibold text-white">Aazath Plaza</span>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <nav className="px-2 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
  ${
    isActive
      ? "bg-white/15 text-white"
      : "text-white/70 hover:bg-white/10 hover:text-white"
  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
