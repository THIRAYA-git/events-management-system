import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
    if (startTime >= endTime) return setError("Start time must be before end time.");
    if (startTime < OPEN_TIME || endTime > CLOSE_TIME) {
      return setError(`Events must run between ${OPEN_TIME} and ${CLOSE_TIME}.`);
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
    <Card>
      <CardHeader>
        <CardTitle>When is your event?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
          className="rounded-md border"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start time</Label>
            <Input
              id="start_time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End time</Label>
            <Input
              id="end_time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest_count">Expected guest count</Label>
          <Input
            id="guest_count"
            type="number"
            min={1}
            max={1200}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            placeholder="e.g. 250"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCheck} disabled={isLoading} className="w-full">
          {isLoading ? "Checking availability…" : "Check availability"}
        </Button>
      </CardFooter>
    </Card>
  );
}