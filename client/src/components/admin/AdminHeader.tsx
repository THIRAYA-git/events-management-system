import { Link } from "react-router-dom";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "@/components/common/NotificationBell";
import UserAvatar from "@/components/common/UserAvatar";
import { getSettingsPath } from "@/utils/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/15 bg-violet-700 px-4 text-white dark:bg-slate-900 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
        <NotificationBell />
        <Link
          to={getSettingsPath(user?.role)}
          className="flex items-center gap-2 px-2 py-1 text-sm text-white rounded-md hover:bg-card/10"
          title="Account settings"
        >
          <UserAvatar src={user?.profile_image} name={user?.name} size={32} />
          <span className="font-medium">{user?.name ?? user?.email}</span>
          <span className="text-xs text-white/60 capitalize">
            ({user?.role?.replace("_", " ")})
          </span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-white/70 rounded-md hover:bg-card/10 hover:text-red-400"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
