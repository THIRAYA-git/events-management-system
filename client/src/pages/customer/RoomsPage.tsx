import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BedDouble } from "lucide-react";
import { primaryBtnClass, errorTextClass } from "@/components/booking/bookingStyles";
import { createRoomReservation, getAvailableRooms } from "@/api/room.api";
import type { AvailableRoom } from "@/types/room.types";

const today = () => new Date().toISOString().slice(0, 10);
const nightsBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export default function RoomsPage() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState<AvailableRoom[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datesValid = !!checkIn && !!checkOut && checkOut > checkIn;
  const nights = datesValid ? nightsBetween(checkIn, checkOut) : 0;

  const total = useMemo(
    () =>
      (rooms ?? [])
        .filter((r) => selected.includes(r.room_id))
        .reduce((sum, r) => sum + Number(r.total_price), 0),
    [rooms, selected]
  );
  const capacity = (rooms ?? [])
    .filter((r) => selected.includes(r.room_id))
    .reduce((s, r) => s + r.capacity, 0);

  const search = async () => {
    setError(null);
    setSelected([]);
    setLoading(true);
    try {
      setRooms(await getAvailableRooms(checkIn, checkOut));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Could not check availability.");
    } finally {
      setLoading(false);
    }
  };

  const reserve = async () => {
    setSubmitting(true);
    try {
      await createRoomReservation({ roomIds: selected, checkIn, checkOut, guests });
      toast.success("Rooms reserved. Complete payment within 15 minutes.");
      navigate("/my-rooms");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Reservation failed.");
      if (e?.response?.status === 409) search();
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-violet-500";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Book a Room</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stay at Aazath Plaza, no event booking needed. LKR 5,000 per room per night.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          Check-in
          <input type="date" min={today()} value={checkIn} className={field}
            onChange={(e) => { setCheckIn(e.target.value); setRooms(null); }} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Check-out
          <input type="date" min={checkIn || today()} value={checkOut} className={field}
            onChange={(e) => { setCheckOut(e.target.value); setRooms(null); }} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Guests
          <input type="number" min={1} value={guests} className={field}
            onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))} />
        </label>
        <button onClick={search} disabled={!datesValid || loading}
          className={`${primaryBtnClass} self-end disabled:opacity-50`}>
          {loading ? "Checking…" : "Check availability"}
        </button>
      </div>

      {error && <p className={`${errorTextClass} mt-4`}>{error}</p>}

      {rooms && rooms.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No rooms are free for those dates. Try different dates.
        </p>
      )}

      {rooms && rooms.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => {
              const on = selected.includes(r.room_id);
              return (
                <button key={r.room_id} type="button"
                  onClick={() => setSelected((p) => on ? p.filter((x) => x !== r.room_id) : [...p, r.room_id])}
                  aria-pressed={on}
                  className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                    on ? "border-violet-600 ring-2 ring-violet-200 dark:ring-violet-500/30"
                       : "border-border bg-card hover:bg-muted/40"}`}>
                  <BedDouble className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  <p className="mt-3 font-semibold text-foreground">{r.room_name}</p>
                  <p className="text-sm text-muted-foreground">Sleeps {r.capacity}</p>
                  <p className="mt-2 text-sm text-foreground">
                    LKR {Number(r.rate_per_day).toLocaleString()} × {nights} night{nights > 1 ? "s" : ""} ={" "}
                    <span className="font-semibold">LKR {Number(r.total_price).toLocaleString()}</span>
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="text-sm">
              <p className="text-muted-foreground">
                {selected.length} room{selected.length !== 1 && "s"} · sleeps {capacity}
              </p>
              <p className="text-lg font-bold text-foreground">LKR {total.toLocaleString()}</p>
              {selected.length > 0 && capacity < guests && (
                <p className="text-xs text-red-600">Selected rooms can't hold {guests} guests.</p>
              )}
            </div>
            <button onClick={reserve}
              disabled={selected.length === 0 || capacity < guests || submitting}
              className={`${primaryBtnClass} disabled:opacity-50`}>
              {submitting ? "Reserving…" : "Reserve & pay"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}