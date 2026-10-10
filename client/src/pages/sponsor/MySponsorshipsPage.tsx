import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getMySponsorRequests, respondToSponsorRequest } from "@/api/sponsor.api";
import type { SponsorRequest } from "@/types/sponsor.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

const STATUS_OPTIONS = ["all", "pending", "accepted", "rejected", "withdrawn"];

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

export default function MySponsorshipsPage() {
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);

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
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No sponsorship requests found.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((req) => {
            const isOffer = req.direction === "sponsor_to_customer";
            return (
              <div key={req.id} className="rounded-md border border-gray-200 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{req.booking_ref}</span>{" "}
                    <span className="text-gray-500">— {req.customer_name}</span>
                    <span className="ml-2 text-xs text-gray-400">{req.event_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOffer && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Your offer
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[req.status] ?? ""}`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="mb-2 text-sm text-gray-600">
                  {new Date(req.event_date).toLocaleDateString()}
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
                  <p className="mb-2 text-xs italic text-gray-500">"{req.message}"</p>
                )}

                {req.status === "pending" && isOffer && (
                  <p className="border-t pt-2 text-xs text-gray-500">
                    Awaiting customer response
                  </p>
                )}

                {req.status === "pending" && !isOffer && (
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <button
                      onClick={() => handleRespond(req.id, "accepted")}
                      disabled={respondingId === req.id}
                      className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                    >
                      {respondingId === req.id ? "…" : "Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "rejected")}
                      disabled={respondingId === req.id}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
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
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-gray-900">{filtered.length}</span>
            </span>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Requests per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
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
                className={`${pageBtn} border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageItems(currentPage, totalPages).map((item, i) =>
                item === "…" ? (
                  <span key={`gap-${i}`} className="px-1.5 text-gray-400">
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
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
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
                className={`${pageBtn} border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`}
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
