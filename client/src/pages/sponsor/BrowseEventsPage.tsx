import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUpcomingConfirmedBookings } from "@/api/publicEvents.api";
import type { PublicUpcomingBooking } from "@/types/publicEvent.types";

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<PublicUpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUpcomingConfirmedBookings();
        setEvents(data);
      } catch {
        setError("Failed to load upcoming events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Browse Events</h1>
      <p className="mb-4 text-sm text-gray-500">
        Upcoming confirmed events at Aazath Plaza. Contact us if you'd like to sponsor one.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming confirmed events.</p>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div
              key={e.booking_id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4"
            >
              <div>
                <span className="font-medium">{e.event_type}</span>
                <span className="ml-2 text-sm text-gray-500">{e.hall_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(e.event_date).toLocaleDateString()} · {e.guest_count} guests
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}