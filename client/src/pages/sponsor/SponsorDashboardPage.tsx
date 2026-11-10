import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getMySponsorProfile,
  getMySponsorRequests,
  respondToSponsorRequest,
  uploadMySponsorLogo,
} from "@/api/sponsor.api";
import type { Sponsor, SponsorRequest } from "@/types/sponsor.types";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  accepted:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground",
};

const MAX_LOGO_MB = 2;

export default function SponsorDashboardPage() {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [requests, setRequests] = useState<SponsorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError(
            "Your sponsor profile has not been set up yet. Please contact Aazath Plaza staff."
          );
        } else {
          setError("Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRespond = async (
    req: SponsorRequest,
    action: "accepted" | "rejected"
  ) => {
    const verb = action === "accepted" ? "accept" : "reject";
    if (
      !window.confirm(
        `Are you sure you want to ${verb} request ${req.booking_ref}?`
      )
    )
      return;

    setRespondingId(req.id);
    setActionError(null);
    try {
      const updated = await respondToSponsorRequest(req.id, action);
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, ...updated } : r))
      );
    } catch (err: any) {
      setActionError(
        err?.response?.data?.message ?? "Failed to update request."
      );
    } finally {
      setRespondingId(null);
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoMessage({
        type: "err",
        text: "Please choose an image file (PNG, JPG or WebP).",
      });
      return;
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      setLogoMessage({
        type: "err",
        text: `Logo must be ${MAX_LOGO_MB} MB or smaller.`,
      });
      return;
    }

    setUploadingLogo(true);
    setLogoMessage(null);
    try {
      const updated = await uploadMySponsorLogo(file);
      setSponsor((prev) => (prev ? { ...prev, ...updated } : updated));
      setLogoMessage({ type: "ok", text: "Logo updated." });
    } catch (err: any) {
      setLogoMessage({
        type: "err",
        text: err?.response?.data?.message ?? "Failed to upload logo.",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
        {error ?? "Sponsor profile not found."}
      </div>
    );
  }

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const totalCommitted = requests
    .filter((r) => r.status === "accepted")
    .reduce((sum, r) => sum + Number(r.proposed_amount ?? 0), 0);

  const recent = [...requests]
    .sort(
      (a, b) =>
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>

      {/* Profile summary */}
      <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
        {sponsor.logo_url ? (
          <img
            src={sponsor.logo_url}
            alt={sponsor.company_name}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
            No logo
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{sponsor.company_name}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                sponsor.status === "active"
                  ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {sponsor.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{sponsor.industry}</p>
          {logoMessage && (
            <p
              className={`mt-1 text-xs ${
                logoMessage.type === "ok"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {logoMessage.text}
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleLogoSelected}
          className="hidden"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/sponsor/profile"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Edit profile
          </Link>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingLogo}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            {uploadingLogo
              ? "Uploading…"
              : sponsor.logo_url
              ? "Change logo"
              : "Add logo"}
          </button>
        </div>
      </div>

      {/* Request counts + total committed */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <div className="text-2xl font-semibold text-yellow-700 dark:text-yellow-400">
            {counts.pending}
          </div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <div className="text-2xl font-semibold text-green-700 dark:text-green-400">
            {counts.accepted}
          </div>
          <div className="text-xs text-muted-foreground">Accepted</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <div className="text-2xl font-semibold text-red-700 dark:text-red-400">
            {counts.rejected}
          </div>
          <div className="text-xs text-muted-foreground">Rejected</div>
        </div>
        <div className="rounded-md border border-border bg-card p-4 text-center">
          <div className="text-2xl font-semibold text-foreground">
            LKR {totalCommitted.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total committed</div>
        </div>
      </div>

      {/* Recent requests */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">
          Recent Requests
        </h3>

        {actionError && (
          <div className="mb-2 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {actionError}
          </div>
        )}

        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sponsorship requests yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((req) => {
              const isOffer = req.direction === "sponsor_to_customer";
              return (
                <div
                  key={req.id}
                  className="rounded-md border border-border bg-card p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{req.booking_ref}</span>{" "}
                      <span className="text-muted-foreground">
                        — {req.customer_name}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {req.event_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOffer && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-500/15 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                          Your offer
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          STATUS_STYLES[req.status] ?? ""
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === "pending" && isOffer && (
                    <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                      Awaiting customer response
                    </p>
                  )}

                  {req.status === "pending" && !isOffer && (
                    <div className="mt-2 flex justify-end gap-2 border-t pt-2">
                      <button
                        onClick={() => handleRespond(req, "accepted")}
                        disabled={respondingId === req.id}
                        className="rounded-md border px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
                      >
                        {respondingId === req.id ? "…" : "Accept"}
                      </button>
                      <button
                        onClick={() => handleRespond(req, "rejected")}
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
      </div>
    </div>
  );
}
