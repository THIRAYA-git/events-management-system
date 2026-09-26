import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  listAllCateringOrders,
  updateCateringOrderStatus,
} from "@/lib/catering.api";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
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

const STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];
const PAGE_SIZE = 10;

export default function RestaurantCateringOrdersPage() {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAllCateringOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
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
  }, [statusFilter, page]);

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Catering Orders</h1>
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

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">No catering orders found.</p>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="rounded-md border border-gray-200 bg-white p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{order.booking_ref}</span>{" "}
                    <span className="text-gray-500">
                      — {order.customer_name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
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

                <div className="mb-2 text-sm text-gray-600">
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

                  <div className="flex gap-2">
                    {NEXT_ACTIONS[order.status]?.map((action) => (
                      <button
                        key={action.to}
                        onClick={() =>
                          handleTransition(order.order_id, action.to)
                        }
                        disabled={updatingId === order.order_id}
                        className={`rounded-md border px-3 py-1 text-xs disabled:opacity-50 ${
                          action.to === "cancelled"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {updatingId === order.order_id ? "…" : action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {order.special_notes && (
                  <p className="mt-2 text-xs italic text-gray-500">
                    Note: {order.special_notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
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
