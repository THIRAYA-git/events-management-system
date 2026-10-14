import { StepCard } from "@/components/booking/StepCard";
import {
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/booking/bookingStyles";
import type {
  AvailableHallsResponse,
  BothHallsOption,
  Hall,
} from "@/types/booking.types";

interface HallSelectionStepProps {
  availability: AvailableHallsResponse;
  guestCount: number;
  onSelect: (hall: Hall) => void;
  onSelectBoth: (option: BothHallsOption) => void;
  onBack: () => void;
}

export function HallSelectionStep({
  availability,
  guestCount,
  onSelect,
  onSelectBoth,
  onBack,
}: HallSelectionStepProps) {
  const bothHalls = availability.bothHalls ?? null;

  return (
    <StepCard
      title="Choose a hall"
      subtitle={`${availability.eventDate} · ${availability.startTime}–${availability.endTime}`}
      footer={
        <button onClick={onBack} className={secondaryBtnClass}>
          Back
        </button>
      }
    >
      {bothHalls && (
        <div className="rounded-lg border-2 border-violet-300 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-violet-900 dark:text-violet-200">Both halls together</p>
              <p className="text-sm text-violet-800 dark:text-violet-200">
                {bothHalls.primary.hall_name} + {bothHalls.secondary.hall_name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Combined capacity {bothHalls.combined_capacity} · fits your{" "}
                {guestCount} guests
              </p>
              {bothHalls.second_hall_complimentary && (
                <span className="mt-2 inline-block rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Second hall free of charge
                </span>
              )}
            </div>
            <button
              onClick={() => onSelectBoth(bothHalls)}
              className={primaryBtnClass}
            >
              Select both halls
            </button>
          </div>
        </div>
      )}

      {!bothHalls &&
        availability.available.length === 0 &&
        availability.unavailable.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {guestCount > 600
              ? `Events of ${guestCount} guests need both halls free for this date and time. Try another slot or date.`
              : `No hall has enough capacity for ${guestCount} guests, or none are free for this date/time. Try fewer guests or another slot.`}
          </p>
        )}

      <div className="space-y-3">
        {availability.available.map((hall) => {
          const fitsGuests = hall.capacity >= guestCount;
          return (
            <div
              key={hall.hall_id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:border-violet-300"
            >
              <div>
                <p className="font-medium text-foreground">{hall.hall_name}</p>
                <p className="text-sm text-muted-foreground">
                  Floor {hall.floor_number} · Capacity {hall.capacity}
                </p>
                {!fitsGuests && (
                  <span className="mt-1 inline-block rounded-full bg-red-100 dark:bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                    Below your guest count
                  </span>
                )}
              </div>
              <button
                onClick={() => onSelect(hall)}
                disabled={!fitsGuests}
                className={primaryBtnClass}
              >
                Select
              </button>
            </div>
          );
        })}
      </div>

      {availability.unavailable.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Already booked</p>
          <div className="space-y-3">
            {availability.unavailable.map((hall) => (
              <div
                key={hall.hall_id}
                className="flex items-center justify-between rounded-lg border border-dashed border-input bg-muted p-4 opacity-70"
              >
                <p className="text-foreground">{hall.hall_name}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Unavailable
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}