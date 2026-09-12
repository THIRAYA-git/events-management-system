import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function PaymentCancelledPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("bookingId");

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Card>
        <CardHeader>
          <CardTitle>Payment cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your booking is still saved as pending — you can complete payment any time.
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {bookingId && (
            <Button onClick={() => navigate(`/payment/${bookingId}`)}>Try payment again</Button>
          )}
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}