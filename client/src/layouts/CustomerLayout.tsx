import { Outlet } from "react-router-dom";
import CustomerNavbar from "@/components/customer/CustomerNavbar";
import GuidedTour, {
  useFirstVisitTour,
  type TourStep,
} from "@/components/tour/GuidedTour";
import { useAuth } from "@/context/AuthContext";

const steps: TourStep[] = [
  {
    target: "nav-book",
    title: "Book your event",
    body: "Check hall availability and reserve your date here.",
  },
  {
    target: "nav-my-bookings",
    title: "My Bookings",
    body: "Track approvals and payments, and download invoices.",
  },
  {
    target: "nav-sponsors",
    title: "Find Sponsors",
    body: "Looking for funding or support for your event? Browse sponsors here and send a request for one of your bookings.",
  },
  {
    target: "nav-dashboard",
    title: "Your Dashboard",
    body: "See upcoming events and leave feedback after your event.",
  },
  {
    target: "nav-menu-toggle",
    title: "Menu",
    body: "Tap here to open the navigation links on your phone.",
  },
  {
    target: "nav-replay-tour",
    title: "Need this again?",
    body: "You can restart the tour any time from here.",
  },
];

const CustomerLayout = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";
  const tour = useFirstVisitTour(
    isCustomer && user ? `ems_tour_${user.id}` : ""
  );

  return (
    <div className="min-h-screen bg-muted">
      <CustomerNavbar onRestartTour={isCustomer ? tour.restart : undefined} />
      <main>
        <Outlet />
      </main>
      {isCustomer && (
        <GuidedTour steps={steps} open={tour.open} onClose={tour.close} />
      )}
    </div>
  );
};

export default CustomerLayout;
