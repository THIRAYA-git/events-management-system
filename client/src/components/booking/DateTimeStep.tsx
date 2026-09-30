import { useState } from "react";
import { format } from "date-fns";
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
          disabled={{ before: new Date() }}
          className="rounded-lg border border-gray-200"
        />
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
