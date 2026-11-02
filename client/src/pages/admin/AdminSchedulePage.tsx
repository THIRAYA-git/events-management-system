import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Loader2, Search, UserPlus } from "lucide-react";
import { listBookings } from "@/lib/booking.api";
import type { AdminBooking } from "@/types/booking.types";
import { PaymentBadge } from "@/components/admin/PaymentBadge";
import AssignOrganizerDialog from "@/components/admin/AssignOrganizerDialog";

// Hardcoded per the venue's fixed two-hall setup (hall_id 5 = Grand, 6 = Banquet)
const HALLS = [
  { hall_id: 5, hall_name: "Hall 1 - Grand" },
  { hall_id: 6, hall_name: "Hall 2 - Banquet" },
];

const PAGE_SIZE = 10;

type Range = "upcoming" | "past";

// en-CA yields YYYY-MM-DD in the browser's local timezone
const localDate = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString("en-CA");

const formatTime = (t: string) => t.slice(0, 5);

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const daysFromToday = (dateStr: string) =>
  Math.round(
    (startOfDay(new Date(dateStr)) - startOfDay(new Date())) / 86_400_000
  );

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

      // Only confirmed bookings are scheduled here.
      // Sorted client-side (nearest first for upcoming, latest first for past),
      // so pagination below is also client-side over this one result set.
      const direction = range === "upcoming" ? 1 : -1;
      const rows = res.bookings
        .filter((b) => b.status === "confirmed")
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
      today: bookings.filter((b) => daysFromToday(b.event_date) === 0).length,
      unpaid: bookings.filter((b) => b.payment_status !== "paid").length,
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
      <h1 className="text-2xl font-semibold text-foreground">
        Manage Scheduled Events
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirmed events only. You can track event timelines to setup, catering,
        decoration and cleanup tasks for each one.
      </p>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: `Confirmed ${range} events`,
            value: stats.total,
            tone: "text-green-600 dark:text-green-400",
          },
          {
            label: "Happening today",
            value: stats.today,
            tone: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Payment outstanding",
            value: stats.unpaid,
            tone: "text-rose-600 dark:text-rose-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className={`mt-1 text-2xl font-semibold ${s.tone}`}>
              {isLoading ? "–" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Show
          </label>
          <div className="flex overflow-hidden rounded-md border border-input text-sm">
            {(["upcoming", "past"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => changeRange(r)}
                className={`px-3 py-1.5 capitalize ${
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Hall
          </label>
          <select
            value={hallFilter}
            onChange={(e) => {
              setHallFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground"
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
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Booking ref or customer"
              className="w-full rounded-md border border-input py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading events…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <CalendarClock className="mb-2 h-8 w-8" />
            <p className="text-sm">
              {search
                ? "No events match your search."
                : `No confirmed ${range} events to schedule.`}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Hall</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((b) => {
                const d = new Date(b.event_date);
                const days = daysFromToday(b.event_date);
                return (
                  <tr
                    key={b.booking_id}
                    className={
                      days === 0
                        ? "bg-blue-50/40 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/20"
                        : "hover:bg-muted"
                    }
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
                        <div className="w-12 shrink-0 rounded-md bg-muted py-1 text-center">
                          <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                            {d.toLocaleDateString("en-LK", { month: "short" })}
                          </div>
                          <div className="text-lg font-semibold leading-tight text-foreground">
                            {d.getDate()}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground">
                            {d.toLocaleDateString("en-LK", {
                              weekday: "short",
                            })}
                          </div>
                          <div
                            className={`whitespace-nowrap text-xs ${
                              days === 0
                                ? "font-medium text-blue-600 dark:text-blue-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {relativeLabel(days)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatTime(b.event_start_time)}–
                      {formatTime(b.event_end_time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">
                        {b.event_type_label ?? b.event_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.booking_ref}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {b.customer_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.second_hall_name
                        ? `${b.hall_name} + ${b.second_hall_name}`
                        : b.hall_name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.guest_count}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={b.payment_status} />
                      {days === 0 && b.payment_status !== "paid" && (
                        <div className="mt-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                          Collect payment
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <AssignOrganizerDialog
                          bookingId={b.booking_id}
                          trigger={
                            <button className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20">
                              <UserPlus className="w-3.5 h-3.5" />
                              Assign
                            </button>
                          }
                        />
                        <Link
                          to={`/admin/bookings/${b.booking_id}/timeline`}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          Timeline
                        </Link>
                      </div>
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {startIdx + 1}–
            {Math.min(startIdx + PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            {pageList(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-md border px-2 py-1 ${
                    p === currentPage
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
