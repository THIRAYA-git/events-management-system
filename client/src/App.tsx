import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import BookingWizardPage from "@/pages/customer/BookingWizardPage";
import PaymentCheckoutPage from "@/pages/customer/PaymentCheckoutPage";
import PaymentSuccessPage from "@/pages/customer/PaymentSuccessPage";
import PaymentCancelledPage from "@/pages/customer/PaymentCancelledPage";
import EventTimelinePage from "@/pages/booking/EventTimelinePage";
import MyBookingsPage from "@/pages/customer/MyBookingsPage";
import CustomerLayout from "@/layouts/CustomerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { AdminDashboardHome } from "@/pages/admin/AdminDashboardHome";
import { AdminBookingsPage } from "@/pages/admin/AdminBookingsPage";
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
import { AdminOrganizersSponsorsPage } from "@/pages/admin/AdminOrganizersSponsorsPage";
import { AdminCateringPage } from "@/pages/admin/AdminCateringPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

// Placeholder — swap out as each role's real dashboard gets built
function Dashboard() {
  return <div className="p-8">Dashboard placeholder</div>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<CustomerLayout />}>
            {/* Any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Only roles allowed to create bookings */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "admin", "manager", "front_desk"]}
                />
              }
            >
              <Route path="/book" element={<BookingWizardPage />} />
              <Route
                path="/payment/:bookingId"
                element={<PaymentCheckoutPage />}
              />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route
                path="/payment/cancelled"
                element={<PaymentCancelledPage />}
              />
              <Route
                path="/bookings/:bookingId/timeline"
                element={<EventTimelinePage />}
              />
            </Route>

            {/* Customer only — booking history + feedback */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Route>
          </Route>

          <Route
            path="/unauthorized"
            element={<div className="p-8">Not authorized.</div>}
          />
          <Route
            path="*"
            element={<div className="p-8">Page not found.</div>}
          />
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["front_desk", "manager", "admin"]}
              />
            }
          >
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["front_desk", "manager", "admin"]}
                />
              }
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardHome />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route
                  path="organizers-sponsors"
                  element={<AdminOrganizersSponsorsPage />}
                />
                <Route path="catering" element={<AdminCateringPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;