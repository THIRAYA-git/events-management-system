import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { assignOrganizerToMyBooking, browseOrganizers } from "@/api/organizer.api";
import { primaryBtnClass, secondaryBtnClass } from "@/components/booking/bookingStyles";
import type { BrowseOrganizer, CustomerBookingOrganizer } from "@/types/organizer.types";

interface Props {
  bookingId: number;
  onAssigned: (assignment: CustomerBookingOrganizer) => void;
  onCancel: () => void;
}

export function OrganizerPicker({ bookingId, onAssigned, onCancel }: Props) {
  const [organizers, setOrganizers] = useState<BrowseOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    browseOrganizers()
      .then(setOrganizers)
      .catch(() => setError("Could not load organizers. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return organizers;
    return organizers.filter((o) =>
      `${o.business_name} ${o.specialty} ${o.service_areas ?? ""}`.toLowerCase().includes(q)
    );
  }, [organizers, query]);

  const selected = organizers.find((o) => o.organizer_id === selectedId) ?? null;

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await assignOrganizerToMyBooking(bookingId, {
        organizerId: selected.organizer_id,
        notes: note.trim() || undefined,
      });
      toast.success(`Request sent to ${selected.business_name}.`);
      onAssigned({
        id: res.id,
        booking_id: bookingId,
        role_in_event: res.role_in_event,
        status: res.status,
        business_name: selected.business_name,
        specialty: selected.specialty,
        avg_rating: selected.avg_rating,
        portfolio_url: selected.portfolio_url,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not assign this organizer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or specialty…"
          aria-label="Search organizers"
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No organizers available.</p>
      )}

      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {filtered.map((o) => {
          const active = o.organizer_id === selectedId;
          const rating = o.avg_rating !== null ? Number(o.avg_rating) : NaN;
          return (
            <li key={o.organizer_id}>
              <button
                type="button"
                onClick={() => setSelectedId(o.organizer_id)}
                aria-pressed={active}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-1 ring-violet-500"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{o.business_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.specialty}
                      {o.experience_years ? ` · ${o.experience_years} yrs` : ""}
                      {o.price_range ? ` · ${o.price_range}` : ""}
                    </p>
                  </div>
                  {!Number.isNaN(rating) && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {o.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{o.bio}</p>}
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div>
          <label htmlFor={`org-note-${bookingId}`} className="mb-1 block text-xs font-medium text-foreground">
            Message to {selected.business_name} (optional)
          </label>
          <textarea
            id={`org-note-${bookingId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="e.g. Pink and gold theme, stage decoration needed"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={!selected || submitting}
          className={`${primaryBtnClass} gap-2 disabled:opacity-50`}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {selected ? `Send request to ${selected.business_name}` : "Select an organizer"}
        </button>
        <button onClick={onCancel} disabled={submitting} className={secondaryBtnClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}
