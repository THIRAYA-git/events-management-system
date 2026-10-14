import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { listAllCateringOrders } from "@/lib/catering.api";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "delivered", "cancelled"];
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  preparing: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

export function AdminCateringPage() {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listAllCateringOrders({
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) {
      setError("Failed to load catering orders. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Catering Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View food orders placed against customer bookings. Order status is managed by the
        restaurant partner.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">
          Status
          <select
            value={statusFilter}
            onChange={(e) => {
              setOffset(0);
              setStatusFilter(e.target.value);
            }}
            className="ml-2 rounded-md border border-input px-2 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading orders…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No catering orders match this filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{order.booking_ref}</div>
                    <div className="text-xs text-muted-foreground">{order.event_type}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.customer_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.menu_items.map((line) => (
                      <div key={line.item_id}>
                        {line.quantity}× {line.item_name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.guest_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    LKR {Number(order.total_cost).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_BADGE[order.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
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

