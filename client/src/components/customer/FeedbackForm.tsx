import { useState } from "react";
import type { FC } from "react";
import { Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitFeedback } from "@/api/feedback.api";

interface FeedbackFormProps {
  bookingId: number;
  onSubmitted?: () => void;
}

// Rendered on a completed booking (e.g. a booking detail / history page).
// The backend rejects submissions for bookings that aren't yet
// status = 'completed', or that don't belong to the requesting customer,
// so this form doesn't need to re-check either — it just surfaces
// whatever error message comes back.
const FeedbackForm: FC<FeedbackFormProps> = ({ bookingId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback({
        booking_id: bookingId,
        rating,
        title: title || undefined,
        comment: comment || undefined,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Thank you for your feedback!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate your event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={
                  value <= (hoverRating || rating)
                    ? "h-7 w-7 fill-yellow-400 text-yellow-400"
                    : "h-7 w-7 text-muted-foreground"
                }
              />
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-title">Title (optional)</Label>
          <Input
            id="feedback-title"
            placeholder="Sum up your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-comment">Comment (optional)</Label>
          <Textarea
            id="feedback-comment"
            placeholder="Tell us more about the event"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? "Submitting…" : "Submit Feedback"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedbackForm;