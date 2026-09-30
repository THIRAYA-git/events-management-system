import { useSearchParams, useNavigate } from "react-router-dom";
import { PaymentStatusCard } from "@/components/payment/PaymentStatusCard";
import { primaryBtnClass, secondaryBtnClass } from "@/components/booking/bookingStyles";

export default function PaymentCancelledPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("bookingId");

  return (
    <PaymentStatusCard
      tone="cancelled"
      title="Payment cancelled"
      message="Your booking is still saved as pending — you can complete payment any time."
    >
      {bookingId && (
        <button
          onClick={() => navigate(`/payment/${bookingId}`)}
          className={`${primaryBtnClass} w-full`}
        >
          Try payment again
        </button>
      )}
      <button onClick={() => navigate("/my-bookings")} className={`${secondaryBtnClass} w-full`}>
        View my bookings
      </button>
    </PaymentStatusCard>
  );
}