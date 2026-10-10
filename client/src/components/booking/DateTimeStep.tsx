import { useEffect, useMemo, useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { getCalendarAvailability } from "@/api/hall.api";
import { Calendar } from "@/components/ui/calendar";
import { StepCard } from "@/components/booking/StepCard";
import {
  CALENDAR_THEME,
  fieldInputClass,
  fieldLabelClass,
  primaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import type { SlotSelection } from "@/types/booking.types";

const OPEN_TIME = "08:00";
const CLOSE_TIME = "22:00";

interface DateTimeStepProps {
  onSubmit: (slot: SlotSelection) => void;
  isLoading: boolean;
}

export function DateTimeStep({ onSubmit, isLoading }: DateTimeStepProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");
  const [guestCount, setGuestCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<Date>(new Date());
  const [booked, setBooked] = useState<Record<string, number>>({});
  const [totalHalls, setTotalHalls] = useState(2);

  // Load per-date hall usage for the visible grid (includes outside days).
  useEffect(() => {
    let cancelled = false;
    const from = format(startOfWeek(startOfMonth(month)), "yyyy-MM-dd");
    const to = format(endOfWeek(endOfMonth(month)), "yyyy-MM-dd");

    getCalendarAvailability(from, to)
      .then((res) => {
        if (cancelled) return;
        setTotalHalls(res.total_halls);
        setBooked(
          Object.fromEntries(res.dates.map((d) => [d.date, d.booked_halls]))
        );
      })
      .catch(() => {
        // Non-fatal: calendar simply shows no shading.
        if (!cancelled) setBooked({});
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

const { fullDates, partialDates } = useMemo(() => {
  const full: Date[] = [];
  const partial: Date[] = [];
  const today = startOfDay(new Date());
  for (const [d, n] of Object.entries(booked)) {
    const date = parseISO(d);
    if (date < today) continue; // past dates are already disabled; don't shade
    if (n >= totalHalls) full.push(date);
    else if (n > 0) partial.push(date);
  }
  return { fullDates: full, partialDates: partial };
}, [booked, totalHalls]);

  const handleCheck = () => {
    setError(null);

    if (!date) return setError("Please select an event date.");
    if (startTime >= endTime)
      return setError("Start time must be before end time.");
    if (startTime < OPEN_TIME || endTime > CLOSE_TIME) {
      return setError(
        `Events must run between ${OPEN_TIME} and ${CLOSE_TIME}.`
      );
    }
    const guests = parseInt(guestCount, 10);
    if (!guests || guests < 1 || guests > 1200) {
      return setError("Guest count must be between 1 and 1200.");
    }

    onSubmit({
      event_date: format(date, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
      guest_count: guests,
    });
  };

  return (
    <StepCard
      title="When is your event?"
      subtitle="Pick a date and time, and we'll show you which halls are free."
      footer={
        <button
          onClick={handleCheck}
          disabled={isLoading}
          className={`${primaryBtnClass} w-full`}
        >
          {isLoading ? "Checking availability…" : "Check availability"}
        </button>
      }
    >
      <div className={`flex justify-center ${CALENDAR_THEME}`}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={month}
          onMonthChange={setMonth}
          disabled={[{ before: startOfDay(new Date()) }, ...fullDates]}
          modifiers={{ full: fullDates, partial: partialDates }}
         modifiersClassNames={{
  full: "bg-gray-300 text-gray-500 [&_button]:cursor-not-allowed",
  partial:
    "bg-[linear-gradient(135deg,var(--color-gray-300)_50%,transparent_50%)]",
}}
          className="rounded-lg border border-gray-200"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
<i className="inline-block size-3.5 rounded-sm border border-gray-300 bg-[linear-gradient(135deg,var(--color-gray-300)_50%,transparent_50%)]" />          One hall available
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-3.5 rounded-sm border border-gray-300 bg-gray-300" />
          Fully booked
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_time" className={fieldLabelClass}>
            Start time
          </label>
          <input
            id="start_time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div>
          <label htmlFor="end_time" className={fieldLabelClass}>
            End time
          </label>
          <input
            id="end_time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="guest_count" className={fieldLabelClass}>
          Expected guest count
        </label>
        <input
          id="guest_count"
          type="number"
          min={1}
          max={1200}
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          placeholder="e.g. 250"
          className={fieldInputClass}
        />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}
    </StepCard>
  );
}
