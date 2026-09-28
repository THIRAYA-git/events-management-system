import { useEffect, useState, useCallback } from "react";
import { getDashboardAnalytics } from "@/lib/analytics.api";
import type { DashboardAnalytics } from "@/types/analytics.types";
import { Loader2 } from "lucide-react";import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  cancelled: "#ef4444",
  completed: "#3b82f6",
};

const HALL_COLORS = ["#3b82f6", "#8b5cf6"];
const EVENT_TYPE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const CHART_HEIGHT = 220;

const formatCurrency = (amount: string | number) =>
  `LKR ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-LK", {
    month: "short",
    year: "numeric",
  });
};

export function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDashboardAnalytics({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setData(res);
    } catch (err) {
      setError("Failed to load analytics. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-24 text-center text-sm text-red-600">
        {error ?? "No data available."}
      </div>
    );
  }

  const totalRevenue = data.revenueOverTime.reduce((sum, p) => sum + Number(p.revenue), 0);
  const totalBookings = data.statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">
        Revenue, utilization, and customer insights across all bookings.
      </p>

      {/* ── Date Filter ─────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear (show all-time)
          </button>
        )}
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-gray-400">Confirmed + completed bookings</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Bookings</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{totalBookings}</p>
          <p className="mt-1 text-xs text-gray-400">All statuses, selected period</p>
        </div>
      </div>

      {/* ── Charts Grid ─────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Over Time */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue Over Time</h3>
          {data.revenueOverTime.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No revenue data yet.</p>
          ) : (
            <div style={{ height: CHART_HEIGHT }}>
              <Line
                data={{
                  labels: data.revenueOverTime.map((p) => formatMonth(p.month)),
                  datasets: [
                    {
                      label: "Revenue (LKR)",
                      data: data.revenueOverTime.map((p) => Number(p.revenue)),
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          )}
        </div>

        {/* Accommodation Placeholder / Room Accommodations */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Room Accommodations by Event Type</h3>
          {data.roomAccommodationsByEventType.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No room bookings recorded yet.</p>
          ) : (
            <div style={{ height: CHART_HEIGHT }}>
              <Bar
                data={{
                  labels: data.roomAccommodationsByEventType.map((r) => r.event_type),
                  datasets: [
                    {
                      label: "Rooms booked",
                      data: data.roomAccommodationsByEventType.map((r) => r.total_rooms),
                      backgroundColor: EVENT_TYPE_COLORS,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          )}
        </div>

        {/* Revenue by Event Type */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue by Event Type</h3>
          {data.revenueByEventType.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
          ) : (
            <div style={{ height: CHART_HEIGHT }}>
              <Bar
                data={{
                  labels: data.revenueByEventType.map((e) => e.event_type),
                  datasets: [
                    {
                      label: "Revenue (LKR)",
                      data: data.revenueByEventType.map((e) => Number(e.revenue)),
                      backgroundColor: EVENT_TYPE_COLORS,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          )}
        </div>

        {/* Hall Utilization */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Hall Utilization</h3>
          {data.hallUtilization.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No bookings yet.</p>
          ) : (
            <div style={{ height: CHART_HEIGHT }}>
              <Bar
                data={{
                  labels: data.hallUtilization.map((h) => h.hall_name),
                  datasets: [
                    {
                      label: "Bookings",
                      data: data.hallUtilization.map((h) => h.booking_count),
                      backgroundColor: HALL_COLORS,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y" as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                }}
              />
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Booking Status Breakdown</h3>
          {data.statusBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No bookings yet.</p>
          ) : (
            <div style={{ height: CHART_HEIGHT }} className="mx-auto max-w-[280px]">
              <Doughnut
                data={{
                  labels: data.statusBreakdown.map(
                    (s) => s.status.charAt(0).toUpperCase() + s.status.slice(1)
                  ),
                  datasets: [
                    {
                      data: data.statusBreakdown.map((s) => s.count),
                      backgroundColor: data.statusBreakdown.map(
                        (s) => STATUS_COLORS[s.status] ?? "#9ca3af"
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Top Customers by Spend</h3>
          {data.topCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topCustomers.map((c, i) => (
                <div
                  key={c.customer_id}
                  className="flex items-center justify-between rounded-md border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.customer_name}</p>
                      <p className="text-xs text-gray-400">{c.customer_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatCurrency(c.total_spend)}
                    </p>
                    <p className="text-xs text-gray-400">{c.booking_count} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
