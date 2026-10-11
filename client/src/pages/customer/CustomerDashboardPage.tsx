import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import {
  CalendarPlus,
  Check,
  Clock,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import FeedbackForm from "@/components/customer/FeedbackForm";
import {
  primaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { fetchMyBookings } from "@/lib/booking.api";
import type { AdminBooking } from "@/types/booking.types";
import { getMyUnreadReplies, markReplyRead } from "@/api/feedback.api";
import type { FeedbackReply } from "@/types/feedback.types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

/* If your AdminBooking uses different field names, change them here only. */
const f = {
  date: (b: AdminBooking) => new Date((b as any).event_date),
  total: (b: AdminBooking) => Number((b as any).total_amount ?? 0),
  type: (b: AdminBooking) => String((b as any).event_type ?? "Event"),
  hall: (b: AdminBooking) => String((b as any).hall_name ?? ""),
  guests: (b: AdminBooking) => (b as any).guest_count as number | undefined,
  start: (b: AdminBooking) => String((b as any).start_time ?? ""),
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const lkr = (n: number) =>
  `LKR ${n.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const CARD_TINTS = [
  "bg-violet-50 border-violet-100",
  "bg-sky-50 border-sky-100",
  "bg-orange-50 border-orange-100",
  "bg-teal-50 border-teal-100",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#7c3aed",
  completed: "#10b981",
  cancelled: "#9ca3af",
};

/* Value of the "My event isn't listed" option in the event dropdown */
const MANUAL = "manual" as const;

const EMPTY_MANUAL = { eventName: "", eventDate: "", hall: "" };

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500";

function daysLeft(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const n = Math.round((+d - +today) / 86_400_000);
  return n <= 0 ? "Today" : n === 1 ? "1 day left" : `${n} days left`;
}

const payment = (b: AdminBooking) =>
  b.status === "cancelled"
    ? { label: "Cancelled", cls: "bg-gray-100 text-gray-600" }
    : b.status === "pending"
    ? { label: "Pending", cls: "bg-amber-50 text-amber-700" }
    : { label: "Paid", cls: "bg-emerald-50 text-emerald-700" };

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200! bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // null = nothing chosen yet, number = booking_id, "manual" = typed in
  const [feedbackId, setFeedbackId] = useState<number | typeof MANUAL | null>(
    null
  );
  const [manual, setManual] = useState(EMPTY_MANUAL);

  const [replies, setReplies] = useState<FeedbackReply[]>([]);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const showNotice = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  useEffect(() => {
    getMyUnreadReplies()
      .then((r) => setReplies(r))
      .catch((e) =>
        console.error("replies error:", e?.response?.status, e?.response?.data)
      );
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markReplyRead(id);
      setReplies((prev) => prev.filter((r) => r.feedback_id !== id));
      setNotice({ type: "success", text: "Reply marked as read." });
    } catch {
      setNotice({
        type: "error",
        text: "Could not mark the reply as read. Please try again.",
      });
    }
    setTimeout(() => setNotice(null), 3000);
  };

  useEffect(() => {
    fetchMyBookings()
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => setError("Failed to load your dashboard. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = bookings
      .filter(
        (b) =>
          (b.status === "pending" || b.status === "confirmed") &&
          f.date(b) >= today
      )
      .sort((a, b) => +f.date(a) - +f.date(b));

    const completed = bookings
      .filter((b) => b.status === "completed")
      .sort((a, b) => +f.date(b) - +f.date(a));

    const statusCounts = (
      ["pending", "confirmed", "completed", "cancelled"] as const
    ).map((s) => bookings.filter((b) => b.status === s).length);

    const paid = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((s, b) => s + f.total(b), 0);
    const due = bookings
      .filter((b) => b.status === "pending")
      .reduce((s, b) => s + f.total(b), 0);

    // amount per month of event date, split paid / due
    const months = new Map<
      string,
      { label: string; paid: number; due: number }
    >();
    [...bookings]
      .filter((b) => b.status !== "cancelled")
      .sort((a, b) => +f.date(a) - +f.date(b))
      .forEach((b) => {
        const d = f.date(b);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        const m = months.get(key) ?? {
          label: d.toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
          }),
          paid: 0,
          due: 0,
        };
        if (b.status === "pending") m.due += f.total(b);
        else m.paid += f.total(b);
        months.set(key, m);
      });

    return {
      upcoming,
      completed,
      statusCounts,
      paid,
      due,
      months: [...months.values()],
    };
  }, [bookings]);

  // completed events still waiting for feedback
  const eligible = useMemo(
    () => data.completed.filter((b) => !b.has_feedback),
    [data.completed]
  );

  const selected =
    typeof feedbackId === "number"
      ? eligible.find((b) => b.booking_id === feedbackId) ?? null
      : null;

  // if the chosen booking disappears (e.g. after submitting), go back to "nothing chosen"
  useEffect(() => {
    if (
      typeof feedbackId === "number" &&
      !eligible.some((b) => b.booking_id === feedbackId)
    ) {
      setFeedbackId(null);
    }
  }, [eligible, feedbackId]);

  const markFeedbackDone = (id: number) =>
    setBookings((prev) =>
      prev.map((b) => (b.booking_id === id ? { ...b, has_feedback: true } : b))
    );

  const todayISO = new Date().toISOString().split("T")[0];
  const manualReady = manual.eventName.trim() !== "" && manual.eventDate !== "";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {user?.name?.split(" ")[0] ?? "there"} – your dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Events, payments and feedback in one place.
          </p>
        </div>
        <Link to="/book" className={`${primaryBtnClass} gap-2`}>
          <CalendarPlus className="h-4 w-4" />
          New booking
        </Link>
      </div>

      {error && <p className={errorTextClass}>{error}</p>}
      {isLoading && (
        <p className="text-sm text-gray-500">Loading your dashboard…</p>
      )}

      {!isLoading && !error && (
        <>
          {/* Upcoming events */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              My upcoming events
            </h2>
            {data.upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300! bg-white px-6 py-10 text-center text-sm text-gray-500">
                No upcoming events.{" "}
                <Link
                  to="/book"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Book a hall
                </Link>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {data.upcoming.map((b, i) => (
                  <div
                    key={b.booking_id}
                    className={`w-64 shrink-0 rounded-2xl border p-4 ${
                      CARD_TINTS[i % CARD_TINTS.length]
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{f.type(b)}</p>
                      <span className="whitespace-nowrap text-xs text-gray-500">
                        {daysLeft(f.date(b))}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {fmtDate(f.date(b))}
                        {f.start(b) && `, ${f.start(b)}`}
                      </p>
                      {f.hall(b) && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" /> {f.hall(b)}
                        </p>
                      )}
                      {f.guests(b) != null && (
                        <p className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" /> {f.guests(b)} guests
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          payment(b).cls
                        }`}
                      >
                        {payment(b).label}
                      </span>
                      <button
                        onClick={() =>
                          navigate(
                            b.status === "pending"
                              ? `/payment/${b.booking_id}`
                              : "/my-bookings"
                          )
                        }
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                      >
                        {b.status === "pending" ? "Pay now" : "View details"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <Link
                to="/my-bookings"
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                Full history in My Bookings
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Total bookings" value={bookings.length} />
              <Stat label="Upcoming events" value={data.upcoming.length} />
              <Stat label="Paid" value={lkr(data.paid)} />
              <Stat label="Amount due" value={lkr(data.due)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-200! bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Bookings by status
                </h3>
                {bookings.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">
                    No bookings yet.
                  </p>
                ) : (
                  <div className="mx-auto h-56 max-w-[14rem]">
                    <Doughnut
                      data={{
                        labels: [
                          "Awaiting payment",
                          "Confirmed",
                          "Completed",
                          "Cancelled",
                        ],
                        datasets: [
                          {
                            data: data.statusCounts,
                            backgroundColor: Object.values(STATUS_COLORS),
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        cutout: "65%",
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { boxWidth: 10 },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200! bg-white p-5 shadow-sm lg:col-span-2">
                <h3 className="mb-3 text-sm font-medium text-gray-700">
                  Spending by event month (LKR)
                </h3>
                {data.months.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">
                    No data to chart yet.
                  </p>
                ) : (
                  <div className="h-56">
                    <Bar
                      data={{
                        labels: data.months.map((m) => m.label),
                        datasets: [
                          {
                            label: "Paid",
                            data: data.months.map((m) => m.paid),
                            backgroundColor: "#7c3aed",
                            borderRadius: 6,
                          },
                          {
                            label: "Due",
                            data: data.months.map((m) => m.due),
                            backgroundColor: "#f59e0b",
                            borderRadius: 6,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          x: { stacked: true, grid: { display: false } },
                          y: { stacked: true, beginAtZero: true },
                        },
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { boxWidth: 10 },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Post-event feedback: pick a recent event or type one in */}
          <section>
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              Post-event feedback
            </h2>
            <p className="mb-3 text-sm text-gray-500">
              Choose one of your recent events, or enter an event yourself, and
              tell us how it went.
            </p>
            {replies.length > 0 && (
              <div className="mb-4 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <MessageSquare className="h-4 w-4 text-violet-600" />
                  Replies from Aazath Plaza
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">
                    {replies.length}
                  </span>
                </h3>
                {replies.map((r) => (
                  <div
                    key={r.feedback_id}
                    className="rounded-2xl border border-violet-100 bg-violet-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {r.title || r.event_type || "Your event"}
                          {r.booking_ref && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              {r.booking_ref}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                          Your review: {r.comment || "No comment"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkRead(r.feedback_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark as read
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-gray-700">
                      {r.admin_reply}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200! bg-white p-5 shadow-sm">
              {notice && (
                <p
                  className={`mb-4 rounded-lg px-3 py-2 text-sm ${
                    notice.type === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {notice.text}
                </p>
              )}
              <label className="block text-sm font-medium text-gray-700">
                Event
                <select
                  value={feedbackId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFeedbackId(
                      v === "" ? null : v === MANUAL ? MANUAL : Number(v)
                    );
                  }}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select one of your recent events…</option>
                  {eligible.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      {f.type(b)} · {fmtDate(f.date(b))}
                      {f.hall(b) && ` · ${f.hall(b)}`}
                    </option>
                  ))}
                  <option value={MANUAL}>
                    My event isn't listed – enter it manually
                  </option>
                </select>
              </label>

              {/* Option 1: a listed booking */}
              {selected && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-gray-500">Event</p>
                      <p className="font-medium text-gray-900">
                        {f.type(selected)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {fmtDate(f.date(selected))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hall</p>
                      <p className="font-medium text-gray-900">
                        {f.hall(selected) || "–"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Booking ref</p>
                      <p className="font-medium text-gray-900">
                        {selected.booking_ref}
                      </p>
                    </div>
                  </div>
                  <FeedbackForm
                    key={selected.booking_id}
                    bookingId={selected.booking_id}
                    onSubmitted={() => {
                      markFeedbackDone(selected.booking_id);
                      showNotice(
                        "success",
                        "Thank you! Your feedback was submitted."
                      );
                    }}
                  />
                </div>
              )}

              {/* Option 2: typed manually */}
              {feedbackId === MANUAL && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Event name
                      <input
                        value={manual.eventName}
                        onChange={(e) =>
                          setManual({ ...manual, eventName: e.target.value })
                        }
                        placeholder="e.g. Birthday party"
                        maxLength={150}
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Event date
                      <input
                        type="date"
                        max={todayISO}
                        value={manual.eventDate}
                        onChange={(e) =>
                          setManual({ ...manual, eventDate: e.target.value })
                        }
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Hall (optional)
                      <input
                        value={manual.hall}
                        onChange={(e) =>
                          setManual({ ...manual, hall: e.target.value })
                        }
                        placeholder="e.g. Hall 1 - Grand"
                        maxLength={100}
                        className={`${inputClass} mt-1`}
                      />
                    </label>
                  </div>

                  {manualReady ? (
                    <FeedbackForm
                      key="manual"
                      manualEvent={{
                        eventName: manual.eventName.trim(),
                        eventDate: manual.eventDate,
                        hall: manual.hall.trim() || undefined,
                      }}
                      onSubmitted={() => {
                        setManual(EMPTY_MANUAL);
                        setFeedbackId(null);
                        showNotice(
                          "success",
                          "Thank you! Your feedback was submitted and will be reviewed by our team."
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Enter the event name and date to continue.
                    </p>
                  )}
                </div>
              )}

              {feedbackId === null && (
                <p className="mt-4 text-sm text-gray-500">
                  {eligible.length === 0
                    ? "No completed events are waiting for feedback. You can still enter an event manually from the list above."
                    : "Pick an event above, or enter one manually, to leave feedback."}
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
