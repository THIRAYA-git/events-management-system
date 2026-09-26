import { useEffect, useState } from "react";
import { Loader2, UtensilsCrossed, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { listMenuItems } from "@/api/menu.api";
import { listAllCateringOrders } from "@/lib/catering.api";
import { useAuth } from "@/context/AuthContext";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function RestaurantDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItemCount, setMenuItemCount] = useState(0);
  const [orders, setOrders] = useState<CateringOrder[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [menuItems, orderResult] = await Promise.all([
          listMenuItems(true),
          listAllCateringOrders(),
        ]);
        setMenuItemCount(
          menuItems.filter((i) => i.restaurant_id === Number(user?.id)).length
        );
        setOrders(orderResult.orders);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Restaurant Dashboard</h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={UtensilsCrossed} label="Menu Items" value={menuItemCount} />
        <StatCard icon={Clock} label="Pending Orders" value={counts.pending || 0} />
        <StatCard icon={ClipboardList} label="In Progress" value={(counts.confirmed || 0) + (counts.preparing || 0)} />
        <StatCard icon={CheckCircle2} label="Delivered" value={counts.delivered || 0} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No catering orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.order_id}>
                  <td className="px-4 py-3">{order.booking_ref}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.event_type}</td>
                  <td className="px-4 py-3">{order.guest_count}</td>
                  <td className="px-4 py-3">LKR {Number(order.total_cost).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof UtensilsCrossed; label: string; value: number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase">{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}