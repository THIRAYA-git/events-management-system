import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          My Room Reservations
        </h1>
        <Link to="/rooms" className={primaryBtnClass}>
          Book a room
        </Link>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className={errorTextClass}>{error}</p>}
      {!loading && !error && groups.length === 0 && (
        <p className="text-sm text-muted-foreground">No room reservations yet.</p>
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
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {g.rows.map((r) => r.room_name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.group_ref}</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                  {first.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">
                {first.check_in.slice(0, 10)} → {first.check_out.slice(0, 10)} ·{" "}
                {first.nights} night{first.nights > 1 && "s"} · {first.guests} guest
                {first.guests > 1 && "s"}
              </p>
              <p className="mt-1 text-sm font-semibold">
                LKR {g.total.toLocaleString()} ({first.payment_status})
              </p>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
