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
    <div className="flex min-h-screen bg-muted">
      <RoleSidebar
        items={items}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

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
