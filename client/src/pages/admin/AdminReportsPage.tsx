import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  completed: "bg-blue-50 text-blue-700 ring-blue-200",
};

const inputClass =
  "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Hall bookings, event types and room revenue for the selected
            period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  period === p.value
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
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
            className="flex h-9 items-center gap-1.5 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating report…
        </div>
      ) : error ? (
        <div className="py-24 text-center text-sm text-red-600">{error}</div>
      ) : report ? (
        <div className={isLoading ? "opacity-60 transition-opacity" : ""}>
          <p className="mt-4 text-sm font-medium text-gray-700">{rangeText}</p>

          {/* Summary cards */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Revenue
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {money(report.summary.total_revenue)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {report.summary.revenue_change_pct === null
                  ? "No previous-period revenue to compare"
                  : `${report.summary.revenue_change_pct >= 0 ? "+" : ""}${
                      report.summary.revenue_change_pct
                    }% vs previous period`}
              </p>
              <dl className="mt-2 space-y-0.5 text-xs text-gray-500">
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

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Bookings
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {report.summary.confirmed + report.summary.completed}
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  / {report.summary.total_bookings} total
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {report.summary.pending} pending · {report.summary.cancelled}{" "}
                cancelled
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Guests
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {report.summary.total_guests.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Confirmed and completed events
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rooms booked
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {report.rooms.total_rooms}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Room revenue {money(report.rooms.revenue)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">
              Revenue by {period === "annual" ? "month" : "day"}
            </h2>
            {report.breakdown.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                No bookings in this period.
              </p>
            ) : (
              <div className="h-64">
                <Bar
                  data={{
                    labels: report.breakdown.map((r) => bucketLabel(r.bucket)),
                    datasets: [
                      {
                        label: "Revenue (LKR)",
                        data: report.breakdown.map((r) => r.revenue),
                        backgroundColor: "#111827",
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            )}
          </div>

          {/* Event types + halls */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                By event type
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Bookings</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.by_event_type.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        No data
                      </td>
                    </tr>
                  ) : (
                    report.by_event_type.map((r) => (
                      <tr key={r.event_type}>
                        <td className="px-4 py-2 text-gray-800">
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                Hall usage
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-4 py-2">Hall</th>
                    <th className="px-4 py-2 text-right">Bookings</th>
                    <th className="px-4 py-2 text-right">Complimentary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.by_hall.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        No data
                      </td>
                    </tr>
                  ) : (
                    report.by_hall.map((r) => (
                      <tr key={r.hall_id}>
                        <td className="px-4 py-2 text-gray-800">{r.hall_name}</td>
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
              <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                A booking using both halls counts once for each hall.
              </p>
            </div>
          </div>

          {/* Rooms */}
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
              Room accommodation
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-2">Event type</th>
                  <th className="px-4 py-2 text-right">Bookings with rooms</th>
                  <th className="px-4 py-2 text-right">Rooms</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.rooms.by_event_type.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      No room reservations in this period
                    </td>
                  </tr>
                ) : (
                  report.rooms.by_event_type.map((r) => (
                    <tr key={r.event_type}>
                      <td className="px-4 py-2 text-gray-800">
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
            <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
              Rooms × LKR {report.rooms.rate_per_day.toLocaleString()} per room
              per day. Room charges are already included in total revenue.
            </p>
          </div>

          {/* Booking detail */}
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <h2 className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
              Booking detail
            </h2>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-2">Ref</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Hall / Type</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Guests</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                      No bookings in this period
                    </td>
                  </tr>
                ) : (
                  report.bookings.map((b) => (
                    <tr key={b.booking_id}>
                      <td className="truncate px-4 py-2 font-mono text-xs text-gray-500">
                        {b.booking_ref}
                      </td>
                      <td className="truncate px-4 py-2 text-gray-800">
                        {b.customer_name}
                      </td>
                      <td className="px-4 py-2">
                        <div className="truncate text-gray-800">{b.halls}</div>
                        <div className="text-xs text-gray-500">
                          {label(b.event_type)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
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
            {report.bookings_truncated && (
              <p className="border-t border-gray-100 px-4 py-2 text-xs text-amber-600">
                Showing the first 500 bookings only.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}