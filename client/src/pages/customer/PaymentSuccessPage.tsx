import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { fetchPaymentStatus, downloadInvoice } from "@/lib/payment.api";
import type { PaymentRecord } from "@/types/payment.types";

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

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Card>
        <CardHeader>
          <CardTitle>Payment complete 🎉</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isLoading && "Checking payment status…"}
          {!isLoading && payment && `Status: ${payment.status}`}
          {!isLoading && !payment && "Your payment was processed. Check your dashboard for the latest status."}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {payment?.status === "completed" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              {isDownloading ? "Preparing invoice…" : "Download Invoice"}
            </Button>
          )}
          <Button className="w-full" onClick={() => navigate("/")}>
            Back to dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}