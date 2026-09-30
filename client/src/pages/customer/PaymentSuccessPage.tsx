import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import {
  PaymentStatusCard,
  formatLkr,
  formatPaidAt,
  titleCase,
} from "@/components/payment/PaymentStatusCard";
import { primaryBtnClass, secondaryBtnClass } from "@/components/booking/bookingStyles";
import { fetchPaymentStatus, downloadInvoice } from "@/lib/payment.api";
import type { PaymentRecord } from "@/types/payment.types";

// Landing page for PayHere's redirect fallback (popup blocked / redirect flow).
export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("bookingId");
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!bookingId) return setIsLoading(false);
    fetchPaymentStatus(parseInt(bookingId, 10))
      .then(setPayment)
      .catch(() => setPayment(null))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const handleDownloadInvoice = async () => {
    if (!bookingId || !payment) return;
    setIsDownloading(true);
    try {
      await downloadInvoice(
        parseInt(bookingId, 10),
        `invoice-${payment.invoice_number ?? bookingId}.pdf`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <PaymentStatusCard
        tone="loading"
        title="Checking payment status…"
        message="One moment while we confirm your payment."
      />
    );
  }

  const confirmed = payment?.status === "completed";

  return (
    <PaymentStatusCard
      tone="success"
      title={confirmed ? "Payment successful" : "Payment received"}
      message={
        confirmed
          ? "Your booking is now confirmed. A receipt will be emailed to you."
          : "Your payment was processed and is being confirmed. Check My Bookings for the latest status."
      }
      highlight={
        confirmed && payment
          ? { label: "Amount paid", value: formatLkr(payment.amount, payment.currency) }
          : undefined
      }
      rows={
        confirmed && payment
          ? [
              { label: "Invoice number", value: payment.invoice_number ?? "—" },
              { label: "Transaction ID", value: payment.transaction_id ?? "—" },
              { label: "Payment method", value: titleCase(payment.payment_method) },
              { label: "Paid on", value: formatPaidAt(payment.paid_at) },
            ]
          : undefined
      }
    >
      {confirmed && (
        <button
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
          className={`${primaryBtnClass} w-full gap-2`}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Preparing invoice…" : "Download invoice"}
        </button>
      )}
      <button
        onClick={() => navigate("/my-bookings")}
        className={`${confirmed ? secondaryBtnClass : primaryBtnClass} w-full`}
      >
        View my bookings
      </button>
    </PaymentStatusCard>
  );
}