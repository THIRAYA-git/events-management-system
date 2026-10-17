import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  PaymentStatusCard,
  formatLkr,
  formatPaidAt,
  titleCase,
} from "@/components/payment/PaymentStatusCard";
import { primaryBtnClass, secondaryBtnClass } from "@/components/booking/bookingStyles";
import { initiatePayment, fetchPaymentStatus, downloadInvoice } from "@/lib/payment.api";
import type { PaymentRecord } from "@/types/payment.types";

type Stage =
  | "loading"
  | "awaiting"
  | "confirming"
  | "success"
  | "failed"
  | "error";

const SANDBOX = import.meta.env.VITE_PAYHERE_SANDBOX !== "false"; // default true
const PAYHERE_SDK_URL = "https://www.payhere.lk/lib/payhere.js";
const SDK_ERROR =
  "Could not load the PayHere payment library. Turn off your VPN, ad blocker or tracking protection for this site, then try again.";

// Make sure window.payhere exists before we touch it. If the <script> in
// index.html was blocked or hasn't finished, try loading it once more here.
const ensurePayhere = async (): Promise<void> => {
  if (window.payhere) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYHERE_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(SDK_ERROR));
    document.head.appendChild(script);
  });

  if (!window.payhere) throw new Error(SDK_ERROR);
};

// Poll a few times after PayHere's popup reports success, since the real
// confirmation happens async via the /notify webhook, not this callback.
const pollPaymentStatus = async (
  bookingId: number,
  attempts = 6,
  delayMs = 1500
) => {
  for (let i = 0; i < attempts; i++) {
    const record = await fetchPaymentStatus(bookingId).catch(() => null);
    if (record?.status === "completed") return record;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
};

export default function PaymentCheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!bookingId || startedRef.current) return;
    startedRef.current = true;

    const numericBookingId = parseInt(bookingId, 10);

    const run = async () => {
      try {
        // 1. SDK first, so we don't create a payment record we can't pay.
        await ensurePayhere();

        // 2. Ask the backend for the signed checkout payload.
        const checkout = await initiatePayment(numericBookingId);
        setStage("awaiting");

        window.payhere.onCompleted = async () => {
          setStage("confirming");
          const confirmed = await pollPaymentStatus(numericBookingId);
          if (confirmed) {
            setPayment(confirmed);
          } else {
            toast.info(
              "Payment received — confirming with the bank, this may take a minute."
            );
          }
          setStage("success");
        };

        window.payhere.onDismissed = () => {
          setStage("failed");
        };

        window.payhere.onError = (message) => {
          setErrorMsg(message);
          setStage("error");
        };

        window.payhere.startPayment({
          sandbox: SANDBOX,
          ...checkout,
          // Override so PayHere's popup-blocked fallback redirect can
          // still identify which booking this was for.
          return_url: `${window.location.origin}/payment/success?bookingId=${numericBookingId}`,
          cancel_url: `${window.location.origin}/payment/cancelled?bookingId=${numericBookingId}`,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Could not start payment.";
        setErrorMsg(message);
        setStage("error");
      }
    };

    run();
  }, [bookingId]);

  const handleDownloadInvoice = async () => {
    if (!bookingId) return;
    setIsDownloading(true);
    try {
      const numericBookingId = parseInt(bookingId, 10);
      const record =
        payment ?? (await fetchPaymentStatus(numericBookingId).catch(() => null));
      await downloadInvoice(
        numericBookingId,
        `invoice-${record?.invoice_number ?? bookingId}.pdf`
      );
    } catch {
      toast.error("Could not download the invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (stage === "loading") {
    return (
      <PaymentStatusCard
        tone="loading"
        title="Preparing checkout…"
        message="Setting up your secure payment. This only takes a moment."
      />
    );
  }

  if (stage === "awaiting") {
    return (
      <PaymentStatusCard
        tone="waiting"
        title="Complete payment in the popup"
        message="Finish your payment in the PayHere window. If you don't see it, check that your browser isn't blocking popups."
      >
        <button onClick={() => window.location.reload()} className={secondaryBtnClass}>
          Reopen payment window
        </button>
      </PaymentStatusCard>
    );
  }

  if (stage === "confirming") {
    return (
      <PaymentStatusCard
        tone="loading"
        title="Confirming your payment…"
        message="Please don't close this page. We're waiting for the bank to confirm."
      />
    );
  }

  if (stage === "success") {
    const confirmed = payment?.status === "completed";
    return (
      <PaymentStatusCard
        tone="success"
        title="Payment successful"
        message={
          confirmed
            ? "Your booking is now confirmed. A receipt will be emailed to you."
            : "Your payment was received and is being confirmed. Your booking status will update shortly."
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

  if (stage === "failed") {
    return (
      <PaymentStatusCard
        tone="cancelled"
        title="Payment cancelled"
        message="You closed the payment window before completing checkout. Your booking is still saved as pending."
      >
        <button onClick={() => window.location.reload()} className={`${primaryBtnClass} w-full`}>
          Try again
        </button>
        <button onClick={() => navigate("/my-bookings")} className={`${secondaryBtnClass} w-full`}>
          View my bookings
        </button>
      </PaymentStatusCard>
    );
  }

  return (
    <PaymentStatusCard
      tone="error"
      title="Something went wrong"
      message={errorMsg ?? "We couldn't start the payment. Please try again."}
    >
      <button onClick={() => window.location.reload()} className={`${primaryBtnClass} w-full`}>
        Try again
      </button>
      <button onClick={() => navigate("/my-bookings")} className={`${secondaryBtnClass} w-full`}>
        View my bookings
      </button>
    </PaymentStatusCard>
  );
}