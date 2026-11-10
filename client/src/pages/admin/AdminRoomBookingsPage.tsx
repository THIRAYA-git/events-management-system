import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Banknote, Download, Loader2, Search, X } from "lucide-react";
import {
  downloadRoomInvoice,
  fetchRoomGroups,
  recordRoomCashPayment,
} from "@/api/roomAdmin.api";
import type { RoomGroup } from "@/types/roomAdmin.types";

const PAGE_SIZE = 10;

const fmtLkr = (n: number | string) =>
  `LKR ${Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const fmtDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? fallback;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

const canTakeCash = (g: RoomGroup) =>
  g.payment_status === "unpaid" &&
  (g.status === "pending" || g.status === "confirmed");

function CashDialog({
  group,
  onClose,
  onDone,
}: {
  group: RoomGroup;
  onClose: () => void;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await recordRoomCashPayment(group.group_ref, note);
      onDone();
    } catch (err) {
      setError(errMsg(err, "Failed to record payment. Please try again."));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Record Cash Payment
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {group.group_ref} — {group.customer_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {group.rooms} · {fmtDate(group.check_in)} to {fmtDate(group.check_out)}
        </p>

        <div className="mt-4 rounded-lg border border-border bg-muted/60 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cash to be received
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {fmtLkr(group.total_amount)}
          </div>
        </div>

        <label className="mb-1 mt-4 block text-xs font-medium text-muted-foreground">
          Note / receipt no. (optional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="e.g. Receipt #1042"
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm cash received
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminRoomBookingsPage() {
  const [groups, setGroups] = useState<RoomGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [cashFor, setCashFor] = useState<RoomGroup | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setGroups(await fetchRoomGroups());
    } catch (err) {
      toast.error(errMsg(err, "Failed to load room bookings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter(
      (g) =>
        (status === "all" || g.status === status) &&
        (payment === "all" || g.payment_status === payment) &&
        (!q ||
          g.group_ref.toLowerCase().includes(q) ||
          g.customer_name.toLowerCase().includes(q) ||
          g.customer_email.toLowerCase().includes(q) ||
          g.rooms.toLowerCase().includes(q))
    );
  }, [groups, search, status, payment]);

  useEffect(() => setPage(1), [search, status, payment]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onInvoice = async (g: RoomGroup) => {
    setDownloading(g.group_ref);
    try {
      await downloadRoomInvoice(g.group_ref);
    } catch {
      toast.error("Invoice is not available for this booking.");
    } finally {
      setDownloading(null);
    }
  };

  const selectCls =
    "h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4">
      <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Room Bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          Accommodation bookings, cash payments and invoices.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, customer, room"
            className={`${selectCls} w-64 pl-8`}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className={selectCls}>
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} booking{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5">Reference</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Rooms</th>
              <th className="px-3 py-2.5">Stay</th>
              <th className="px-3 py-2.5 text-right">Total</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Payment</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  No room bookings found.
                </td>
              </tr>
            ) : (
              rows.map((g) => (
                <tr key={g.group_ref} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-foreground">{g.group_ref}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-foreground">{g.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{g.customer_email}</div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground">
                    {g.rooms}
                    <div className="text-xs text-muted-foreground">
                      {g.guests} guest{g.guests === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                    {fmtDate(g.check_in)} → {fmtDate(g.check_out)}
                    <div className="text-xs text-muted-foreground">
                      {g.nights} night{g.nights === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-foreground">
                    {fmtLkr(g.total_amount)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[g.status]}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {g.payment_status === "paid" ? (
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Paid · {g.payment_method === "cash" ? "Cash" : "Online"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unpaid</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {canTakeCash(g) && (
                        <button
                          onClick={() => setCashFor(g)}
                          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          <Banknote className="h-3.5 w-3.5" />
                          Mark paid
                        </button>
                      )}
                      {g.payment_status === "paid" && (
                        <button
                          onClick={() => onInvoice(g)}
                          disabled={downloading === g.group_ref}
                          title="Download invoice"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                        >
                          {downloading === g.group_ref ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page} of {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-border px-3 py-1 text-foreground hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {cashFor && (
        <CashDialog
          group={cashFor}
          onClose={() => setCashFor(null)}
          onDone={() => {
            toast.success("Cash payment recorded. Invoice sent to the customer.");
            setCashFor(null);
            load();
          }}
        />
      )}
    </div>
  );
}