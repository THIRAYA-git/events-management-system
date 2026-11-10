import { useEffect, useState } from "react";
import {
  Loader2,
  UtensilsCrossed,
  ClipboardList,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { listMenuItems } from "@/api/menu.api";
import { listAllCateringOrders } from "@/lib/catering.api";
import { useAuth } from "@/context/AuthContext";
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

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
        Restaurant Dashboard
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={UtensilsCrossed}
          label="Menu Items"
          value={menuItemCount}
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={counts.pending || 0}
        />
        <StatCard
          icon={ClipboardList}
          label="In Progress"
          value={(counts.confirmed || 0) + (counts.preparing || 0)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={counts.delivered || 0}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Recent Orders
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No catering orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.order_id}>
                  <td className="px-4 py-3">{order.booking_ref}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{order.event_type}</td>
                  <td className="px-4 py-3">{order.guest_count}</td>
                  <td className="px-4 py-3">
                    LKR {Number(order.total_cost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLES[order.status] ?? ""
                      }`}
                    >
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UtensilsCrossed;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase">{label}</span>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
