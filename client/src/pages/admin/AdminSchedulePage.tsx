import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Loader2, Search } from "lucide-react";
import { listBookings } from "@/lib/booking.api";
import type { AdminBooking, BookingStatus } from "@/types/booking.types";

// Hardcoded per the venue's fixed two-hall setup (hall_id 5 = Grand, 6 = Banquet)
const HALLS = [
  { hall_id: 5, hall_name: "Hall 1 - Grand" },
  { hall_id: 6, hall_name: "Hall 2 - Banquet" },
];

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const PAGE_SIZE = 10;

type Range = "upcoming" | "past";

// en-CA yields YYYY-MM-DD in the browser's local timezone
const localDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString("en-CA");

const formatTime = (t: string) => t.slice(0, 5);

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const daysFromToday = (dateStr: string) =>
  Math.round((startOfDay(new Date(dateStr)) - startOfDay(new Date())) / 86_400_000);

const relativeLabel = (days: number) => {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`;
};

// 1 … 4 5 [6] 7 8 … 20
const pageList = (cur: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = [...new Set([1, total, cur - 1, cur, cur + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  keep.forEach((p, i) => {
    if (i > 0 && p - keep[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

export function AdminSchedulePage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("upcoming");
  const [hallFilter, setHallFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listBookings({
        hall_id: hallFilter ? Number(hallFilter) : undefined,
        date_from: range === "upcoming" ? localDate(0) : undefined,
        date_to: range === "past" ? localDate(-1) : undefined,
        limit: 500,
        offset: 0,
      });

      // Sorted client-side (nearest first for upcoming, latest first for past),
      // so pagination below is also client-side over this one result set.
      const direction = range === "upcoming" ? 1 : -1;
      const rows = res.bookings
        .filter((b) => b.status !== "cancelled")
        .sort((a, b) => {
          const byDate =
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
          return (
            direction *
            (byDate || a.event_start_time.localeCompare(b.event_start_time))
          );
        });
      setBookings(rows);
    } catch (err) {
      setError("Failed to load events. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [range, hallFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.booking_ref.toLowerCase().includes(q) ||
        b.customer_name.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
    }),
    [bookings]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const changeRange = (r: Range) => {
    setRange(r);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Schedule Event</h1>
      <p className="mt-1 text-sm text-gray-500">
        Plan setup, catering, decoration and cleanup tasks for each booked event.
      </p>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: `${range === "upcoming" ? "Upcoming" : "Past"} events`, value: stats.total, tone: "text-gray-800" },
          { label: "Confirmed", value: stats.confirmed, tone: "text-green-600" },
          { label: "Awaiting confirmation", value: stats.pending, tone: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {s.label}
            </div>
            <div className={`mt-1 text-2xl font-semibold ${s.tone}`}>
              {isLoading ? "–" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Show</label>
          <div className="flex overflow-hidden rounded-md border border-gray-300 text-sm">
            {(["upcoming", "past"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => changeRange(r)}
                className={`px-3 py-1.5 capitalize ${
                  range === r
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hall</label>
          <select
            value={hallFilter}
            onChange={(e) => {
              setHallFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All halls</option>
            {HALLS.map((h) => (
              <option key={h.hall_id} value={h.hall_id}>
                {h.hall_name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto w-full sm:w-64">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Booking ref or customer"
              className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading events…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-gray-400">
            <CalendarClock className="mb-2 h-8 w-8" />
            <p className="text-sm">
              {search
                ? "No events match your search."
                : `No ${range} events to schedule.`}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Hall</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.map((b) => {
                const d = new Date(b.event_date);
                const days = daysFromToday(b.event_date);
                return (
                  <tr
                    key={b.booking_id}
                    className={days === 0 ? "bg-blue-50/40 hover:bg-blue-50" : "hover:bg-gray-50"}
                  >
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-3"
                        title={d.toLocaleDateString("en-LK", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      >
                        <div className="w-12 shrink-0 rounded-md bg-gray-100 py-1 text-center">
                          <div className="text-[10px] font-semibold uppercase text-gray-500">
                            {d.toLocaleDateString("en-LK", { month: "short" })}
                          </div>
                          <div className="text-lg font-semibold leading-tight text-gray-800">
                            {d.getDate()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-800">
                            {d.toLocaleDateString("en-LK", { weekday: "short" })}
                          </div>
                          <div
                            className={`text-xs ${
                              days === 0 ? "font-medium text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {relativeLabel(days)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatTime(b.event_start_time)}–{formatTime(b.event_end_time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-800">{b.event_type_label ?? b.event_type}</div>
                      <div className="text-xs text-gray-400">{b.booking_ref}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{b.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.second_hall_name
                        ? `${b.hall_name} + ${b.second_hall_name}`
                        : b.hall_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.guest_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          STATUS_BADGE[b.status]
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/bookings/${b.booking_id}/timeline`}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
          <span>
            Showing {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            {pageList(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1.5 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-md border px-2 py-1 ${
                    p === currentPage
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}