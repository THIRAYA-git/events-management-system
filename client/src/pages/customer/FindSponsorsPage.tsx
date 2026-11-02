import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  Building2,
  Globe,
  Wallet,
  HandHeart,
  X,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { fetchMyBookings as loadMyBookings } from "@/lib/booking.api";
import type { Sponsor } from "@/types/sponsor.types";
import { AccountDetailsFields } from "@/components/customer/AccountDetailsFields";
import {
  emptyAccountDetails,
  formatAccountDetails,
  validateAccountDetails,
  type AccountDetails,
} from "@/lib/accountDetails";

/* ------------------------------------------------------------------ */
/*  API calls – adjust the paths/response shapes to your backend       */
/* ------------------------------------------------------------------ */
const fetchSponsors = async (): Promise<Sponsor[]> => {
  const { data } = await api.get("/sponsors"); // active sponsors only
  return data.sponsors ?? data.data ?? data;
};

// Same call the My Bookings page uses
interface MyBooking {
  booking_id: number;
  booking_ref?: string;
  status: string;
  [key: string]: unknown;
}

const fetchMyBookings = async (): Promise<MyBooking[]> => {
  const { bookings } = await loadMyBookings();
  return bookings as unknown as MyBooking[];
};

// Label shown in the booking dropdown; falls back if a field name differs
const bookingLabel = (b: MyBooking) => {
  const ref = b.booking_ref ?? `#${b.booking_id}`;
  const type = (b.event_type ?? b.event_name ?? "") as string;
  const rawDate = (b.event_date ?? b.booking_date ?? "") as string;
  const date = rawDate ? new Date(rawDate).toLocaleDateString() : "";
  return [ref, type, date].filter(Boolean).join(" · ");
};

// Backend: createSponsorRequestHandler reads bookingId from the URL and
// sponsorId, proposedAmount, message from the body.
// If your route path differs, change only this URL.
const sendRequest = (
  bookingId: number,
  payload: {
    sponsorId: number;
    proposedAmount: number;
    message: string;
    paymentDetails: string;
  }
) => api.post(`/sponsors/bookings/${bookingId}/requests`, payload);

/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500";

