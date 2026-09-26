import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMySponsorProfile } from "@/api/sponsor.api";
import { getMySponsorRequests } from "@/api/sponsor.api";
import type { Sponsor, SponsorRequest } from "@/types/sponsor.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

export default function SponsorDashboardPage() {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profile, reqs] = await Promise.all([
          getMySponsorProfile(),
          getMySponsorRequests(),
        ]);
        setSponsor(profile);
        setRequests(reqs);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Sponsor profile not found."}
      </div>
    );
  }

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const recent = [...requests]
    .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Profile summary */}
      <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4">
        {sponsor.logo_url ? (
          <img
            src={sponsor.logo_url}
            alt={sponsor.company_name}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
            No logo
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{sponsor.company_name}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                sponsor.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {sponsor.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{sponsor.industry}</p>
        </div>
      </div>

      {/* Request counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-yellow-700">{counts.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-green-700">{counts.accepted}</div>
          <div className="text-xs text-gray-500">Accepted</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-red-700">{counts.rejected}</div>
          <div className="text-xs text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Recent requests */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Recent Requests</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">No sponsorship requests yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 text-sm"
              >
                <div>
                  <span className="font-medium">{req.booking_ref}</span>{" "}
                  <span className="text-gray-500">— {req.customer_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{req.event_type}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[req.status] ?? ""}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}