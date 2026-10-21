import { useEffect, useState } from "react";
import {
  Loader2,
  CalendarClock,
  Users,
  Wallet,
  UserCheck,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import {
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
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getDashboardAnalytics } from "@/lib/analytics.api";
import type { DashboardAnalytics } from "@/types/analytics.types";
import {
  getRecentBookings,
  getBookingStatusCounts,
  type RecentBookingRow,
} from "@/lib/recentBookings.api";
import { getDashboardAttention } from "@/api/dashboardAttention.api";
import type { DashboardAttention } from "@/types/dashboardAttention.types";

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

const HALL_COLORS = ["#3b82f6", "#8b5cf6"];
const EVENT_TYPE_COLOR_MAP: Record<string, string> = {
  school: "#3b82f6",
  political: "#ef4444",
  birthday: "#f59e0b",
  wedding: "#8b5cf6",
  walima: "#22c55e",
};
const FALLBACK_COLORS = ["#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#64748b"];

const eventTypeColor = (type: string, i: number) => {
  const t = type.toLowerCase();
  const key = Object.keys(EVENT_TYPE_COLOR_MAP).find((k) => t.includes(k));
  return key
    ? EVENT_TYPE_COLOR_MAP[key]
    : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
};
const CHART_HEIGHT = 220;

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  confirmed:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  completed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

const STATUS_ORDER = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  confirmed: "#22c55e",
  completed: "#3b82f6",
  cancelled: "#ef4444",
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface AttentionCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  hint: string;
  to: string;
}

