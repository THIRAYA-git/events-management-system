import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { ReactNode } from "react";
import { getHomePath, isPartnerRole, isStaffRole } from "@/utils/navigation";
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
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AccountSettingsPage } from "@/pages/AccountSettingsPage";
import MenuItemsPage from "@/pages/restaurant/MenuItemsPage";
import RestaurantDashboardPage from "@/pages/restaurant/RestaurantDashboardPage";
import RestaurantCateringOrdersPage from "@/pages/restaurant/RestaurantCateringOrdersPage";
import MySponsorshipsPage from "@/pages/sponsor/MySponsorshipsPage";
import SponsorDashboardPage from "@/pages/sponsor/SponsorDashboardPage";
import OrganizerDashboardPage from "@/pages/organizer/OrganizerDashboardPage";
import OrganizerEventRequestsPage from "@/pages/organizer/OrganizerEventRequestsPage";
import OrganizerPortfolioPage from "@/pages/organizer/OrganizerPortfolioPage";
import OrganizerEventDetailPage from "@/pages/organizer/OrganizerEventDetailPage";
import OrganizerManageEventsPage from "@/pages/organizer/OrganizerManageEventsPage";
import BrowseEventsPage from "@/pages/sponsor/BrowseEventsPage";
import HomePage from "@/pages/customer/HomePage";
import AboutPage from "@/pages/customer/AboutPage";
import ContactPage from "@/pages/customer/ContactPage";
import { AdminStaffPage } from "@/pages/admin/AdminStaffPage";
import { AdminSchedulePage } from "@/pages/admin/AdminSchedulePage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import CustomerDashboardPage from "@/pages/customer/CustomerDashboardPage";
import MyRoomsPage from "./pages/customer/MyRoomsPage";
import RoomsPage from "./pages/customer/RoomsPage";
import RoomPaymentCheckoutPage from "@/pages/customer/RoomPaymentCheckoutPage";
import AdminBackupsPage from "@/pages/admin/AdminBackupsPage";
import AdminPricingPage from "@/pages/admin/AdminPricingPage";
import SponsorProfilePage from "@/pages/sponsor/SponsorProfilePage";
import FindSponsorsPage from "@/pages/customer/FindSponsorsPage";

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user && (isStaffRole(user.role) || isPartnerRole(user.role))) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <>{children}</>;
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
            {/* Public: no login needed */}
            <Route
              path="/"
              element={
                <PublicOnly>
                  <HomePage />
                </PublicOnly>
              }
            />
            <Route
              path="/about"
              element={
                <PublicOnly>
                  <AboutPage />
                </PublicOnly>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicOnly>
                  <ContactPage />
                </PublicOnly>
              }
            />
            {/* Only roles allowed to create bookings */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "admin", "front_desk"]}
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
            </Route>

            {/* Customer only — booking history + account settings */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/sponsors" element={<FindSponsorsPage />} />
              <Route path="/my-rooms" element={<MyRoomsPage />} />
              <Route
                path="/room-payment/:groupRef"
                element={<RoomPaymentCheckoutPage />}
              />
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/settings" element={<AccountSettingsPage />} />
            </Route>
            {/* Rooms: customers + staff */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["customer", "front_desk", "admin"]}
                />
              }
            >
              <Route path="/rooms" element={<RoomsPage />} />
            </Route>
          </Route>

          {/* Staff: front desk, admin — each guard is its own top-level group */}
          <Route
            element={<ProtectedRoute allowedRoles={["front_desk", "admin"]} />}
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardHome />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="schedule" element={<AdminSchedulePage />} />
              <Route
                path="bookings/:bookingId/timeline"
                element={<EventTimelinePage />}
              />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="feedback" element={<AdminFeedbackPage />} />
              </Route>{" "}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="staff" element={<AdminStaffPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="backups" element={<AdminBackupsPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
              </Route>
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Organizer */}
          <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route path="/organizer" element={<PartnerLayout />}>
              <Route index element={<OrganizerDashboardPage />} />
              <Route path="requests" element={<OrganizerEventRequestsPage />} />
              <Route path="events" element={<OrganizerManageEventsPage />} />
              <Route
                path="events/:assignmentId"
                element={<OrganizerEventDetailPage />}
              />
              <Route path="portfolio" element={<OrganizerPortfolioPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          {/* Sponsor */}
          <Route element={<ProtectedRoute allowedRoles={["sponsor"]} />}>
            <Route path="/sponsor" element={<PartnerLayout />}>
              <Route index element={<SponsorDashboardPage />} />
              <Route path="profile" element={<SponsorProfilePage />} />
              <Route path="events" element={<BrowseEventsPage />} />
              <Route path="sponsorships" element={<MySponsorshipsPage />} />
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
