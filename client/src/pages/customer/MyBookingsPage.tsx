import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarPlus, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { BookingCard } from "@/components/customer/BookingCard";
import { BookingSponsorOffers } from "@/components/customer/BookingSponsorOffers";
import { BookingOrganizerPanel } from "@/components/customer/BookingOrganizerPanel";
import FeedbackForm from "@/components/customer/FeedbackForm";
import {
  primaryBtnClass,
  secondaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { fetchMyBookings } from "@/lib/booking.api";
import { downloadInvoice } from "@/lib/payment.api";
import { getMyReceivedOffers, respondToSponsorOffer } from "@/api/sponsor.api";
import { getMyBookingOrganizers } from "@/api/organizer.api";
import type { AdminBooking } from "@/types/booking.types";
import type { SponsorOffer } from "@/types/sponsorOffer.types";
import type { CustomerBookingOrganizer } from "@/types/organizer.types";

type Filter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

/** Builds a compact page list like [1, "…", 4, 5, 6, "…", 12] */
function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

/** Searchable text for a booking: every string/number field, lower-cased */
function bookingHaystack(b: AdminBooking): string {
  return Object.values(b as unknown as Record<string, unknown>)
    .filter((v) => typeof v === "string" || typeof v === "number")
    .join(" ")
    .toLowerCase();
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border! bg-card p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [feedbackOpenFor, setFeedbackOpenFor] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [offers, setOffers] = useState<SponsorOffer[]>([]);
  const [respondingOfferId, setRespondingOfferId] = useState<number | null>(null);
  const [organizers, setOrganizers] = useState<CustomerBookingOrganizer[]>([]);

  // search + pagination
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchMyBookings()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => setError("Failed to load your bookings. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  // Offers are optional extras: never block the page if this call fails
  useEffect(() => {
    getMyReceivedOffers()
      .then(setOffers)
      .catch(() => {});
  }, []);

  // Same for assigned organizers
  useEffect(() => {
    getMyBookingOrganizers()
      .then(setOrganizers)
      .catch(() => {});
  }, []);

  // Debounce the search box (300 ms)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Back to page 1 whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [search, filter, pageSize]);

  // 1) search first, so tab counts reflect the search
  const searched = useMemo(() => {
    if (!search) return bookings;
    const terms = search.split(/\s+/).filter(Boolean);
    return bookings.filter((b) => {
      const hay = bookingHaystack(b);
      return terms.every((t) => hay.includes(t));
    });
  }, [bookings, search]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: searched.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    searched.forEach((b) => {
      c[b.status as Exclude<Filter, "all">] += 1;
    });
    return c;
  }, [searched]);

  const offersByBooking = useMemo(() => {
    const map = new Map<number, SponsorOffer[]>();
    offers.forEach((o) => {
      const list = map.get(o.booking_id) ?? [];
      list.push(o);
      map.set(o.booking_id, list);
    });
    return map;
  }, [offers]);

  const organizersByBooking = useMemo(() => {
    const map = new Map<number, CustomerBookingOrganizer[]>();
    organizers.forEach((o) => {
      const list = map.get(o.booking_id) ?? [];
      list.push(o);
      map.set(o.booking_id, list);
    });
    return map;
  }, [organizers]);

  // 2) status tab, 3) paginate
  const filtered = filter === "all" ? searched : searched.filter((b) => b.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const visible = filtered.slice(startIdx, startIdx + pageSize);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInvoice = async (b: AdminBooking) => {
    setDownloadingId(b.booking_id);
    try {
      await downloadInvoice(b.booking_id, `invoice-${b.booking_ref}.pdf`);
    } catch {
      toast.error("Could not download the invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOfferRespond = async (offerId: number, action: "accepted" | "rejected") => {
    const offer = offers.find((o) => o.id === offerId);
    const verb = action === "accepted" ? "accept" : "reject";
    if (!window.confirm(`Are you sure you want to ${verb} the offer from ${offer?.company_name}?`))
      return;

    setRespondingOfferId(offerId);
    try {
      const updated = await respondToSponsorOffer(offerId, action);
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, ...updated } as SponsorOffer : o)));
      toast.success(action === "accepted" ? "Offer accepted." : "Offer rejected.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not update the offer.");
    } finally {
      setRespondingOfferId(null);
    }
  };

  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your events, complete payments and download invoices.
          </p>
        </div>
        <Link to="/book" className={`${primaryBtnClass} gap-2`}>
          <CalendarPlus className="h-4 w-4" />
          New booking
        </Link>
      </div>

      {!isLoading && bookings.length > 0 && (
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by booking ref, event type, hall, date or guests…"
              aria-label="Search bookings"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter bookings">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={filter === t.key}
                onClick={() => setFilter(t.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === t.key
                    ? "bg-violet-600 text-white"
                    : "bg-card text-muted-foreground ring-1 ring-inset ring-gray-200 hover:bg-muted"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    filter === t.key ? "bg-card/20" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && <p className={errorTextClass}>{error}</p>}

      {!isLoading && !error && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-input! bg-card px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <CalendarPlus className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No bookings yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Pick a date, choose your hall and confirm your event in a few simple steps.
          </p>
          <Link to="/book" className={`${primaryBtnClass} mt-5`}>
            Book a hall
          </Link>
        </div>
      )}

      {!isLoading && bookings.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-border! bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          {search ? (
            <>
              No bookings match “{searchInput.trim()}”.{" "}
              <button
                onClick={() => setSearchInput("")}
                className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            "No bookings in this category."
          )}
        </div>
      )}

      <div className="space-y-4">
        {visible.map((booking) => (
          <div key={booking.booking_id}>
            <BookingCard
              booking={booking}
              actions={
                <>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => navigate(`/payment/${booking.booking_id}`)}
                      className={primaryBtnClass}
                    >
                      Pay now
                    </button>
                  )}
                  {(booking.status === "confirmed" || booking.status === "completed") && (
                    <button
                      onClick={() => handleInvoice(booking)}
                      disabled={downloadingId === booking.booking_id}
                      className={`${secondaryBtnClass} gap-2`}
                    >
                      <Download className="h-4 w-4" />
                      {downloadingId === booking.booking_id ? "Preparing…" : "Invoice"}
                    </button>
                  )}
                  {booking.status === "completed" &&
                    (booking.has_feedback ? (
                      <span className="text-sm text-green-700 dark:text-green-400">✓ Thanks for your feedback</span>
                    ) : (
                      feedbackOpenFor !== booking.booking_id && (
                        <button
                          onClick={() => setFeedbackOpenFor(booking.booking_id)}
                          className={secondaryBtnClass}
                        >
                          Leave feedback
                        </button>
                      )
                    ))}
                </>
              }
            />

            <BookingOrganizerPanel
              bookingId={booking.booking_id}
              assignments={organizersByBooking.get(booking.booking_id) ?? []}
              canAssign={booking.status === "pending" || booking.status === "confirmed"}
              onAssigned={(a) => setOrganizers((prev) => [a, ...prev])}
            />

            <BookingSponsorOffers
              offers={offersByBooking.get(booking.booking_id) ?? []}
              respondingId={respondingOfferId}
              onRespond={handleOfferRespond}
            />

            {booking.status === "completed" &&
              !booking.has_feedback &&
              feedbackOpenFor === booking.booking_id && (
                <div className="mt-2 rounded-2xl border border-border! bg-card p-5 shadow-sm">
                  <FeedbackForm
                    bookingId={booking.booking_id}
                    onSubmitted={() => {
                      setFeedbackOpenFor(null);
                      setBookings((prev) =>
                        prev.map((b) =>
                          b.booking_id === booking.booking_id ? { ...b, has_feedback: true } : b
                        )
                      );
                    }}
                  />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span>
            </span>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Bookings per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground outline-none focus:border-violet-500"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </label>
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={`${pageBtn} bg-card text-muted-foreground ring-1 ring-inset ring-gray-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageItems(currentPage, totalPages).map((item, i) =>
                item === "…" ? (
                  <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    className={`${pageBtn} ${
                      item === currentPage
                        ? "bg-violet-600 text-white"
                        : "bg-card text-muted-foreground ring-1 ring-inset ring-gray-200 hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={`${pageBtn} bg-card text-muted-foreground ring-1 ring-inset ring-gray-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
