import { useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Wallet,
} from "lucide-react";
import {
  getMyOrganizerProfile,
  updateMyOrganizerProfile,
} from "@/api/organizer.api";
import type { Organizer } from "@/types/organizer.types";

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground " +
  "placeholder:text-muted-foreground transition focus:border-primary focus:outline-none " +
  "focus:ring-2 focus:ring-ring/20";

const BIO_MAX = 500;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

export default function OrganizerPortfolioPage() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [form, setForm] = useState({
    business_name: "",
    specialty: "",
    portfolio_url: "",
    bio: "",
    service_areas: "",
    price_range: "",
    is_available: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getMyOrganizerProfile();
        setOrganizer(profile);
        setForm({
          business_name: profile.business_name ?? "",
          specialty: profile.specialty ?? "",
          portfolio_url: profile.portfolio_url ?? "",
          bio: profile.bio ?? "",
          service_areas: profile.service_areas ?? "",
          price_range: profile.price_range ?? "",
          is_available: profile.is_available,
        });
      } catch {
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-hide the success banner
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMyOrganizerProfile(form);
      setOrganizer(updated);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
        {error ?? "Organizer profile not found."}
      </div>
    );
  }

  const initials =
    form.business_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const areas = form.service_areas
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          My Portfolio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is how customers and admins see your business when assigning
          events.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 lg:col-span-2"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <SectionTitle icon={Briefcase} title="Business details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business Name">
                <input
                  name="business_name"
                  value={form.business_name}
                  onChange={handleChange}
                  className={inputCls}
                />
              </Field>
              <Field label="Specialty">
                <input
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  className={inputCls}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Portfolio URL">
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      name="portfolio_url"
                      value={form.portfolio_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <SectionTitle icon={MapPin} title="About & service area" />
            <div className="space-y-4">
              <Field label="Bio">
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={BIO_MAX}
                  className={`${inputCls} resize-none`}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {form.bio.length}/{BIO_MAX}
                </p>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Service Areas"
                  hint="Separate towns with commas"
                >
                  <input
                    name="service_areas"
                    value={form.service_areas}
                    onChange={handleChange}
                    placeholder="e.g. Kalmunai, Ampara, Batticaloa"
                    className={inputCls}
                  />
                </Field>
                <Field label="Price Range">
                  <div className="relative">
                    <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      name="price_range"
                      value={form.price_range}
                      onChange={handleChange}
                      placeholder="e.g. LKR 20,000 - 80,000"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* ── Live preview ── */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-amber-100 text-base font-semibold text-foreground">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {form.business_name || "Business name"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {form.specialty || "Specialty"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                {organizer.experience_years} yrs experience
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${
                  organizer.is_verified
                    ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {organizer.is_verified && <BadgeCheck className="h-3 w-3" />}
                {organizer.is_verified ? "Verified" : "Unverified"}
              </span>
            </div>

            {form.bio && (
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {form.bio}
              </p>
            )}

            {areas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {areas.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400"
                  >
                    <MapPin className="h-3 w-3" />
                    {a}
                  </span>
                ))}
              </div>
            )}

            {form.price_range && (
              <p className="mt-4 text-sm text-muted-foreground">
                Price range:{" "}
                <span className="font-medium text-foreground">
                  {form.price_range}
                </span>
              </p>
            )}

            {form.portfolio_url && (
              <a
                href={form.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View portfolio <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Availability switch */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-foreground">
                Available for new bookings
              </p>
              <p className="text-xs text-muted-foreground">
                {form.is_available
                  ? "You can be assigned to events"
                  : "You won't be assigned new events"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_available}
              onClick={() =>
                setForm((p) => ({ ...p, is_available: !p.is_available }))
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.is_available ? "bg-green-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
                  form.is_available ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
