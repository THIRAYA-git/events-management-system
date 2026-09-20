import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff, ExternalLink } from "lucide-react";
import { getAllOrganizers } from "@/api/organizer.api";
import { getAllSponsors } from "@/api/sponsor.api";
import type { Organizer } from "@/types/organizer.types";
import type { Sponsor } from "@/types/sponsor.types";

type Tab = "organizers" | "sponsors";

export function AdminOrganizersSponsorsPage() {
  const [tab, setTab] = useState<Tab>("organizers");
  const [search, setSearch] = useState("");

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setSearch("");

    const request =
      tab === "organizers"
        ? getAllOrganizers().then(setOrganizers)
        : getAllSponsors().then(setSponsors);

    request
      .catch(() => setError(`Failed to load ${tab}. Please try again.`))
      .finally(() => setIsLoading(false));
  }, [tab]);

  const filteredOrganizers = organizers.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.business_name.toLowerCase().includes(q) ||
      o.specialty.toLowerCase().includes(q)
    );
  });

  const filteredSponsors = sponsors.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.company_name.toLowerCase().includes(q) ||
      s.industry.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Organizers & Sponsors</h1>
      <p className="mt-1 text-sm text-gray-500">
        Browse registered event organizers and sponsors available to customers.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {(["organizers", "sponsors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "organizers"
              ? "Search by business name or specialty…"
              : "Search by company name or industry…"
          }
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading {tab}…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : tab === "organizers" ? (
          filteredOrganizers.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No organizers match this search.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Price Range</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrganizers.map((o) => (
                  <tr key={o.organizer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{o.business_name}</td>
                    <td className="px-4 py-3 text-gray-600">{o.specialty}</td>
                    <td className="px-4 py-3 text-gray-600">{o.experience_years} yrs</td>
                    <td className="px-4 py-3 text-gray-600">{o.price_range ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.avg_rating != null ? `★ ${o.avg_rating} (${o.total_reviews})` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {o.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          <ShieldOff className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o.is_available ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : filteredSponsors.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No sponsors match this search.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Budget Range</th>
                <th className="px-4 py-3">Preferred Events</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSponsors.map((s) => (
                <tr key={s.sponsor_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.company_name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.industry}</td>
                  <td className="px-4 py-3 text-gray-600">{s.budget_range ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.preferred_events ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.website_url ? (
                      <a
                        href={s.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        s.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}