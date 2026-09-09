import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import BookingWizardPage from "@/pages/customer/BookingWizardPage";

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