import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUpcomingConfirmedBookings } from "@/api/publicEvents.api";
import { createSponsorOffer } from "@/api/sponsorOffer.api";

import type { PublicUpcomingBooking } from "@/types/publicEvent.types";

const PAGE_SIZE = 6;

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<PublicUpcomingBooking[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerFor, setOfferFor] = useState<PublicUpcomingBooking | null>(null);
const [amount, setAmount] = useState("");
const [note, setNote] = useState("");
const [submitting, setSubmitting] = useState(false);
const [offerError, setOfferError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUpcomingConfirmedBookings();
        setEvents(data);
      } catch {
        setError("Failed to load upcoming events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.event_type.toLowerCase().includes(q) ||
        e.hall_name.toLowerCase().includes(q)
    );
  }, [events, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const closeOffer = () => {
  setOfferFor(null);
  setAmount("");
  setNote("");
  setOfferError(null);
};

const submitOffer = async () => {
  if (!offerFor) return;
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    setOfferError("Enter an amount greater than 0.");
    return;
  }
  setSubmitting(true);
  setOfferError(null);
  try {
    await createSponsorOffer({
      bookingId: offerFor.booking_id,
      proposedAmount: value,
      message: note.trim() || undefined,
    });
    setSuccess(`Offer sent for ${offerFor.event_type} on ${new Date(offerFor.event_date).toLocaleDateString()}.`);
    closeOffer();
  } catch (err: any) {
    setOfferError(err?.response?.data?.message ?? "Failed to send offer.");
  } finally {
    setSubmitting(false);
  }
};

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Browse Events</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by event type or hall..."
          className="w-64 rounded-md border px-3 py-2 text-sm"
        />
      </div>

     <p className="mb-4 text-sm text-gray-500">
  Upcoming confirmed events at Aazath Plaza. Send an offer to sponsor one.
</p>
{success && (
  <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
    {success}
  </div>
)}

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
        <p className="text-sm text-gray-500">
          {search ? "No events match your search." : "No upcoming confirmed events."}
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((e) => (
              <div
                key={e.booking_id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4"
              >
                <div>
                  <span className="font-medium">{e.event_type}</span>
                  <span className="ml-2 text-sm text-gray-500">{e.hall_name}</span>
                </div>
                <div className="text-sm text-gray-600">
<div className="flex items-center gap-4">
  <div className="text-sm text-gray-600">
    {new Date(e.event_date).toLocaleDateString()} · {e.guest_count} guests
  </div>
  <button
    onClick={() => { setSuccess(null); setOfferFor(e); }}
    className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
  >
    Offer to sponsor
  </button>
</div>                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Page {page} of {totalPages} ({filtered.length} event
                {filtered.length !== 1 ? "s" : ""})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {offerFor && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-lg bg-white p-6">
      <h2 className="text-lg font-semibold">Offer to sponsor</h2>
      <p className="mb-4 text-sm text-gray-500">
        {offerFor.event_type} · {offerFor.hall_name} ·{" "}
        {new Date(offerFor.event_date).toLocaleDateString()}
      </p>
      <label className="mb-1 block text-sm font-medium">Proposed amount (LKR)</label>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
      />
      <label className="mb-1 block text-sm font-medium">Message (optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={3}
        className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
      />
      {offerError && <p className="mb-3 text-sm text-red-600">{offerError}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={closeOffer} className="rounded-md border px-3 py-1.5 text-sm">
          Cancel
        </button>
        <button
          onClick={submitOffer}
          disabled={submitting}
          className="rounded-md bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send offer"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}