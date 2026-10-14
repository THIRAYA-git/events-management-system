import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { downloadReportPdf, getReport } from "@/api/report.api";
import type { Report, ReportPeriod } from "@/types/report.types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30",
  confirmed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30",
  cancelled: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-500/30",
  completed: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-500/30",
};

const inputClass =
  "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

const money = (n: number | string) =>
  `LKR ${Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const label = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (s: string) =>
  new Date(s.slice(0, 10) + "T00:00:00").toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const today = () => new Date().toLocaleDateString("en-CA");

export function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [date, setDate] = useState(today());
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { theme } = useTheme();
const dark = theme === "dark";
const barColor = dark ? "#a78bfa" : "#7c3aed";
const tickColor = dark ? "#94a3b8" : "#64748b";
const gridColor = dark ? "rgba(148,163,184,0.15)" : "rgba(15,23,42,0.08)";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReport({ period, date });
        if (!cancelled) setReport(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load report. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period, date]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await downloadReportPdf({ period, date });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aazath-plaza-${period}-report-${
        report?.range.from ?? date
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export the report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const bucketLabel = (bucket: string) =>
    new Date(bucket + "T00:00:00").toLocaleDateString(
      "en-LK",
      period === "annual"
        ? { month: "short" }
        : { day: "numeric", month: "short" }
    );

  const rangeText = report
    ? report.range.from === report.range.to
      ? fmtDate(report.range.from)
      : `${fmtDate(report.range.from)} – ${fmtDate(report.range.to)}`
    : "";

  return (
    <div className="min-w-0">
      {/* Header + controls */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hall bookings, event types and room revenue for the selected period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-input bg-card p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  period === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading || !report}
            className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {isLoading && !report ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating report…
        </div>
      ) : error ? (
        <div className="py-24 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : report ? (
        <div className={isLoading ? "opacity-60 transition-opacity" : ""}>
          <p className="mt-4 text-sm font-medium text-foreground">{rangeText}</p>

          {/* Summary cards */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Revenue
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {money(report.summary.total_revenue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {report.summary.revenue_change_pct === null
                  ? "No previous-period revenue to compare"
                  : `${report.summary.revenue_change_pct >= 0 ? "+" : ""}${
                      report.summary.revenue_change_pct
                    }% vs previous period`}
              </p>
              <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {(
                  [
                    ["Halls", report.summary.hall_revenue],
                    ["Rooms", report.summary.room_revenue],
                    ["Other add-ons", report.summary.addon_other_revenue],
                    ["Tax", report.summary.tax_total],
                    ["Discounts", -report.summary.discount_total],
                  ] as [string, number][]
                ).map(([name, value]) => (
                  <div key={name} className="flex justify-between gap-2">
                    <dt>{name}</dt>
                    <dd className="tabular-nums">
                      {value < 0 ? "−" : ""}
                      {money(Math.abs(value))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bookings
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {report.summary.confirmed + report.summary.completed}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {report.summary.total_bookings} total
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {report.summary.pending} pending · {report.summary.cancelled}{" "}
                cancelled
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Guests
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {report.summary.total_guests.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Confirmed and completed events
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Rooms booked
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {report.rooms.total_rooms}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Room revenue {money(report.rooms.revenue)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Revenue by {period === "annual" ? "month" : "day"}
            </h2>
            {report.breakdown.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No bookings in this period.
              </p>
            ) : (
              <div className="h-64">
                <Bar
  key={theme}
  data={{
    labels: report.breakdown.map((r) => bucketLabel(r.bucket)),
    datasets: [
      {
        label: "Revenue (LKR)",
        data: report.breakdown.map((r) => r.revenue),
        backgroundColor: barColor,
        hoverBackgroundColor: dark ? "#c4b5fd" : "#6d28d9",
        borderRadius: 4,
      },
    ],
  }}
  options={{
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: tickColor }, grid: { display: false } },
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

          {/* Event types + halls */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <h2 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                By event type
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Bookings</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.by_event_type.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No data
                      </td>
                    </tr>
                  ) : (
                    report.by_event_type.map((r) => (
                      <tr key={r.event_type}>
                        <td className="px-4 py-2 text-foreground">
                          {label(r.event_type)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {r.bookings}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums">
                          {money(r.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <h2 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                Hall usage
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2">Hall</th>
                    <th className="px-4 py-2 text-right">Bookings</th>
                    <th className="px-4 py-2 text-right">Complimentary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.by_hall.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No data
                      </td>
                    </tr>
                  ) : (
                    report.by_hall.map((r) => (
                      <tr key={r.hall_id}>
                        <td className="px-4 py-2 text-foreground">
                          {r.hall_name}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {r.booking_count}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {r.complimentary_count}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
                A booking using both halls counts once for each hall.
              </p>
            </div>
          </div>

          {/* Rooms */}
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <h2 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
              Room accommodation
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2">Event type</th>
                  <th className="px-4 py-2 text-right">Bookings with rooms</th>
                  <th className="px-4 py-2 text-right">Rooms</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.rooms.by_event_type.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No room reservations in this period
                    </td>
                  </tr>
                ) : (
                  report.rooms.by_event_type.map((r) => (
                    <tr key={r.event_type}>
                      <td className="px-4 py-2 text-foreground">
                        {label(r.event_type)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {r.bookings_with_rooms}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {r.total_rooms}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums">
                        {money(r.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Rooms × LKR {report.rooms.rate_per_day.toLocaleString()} per room
              per day. Room charges are already included in total revenue.
            </p>
          </div>

          {/* Booking detail */}
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <h2 className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground">
              Booking detail
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[16%]" />
                  <col className="w-[17%]" />
                  <col className="w-[18%]" />
                  <col className="w-[13%]" />
                  <col className="w-[8%]" />
                  <col className="w-[12%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-2">Ref</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Hall / Type</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2 text-right">Guests</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.bookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No bookings in this period
                      </td>
                    </tr>
                  ) : (
                    report.bookings.map((b) => (
                      <tr key={b.booking_id}>
                        <td className="truncate px-4 py-2 font-mono text-xs text-muted-foreground">
                          {b.booking_ref}
                        </td>
                        <td className="truncate px-4 py-2 text-foreground">
                          {b.customer_name}
                        </td>
                        <td className="px-4 py-2">
                          <div className="truncate text-foreground">
                            {b.halls}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {label(b.event_type)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-foreground">
                          {fmtDate(b.event_date)}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {b.guest_count}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                              STATUS_BADGE[b.status] ?? ""
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-right font-medium tabular-nums">
                          {money(b.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {report.bookings_truncated && (
              <p className="border-t border-border px-4 py-2 text-xs text-amber-600 dark:text-amber-400">
                Showing the first 500 bookings only.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
