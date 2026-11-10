import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import {
  listAllCateringOrders,
  updateCateringOrderStatus,
} from "@/lib/catering.api";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  preparing:
    "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-muted text-muted-foreground",
};

// Mirrors the backend's ALLOWED_TRANSITIONS state machine (catering.service.js)
const NEXT_ACTIONS: Record<string, { label: string; to: string }[]> = {
  pending: [
    { label: "Confirm", to: "confirmed" },
    { label: "Cancel", to: "cancelled" },
  ],
  confirmed: [
    { label: "Start Preparing", to: "preparing" },
    { label: "Cancel", to: "cancelled" },
  ],
  preparing: [
    { label: "Mark Delivered", to: "delivered" },
    { label: "Cancel", to: "cancelled" },
  ],
  delivered: [],
  cancelled: [],
};

const OPEN_STATUSES = ["pending", "confirmed", "preparing"];

const STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

type DateFilter = "all" | "overdue" | "today" | "upcoming";
const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
];

const PAGE_SIZE = 10;
const CLEARED_KEY = "restaurant-orders-cleared-through";

// Local calendar date as YYYY-MM-DD (not toISOString, which is UTC).
const todayStr = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Parse "YYYY-MM-DD" manually to avoid timezone shifts.
const formatEventDate = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const readClearedThrough = (): string | null => {
  try {
    return localStorage.getItem(CLEARED_KEY);
  } catch {
    return null;
  }
};

export default function RestaurantCateringOrdersPage() {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clearedThrough, setClearedThrough] = useState<string | null>(
    readClearedThrough
  );
  const [showCleared, setShowCleared] = useState(false);

  const hideDeliveredThrough =
    clearedThrough && !showCleared ? clearedThrough : undefined;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAllCateringOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        hideDeliveredThrough,
        dateFilter: dateFilter === "all" ? undefined : dateFilter,
        today: dateFilter === "all" ? undefined : todayStr(),
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch {
      setError("Failed to load catering orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter, page, hideDeliveredThrough]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleTransition = async (orderId: number, to: string) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updated = await updateCateringOrderStatus(orderId, to);
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, ...updated } : o))
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearDelivered = () => {
    const ok = window.confirm(
      "Hide delivered orders up to today from this list? They are not deleted and stay in reports."
    );
    if (!ok) return;
    const today = todayStr();
    try {
      localStorage.setItem(CLEARED_KEY, today);
    } catch {
      /* storage unavailable: the clear still applies for this session */
    }
    setClearedThrough(today);
    setShowCleared(false);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const today = todayStr();
  const canClear = statusFilter === "all" || statusFilter === "delivered";

  return (
    <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
          Catering Orders
        </h1>
        <div className="mb-4 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium">
          {canClear && (
            <button
              onClick={handleClearDelivered}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Clear delivered
            </button>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all"
                  ? "All statuses"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      

      <div className="mb-4 flex flex-wrap gap-2">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setDateFilter(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-sm ${
              dateFilter === f.value
                ? "border-blue-600 bg-blue-600 text-white"
                : "hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {clearedThrough && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span>
            {showCleared
              ? "Showing previously cleared delivered orders."
              : `Delivered orders up to ${formatEventDate(
                  clearedThrough
                )} are hidden.`}
          </span>
          <button
            onClick={() => {
              setShowCleared((v) => !v);
              setPage(1);
            }}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showCleared ? "Hide again" : "Show"}
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No catering orders found.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const overdue =
                !!order.event_date &&
                order.event_date < today &&
                OPEN_STATUSES.includes(order.status);
              return (
                <div
                  key={order.order_id}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{order.booking_ref}</span>{" "}
                      <span className="text-muted-foreground">
                        — {order.customer_name}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {order.event_type}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLES[order.status] ?? ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.event_date && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatEventDate(order.event_date)}</span>
                      {order.event_date === today && (
                        <span className="rounded bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 text-blue-700 dark:text-blue-400">
                          Today
                        </span>
                      )}
                      {overdue && (
                        <span className="rounded bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 text-red-600 dark:text-red-400">
                          Overdue
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mb-2 text-sm text-muted-foreground">
                    {order.menu_items.map((line, idx) => {
                      const name =
                        line.item_name || `Item #${line.item_id ?? "?"}`;
                      const qty = line.quantity ?? 0;
                      const hasPrice = line.unit_price != null;
                      const subtotal =
                        line.subtotal ??
                        (hasPrice
                          ? line.unit_price * qty - (line.discount || 0)
                          : null);
                      return (
                        <div
                          key={line.item_id ?? idx}
                          className="flex justify-between"
                        >
                          <span>
                            {name} × {qty}
                          </span>
                          <span>
                            {subtotal != null
                              ? `LKR ${subtotal.toFixed(2)}`
                              : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 text-sm">
                    <span>
                      Guests: {order.guest_count} · Total:{" "}
                      <span className="font-medium">
                        LKR {Number(order.total_cost).toFixed(2)}
                      </span>
                    </span>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-sm">
                      {NEXT_ACTIONS[order.status]?.map((action) => (
                        <button
                          key={action.to}
                          onClick={() =>
                            handleTransition(order.order_id, action.to)
                          }
                          disabled={updatingId === order.order_id}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50 ${
                            action.to === "cancelled"
                              ? "border border-red-500/60 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:border-red-400/50 dark:text-red-300"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {updatingId === order.order_id ? "…" : action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {order.special_notes && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Note: {order.special_notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {page} of {totalPages} ({total} order
                {total !== 1 ? "s" : ""})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
