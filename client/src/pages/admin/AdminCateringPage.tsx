import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { listAllCateringOrders, updateCateringOrderStatus } from "@/lib/catering.api";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "delivered", "cancelled"];
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

// Mirrors ALLOWED_TRANSITIONS in catering.service.js
const NEXT_STATUS: Record<string, string | null> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "delivered",
  delivered: null,
  cancelled: null,
};
const CANCELLABLE_FROM = ["pending", "confirmed", "preparing"];

export function AdminCateringPage() {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
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

  const handleAdvance = async (order: CateringOrder, newStatus: string) => {
    setActionLoadingId(order.order_id);
    try {
      await updateCateringOrderStatus(order.order_id, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error(err);
      setError("Failed to update order status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Catering Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Track and progress food orders placed against customer bookings.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-gray-600">
          Status
          <select
            value={statusFilter}
            onChange={(e) => {
              setOffset(0);
              setStatusFilter(e.target.value);
            }}
            className="ml-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
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

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading orders…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No catering orders match this filter.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{order.booking_ref}</div>
                    <div className="text-xs text-gray-500">{order.event_type}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.menu_items.map((line) => (
                      <div key={line.item_id}>
                        {line.quantity}× {line.item_name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.guest_count}</td>
                  <td className="px-4 py-3 text-gray-600">
                    LKR {Number(order.total_cost).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {NEXT_STATUS[order.status] && (
                        <button
                          disabled={actionLoadingId === order.order_id}
                          onClick={() => handleAdvance(order, NEXT_STATUS[order.status]!)}
                          className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Mark {NEXT_STATUS[order.status]}
                        </button>
                      )}
                      {CANCELLABLE_FROM.includes(order.status) && (
                        <button
                          disabled={actionLoadingId === order.order_id}
                          onClick={() => handleAdvance(order, "cancelled")}
                          className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
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