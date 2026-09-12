import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { initiatePayment, fetchPaymentStatus } from "@/lib/payment.api";

type Stage =
  | "loading"
  | "awaiting"
  | "confirming"
  | "success"
  | "failed"
  | "error";

const SANDBOX = import.meta.env.VITE_PAYHERE_SANDBOX !== "false"; // default true

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
  const startedRef = useRef(false);

  useEffect(() => {
    if (!bookingId || startedRef.current) return;
    startedRef.current = true;

    const numericBookingId = parseInt(bookingId, 10);

    const run = async () => {
      try {
        const checkout = await initiatePayment(numericBookingId);
        setStage("awaiting");

        window.payhere.onCompleted = async () => {
          setStage("confirming");
          const confirmed = await pollPaymentStatus(numericBookingId);
          if (confirmed) {
            setStage("success");
          } else {
            toast.info(
              "Payment received — confirming with the bank, this may take a minute."
            );
            setStage("success");
          }
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

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Card>
        <CardHeader>
          <CardTitle>
            {stage === "loading" && "Preparing checkout…"}
            {stage === "awaiting" && "Complete payment in the popup"}
            {stage === "confirming" && "Confirming your payment…"}
            {stage === "success" && "Payment successful 🎉"}
            {stage === "failed" && "Payment cancelled"}
            {stage === "error" && "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {stage === "awaiting" &&
            "If you don't see a popup, check that your browser isn't blocking it."}
          {stage === "success" &&
            "Your booking is now confirmed. A receipt will be emailed to you."}
          {stage === "failed" &&
            "You closed the payment window before completing checkout."}
          {stage === "error" && errorMsg}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {(stage === "failed" || stage === "error") && (
            <Button onClick={() => window.location.reload()}>Try again</Button>
          )}
          {stage === "success" && (
            <Button onClick={() => navigate("/")}>Back to dashboard</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
