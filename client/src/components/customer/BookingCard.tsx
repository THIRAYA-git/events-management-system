import type { ReactNode } from "react";
import { CalendarDays, Clock, Hash, Users } from "lucide-react";
import type { AdminBooking } from "@/types/booking.types";

const STATUS: Record<string, { label: string; pill: string; date: string }> = {
  pending: { label: "Awaiting payment", pill: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30", date: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  confirmed: { label: "Confirmed", pill: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-200 dark:ring-green-500/30", date: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400" },
  completed: { label: "Completed", pill: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-500/30", date: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", pill: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-200 dark:ring-red-500/30", date: "bg-muted text-muted-foreground" },
};

export const statusLabel = (s: string) => STATUS[s]?.label ?? s;

const TZ = "Asia/Colombo";

const fmtClock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const parts = (iso: string) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: TZ }),
    month: d.toLocaleDateString("en-GB", { month: "short", timeZone: TZ }).toUpperCase(),
    year: d.toLocaleDateString("en-GB", { year: "numeric", timeZone: TZ }),
    weekday: d.toLocaleDateString("en-GB", { weekday: "long", timeZone: TZ }),
  };
};

interface BookingCardProps {
  booking: AdminBooking;
  /** Buttons / forms shown in the card footer. */
  actions?: ReactNode;
}

export function BookingCard({ booking, actions }: BookingCardProps) {
  const s = STATUS[booking.status] ?? STATUS.pending;
  const d = parts(booking.event_date);
  const halls = booking.second_hall_name
    ? `${booking.hall_name} + ${booking.second_hall_name}`
    : booking.hall_name;
  const dimmed = booking.status === "cancelled";

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border! bg-card shadow-sm transition hover:shadow-md ${
        dimmed ? "opacity-75" : ""
      }`}
    >
      <div className="flex gap-4 p-5">
        <div
          className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${s.date}`}
          aria-hidden="true"
        >
          <span className="text-[11px] font-semibold tracking-wider">{d.month}</span>
          <span className="text-2xl font-bold leading-none">{d.day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground">
                {booking.event_type_label ?? booking.event_type}
              </h2>
              <p className="text-sm text-muted-foreground">{halls}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.pill}`}
            >
              {s.label}
            </span>
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <dt className="sr-only">Date</dt>
              <dd>
                {d.weekday}, {d.day} {d.month.charAt(0) + d.month.slice(1).toLowerCase()} {d.year}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <dt className="sr-only">Time</dt>
              <dd>
                {fmtClock(booking.event_start_time)} – {fmtClock(booking.event_end_time)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <dt className="sr-only">Guests</dt>
              <dd>{booking.guest_count.toLocaleString()} guests</dd>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <dt className="sr-only">Reference</dt>
              <dd className="font-mono text-xs">{booking.booking_ref}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border! bg-muted px-5 py-3">
        <p className="text-sm text-muted-foreground">
          Total{" "}
          <span className="text-base font-semibold text-foreground">
            LKR{" "}
            {Number(booking.total_amount).toLocaleString("en-LK", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </article>
  );
}