const splitEvents = (s?: string | null) =>
  (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export default function FindSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [eventType, setEventType] = useState("all");

  const [selected, setSelected] = useState<Sponsor | null>(null);

  const [showHint, setShowHint] = useState(() => {
    try {
      return localStorage.getItem("sponsorHintDismissed") !== "1";
    } catch {
      return true;
    }
  });
  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem("sponsorHintDismissed", "1");
    } catch {
      /* ignore */
    }
  };
  const clearFilters = () => {
    setSearch("");
    setIndustry("all");
    setEventType("all");
  };

  useEffect(() => {
    fetchSponsors()
      .then(setSponsors)
      .catch(() => setError("Failed to load sponsors."))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(
    () =>
      Array.from(
        new Set(sponsors.map((s) => s.industry).filter(Boolean) as string[])
      ).sort(),
    [sponsors]
  );

  const eventTypes = useMemo(
    () =>
      Array.from(
        new Set(sponsors.flatMap((s) => splitEvents(s.preferred_events)))
      ).sort(),
    [sponsors]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sponsors.filter((s) => {
      if (industry !== "all" && s.industry !== industry) return false;
      if (
        eventType !== "all" &&
        !splitEvents(s.preferred_events).some(
          (e) => e.toLowerCase() === eventType.toLowerCase()
        )
      )
        return false;
      if (!q) return true;
      return [s.company_name, s.industry, s.description, s.preferred_events]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [sponsors, search, industry, eventType]);

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 px-6 py-6 text-white shadow-sm">
        <h1 className="text-2xl font-semibold">Find Sponsors</h1>
        <p className="mt-1 text-sm text-purple-100">
          Browse sponsors open to supporting events at Aazath Plaza and send a
          request for your booking.
        </p>
      </div>

      {showHint && (
        <div className="relative rounded-xl border border-purple-200 bg-purple-50 p-4 pr-10 dark:border-purple-500/30 dark:bg-purple-500/10">
          <button
            onClick={dismissHint}
            aria-label="Dismiss"
            title="Hide this guide"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-800 dark:text-purple-300">
            <Info className="h-4 w-4" />
            How it works
          </div>
          <ol className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            <li>
              <span className="font-medium text-foreground">1. Browse.</span>{" "}
              Search or filter sponsors by industry and event type.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Request.</span>{" "}
              Click Request sponsorship, pick one of your upcoming bookings,
              enter the amount you need and your account details.
            </li>
            <li>
              <span className="font-medium text-foreground">3. Track.</span> The
              sponsor replies on your My Bookings page.
            </li>
          </ol>
        </div>
      )}

      {notice && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
          {notice}
        </div>
      )}

      {/* Filters */}
      <div
        data-tour="sponsor-filters"
        className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className={`${inputCls} pl-9`}
            placeholder="Search by company, industry or keyword"
            title="Type a company name, industry or keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={inputCls}
          title="Show only sponsors in this industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        >
          <option value="all">All industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          title="Show only sponsors who support this type of event"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="all">All event types</option>
          {eventTypes.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : sponsors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No sponsors are available right now. Please check back soon.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          <p>No sponsors match your search.</p>
          <button
            onClick={clearFilters}
            className="mt-3 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {filtered.length} sponsor{filtered.length === 1 ? "" : "s"} found
          </p>
          <div
            data-tour="sponsor-list"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {filtered.map((s) => (
              <SponsorCard
                key={s.sponsor_id}
                sponsor={s}
                onRequest={() => setSelected(s)}
              />
            ))}
          </div>
        </>
      )}

      {selected && (
        <RequestModal
          sponsor={selected}
          onClose={() => setSelected(null)}
          onSent={() => {
            setNotice(`Request sent to ${selected.company_name}.`);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ Card ------------------------------ */

function SponsorCard({
  sponsor: s,
  onRequest,
}: {
  sponsor: Sponsor;
  onRequest: () => void;
}) {
  const events = splitEvents(s.preferred_events);
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg dark:hover:border-purple-500/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{s.company_name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {s.industry || "Industry not specified"}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
        {s.description || "No description provided."}
      </p>

      <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-purple-600" />
          <span>{s.budget_range || "Budget not specified"}</span>
        </div>
        {s.website_url && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0 text-purple-600" />
            <a
              href={s.website_url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-purple-700 hover:underline dark:text-purple-300"
            >
              {s.website_url}
            </a>
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="mb-5 mt-3 flex flex-wrap gap-1.5">
          {events.map((ev) => (
            <span
              key={ev}
              className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
            >
              {ev}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onRequest}
        title="Send a sponsorship request for one of your upcoming bookings"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-md bg-purple-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-800"
      >
        <HandHeart className="h-4 w-4" />
        Request sponsorship
      </button>
    </div>
  );
}

/* ----------------------------- Modal ------------------------------ */

function RequestModal({
  sponsor,
  onClose,
  onSent,
}: {
  sponsor: Sponsor;
  onClose: () => void;
  onSent: () => void;
}) {
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<AccountDetails>(emptyAccountDetails);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then((list) =>
        setBookings(
          list.filter((b) => {
            if (!["pending", "confirmed"].includes(b.status)) return false;
            const d = (b.event_date ?? b.booking_date) as string | undefined;
            return !d || new Date(d) >= new Date(new Date().toDateString());
          })
        )
      )
      .catch(() => setErr("Failed to load your bookings."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return setErr("Please select a booking.");
    const value = Number(amount);
    if (!value || value <= 0) return setErr("Enter a valid amount.");
    const accountErr = validateAccountDetails(account);
    if (accountErr) return setErr(accountErr);
    setSending(true);
    setErr(null);
    try {
      await sendRequest(Number(bookingId), {
        sponsorId: sponsor.sponsor_id,
        proposedAmount: value,
        message: message.trim(),
        paymentDetails: formatAccountDetails(account),
      });
      onSent();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to send request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Request sponsorship</h2>
            <p className="text-sm text-muted-foreground">
              {sponsor.company_name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {err}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Your booking</label>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : bookings.length === 0 && !err ? (
            <p className="text-sm text-muted-foreground">
              You have no upcoming pending or confirmed bookings to attach a
              request to.{" "}
              <Link
                to="/book"
                className="font-medium text-purple-700 hover:underline dark:text-purple-300"
              >
                Make a booking first
              </Link>
              .
            </p>
          ) : (
            <select
              className={inputCls}
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            >
              <option value="">Select a booking</option>
              {bookings.map((b) => (
                <option key={b.booking_id} value={b.booking_id}>
                  {bookingLabel(b)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Amount requested (LKR)
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={sponsor.budget_range ?? "e.g. 50000"}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Your account details
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            The sponsor sees these only after accepting, and uses them to pay
            you.
          </p>
          <AccountDetailsFields value={account} onChange={setAccount} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea
            className={inputCls}
            rows={4}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the sponsor about your event and what you need."
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || bookings.length === 0}
            className="rounded-md bg-purple-700 px-4 py-2 text-sm text-white hover:bg-purple-800 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send request"}
          </button>
        </div>
      </form>
    </div>
  );
}