/** Amber when something needs action, neutral when all clear, dash when unavailable. */
function AttentionCard({ icon, label, value, hint, to }: AttentionCardProps) {
  const needsAction = value !== null && value > 0;
  return (
    <Link
      to={to}
      className={`block rounded-lg border p-5 transition-shadow hover:shadow-md ${
        needsAction
          ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10"
          : "border-border bg-card"
      }`}
    >
      <p
        className={`flex items-center gap-1 text-xs font-medium uppercase ${
          needsAction
            ? "text-amber-700 dark:text-amber-400"
            : "text-muted-foreground"
        }`}
      >
        {icon} {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">
        {value ?? "—"}
      </p>
      <p
        className={`mt-1 text-xs ${
          needsAction
            ? "text-amber-700 dark:text-amber-400"
            : "text-muted-foreground"
        }`}
      >
        {hint}
      </p>
    </Link>
  );
}

export function AdminDashboardHome() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const canSeeAnalytics = user?.role === "admin";

  // Chart.js can't read Tailwind classes, so theme colours are passed in directly
  const dark = theme === "dark";
  const tickColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "rgba(148,163,184,0.15)" : "rgba(15,23,42,0.08)";
  const legendColor = dark ? "#cbd5e1" : "#475569";

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(canSeeAnalytics);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [statusCounts, setStatusCounts] = useState<Record<
    string,
    number
  > | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBookingRow[]>([]);
  const [attention, setAttention] = useState<DashboardAttention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base data: loaded once (recent bookings, attention cards, status counts for non-admins)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Attention cards are an extra: never block the dashboard if they fail
        const attentionPromise = getDashboardAttention().catch(() => null);
        const [recent, att, counts] = await Promise.all([
          getRecentBookings(5),
          attentionPromise,
          canSeeAnalytics ? Promise.resolve(null) : getBookingStatusCounts(),
        ]);
        setRecentBookings(recent);
        setAttention(att);
        setStatusCounts(counts);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canSeeAnalytics]);

  // Analytics: re-fetched whenever the date filter changes (admin only)
  useEffect(() => {
    if (!canSeeAnalytics) return;
    let cancelled = false;
    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const res = await getDashboardAnalytics({
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        });
        if (!cancelled) setAnalytics(res);
      } catch (err) {
        console.error(err);
        if (!cancelled)
          setAnalyticsError("Failed to load analytics. Please try again.");
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, [canSeeAnalytics, dateFrom, dateTo]);

  // Full-page spinner only on first load; filter changes just dim the charts
  if (loading || (canSeeAnalytics && analytics === null && analyticsLoading)) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  const hasFilter = Boolean(dateFrom || dateTo);
  const periodLabel = hasFilter ? "selected period" : "all-time";

  const totalRevenue = analytics
    ? analytics.revenueOverTime.reduce((sum, p) => sum + Number(p.revenue), 0)
    : 0;
  const totalBookings = analytics
    ? analytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0)
    : Object.values(statusCounts ?? {}).reduce((a, b) => a + b, 0);
  const pendingCount = analytics
    ? analytics.statusBreakdown.find((s) => s.status === "pending")?.count ?? 0
    : statusCounts?.pending ?? 0;

  // Status split for the doughnut
  const rawCounts: Record<string, number> = analytics
    ? Object.fromEntries(
        analytics.statusBreakdown.map((s) => [s.status, s.count])
      )
    : statusCounts ?? {};
  const statusEntries = [
    ...STATUS_ORDER.filter((k) => (rawCounts[k] ?? 0) > 0),
    ...Object.keys(rawCounts).filter(
      (k) => !STATUS_ORDER.includes(k) && rawCounts[k] > 0
    ),
  ].map((status) => ({ status, count: rawCounts[status] }));

  const organizerHint =
    attention?.organizerNeedsReassign && attention.organizerNeedsReassign > 0
      ? `${attention.organizerNeedsReassign} declined, need a new organizer`
      : "Awaiting organizer response";

  const fb = attention?.feedback;

  const statusCard = (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-foreground">
        Booking Status
      </h3>
      {statusEntries.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No bookings yet.
        </p>
      ) : (
        <div style={{ height: CHART_HEIGHT }} className="mx-auto max-w-[280px]">
          <Doughnut
            key={theme}
            data={{
              labels: statusEntries.map(
                (e) => `${capitalize(e.status)} (${e.count})`
              ),
              datasets: [
                {
                  data: statusEntries.map((e) => e.count),
                  backgroundColor: statusEntries.map(
                    (e) => STATUS_COLORS[e.status] ?? "#9ca3af"
                  ),
                  borderWidth: 2,
                  // White borders look like outlines on a dark card
                  borderColor: dark ? "transparent" : "#ffffff",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "65%",
              plugins: {
                legend: { position: "bottom", labels: { color: legendColor } },
              },
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {canSeeAnalytics
          ? "Revenue, utilization, and customer insights across Aazath Plaza."
          : "Booking status overview across Aazath Plaza."}
      </p>

      {/* ── Summary cards ───────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {canSeeAnalytics && (
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> Total Revenue
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirmed + completed, {periodLabel}
            </p>
          </div>
        )}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" /> Total Bookings
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {totalBookings}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            All statuses{canSeeAnalytics ? `, ${periodLabel}` : ""}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Pending Approval
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Awaiting confirmation
          </p>
        </div>
      </div>

      {/* ── Needs attention ─────────────────────────────────── */}
      {attention && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-foreground">
            Needs attention
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AttentionCard
              icon={<UserCheck className="h-3.5 w-3.5" />}
              label="Organizer Requests"
              value={attention.organizerPending}
              hint={organizerHint}
              to="/admin/bookings"
            />
            <AttentionCard
              icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
              label="Catering Orders"
              value={attention.cateringPending}
              hint="Pending confirmation"
              to="/admin/catering"
            />
            {fb && (
              <AttentionCard
                icon={<Star className="h-3.5 w-3.5" />}
                label="Low-rated Reviews"
                value={fb.lowRated}
                hint={
                  fb.avgRating !== null && fb.total !== null
                    ? `2★ or below · avg ${fb.avgRating.toFixed(1)} from ${
                        fb.total
                      } reviews`
                    : "2★ or below"
                }
                to="/admin/feedback"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Analytics (admin only) ──────────────────────────── */}
      {canSeeAnalytics && (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground"
              />
            </div>
            {hasFilter && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear (show all-time)
              </button>
            )}
            {analyticsLoading && (
              <Loader2 className="mb-2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {analyticsError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {analyticsError}
            </p>
          )}

          {analytics && (
            <div
              className={`mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 transition-opacity ${
                analyticsLoading ? "opacity-60" : ""
              }`}
            >
              {/* Revenue Over Time */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Revenue Over Time
                </h3>
                {analytics.revenueOverTime.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    No revenue data yet.
                  </p>
                ) : (
                  <div style={{ height: CHART_HEIGHT }}>
                    <Line
                      key={theme}
                      data={{
                        labels: analytics.revenueOverTime.map((p) =>
                          formatMonth(p.month)
                        ),
                        datasets: [
                          {
                            label: "Revenue (LKR)",
                            data: analytics.revenueOverTime.map((p) =>
                              Number(p.revenue)
                            ),
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
                        scales: {
                          x: {
                            ticks: { color: tickColor },
                            grid: { color: gridColor },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { color: tickColor },
                            grid: { color: gridColor },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Room Accommodations */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Room Accommodations by Event Type
                </h3>
                {analytics.roomAccommodationsByEventType.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    No room bookings recorded yet.
                  </p>
                ) : (
                  <div style={{ height: CHART_HEIGHT }}>
                    <Bar
                      key={theme}
                      data={{
                        labels: analytics.roomAccommodationsByEventType.map(
                          (r) => r.event_type
                        ),
                        datasets: [
                          {
                            label: "Rooms booked",
                            data: analytics.roomAccommodationsByEventType.map(
                              (r) => r.total_rooms
                            ),
                            backgroundColor:
                              analytics.roomAccommodationsByEventType.map(
                                (r, i) => eventTypeColor(r.event_type, i)
                              ),
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: {
                            ticks: { color: tickColor },
                            grid: { display: false },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: tickColor },
                            grid: { color: gridColor },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Revenue by Event Type */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Revenue by Event Type
                </h3>
                {analytics.revenueByEventType.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    No data yet.
                  </p>
                ) : (
                  <div style={{ height: CHART_HEIGHT }}>
                    <Bar
                      key={theme}
                      data={{
                        labels: analytics.revenueByEventType.map(
                          (e) => e.event_type
                        ),
                        datasets: [
                          {
                            label: "Revenue (LKR)",
                            data: analytics.revenueByEventType.map((e) =>
                              Number(e.revenue)
                            ),
                            backgroundColor: analytics.revenueByEventType.map(
                              (e, i) => eventTypeColor(e.event_type, i)
                            ),
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: {
                            ticks: { color: tickColor },
                            grid: { display: false },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { color: tickColor },
                            grid: { color: gridColor },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Hall Utilization */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">
                  Hall Utilization
                </h3>
                {analytics.hallUtilization.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center">
                    No bookings yet.
                  </p>
                ) : (
                  <div style={{ height: CHART_HEIGHT }}>
                    <Bar
                      key={theme}
                      data={{
                        labels: analytics.hallUtilization.map(
                          (h) => h.hall_name
                        ),
                        datasets: [
                          {
                            label: "Bookings",
                            data: analytics.hallUtilization.map(
                              (h) => h.booking_count
                            ),
                            backgroundColor: HALL_COLORS,
                          },
                        ],
                      }}
                      options={{
                        indexAxis: "y" as const,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: tickColor },
                            grid: { color: gridColor },
                          },
                          y: {
                            ticks: { color: tickColor },
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Recent bookings + status / top customers ────────── */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Recent Bookings
          </h3>
          {recentBookings.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No bookings yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
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
                      <td className="py-2 pr-4">
                        {new Date(b.event_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">{b.hall_name}</td>
                      <td className="py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            STATUS_STYLES[b.status] ?? ""
                          }`}
                        >
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
            <Link
              to="/admin/bookings"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all bookings →
            </Link>
          </div>
        </div>

        {statusCard}
      </div>

      {/* Top Customers (admin only) */}
      {canSeeAnalytics && analytics && (
        <div className="mt-4 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Top Customers by Spend
          </h3>
          {analytics.topCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No data yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {analytics.topCustomers.map((c, i) => (
                <div
                  key={c.customer_id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-xs font-medium text-blue-700 dark:text-blue-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {c.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.customer_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(c.total_spend)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.booking_count} bookings
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
