import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { listAllCateringOrders } from "@/lib/catering.api";
import type { CateringOrder } from "@/types/catering.types";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];
const PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "weekly", label: "This week" },
  { value: "monthly", label: "This month" },
  { value: "yearly", label: "This year" },
] as const;
type Period = (typeof PERIOD_OPTIONS)[number]["value"];
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<string, string> = {
  pending:
    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  preparing:
    "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
};

// ⚠ Change this if your order's date field has a different name
const getOrderDate = (o: CateringOrder): Date | null => {
  const raw = (o as any).created_at ?? (o as any).event_date;
  const d = raw ? new Date(raw) : null;
  return d && !isNaN(d.getTime()) ? d : null;
};

function getRange(period: Period): { start: Date; end: Date } | null {
  const now = new Date();
  if (period === "weekly") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  if (period === "monthly") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }
  if (period === "yearly") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1),
    };
  }
  return null;
}

export function AdminCateringPage() {
  const [allOrders, setAllOrders] = useState<CateringOrder[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [period, setPeriod] = useState<Period>("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listAllCateringOrders({
        status: statusFilter || undefined,
        limit: 1000,
        offset: 0,
      });
      setAllOrders(res.orders);
    } catch (err) {
      setError("Failed to load catering orders. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    const range = getRange(period);
    if (!range) return allOrders;
    return allOrders.filter((o) => {
      const d = getOrderDate(o);
      return d && d >= range.start && d < range.end;
    });
  }, [allOrders, period]);

  const total = filtered.length;
  const offset = page * PAGE_SIZE;
  const orders = filtered.slice(offset, offset + PAGE_SIZE);

  const downloadPdf = () => {
    const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)!.label;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Aazath Plaza - Catering Orders Report", 14, 16);
    doc.setFontSize(10);
    doc.text(
      `Period: ${periodLabel}   |   Status: ${
        statusFilter || "All"
      }   |   Generated: ${new Date().toLocaleString()}`,
      14,
      23
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "Booking",
          "Event",
          "Customer",
          "Items",
          "Guests",
          "Total (LKR)",
          "Status",
        ],
      ],
      body: filtered.map((o) => [
        String(o.booking_ref ?? ""),
        String(o.event_type ?? ""),
        String(o.customer_name ?? ""),
        o.menu_items.map((l) => `${l.quantity}x ${l.item_name}`).join(", "),
        String(o.guest_count ?? ""),
        Number(o.total_cost).toLocaleString(),
        String(o.status ?? ""),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [88, 28, 135] },
      columnStyles: { 3: { cellWidth: 80 } },
    });

    const sum = filtered.reduce((s, o) => s + Number(o.total_cost), 0);
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.text(
      `Total orders: ${
        filtered.length
      }   |   Total value: LKR ${sum.toLocaleString()}`,
      14,
      finalY
    );

    doc.save(
      `catering-orders-${period}-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const selectCls = "ml-2 rounded-md border border-input px-2 py-1.5 text-sm";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Catering Orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View food orders placed against customer bookings. Order status is
        managed by the restaurant partner.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="text-sm text-muted-foreground">
          Period
          <select
            value={period}
            onChange={(e) => {
              setPage(0);
              setPeriod(e.target.value as Period);
            }}
            className={selectCls}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted-foreground">
          Status
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(0);
              setStatusFilter(e.target.value);
            }}
            className={selectCls}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={downloadPdf}
          disabled={isLoading || filtered.length === 0}
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading orders…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No catering orders match these filters.
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
                    <div className="font-medium text-foreground">
                      {order.booking_ref}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.event_type}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customer_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.menu_items.map((line) => (
                      <div key={line.item_id}>
                        {line.quantity}× {line.item_name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.guest_count}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    LKR {Number(order.total_cost).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_BADGE[order.status] ??
                        "bg-muted text-muted-foreground"
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
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of{" "}
            {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setPage((p) => p + 1)}
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
