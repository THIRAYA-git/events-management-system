import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BedDouble, CalendarDays, Check, Moon, Users } from "lucide-react";
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
    "w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30";
  const iconCls =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";

  const tooSmall = selected.length > 0 && capacity < guests;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          <BedDouble className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Book a Room
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay at Aazath Plaza, no event booking needed.{" "}
            <span className="font-medium text-violet-700 dark:text-violet-300">
              LKR 5,000 per room per night.
            </span>
          </p>
        </div>
      </div>

      {/* Search panel */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Check-in
            <span className="relative">
              <CalendarDays className={iconCls} />
              <input
                type="date"
                min={today()}
                value={checkIn}
                className={field}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setRooms(null);
                }}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Check-out
            <span className="relative">
              <CalendarDays className={iconCls} />
              <input
                type="date"
                min={checkIn || today()}
                value={checkOut}
                className={field}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setRooms(null);
                }}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Guests
            <span className="relative">
              <Users className={iconCls} />
              <input
                type="number"
                min={1}
                value={guests}
                className={field}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
              />
            </span>
          </label>
          <button
            onClick={search}
            disabled={!datesValid || loading}
            className={`${primaryBtnClass} self-end disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading ? "Checking…" : "Check availability"}
          </button>
        </div>
        {datesValid && (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Moon className="h-3.5 w-3.5" />
            {nights} night{nights > 1 && "s"}
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <p className={errorTextClass}>{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border bg-muted/50"
            />
          ))}
        </div>
      )}

      {/* Empty result */}
      {!loading && rooms && rooms.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">No rooms free for those dates</p>
          <p className="mt-1 text-sm text-muted-foreground">Try different dates.</p>
        </div>
      )}

      {/* Rooms */}
      {!loading && rooms && rooms.length > 0 && (
        <>
          <div className="mt-6 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-foreground">Available rooms</h2>
            <p className="text-sm text-muted-foreground">
              {rooms.length} room{rooms.length !== 1 && "s"} free
            </p>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((r) => {
              const on = selected.includes(r.room_id);
              return (
                <button
                  key={r.room_id}
                  type="button"
                  onClick={() =>
                    setSelected((p) =>
                      on ? p.filter((x) => x !== r.room_id) : [...p, r.room_id]
                    )
                  }
                  aria-pressed={on}
                  className={`relative rounded-2xl border p-5 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    on
                      ? "border-violet-600 bg-violet-50/60 ring-2 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30"
                      : "border-border bg-card hover:border-violet-300 hover:shadow-md dark:hover:border-violet-500/50"
                  }`}
                >
                  <span
                    className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                      on
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-border bg-background text-transparent"
                    }`}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    <BedDouble className="h-6 w-6" />
                  </span>
                  <p className="mt-3 font-semibold text-foreground">{r.room_name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> Sleeps {r.capacity}
                  </p>

                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      LKR {Number(r.rate_per_day).toLocaleString()} × {nights} night
                      {nights > 1 ? "s" : ""}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      LKR {Number(r.total_price).toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-5 shadow-lg backdrop-blur">
            <div className="text-sm">
              <p className="text-muted-foreground">
                {selected.length} room{selected.length !== 1 && "s"} selected · sleeps{" "}
                {capacity}
              </p>
              <p className="text-xl font-bold text-foreground">
                LKR {total.toLocaleString()}
              </p>
              {tooSmall && (
                <p className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                  Selected rooms can't hold {guests} guests.
                </p>
              )}
            </div>
            <button
              onClick={reserve}
              disabled={selected.length === 0 || capacity < guests || submitting}
              className={`${primaryBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {submitting ? "Reserving…" : "Reserve & pay"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
