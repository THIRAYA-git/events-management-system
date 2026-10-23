import { useEffect, useState, useCallback } from "react";
import { listBookings, updateBookingStatus } from "@/lib/booking.api";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Check,
  Download,
} from "lucide-react";
import { downloadInvoice } from "@/api/payment.api";
import { PaymentBadge } from "@/components/admin/PaymentBadge";
import type {
  AdminBooking,
  BookingStatus,
  PaymentStatus,
} from "@/types/booking.types";
import MarkPaidDialog from "@/components/admin/MarkPaidDialog";

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
const PAYMENT_OPTIONS: PaymentStatus[] = ["paid", "partial", "unpaid"];
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30",
  confirmed:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30",
  cancelled:
    "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-500/30",
  completed:
    "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-500/30",
};

const inputClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50";

// en-CA gives YYYY-MM-DD in the browser's local timezone
const todayStr = () => new Date().toLocaleDateString("en-CA");

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [hallFilter, setHallFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [payTarget, setPayTarget] = useState<AdminBooking | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Bulk confirm / reject of pending bookings
  const [bulk, setBulk] = useState<{
    action: "confirm" | "reject";
    items: AdminBooking[];
  } | null>(null);
  const [bulkReason, setBulkReason] = useState("");
  const [bulkPreparing, setBulkPreparing] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listBookings({
        status: statusFilter || undefined,
        hall_id: hallFilter ? Number(hallFilter) : undefined,
        payment_status: paymentFilter || undefined,
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
  }, [statusFilter, hallFilter, paymentFilter, dateFrom, dateTo, offset]);

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

  const errorMessage = (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback;

  const handleConfirm = async (booking: AdminBooking) => {
    setActionLoadingId(booking.booking_id);
    try {
      await updateBookingStatus(booking.booking_id, { status: "confirmed" });
      await fetchBookings();
    } catch (err) {
      alert(errorMessage(err, "Failed to confirm booking. Please try again."));
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadInvoice = async (booking: AdminBooking) => {
    setDownloadingId(booking.booking_id);
    try {
      await downloadInvoice(
        booking.booking_id,
        `invoice-${booking.booking_ref}.pdf`
      );
    } catch (err) {
      alert("Failed to download the invoice. Please try again.");
      console.error(err);
    } finally {
      setDownloadingId(null);
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

  // Targets every pending booking matching the current hall/date filters
  // (across all pages), not just the 10 rows currently visible.
  const openBulk = async (action: "confirm" | "reject") => {
    setBulkPreparing(true);
    try {
      const res = await listBookings({
        status: "pending",
        hall_id: hallFilter ? Number(hallFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 1000,
        offset: 0,
      });
      if (res.bookings.length === 0) {
        alert("There are no pending bookings to process.");
        return;
      }
      setBulkReason("");
      setBulk({ action, items: res.bookings });
    } catch (err) {
      alert("Failed to load pending bookings. Please try again.");
      console.error(err);
    } finally {
      setBulkPreparing(false);
    }
  };

  const runBulk = async () => {
    if (!bulk) return;
    setBulkRunning(true);
    const failed: string[] = [];
    // Sequential on purpose: avoids racing hall-availability constraints.
    for (const b of bulk.items) {
      try {
        await updateBookingStatus(
          b.booking_id,
          bulk.action === "confirm"
            ? { status: "confirmed" }
            : { status: "cancelled", cancel_reason: bulkReason || undefined }
        );
      } catch (err) {
        console.error(err);
        failed.push(`${b.booking_ref} (${errorMessage(err, "error")})`);
      }
    }
    setBulkRunning(false);
    setBulk(null);
    await fetchBookings();
    if (failed.length > 0) {
      alert(
        `${bulk.items.length - failed.length} of ${
          bulk.items.length
        } processed. Failed: ${failed.join(", ")}`
      );
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

  const bulkDisabled =
    bulkPreparing || (!!statusFilter && statusFilter !== "pending");

  const hasFilters =
    statusFilter || hallFilter || paymentFilter || dateFrom || dateTo;

  return (
    <div className="min-w-0">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, confirm, and manage hall booking requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openBulk("confirm")}
            disabled={bulkDisabled}
            className="flex items-center gap-1.5 rounded-md border border-emerald-200 dark:border-emerald-500/30 bg-card px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm All
          </button>
          <button
            onClick={() => openBulk("reject")}
            disabled={bulkDisabled}
            className="flex items-center gap-1.5 rounded-md border border-rose-200 dark:border-rose-500/30 bg-card px-3 py-2 text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject All
          </button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-4 xl:grid-cols-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) =>
              handleFilterChange(setStatusFilter)(
                e.target.value as BookingStatus | ""
              )
            }
            className={inputClass}
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Hall
          </label>
          <select
            value={hallFilter}
            onChange={(e) => handleFilterChange(setHallFilter)(e.target.value)}
            className={inputClass}
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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Payment
          </label>
          <select
            value={paymentFilter}
            onChange={(e) =>
              handleFilterChange(setPaymentFilter)(
                e.target.value as PaymentStatus | ""
              )
            }
            className={inputClass}
          >
            <option value="">All payments</option>
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex items-end gap-3">
          <button
            onClick={() => {
              const t = todayStr();
              setDateFrom(t);
              setDateTo(t);
              setOffset(0);
            }}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground hover:bg-muted"
          >
            Today
          </button>

          {hasFilters && (
            <button
              onClick={() => {
                setStatusFilter("");
                setHallFilter("");
                setPaymentFilter("");
                setDateFrom("");
                setDateTo("");
                setOffset(0);
              }}
              className="h-9 text-left text-sm text-muted-foreground underline hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading bookings…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No bookings match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-fixed text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[16%]" />
                <col className="w-[13%]" />
                <col className="w-[7%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-muted">
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Hall / Type</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3 text-right">Guests</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr
                    key={b.booking_id}
                    className="transition-colors hover:bg-muted/70"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="truncate font-medium text-foreground">
                        {b.customer_name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {b.customer_email}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                        {b.booking_ref}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-foreground">
                        {b.second_hall_name
                          ? `${b.hall_name} + ${b.second_hall_name}`
                          : b.hall_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.event_type_label ?? b.event_type}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <div className="font-medium text-foreground">
                        {formatDate(b.event_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(b.event_start_time)}–
                        {formatTime(b.event_end_time)}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right align-top tabular-nums text-foreground">
                      {b.guest_count}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right align-top font-medium tabular-nums text-foreground">
                      {formatCurrency(b.total_amount)}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                          STATUS_BADGE[b.status]
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      {b.status === "cancelled" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <>
                          <PaymentBadge status={b.payment_status} />
                          {b.payment_status === "partial" && (
                            <div className="mt-0.5 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
                              {Number(b.amount_paid).toLocaleString("en-LK")}{" "}
                              paid
                            </div>
                          )}
                          {b.payment_status !== "paid" &&
                            (b.status === "confirmed" ||
                              b.status === "completed") && (
                              <button
                                onClick={() => setPayTarget(b)}
                                className="mt-1 block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 underline-offset-2 hover:underline"
                              >
                                Mark as paid
                              </button>
                            )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirm(b)}
                              disabled={actionLoadingId === b.booking_id}
                              title="Confirm booking"
                              aria-label="Confirm booking"
                              className={`${iconBtn} text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20`}
                            >
                              {actionLoadingId === b.booking_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => openCancelModal(b)}
                              disabled={actionLoadingId === b.booking_id}
                              title="Reject booking"
                              aria-label="Reject booking"
                              className={`${iconBtn} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {b.payment_status === "paid" &&
                          b.status !== "cancelled" && (
                            <button
                              onClick={() => handleDownloadInvoice(b)}
                              disabled={downloadingId === b.booking_id}
                              title="Download invoice"
                              aria-label="Download invoice"
                              className={`${iconBtn} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500/20`}
                            >
                              {downloadingId === b.booking_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination (inside the card) ──────────────────────────── */}
        {!isLoading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
              {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                disabled={offset === 0}
                className="rounded-md border border-input bg-card px-3 py-1 hover:bg-muted disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                className="rounded-md border border-input bg-card px-3 py-1 hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {payTarget && (
        <MarkPaidDialog
          booking={payTarget}
          onClose={() => setPayTarget(null)}
          onDone={() => {
            setPayTarget(null);
            fetchBookings();
          }}
        />
      )}

      {/* ── Cancel/Reject Modal ─────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {cancelTarget.status === "pending"
                  ? "Reject Booking"
                  : "Cancel Booking"}
              </h2>
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {cancelTarget.booking_ref} — {cancelTarget.customer_name},{" "}
              {formatDate(cancelTarget.event_date)}
            </p>

            <label className="mb-1 mt-4 block text-xs font-medium text-muted-foreground">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Date conflict, customer requested cancellation…"
              className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={submitCancel}
                disabled={actionLoadingId === cancelTarget.booking_id}
                className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoadingId === cancelTarget.booking_id && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
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

      {/* ── Bulk Confirm/Reject Modal ───────────────────────────────── */}
      {bulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">
              {bulk.action === "confirm" ? "Confirm All" : "Reject All"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will {bulk.action === "confirm" ? "confirm" : "reject"}{" "}
              <span className="font-medium text-foreground">
                {bulk.items.length} pending booking
                {bulk.items.length === 1 ? "" : "s"}
              </span>
              {hallFilter || dateFrom || dateTo
                ? " matching the current hall/date filters."
                : "."}
            </p>

            {bulk.action === "reject" && (
              <>
                <label className="mb-1 mt-4 block text-xs font-medium text-muted-foreground">
                  Reason (optional)
                </label>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setBulk(null)}
                disabled={bulkRunning}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={runBulk}
                disabled={bulkRunning}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${
                  bulk.action === "confirm"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {bulkRunning && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {bulk.action === "confirm" ? "Confirm All" : "Reject All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
