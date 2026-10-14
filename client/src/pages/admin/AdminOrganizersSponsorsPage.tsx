import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllOrganizers } from "@/api/organizer.api";
import { getAllSponsors } from "@/api/sponsor.api";
import { createOrganizerAccount, createSponsorAccount } from "@/api/partner.api";
import type { Organizer } from "@/types/organizer.types";
import type { Sponsor } from "@/types/sponsor.types";

type Tab = "organizers" | "sponsors";

const fieldClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  business_name: "",
  specialty: "",
  experience_years: "0",
  price_range: "",
  service_areas: "",
  portfolio_url: "",
  bio: "",
  company_name: "",
  industry: "",
  budget_range: "",
  preferred_events: "",
  website_url: "",
  description: "",
};
type FormState = typeof EMPTY_FORM;

const errMsg = (e: any) => e?.response?.data?.message || "Something went wrong.";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function AdminOrganizersSponsorsPage() {
  const [tab, setTab] = useState<Tab>("organizers");
  const [search, setSearch] = useState("");

  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [dialogType, setDialogType] = useState<Tab | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSearch("");
  }, [tab]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const request =
      tab === "organizers"
        ? getAllOrganizers().then(setOrganizers)
        : getAllSponsors().then(setSponsors);

    request
      .catch(() => setError(`Failed to load ${tab}. Please try again.`))
      .finally(() => setIsLoading(false));
  }, [tab, refreshKey]);

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
      (s.industry ?? "").toLowerCase().includes(q)
    );
  });

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [key]: e.target.value });

  const openDialog = (type: Tab) => {
    setForm(EMPTY_FORM);
    setDialogType(type);
  };

  const handleCreate = async () => {
    if (!dialogType) return;
    if (!form.full_name.trim() || !form.email.trim())
      return toast.error("Contact name and email are required.");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters.");

    const account = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    setSaving(true);
    try {
      if (dialogType === "organizers") {
        if (!form.business_name.trim()) return toast.error("Business name is required.");
        if (!form.specialty.trim()) return toast.error("Specialty is required.");
        const res = await createOrganizerAccount({
          ...account,
          business_name: form.business_name,
          specialty: form.specialty,
          experience_years: Number(form.experience_years) || 0,
          price_range: form.price_range,
          service_areas: form.service_areas,
          portfolio_url: form.portfolio_url,
          bio: form.bio,
        });
        toast.success(res.message);
      } else {
        if (!form.company_name.trim()) return toast.error("Company name is required.");
        const res = await createSponsorAccount({
          ...account,
          company_name: form.company_name,
          industry: form.industry,
          budget_range: form.budget_range,
          preferred_events: form.preferred_events,
          website_url: form.website_url,
          description: form.description,
        });
        toast.success(res.message);
      }
      setTab(dialogType);
      setRefreshKey((k) => k + 1);
      setDialogType(null);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const primaryBtn =
    "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90";
  const outlineBtn =
    "inline-flex items-center gap-2 rounded-md border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Organizers & Sponsors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse registered event organizers and sponsors available to customers.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openDialog("organizers")}
            className={tab === "organizers" ? primaryBtn : outlineBtn}
          >
            <Plus className="h-4 w-4" /> Add Organizer
          </button>
          <button
            onClick={() => openDialog("sponsors")}
            className={tab === "sponsors" ? primaryBtn : outlineBtn}
          >
            <Plus className="h-4 w-4" /> Add Sponsor
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {(["organizers", "sponsors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-muted-foreground hover:text-foreground"
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
          className="w-full max-w-sm rounded-md border border-input px-3 py-1.5 text-sm"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading {tab}…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
        ) : tab === "organizers" ? (
          filteredOrganizers.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No organizers match this search.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Price Range</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrganizers.map((o) => (
                  <tr key={o.organizer_id} className="hover:bg-muted">
                    <td className="px-4 py-3 font-medium text-foreground">{o.business_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.specialty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.experience_years} yrs</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.price_range ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.avg_rating != null ? `★ ${o.avg_rating} (${o.total_reviews})` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {o.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <ShieldOff className="w-3 h-3" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {o.is_available ? (
                        <span className="rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
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
          <div className="py-16 text-center text-sm text-muted-foreground">
            No sponsors match this search.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Budget Range</th>
                <th className="px-4 py-3">Preferred Events</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSponsors.map((s) => (
                <tr key={s.sponsor_id} className="hover:bg-muted">
                  <td className="px-4 py-3 font-medium text-foreground">{s.company_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.industry}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.budget_range ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.preferred_events ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.website_url ? (
                      <a
                        href={s.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
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
                          ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
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

      {/* Add dialog */}
      <Dialog open={dialogType !== null} onOpenChange={(o) => !o && setDialogType(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card text-foreground ring-gray-200 sm:max-w-lg">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-semibold">
              {dialogType === "organizers" ? "Add organizer" : "Add sponsor"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Creates a login for the partner and their public profile. They can sign in
              immediately with the temporary password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Login account
            </p>
            <Field label="Contact name" required>
              <input className={fieldClass} value={form.full_name} onChange={set("full_name")} />
            </Field>
            <Field label="Email" required>
              <input type="email" className={fieldClass} value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Phone">
              <input className={fieldClass} value={form.phone} onChange={set("phone")} />
            </Field>
            <Field label="Temporary password" required>
              <input
                type="password"
                className={fieldClass}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={set("password")}
              />
            </Field>

            <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dialogType === "organizers" ? "Business details" : "Company details"}
            </p>

            {dialogType === "organizers" ? (
              <>
                <Field label="Business name" required>
                  <input className={fieldClass} value={form.business_name} onChange={set("business_name")} />
                </Field>
                <Field label="Specialty" required>
                  <input
                    className={fieldClass}
                    placeholder="e.g. Wedding & Reception Decoration"
                    value={form.specialty}
                    onChange={set("specialty")}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Experience (years)">
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      value={form.experience_years}
                      onChange={set("experience_years")}
                    />
                  </Field>
                  <Field label="Price range">
                    <input
                      className={fieldClass}
                      placeholder="LKR 25,000 - 80,000"
                      value={form.price_range}
                      onChange={set("price_range")}
                    />
                  </Field>
                </div>
                <Field label="Service areas">
                  <input className={fieldClass} value={form.service_areas} onChange={set("service_areas")} />
                </Field>
                <Field label="Portfolio URL">
                  <input className={fieldClass} value={form.portfolio_url} onChange={set("portfolio_url")} />
                </Field>
                <Field label="Bio">
                  <textarea
                    rows={3}
                    className={`${fieldClass} h-auto py-2`}
                    value={form.bio}
                    onChange={set("bio")}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Company name" required>
                  <input className={fieldClass} value={form.company_name} onChange={set("company_name")} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Industry">
                    <input className={fieldClass} value={form.industry} onChange={set("industry")} />
                  </Field>
                  <Field label="Budget range">
                    <input
                      className={fieldClass}
                      placeholder="LKR 50,000 - 200,000"
                      value={form.budget_range}
                      onChange={set("budget_range")}
                    />
                  </Field>
                </div>
                <Field label="Preferred events">
                  <input
                    className={fieldClass}
                    placeholder="weddings, corporate events"
                    value={form.preferred_events}
                    onChange={set("preferred_events")}
                  />
                </Field>
                <Field label="Website URL">
                  <input className={fieldClass} value={form.website_url} onChange={set("website_url")} />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={3}
                    className={`${fieldClass} h-auto py-2`}
                    value={form.description}
                    onChange={set("description")}
                  />
                </Field>
              </>
            )}
          </div>

          <DialogFooter className="bg-muted">
            <button
              onClick={() => setDialogType(null)}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}