import { useEffect, useState } from "react";
import { Loader2, CalendarClock, Users, TrendingUp, Wallet } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getDashboardAnalytics } from "@/lib/analytics.api";
import type { DashboardAnalytics } from "@/types/analytics.types";
import {
  getRecentBookings,
  getBookingStatusCounts,
  type RecentBookingRow,
} from "@/lib/recentBookings.api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const HALL_COLORS = ["#3b82f6", "#8b5cf6"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const formatCurrency = (amount: string | number) =>
  `LKR ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-LK", {
    month: "short",
    year: "numeric",
  });
};

export function AdminDashboardHome() {
  const { user } = useAuth();
  const canSeeAnalytics = user?.role === "admin" || user?.role === "manager";

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (canSeeAnalytics) {
          const [analyticsData, recent] = await Promise.all([
            getDashboardAnalytics({}),
            getRecentBookings(5),
          ]);
          setAnalytics(analyticsData);
          setRecentBookings(recent);
        } else {
          const [counts, recent] = await Promise.all([
            getBookingStatusCounts(),
            getRecentBookings(5),
          ]);
          setStatusCounts(counts);
          setRecentBookings(recent);
        }
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return <div className="py-24 text-center text-sm text-red-600">{error}</div>;
  }

  const totalRevenue = analytics
    ? analytics.revenueOverTime.reduce((sum, p) => sum + Number(p.revenue), 0)
    : 0;
  const totalBookings = analytics
    ? analytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0)
    : Object.values(statusCounts ?? {}).reduce((a, b) => a + b, 0);
  const pendingCount = analytics
    ? analytics.statusBreakdown.find((s) => s.status === "pending")?.count ?? 0
    : statusCounts?.pending ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        {canSeeAnalytics
          ? "Revenue and booking overview across Aazath Plaza."
          : "Booking status overview across Aazath Plaza."}
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canSeeAnalytics && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="flex items-center gap-1 text-xs font-medium uppercase text-gray-500">
              <Wallet className="h-3.5 w-3.5" /> Total Revenue
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-800">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-gray-400">Confirmed + completed, all-time</p>
          </div>
        )}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase text-gray-500">
            <CalendarClock className="h-3.5 w-3.5" /> Total Bookings
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{totalBookings}</p>
          <p className="mt-1 text-xs text-gray-400">All statuses</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase text-gray-500">
            <Users className="h-3.5 w-3.5" /> Pending Approval
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{pendingCount}</p>
          <p className="mt-1 text-xs text-gray-400">Awaiting confirmation</p>
        </div>
      </div>

      {canSeeAnalytics && analytics && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-700">
              <TrendingUp className="h-4 w-4" /> Monthly Revenue
            </h3>
            {analytics.revenueOverTime.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No revenue data yet.</p>
            ) : (
              <Line
                data={{
                  labels: analytics.revenueOverTime.map((p) => formatMonth(p.month)),
                  datasets: [
                    {
                      label: "Revenue (LKR)",
                      data: analytics.revenueOverTime.map((p) => Number(p.revenue)),
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-medium text-gray-700">Hall Booking Counts</h3>
            {analytics.hallUtilization.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No bookings yet.</p>
            ) : (
              <Bar
                data={{
                  labels: analytics.hallUtilization.map((h) => h.hall_name),
                  datasets: [
                    {
                      label: "Bookings",
                      data: analytics.hallUtilization.map((h) => h.booking_count),
                      backgroundColor: HALL_COLORS,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y" as const,
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            )}
          </div>

          <div className="text-right lg:col-span-2">
            <Link to="/admin/analytics" className="text-sm text-blue-600 hover:underline">
              View full analytics →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-medium text-gray-700">Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-400">
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Event Date</th>
                  <th className="pb-2 pr-4">Hall</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.booking_id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{b.customer_name}</td>
                    <td className="py-2 pr-4">{new Date(b.event_date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{b.hall_name}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 text-right">
          <Link to="/admin/bookings" className="text-sm text-blue-600 hover:underline">
            View all bookings →
          </Link>
        </div>
      </div>
    </div>
  );
}