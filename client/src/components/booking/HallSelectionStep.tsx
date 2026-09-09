import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AvailableHallsResponse, Hall } from "@/types/booking.types";

interface HallSelectionStepProps {
  availability: AvailableHallsResponse;
  guestCount: number;
  onSelect: (hall: Hall) => void;
  onBack: () => void;
}

export function HallSelectionStep({
  availability,
  guestCount,
  onSelect,
  onBack,
}: HallSelectionStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a hall</CardTitle>
        <p className="text-sm text-muted-foreground">
          {availability.eventDate} · {availability.startTime}–{availability.endTime}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.available.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No halls are free for this slot. Try a different date or time.
          </p>
        )}

        {availability.available.map((hall) => {
          const fitsGuests = hall.capacity >= guestCount;
          return (
            <div
              key={hall.hall_id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{hall.hall_name}</p>
                <p className="text-sm text-muted-foreground">
                  Floor {hall.floor_number} · Capacity {hall.capacity} · LKR{" "}
                  {hall.base_price.toLocaleString()}
                </p>
                {!fitsGuests && (
                  <Badge variant="destructive" className="mt-1">
                    Below your guest count
                  </Badge>
                )}
              </div>
              <Button onClick={() => onSelect(hall)} disabled={!fitsGuests}>
                Select
              </Button>
            </div>
          );
        })}

        {availability.unavailable.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Already booked</p>
            {availability.unavailable.map((hall) => (
              <div
                key={hall.hall_id}
                className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60"
              >
                <p>{hall.hall_name}</p>
                <Badge variant="secondary">Unavailable</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}