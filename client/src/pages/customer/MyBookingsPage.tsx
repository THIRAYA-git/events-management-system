import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarPlus, Download } from "lucide-react";
import { BookingCard } from "@/components/customer/BookingCard";
import FeedbackForm from "@/components/customer/FeedbackForm";
import {
  primaryBtnClass,
  secondaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { fetchMyBookings } from "@/lib/booking.api";
import { downloadInvoice } from "@/lib/payment.api";
import type { AdminBooking } from "@/types/booking.types";

type Filter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200! bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/2 rounded bg-gray-100" />
          <div className="h-3 w-1/3 rounded bg-gray-100" />
          <div className="h-3 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [feedbackOpenFor, setFeedbackOpenFor] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => setError("Failed to load your bookings. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      c[b.status as Exclude<Filter, "all">] += 1;
    });
    return c;
  }, [bookings]);

  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const handleInvoice = async (b: AdminBooking) => {
    setDownloadingId(b.booking_id);
    try {
      await downloadInvoice(b.booking_id, `invoice-${b.booking_ref}.pdf`);
    } catch {
      toast.error("Could not download the invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your events, complete payments and download invoices.
          </p>
        </div>
        <Link to="/book" className={`${primaryBtnClass} gap-2`}>
          <CalendarPlus className="h-4 w-4" />
          New booking
        </Link>
      </div>

      {!isLoading && bookings.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  filter === t.key ? "bg-white/20" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && <p className={errorTextClass}>{error}</p>}

      {!isLoading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300! bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <CalendarPlus className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No bookings yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Pick a date, choose your hall and confirm your event in a few simple steps.
          </p>
          <Link to="/book" className={`${primaryBtnClass} mt-5`}>
            Book a hall
          </Link>
        </div>
      )}

      {!isLoading && bookings.length > 0 && visible.length === 0 && (
        <p className="rounded-2xl border border-gray-200! bg-white px-6 py-10 text-center text-sm text-gray-500">
          No bookings in this category.
        </p>
      )}

      <div className="space-y-4">
        {visible.map((booking) => (
          <div key={booking.booking_id}>
            <BookingCard
              booking={booking}
              actions={
                <>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => navigate(`/payment/${booking.booking_id}`)}
                      className={primaryBtnClass}
                    >
                      Pay now
                    </button>
                  )}
                  {(booking.status === "confirmed" || booking.status === "completed") && (
                    <button
                      onClick={() => handleInvoice(booking)}
                      disabled={downloadingId === booking.booking_id}
                      className={`${secondaryBtnClass} gap-2`}
                    >
                      <Download className="h-4 w-4" />
                      {downloadingId === booking.booking_id ? "Preparing…" : "Invoice"}
                    </button>
                  )}
                  {booking.status === "completed" &&
                    (booking.has_feedback ? (
                      <span className="text-sm text-green-700">✓ Thanks for your feedback</span>
                    ) : (
                      feedbackOpenFor !== booking.booking_id && (
                        <button
                          onClick={() => setFeedbackOpenFor(booking.booking_id)}
                          className={secondaryBtnClass}
                        >
                          Leave feedback
                        </button>
                      )
                    ))}
                </>
              }
            />

            {booking.status === "completed" &&
              !booking.has_feedback &&
              feedbackOpenFor === booking.booking_id && (
                <div className="mt-2 rounded-2xl border border-gray-200! bg-white p-5 shadow-sm">
                  <FeedbackForm
                    bookingId={booking.booking_id}
                    onSubmitted={() => {
                      setFeedbackOpenFor(null);
                      setBookings((prev) =>
                        prev.map((b) =>
                          b.booking_id === booking.booking_id ? { ...b, has_feedback: true } : b
                        )
                      );
                    }}
                  />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}