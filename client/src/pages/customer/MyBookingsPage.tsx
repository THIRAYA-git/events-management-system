import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchMyBookings } from "@/lib/booking.api";
import type { AdminBooking } from "@/types/booking.types";
import FeedbackForm from "@/components/customer/FeedbackForm";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  completed: "default",
  cancelled: "destructive",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpenFor, setFeedbackOpenFor] = useState<number | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => setError("Failed to load your bookings. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">My Bookings</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!isLoading && !error && bookings.length === 0 && (
        <p className="text-sm text-muted-foreground">You don't have any bookings yet.</p>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.booking_id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {booking.event_type} — {booking.hall_name}
              </CardTitle>
              <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>
                {booking.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                {new Date(booking.event_date).toLocaleDateString()} ·{" "}
                {booking.event_start_time}–{booking.event_end_time} · {booking.guest_count} guests
              </div>
              <div>Ref: {booking.booking_ref}</div>

              {booking.status === "completed" && (
                <div className="pt-2">
                  {booking.has_feedback ? (
                    <p className="text-sm text-muted-foreground">
                      ✓ Thank you for your feedback.
                    </p>
                  ) : feedbackOpenFor === booking.booking_id ? (
                    <FeedbackForm
                      bookingId={booking.booking_id}
                      onSubmitted={() => {
                        setFeedbackOpenFor(null);
                        setBookings((prev) =>
                          prev.map((b) =>
                            b.booking_id === booking.booking_id
                              ? { ...b, has_feedback: true }
                              : b
                          )
                        );
                      }}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackOpenFor(booking.booking_id)}
                    >
                      Leave Feedback
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}