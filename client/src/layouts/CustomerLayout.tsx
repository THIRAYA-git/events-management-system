import { Outlet } from "react-router-dom";
import CustomerNavbar from "@/components/customer/CustomerNavbar";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;