import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { getMyBookingAssignments, respondToAssignment } from "@/api/organizer.api";
import type { OrganizerAssignment, RespondAction } from "@/types/organizer.types";

type DateFilter = "all" | "overdue" | "today" | "upcoming";
type DateBucket = "overdue" | "today" | "upcoming" | "past";

const DATE_TABS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

/** Builds a compact page list like [1, "…", 4, 5, 6, "…", 12] */
function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

// Midnight timestamp for a date string. Date-only strings (YYYY-MM-DD) are
// parsed as local time to avoid the UTC off-by-one-day bug.
const toDay = (value: string) => {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const getBucket = (a: OrganizerAssignment): DateBucket => {
  // Declined requests are no longer the organizer's work
  if (a.status === "declined") return "past";
  const eventDay = toDay(a.event_date);
  const today = toDay(new Date().toISOString().slice(0, 10) + "T00:00:00");
  if (eventDay === today) return "today";
  if (eventDay > today) return "upcoming";
  // Past event: only "overdue" if the work isn't finished
  return a.status === "completed" ? "past" : "overdue";
};

export default function OrganizerEventRequestsPage() {
  const [assignments, setAssignments] = useState<OrganizerAssignment[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // accept / decline state
  const [busyId, setBusyId] = useState<number | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBookingAssignments();
        // This page is only for requests still waiting for a decision.
        // Accepted events live under "Manage Confirmed Events".
        setAssignments(data.filter((a) => a.status === "assigned"));
      } catch {
        setError("Failed to load event assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Back to page 1 whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [dateFilter, pageSize]);

  const handleRespond = async (a: OrganizerAssignment, action: RespondAction) => {
    if (
      action === "accept" &&
      !window.confirm(`Accept ${a.booking_ref} (${a.customer_name})?`)
    )
      return;

    setBusyId(a.id);
    try {
      await respondToAssignment(
        a.id,
        action,
        action === "decline" ? reason.trim() : undefined
      );
      // Decided requests leave this page: accepted ones move to Manage Confirmed Events
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
      toast.success(
        action === "accept"
          ? "Request accepted. You can manage it under Manage Confirmed Events."
          : "Request declined."
      );
      setDecliningId(null);
      setReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not update this request.");
    } finally {
      setBusyId(null);
    }
  };

  // Counts respect the status dropdown, so the pills always match the list
  const counts = useMemo(() => {
    const c: Record<DateFilter, number> = { all: 0, overdue: 0, today: 0, upcoming: 0 };
    assignments
      .forEach((a) => {
        c.all++;
        const b = getBucket(a);
        if (b !== "past") c[b]++;
      });
    return c;
  }, [assignments]);

  const filtered = useMemo(() => {
    const list = assignments.filter((a) => dateFilter === "all" || getBucket(a) === dateFilter);

    // Overdue: most recent first. Everything else: nearest date first.
    const dir = dateFilter === "overdue" ? -1 : 1;
    return [...list].sort((a, b) => dir * (toDay(a.event_date) - toDay(b.event_date)));
  }, [assignments, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const visible = filtered.slice(startIdx, startIdx + pageSize);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition";

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Event Requests</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {assignments.length > 0
            ? `${assignments.length} request${assignments.length === 1 ? "" : "s"} waiting for your response`
            : "Requests that need your accept or decline appear here."}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {DATE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDateFilter(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              dateFilter === t.key
                ? t.key === "overdue"
                  ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                  : "border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const bucket = getBucket(a);
            const busy = busyId === a.id;
            const declining = decliningId === a.id;
            return (
              <div key={a.id} className="rounded-md border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{a.booking_ref}</span>{" "}
                    <span className="text-muted-foreground">— {a.customer_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{a.event_type}</span>
                  </div>
                  <span className="rounded-full bg-yellow-100 dark:bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                    Awaiting your response
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {new Date(a.event_date).toLocaleDateString()}
                  {a.event_start_time && a.event_end_time && (
                    <span>
                      · {a.event_start_time}–{a.event_end_time}
                    </span>
                  )}
                  {bucket === "overdue" && (
                    <span className="rounded-full bg-red-100 dark:bg-red-500/15 px-2 py-0.5 text-xs text-red-700 dark:text-red-400">
                      Overdue
                    </span>
                  )}
                  {bucket === "today" && (
                    <span className="rounded-full bg-orange-100 dark:bg-orange-500/15 px-2 py-0.5 text-xs text-orange-700 dark:text-orange-400">
                      Today
                    </span>
                  )}
                </div>

                <div className="mb-1 text-sm">
                  <span className="font-medium">{a.role_in_event}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {Number(a.agreed_fee) > 0 ? (
                    <>
                      Agreed fee: <span className="font-medium">LKR {Number(a.agreed_fee).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="italic text-muted-foreground">Fee to be agreed</span>
                  )}
                </div>

                {a.notes && <p className="mt-2 text-xs italic text-muted-foreground">Note: {a.notes}</p>}

                {!declining && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRespond(a, "accept")}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setDecliningId(a.id);
                        setReason("");
                      }}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-300 dark:border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                )}

                {declining && (
                  <div className="mt-3 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 p-3">
                    <label className="mb-1 block text-xs font-medium text-foreground" htmlFor={`reason-${a.id}`}>
                      Reason for declining (optional)
                    </label>
                    <textarea
                      id={`reason-${a.id}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="e.g. Already booked on that date"
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-red-400"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleRespond(a, "decline")}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm decline
                      </button>
                      <button
                        onClick={() => setDecliningId(null)}
                        disabled={busy}
                        className="rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span>
            </span>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Requests per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-input bg-card px-2 py-1.5 text-sm text-foreground outline-none focus:border-blue-500"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </label>
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={`${pageBtn} border border-input bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageItems(currentPage, totalPages).map((item, i) =>
                item === "…" ? (
                  <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={`${pageBtn} ${
                      item === currentPage
                        ? "border border-blue-600 bg-blue-600 text-white"
                        : "border border-input bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={`${pageBtn} border border-input bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
