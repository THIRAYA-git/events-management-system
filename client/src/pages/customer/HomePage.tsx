import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Star, MapPin, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllHalls } from "@/api/hall.api";
import type { Hall } from "@/types/hall.types";
import { getPublicFeedback } from "@/api/publicFeedback.api";
import type { PublicFeedback } from "@/types/publicFeedback.types";
import {
  getMyNextUpcomingBooking,
  type UpcomingBookingSummary,
} from "@/api/myUpcomingBooking.api";

export default function HomePage() {
  const { user } = useAuth();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [testimonials, setTestimonials] = useState<PublicFeedback[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingBookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hallsData, feedbackData, upcomingData] = await Promise.all([
          getAllHalls(),
          getPublicFeedback(4),
          user?.role === "customer" ? getMyNextUpcomingBooking() : Promise.resolve(null),
        ]);
        setHalls(hallsData);
        setTestimonials(feedbackData);
        setUpcoming(upcomingData);
      } catch {
        // Non-critical page — fail silently per section rather than blocking the whole page
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center lg:px-6">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Welcome to Aazath Plaza
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Two elegant halls, seamless booking, and everything you need for weddings,
            engagements, and celebrations — all in one place.
          </p>
          <Link
            to="/book"
            className="mt-6 inline-block rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Book Now
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        {/* ── Upcoming event card (customer only) ─────────────── */}
        {upcoming && (
          <div className="mb-10 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-medium uppercase text-blue-700">Your Upcoming Event</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-gray-900">{upcoming.booking_ref}</span>
                <span className="ml-2 text-sm text-gray-600">{upcoming.event_type}</span>
                <span className="ml-2 text-sm text-gray-500">{upcoming.hall_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {new Date(upcoming.event_date).toLocaleDateString()}
                </span>
                <Link
                  to="/my-bookings"
                  className="text-sm font-medium text-blue-700 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Hall showcase ────────────────────────────────────── */}
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Our Halls</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {halls.map((hall) => (
            <div
              key={hall.hall_id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {hall.image_url ? (
                <img
                  src={hall.image_url}
                  alt={hall.hall_name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                  No photo yet
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{hall.hall_name}</h3>
                {hall.description && (
                  <p className="mt-1 text-sm text-gray-500">{hall.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {hall.capacity} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Floor {hall.floor_number}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Testimonials ─────────────────────────────────────── */}
        {testimonials.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">What Our Customers Say</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {testimonials.map((t) => (
                <div
                  key={t.feedback_id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {t.comment && <p className="mt-2 text-sm text-gray-700">"{t.comment}"</p>}
                  <p className="mt-2 text-xs text-gray-400">
                    {t.customer_name} · {t.event_type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}