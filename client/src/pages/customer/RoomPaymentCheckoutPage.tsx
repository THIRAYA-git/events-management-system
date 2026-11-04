import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { downloadRoomInvoice } from "@/api/roomAdmin.api";
import {
  PaymentStatusCard,
  formatLkr,
  formatPaidAt,
  titleCase,
} from "@/components/payment/PaymentStatusCard";
import {
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/booking/bookingStyles";
import { initiateRoomPayment, fetchRoomPaymentStatus } from "@/api/room.api";
import type { RoomPaymentStatus } from "@/types/room.types";

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

// The real confirmation arrives via the notify webhook, so poll for it
const pollStatus = async (groupRef: string, attempts = 8, delayMs = 1500) => {
  for (let i = 0; i < attempts; i++) {
    const s = await fetchRoomPaymentStatus(groupRef).catch(() => null);
    if (s?.payment_status === "paid") return s;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
};

export default function RoomPaymentCheckoutPage() {
  const { groupRef } = useParams<{ groupRef: string }>();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paid, setPaid] = useState<RoomPaymentStatus | null>(null);
  const startedRef = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const handleInvoice = async () => {
    if (!groupRef) return;
    setDownloading(true);
    try {
      await downloadRoomInvoice(groupRef);
    } catch {
      toast.error("Invoice is not ready yet. Please try again in a moment.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!groupRef || startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      try {
        await ensurePayhere();
        const checkout = await initiateRoomPayment(groupRef);
        setStage("awaiting");

        window.payhere.onCompleted = async () => {
          setStage("confirming");
          const confirmed = await pollStatus(groupRef);
          if (confirmed) setPaid(confirmed);
          else
            toast.info(
              "Payment received. Confirming with the bank, this may take a minute."
            );
          setStage("success");
        };
        window.payhere.onDismissed = () => setStage("failed");
        window.payhere.onError = (message: string) => {
          setErrorMsg(message);
          setStage("error");
        };

        window.payhere.startPayment({
          sandbox: SANDBOX,
          ...checkout,
          return_url: `${window.location.origin}/my-rooms`,
          cancel_url: `${window.location.origin}/my-rooms`,
        });
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Could not start payment."
        );
        setStage("error");
      }
    };
    run();
  }, [groupRef]);

  if (stage === "loading")
    return (
      <PaymentStatusCard
        tone="loading"
        title="Preparing checkout…"
        message="Setting up your secure payment. This only takes a moment."
      />
    );

  if (stage === "awaiting")
    return (
      <PaymentStatusCard
        tone="waiting"
        title="Complete payment in the popup"
        message="Finish your payment in the PayHere window. If you don't see it, check that your browser isn't blocking popups."
      >
        <button
          onClick={() => window.location.reload()}
          className={secondaryBtnClass}
        >
          Reopen payment window
        </button>
      </PaymentStatusCard>
    );

  if (stage === "confirming")
    return (
      <PaymentStatusCard
        tone="loading"
        title="Confirming your payment…"
        message="Please don't close this page. We're waiting for the bank to confirm."
      />
    );

  if (stage === "success") {
    const confirmed = paid?.payment_status === "paid";
    return (
      <PaymentStatusCard
        tone="success"
        title="Payment successful"
        message={
          confirmed
            ? "Your room reservation is now confirmed."
            : "Your payment was received and is being confirmed. Your reservation will update shortly."
        }
        highlight={
          confirmed && paid
            ? {
                label: "Amount paid",
                value: formatLkr(paid.total_amount, "LKR"),
              }
            : undefined
        }
        rows={
          confirmed && paid
            ? [
                { label: "Reservation", value: paid.group_ref },
                {
                  label: "Rooms",
                  value: paid.rooms.map((r) => r.room_name).join(", "),
                },
                { label: "Transaction ID", value: paid.transaction_id ?? "—" },
                {
                  label: "Payment method",
                  value: paid.payment_method
                    ? titleCase(paid.payment_method)
                    : "—",
                },
                { label: "Paid on", value: formatPaidAt(paid.paid_at) },
              ]
            : undefined
        }
      >
        {confirmed && (
          <button
            onClick={handleInvoice}
            disabled={downloading}
            className={`${secondaryBtnClass} w-full`}
          >
            {downloading ? (
              <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 inline h-4 w-4" />
            )}
            {downloading ? "Preparing..." : "Download invoice"}
          </button>
        )}
        <button
          onClick={() => navigate("/my-rooms")}
          className={`${primaryBtnClass} w-full`}
        >
          View my rooms
        </button>
      </PaymentStatusCard>
    );
  }

  if (stage === "failed")
    return (
      <PaymentStatusCard
        tone="cancelled"
        title="Payment cancelled"
        message="You closed the payment window before completing checkout. Your rooms stay held for a short time."
      >
        <button
          onClick={() => window.location.reload()}
          className={`${primaryBtnClass} w-full`}
        >
          Try again
        </button>
        <button
          onClick={() => navigate("/my-rooms")}
          className={`${secondaryBtnClass} w-full`}
        >
          View my rooms
        </button>
      </PaymentStatusCard>
    );

  return (
    <PaymentStatusCard
      tone="error"
      title="Something went wrong"
      message={errorMsg ?? "We couldn't start the payment. Please try again."}
    >
      <button
        onClick={() => window.location.reload()}
        className={`${primaryBtnClass} w-full`}
      >
        Try again
      </button>
      <button
        onClick={() => navigate("/my-rooms")}
        className={`${secondaryBtnClass} w-full`}
      >
        View my rooms
      </button>
    </PaymentStatusCard>
  );
}
