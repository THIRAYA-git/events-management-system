import { useEffect, useState, useCallback } from "react";
import { listBookings, updateBookingStatus } from "@/lib/booking.api";
import type { AdminBooking, BookingStatus } from "@/types/booking.types";
import { Loader2, CheckCircle2, XCircle, X } from "lucide-react";

// Hardcoded per the venue's fixed two-hall setup (hall_id 5 = Grand, 6 = Banquet)
const HALLS = [
  { hall_id: 5, hall_name: "Hall 1 - Grand" },
  { hall_id: 6, hall_name: "Hall 2 - Banquet" },
];

const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [hallFilter, setHallFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listBookings({
        status: statusFilter || undefined,
        hall_id: hallFilter ? Number(hallFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setBookings(res.bookings);
      setTotal(res.meta.total);
    } catch (err) {
      setError("Failed to load bookings. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, hallFilter, dateFrom, dateTo, offset]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 whenever a filter changes
  const handleFilterChange =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setOffset(0);
    };

  const handleConfirm = async (booking: AdminBooking) => {
    setActionLoadingId(booking.booking_id);
    try {
      await updateBookingStatus(booking.booking_id, { status: "confirmed" });
      await fetchBookings();
    } catch (err) {
      alert("Failed to confirm booking. Please try again.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCancelModal = (booking: AdminBooking) => {
    setCancelTarget(booking);
    setCancelReason("");
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    setActionLoadingId(cancelTarget.booking_id);
    try {
      await updateBookingStatus(cancelTarget.booking_id, {
        status: "cancelled",
        cancel_reason: cancelReason || undefined,
      });
      setCancelTarget(null);
      await fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking. Please try again.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatCurrency = (amount: string) =>
    `LKR ${Number(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (timeStr: string) => timeStr.slice(0, 5);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Bookings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review, confirm, and manage hall booking requests.
      </p>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              handleFilterChange(setStatusFilter)(
                e.target.value as BookingStatus | ""
              )
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hall
          </label>
          <select
            value={hallFilter}
            onChange={(e) => handleFilterChange(setHallFilter)(e.target.value)}
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

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        {(statusFilter || hallFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setHallFilter("");
              setDateFrom("");
              setDateTo("");
              setOffset(0);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading bookings…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No bookings match these filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Hall</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.booking_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {b.booking_ref}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{b.customer_name}</div>
                    <div className="text-xs text-gray-400">
                      {b.customer_email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.hall_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(b.event_date)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatTime(b.event_start_time)}–
                    {formatTime(b.event_end_time)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.event_type}</td>
                  <td className="px-4 py-3 text-gray-600">{b.guest_count}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatCurrency(b.total_amount)}
                  </td>
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
                    {b.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleConfirm(b)}
                          disabled={actionLoadingId === b.booking_id}
                          className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                        <button
                          onClick={() => openCancelModal(b)}
                          disabled={actionLoadingId === b.booking_id}
                          className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => openCancelModal(b)}
                        disabled={actionLoadingId === b.booking_id}
                        className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 ml-auto"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
            {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              disabled={offset === 0}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Cancel/Reject Modal ─────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {cancelTarget.status === "pending"
                  ? "Reject Booking"
                  : "Cancel Booking"}
              </h2>
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {cancelTarget.booking_ref} — {cancelTarget.customer_name},{" "}
              {formatDate(cancelTarget.event_date)}
            </p>

            <label className="block text-xs font-medium text-gray-500 mt-4 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Date conflict, customer requested cancellation…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={submitCancel}
                disabled={actionLoadingId === cancelTarget.booking_id}
                className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoadingId === cancelTarget.booking_id && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirm{" "}
                {cancelTarget.status === "pending"
                  ? "Rejection"
                  : "Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
