import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getMyOrganizerProfile,
  updateMyOrganizerProfile,
} from "@/api/organizer.api";
import type { Organizer } from "@/types/organizer.types";

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
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Organizer profile not found."}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-xl font-semibold">My Portfolio</h1>

      <div className="mb-4 flex gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2 py-0.5">
          {organizer.experience_years} yrs experience
        </span>
        <span
          className={`rounded-full px-2 py-0.5 ${
            organizer.is_verified
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {organizer.is_verified ? "verified" : "unverified"}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Business Name
          </label>
          <input
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Specialty</label>
          <input
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Portfolio URL
          </label>
          <input
            name="portfolio_url"
            value={form.portfolio_url}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Service Areas
          </label>
          <input
            name="service_areas"
            value={form.service_areas}
            onChange={handleChange}
            placeholder="e.g. Kalmunai, Ampara, Batticaloa"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Price Range</label>
          <input
            name="price_range"
            value={form.price_range}
            onChange={handleChange}
            placeholder="e.g. LKR 20,000 - 80,000"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={form.is_available}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="is_available" className="text-sm font-medium">
            Currently available for new bookings
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
