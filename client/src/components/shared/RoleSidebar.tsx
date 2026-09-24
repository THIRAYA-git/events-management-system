import { NavLink } from "react-router-dom";
import type { NavItem } from "@/config/partnerNav.config";

interface Props {
  items: NavItem[];
  onNavigate?: () => void; // closes the mobile drawer
}

const RoleSidebar = ({ items, onNavigate }: Props) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 items-center border-b border-gray-200 px-6">
      <span className="text-lg font-semibold text-gray-900">Aazath Plaza</span>
    </div>
    <nav className="flex-1 space-y-1 p-3">
      {items.map(({ label, path, icon: Icon }, index) => (
        <NavLink
          key={path}
          to={path}
          end={index === 0} // first item is the role's home; don't keep it active on sub-pages
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default RoleSidebar;