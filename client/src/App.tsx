import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getHomePath, isPartnerRole } from "@/utils/navigation";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import BookingWizardPage from "@/pages/customer/BookingWizardPage";
import PaymentCheckoutPage from "@/pages/customer/PaymentCheckoutPage";
import PaymentSuccessPage from "@/pages/customer/PaymentSuccessPage";
import PaymentCancelledPage from "@/pages/customer/PaymentCancelledPage";
import EventTimelinePage from "@/pages/booking/EventTimelinePage";
import MyBookingsPage from "@/pages/customer/MyBookingsPage";
import CustomerLayout from "@/layouts/CustomerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import PartnerLayout from "@/layouts/PartnerLayout";
import { AdminDashboardHome } from "@/pages/admin/AdminDashboardHome";
import { AdminBookingsPage } from "@/pages/admin/AdminBookingsPage";
import { AdminCustomersPage } from "@/pages/admin/AdminCustomersPage";
import { AdminOrganizersSponsorsPage } from "@/pages/admin/AdminOrganizersSponsorsPage";
import { AdminCateringPage } from "@/pages/admin/AdminCateringPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import MenuItemsPage from "@/pages/restaurant/MenuItemsPage";
import RestaurantDashboardPage from "@/pages/restaurant/RestaurantDashboardPage";
import RestaurantCateringOrdersPage from "@/pages/restaurant/RestaurantCateringOrdersPage";

// Placeholder — swap out as each role's real dashboard gets built
function Dashboard() {
  return <div className="p-8">Dashboard placeholder</div>;
}

// "/" is the customer home; partners have their own layout, so send them there
function Home() {
  const { user } = useAuth();
  if (isPartnerRole(user?.role)) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }
  return <Dashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<CustomerLayout />}>
            {/* Any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
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

            {/* Customer only — booking history + account settings */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* Staff: front desk, manager, admin — each guard is its own top-level group */}
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

          {/* Organizer */}
          <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route path="/organizer" element={<PartnerLayout />}>
              <Route
                index
                element={<PlaceholderPage title="Organizer Dashboard" />}
              />
              <Route
                path="requests"
                element={<PlaceholderPage title="Event Requests" />}
              />
              <Route
                path="portfolio"
                element={<PlaceholderPage title="My Portfolio" />}
              />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* Sponsor */}
          <Route element={<ProtectedRoute allowedRoles={["sponsor"]} />}>
            <Route path="/sponsor" element={<PartnerLayout />}>
              <Route
                index
                element={<PlaceholderPage title="Sponsor Dashboard" />}
              />
              <Route
                path="events"
                element={<PlaceholderPage title="Browse Events" />}
              />
              <Route
                path="sponsorships"
                element={<PlaceholderPage title="My Sponsorships" />}
              />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* Restaurant partner */}
          <Route element={<ProtectedRoute allowedRoles={["restaurant"]} />}>
            <Route path="/restaurant" element={<PartnerLayout />}>
              <Route index element={<RestaurantDashboardPage />} />
              <Route path="menu" element={<MenuItemsPage />} />
              <Route path="orders" element={<RestaurantCateringOrdersPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
