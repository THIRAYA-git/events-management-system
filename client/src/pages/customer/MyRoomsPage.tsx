import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BedDouble, CalendarCheck, CalendarX, Moon, Users } from "lucide-react";
import {
  primaryBtnClass,
  secondaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { cancelRoomReservation, getMyRoomReservations } from "@/api/room.api";
import type { RoomReservation } from "@/types/room.types";

interface Group {
  group_ref: string;
  rows: RoomReservation[];
  total: number;
}

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  confirmed:
    "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  cancelled:
    "bg-red-100 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
};
const neutralBadge =
  "bg-muted text-muted-foreground ring-border";

const paymentStyles: Record<string, string> = {
  paid: statusStyles.confirmed,
  unpaid: statusStyles.pending,
  refunded:
    "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
};

const badge = (cls: string) =>
  `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${cls}`;

const accentBar = (status: string) =>
  status === "confirmed"
    ? "bg-emerald-500"
    : status === "pending"
    ? "bg-amber-500"
    : status === "cancelled"
    ? "bg-red-400"
    : "bg-violet-500";

const fmtDate = (iso: string) =>
  new Date(iso.slice(0, 10)).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
      <div className="mt-5 h-14 rounded-xl bg-muted" />
      <div className="mt-5 h-8 w-1/2 rounded bg-muted" />
    </div>
  );
}

export default function MyRoomsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RoomReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyRoomReservations()
      .then(setItems)
      .catch(() => setError("Failed to load your room reservations."))
      .finally(() => setLoading(false));
  }, []);

  // One card per booking: rooms reserved together are paid and cancelled together
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, RoomReservation[]>();
    items.forEach((r) => {
      const list = map.get(r.group_ref) ?? [];
      list.push(r);
      map.set(r.group_ref, list);
    });
    return [...map.entries()].map(([group_ref, rows]) => ({
      group_ref,
      rows,
      total: rows.reduce((s, r) => s + Number(r.total_amount), 0),
    }));
  }, [items]);

  const cancel = async (g: Group) => {
    const names = g.rows.map((r) => r.room_name).join(", ");
    if (!window.confirm(`Cancel ${names}?`)) return;
    try {
      const active = g.rows.filter(
        (r) => r.status === "pending" || r.status === "confirmed"
      );
      const updated = await Promise.all(
        active.map((r) => cancelRoomReservation(r.reservation_id))
      );
      setItems((prev) =>
        prev.map((x) => {
          const u = updated.find((y) => y.reservation_id === x.reservation_id);
          return u ? { ...x, ...u } : x;
        })
      );
      toast.success("Reservation cancelled.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Could not cancel.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            <BedDouble className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              My Room Reservations
            </h1>
            {!loading && !error && groups.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {groups.length} booking{groups.length !== 1 && "s"}
              </p>
            )}
          </div>
        </div>
        <Link to="/rooms" className={primaryBtnClass}>
          Book a room
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <p className={errorTextClass}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            <BedDouble className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold text-foreground">No room reservations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick your dates and reserve a room at Aazath Plaza.
          </p>
          <Link to="/rooms" className={`${primaryBtnClass} mt-5`}>
            Book a room
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => {
          const first = g.rows[0];
          const canPay =
            first.status === "pending" && first.payment_status === "unpaid";
          const canCancel =
            first.status === "pending" || first.status === "confirmed";
          return (
            <div
              key={g.group_ref}
              className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1.5 ${accentBar(first.status)}`}
                aria-hidden
              />
              <div className="p-5 pl-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {g.rows.map((r) => r.room_name).join(", ")}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {g.group_ref}
                    </p>
                  </div>
                  <span className={badge(statusStyles[first.status] ?? neutralBadge)}>
                    {first.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-sm">
                  <div className="bg-background px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarCheck className="h-3.5 w-3.5" /> Check-in
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {fmtDate(first.check_in)}
                    </p>
                  </div>
                  <div className="bg-background px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarX className="h-3.5 w-3.5" /> Check-out
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {fmtDate(first.check_out)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                    <Moon className="h-3.5 w-3.5" />
                    {first.nights} night{first.nights > 1 && "s"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {first.guests} guest{first.guests > 1 && "s"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">
                      LKR {g.total.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={badge(
                      paymentStyles[first.payment_status] ?? neutralBadge
                    )}
                  >
                    {first.payment_status}
                  </span>
                </div>

                {(canPay || canCancel) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canPay && (
                      <button
                        onClick={() => navigate(`/room-payment/${g.group_ref}`)}
                        className={primaryBtnClass}
                      >
                        Pay now
                      </button>
                    )}
                    {canCancel && (
                      <button onClick={() => cancel(g)} className={secondaryBtnClass}>
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
