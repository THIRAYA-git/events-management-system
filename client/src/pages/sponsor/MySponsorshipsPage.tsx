import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMySponsorRequests, respondToSponsorRequest } from "@/api/sponsor.api";
import type { SponsorRequest } from "@/types/sponsor.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

const STATUS_OPTIONS = ["all", "pending", "accepted", "rejected", "withdrawn"];

export default function MySponsorshipsPage() {
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);

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
          {filtered.map((req) => (
            <div key={req.id} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{req.booking_ref}</span>{" "}
                  <span className="text-gray-500">— {req.customer_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{req.event_type}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[req.status] ?? ""}`}>
                  {req.status}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-600">
                {new Date(req.event_date).toLocaleDateString()}
              </div>

              {req.proposed_amount != null && (
                <div className="mb-2 text-sm">
                  Proposed amount:{" "}
                  <span className="font-medium">LKR {Number(req.proposed_amount).toFixed(2)}</span>
                </div>
              )}

              {req.message && (
                <p className="mb-2 text-xs italic text-gray-500">"{req.message}"</p>
              )}

              {req.status === "pending" && (
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
          ))}
        </div>
      )}
    </div>
  );
}