import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader"; // adjust path if yours differs
import RoleSidebar from "@/components/shared/RoleSidebar";
import { partnerNavByRole, type PartnerRole } from "@/config/partnerNav.config";

// One layout for organizer, sponsor and restaurant; the sidebar comes from the user's role
const PartnerLayout = () => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = partnerNavByRole[user?.role as PartnerRole] ?? [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 border-r border-white/15 bg-violet-800 lg:block">
        <RoleSidebar items={items} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="hidden w-64 shrink-0 border-r border-white/15 bg-violet-800 lg:block">
            <RoleSidebar
              items={items}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
