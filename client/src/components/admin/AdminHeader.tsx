import { Menu, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserCircle className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{user?.name ?? user?.email}</span>
          <span className="text-xs text-gray-400 capitalize">
            ({user?.role?.replace("_", " ")})
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-red-600"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
