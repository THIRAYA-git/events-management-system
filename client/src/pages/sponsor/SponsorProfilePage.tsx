import { useEffect, useState } from "react";
import { Loader2, Building2, Globe, Wallet, CalendarDays } from "lucide-react";
import { getMySponsorProfile, updateMySponsorProfile } from "@/api/sponsor.api";
import type { Sponsor } from "@/types/sponsor.types";

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";

const statusBadge: Record<string, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  inactive:
    "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
};

export default function SponsorSettingsPage() {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    websiteUrl: "",
    budgetRange: "",
    preferredEvents: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const fillForm = (s: Sponsor) =>
    setForm({
      companyName: s.company_name ?? "",
      industry: s.industry ?? "",
      websiteUrl: s.website_url ?? "",
      budgetRange: s.budget_range ?? "",
      preferredEvents: s.preferred_events ?? "",
      description: s.description ?? "",
    });

  useEffect(() => {
    getMySponsorProfile()
      .then((s) => {
        setSponsor(s);
        fillForm(s);
      })
      .catch(() =>
        setMsg({ type: "err", text: "Failed to load your profile." })
      )
      .finally(() => setLoading(false));
  }, []);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      setMsg({ type: "err", text: "Company name is required." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const updated = await updateMySponsorProfile(form);
      setSponsor(updated);
      fillForm(updated);
      setMsg({ type: "ok", text: "Profile saved." });
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.response?.data?.message ?? "Failed to save.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!sponsor) return;
    const next = sponsor.status === "active" ? "inactive" : "active";
    const question =
      next === "inactive"
        ? "Set your profile to inactive? Customers will no longer see you or be able to send you new requests."
        : "Set your profile to active? Customers will be able to find you again.";
    if (!window.confirm(question)) return;

    setTogglingStatus(true);
    setMsg(null);
    try {
      const updated = await updateMySponsorProfile({ status: next });
      setSponsor(updated);
      setMsg({ type: "ok", text: `You are now ${updated.status}.` });
    } catch (err: any) {
      setMsg({
        type: "err",
        text: err?.response?.data?.message ?? "Failed to change status.",
      });
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!sponsor) {
    return (
      <p className="text-sm text-red-600">
        {msg?.text ?? "Profile not found."}
      </p>
    );
  }

  const isActive = sponsor.status === "active";
  const events = form.preferredEvents
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sponsor Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage how your company appears to customers at Aazath Plaza.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            statusBadge[sponsor.status] ?? statusBadge.inactive
          }`}
        >
          {sponsor.status}
        </span>
      </div>

      {msg && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {msg.text}
        </div>
      )}

      {sponsor.status === "pending" && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400">
          Your account is awaiting approval from Aazath Plaza staff. You can
          complete your profile now, and you'll be visible to customers once
          approved.
        </div>
      )}

      <div className="grid w-full gap-6 lg:grid-cols-3">
        {/* Main form (2/3 width) */}
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-lg border border-border bg-card p-6 lg:col-span-2"
        >
          <h2 className="text-base font-semibold">Profile details</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Company name *
              </label>
              <input
                className={inputCls}
                value={form.companyName}
                onChange={set("companyName")}
                maxLength={150}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Industry
              </label>
              <input
                className={inputCls}
                value={form.industry}
                onChange={set("industry")}
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Budget range
              </label>
              <input
                className={inputCls}
                value={form.budgetRange}
                onChange={set("budgetRange")}
                maxLength={50}
                placeholder="e.g. LKR 50,000 – 200,000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Website</label>
              <input
                className={inputCls}
                value={form.websiteUrl}
                onChange={set("websiteUrl")}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preferred events
              </label>
              <input
                className={inputCls}
                value={form.preferredEvents}
                onChange={set("preferredEvents")}
                placeholder="e.g. Wedding, Birthday, School Event"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate with commas.
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                About your business
              </label>
              <textarea
                className={inputCls}
                rows={6}
                maxLength={1000}
                value={form.description}
                onChange={set("description")}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {form.description.length}/1000
              </p>
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-purple-700 px-5 py-2 text-sm text-white hover:bg-purple-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        {/* Side column (1/3 width) */}
        <div className="space-y-6">
          {/* Availability */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Open to sponsorship requests
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sponsor.status === "pending" ? (
                    "Availability can be changed once your account is approved."
                  ) : (
                    <>
                      Currently{" "}
                      <span className="font-medium">{sponsor.status}</span>.
                      {isActive
                        ? " Customers can find you and send requests."
                        : " You are hidden from customers."}
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={
                  togglingStatus ||
                  !["active", "inactive"].includes(sponsor.status)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                  isActive ? "bg-green-500" : "bg-muted-foreground/40"
                }`}
                aria-pressed={isActive}
                aria-label="Toggle availability"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    isActive ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">
              How customers see you
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                <div>
                  <p className="font-medium">
                    {form.companyName || "Company name"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.industry || "Industry not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="text-muted-foreground">
                  {form.budgetRange || "Budget not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="break-all text-muted-foreground">
                  {form.websiteUrl || "No website"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                <div className="flex flex-wrap gap-1.5">
                  {events.length ? (
                    events.map((ev) => (
                      <span
                        key={ev}
                        className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                      >
                        {ev}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">
                      No preferred events
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}