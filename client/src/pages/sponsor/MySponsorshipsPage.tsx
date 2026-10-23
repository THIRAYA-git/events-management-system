import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getMySponsorRequests,
  respondToSponsorRequest,
  initiateSponsorPayment,
  getSponsorPaymentStatus,
} from "@/api/sponsor.api";
import { ensurePayhere, PAYHERE_SANDBOX } from "@/lib/payhere";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SponsorRequest } from "@/types/sponsor.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  accepted: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS = ["all", "pending", "accepted", "rejected", "withdrawn"];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const fmtLkr = (n: number | string) =>
  `LKR ${Number(n).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Pay is allowed for an accepted, unpaid sponsorship on a live (not cancelled) event
const canPay = (r: SponsorRequest) =>
  r.status === "accepted" &&
  r.payment_status !== "paid" &&
  r.booking_status !== "cancelled" &&
  r.proposed_amount != null &&
  Number(r.proposed_amount) > 0;

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

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

export default function MySponsorshipsPage() {
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SponsorRequest | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMySponsorRequests();
      setRequests(data);
    } catch {
      setError("Failed to load sponsorship requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Back to page 1 whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, pageSize]);

  const handleRespond = async (requestId: number, action: "accepted" | "rejected") => {
    setRespondingId(requestId);
    setError(null);
    try {
      const updated = await respondToSponsorRequest(requestId, action);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...updated } : r))
      );
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update request.");
    } finally {
      setRespondingId(null);
    }
  };

  const handlePay = async (req: SponsorRequest) => {
    setPayingId(req.id);
    setError(null);
    try {
      await ensurePayhere();
      const checkout = await initiateSponsorPayment(req.id);

      window.payhere.onCompleted = async () => {
        // The webhook is the source of truth, so poll until it lands
        for (let i = 0; i < 8; i++) {
          const st = await getSponsorPaymentStatus(req.id).catch(() => null);
          if (st?.payment_status === "paid") {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === req.id
                  ? {
                      ...r,
                      payment_status: "paid",
                      paid_at: st.paid_at,
                      transaction_id: st.transaction_id,
                      payment_method: st.payment_method,
                    }
                  : r
              )
            );
            toast.success("Payment successful. Thank you for sponsoring this event.");
            setPayingId(null);
            return;
          }
          await new Promise((r) => setTimeout(r, 1500));
        }
        toast.info("Payment received. Confirming with the bank, refresh in a minute.");
        setPayingId(null);
        load();
      };
      window.payhere.onDismissed = () => {
        toast.info("Payment window closed. You have not been charged.");
        setPayingId(null);
      };
      window.payhere.onError = (message: string) => {
        setError(message || "Payment failed.");
        setPayingId(null);
      };

      window.payhere.startPayment({
        sandbox: PAYHERE_SANDBOX,
        ...checkout,
        return_url: `${window.location.origin}/sponsor/sponsorships`,
        cancel_url: `${window.location.origin}/sponsor/sponsorships`,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Could not start payment."
      );
      setPayingId(null);
    }
  };

  const filtered =
    statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Sponsorships</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
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
        <p className="text-sm text-muted-foreground">No sponsorship requests found.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((req) => {
            const isOffer = req.direction === "sponsor_to_customer";
            return (
              <div key={req.id} className="rounded-md border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{req.booking_ref}</span>{" "}
                    <span className="text-muted-foreground">— {req.customer_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{req.event_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOffer && (
                      <span className="rounded-full bg-blue-100 dark:bg-blue-500/15 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                        Your offer
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[req.status] ?? ""}`}
                    >
                      {req.status}
                    </span>
                    {req.payment_status === "paid" && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                        paid
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-2 text-sm text-muted-foreground">
                  {new Date(`${req.event_date}T00:00:00`).toLocaleDateString()}
                  {" · "}
                  {fmtTime(req.event_start_time)} – {fmtTime(req.event_end_time)}
                </div>

                {req.proposed_amount != null && (
                  <div className="mb-2 text-sm">
                    Proposed amount:{" "}
                    <span className="font-medium">
                      LKR {Number(req.proposed_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                {req.message && (
                  <p className="mb-2 text-xs italic text-muted-foreground">"{req.message}"</p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-2">
                  {req.payment_status === "paid" && req.paid_at && (
                    <span className="mr-auto text-xs text-muted-foreground">
                      Paid on {new Date(req.paid_at).toLocaleDateString()}
                    </span>
                  )}
                  <button
                    onClick={() => setDetail(req)}
                    className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                  >
                    View details
                  </button>
                  {canPay(req) && (
                    <button
                      onClick={() => handlePay(req)}
                      disabled={payingId === req.id}
                      className="rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {payingId === req.id
                        ? "Opening payment…"
                        : `Pay ${fmtLkr(req.proposed_amount as number)}`}
                    </button>
                  )}
                </div>

                {req.status === "pending" && isOffer && (
                  <p className="border-t pt-2 text-xs text-muted-foreground">
                    Awaiting customer response
                  </p>
                )}

                {req.status === "pending" && !isOffer && (
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <button
                      onClick={() => handleRespond(req.id, "accepted")}
                      disabled={respondingId === req.id}
                      className="rounded-md border px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
                    >
                      {respondingId === req.id ? "…" : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "rejected")}
                      disabled={respondingId === req.id}
                      className="rounded-md border border-red-200 dark:border-red-500/30 px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {respondingId === req.id ? "…" : "Reject"}
                    </button>
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
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.event_type}</DialogTitle>
                <DialogDescription>{detail.booking_ref}</DialogDescription>
              </DialogHeader>
              <div>
                <DetailRow label="Date" value={fmtDate(detail.event_date)} />
                <DetailRow
                  label="Time"
                  value={`${fmtTime(detail.event_start_time)} – ${fmtTime(detail.event_end_time)}`}
                />
                <DetailRow label="Hall" value={detail.hall_names ?? "—"} />
                <DetailRow label="Expected guests" value={detail.guest_count} />
                <DetailRow label="Hosted by" value={detail.customer_name} />
                <DetailRow label="Event status" value={detail.booking_status} />
                <DetailRow
                  label="Your sponsorship"
                  value={
                    detail.proposed_amount != null ? fmtLkr(detail.proposed_amount) : "—"
                  }
                />
                <DetailRow
                  label="Payment"
                  value={detail.payment_status === "paid" ? "Paid" : "Unpaid"}
                />
                {detail.payment_status === "paid" && (
                  <>
                    <DetailRow
                      label="Paid on"
                      value={detail.paid_at ? new Date(detail.paid_at).toLocaleString() : "—"}
                    />
                    <DetailRow label="Transaction ID" value={detail.transaction_id ?? "—"} />
                  </>
                )}
              </div>
              {canPay(detail) && (
                <button
                  onClick={() => {
                    const r = detail;
                    setDetail(null);
                    handlePay(r);
                  }}
                  className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Pay {fmtLkr(detail.proposed_amount as number)}
                </button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
