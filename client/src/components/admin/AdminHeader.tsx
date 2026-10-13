import { Link } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "@/components/common/NotificationBell";
import UserAvatar from "@/components/common/UserAvatar";
import { getSettingsPath } from "@/utils/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-violet-800 border-b border-white/15 text-white lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-white/10"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link
          to={getSettingsPath(user?.role)}
          className="flex items-center gap-2 px-2 py-1 text-sm text-white rounded-md hover:bg-white/10"
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
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-white/70 rounded-md hover:bg-white/10 hover:text-red-400"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
