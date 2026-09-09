import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchEventPricing, calculatePrice } from "@/lib/booking.api";
import type { EventPricingOption, PriceCalculation } from "@/types/booking.types";

interface EventDetailsStepProps {
  onSubmit: (details: {
    eventType: string;
    roomCount: number;
    specialRequests: string;
    pricing: PriceCalculation;
  }) => void;
  onBack: () => void;
}

export function EventDetailsStep({ onSubmit, onBack }: EventDetailsStepProps) {
  const [eventTypes, setEventTypes] = useState<EventPricingOption[]>([]);
  const [eventType, setEventType] = useState("");
  const [roomCount, setRoomCount] = useState("0");
  const [specialRequests, setSpecialRequests] = useState("");
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventPricing()
      .then(setEventTypes)
      .catch(() => setError("Could not load event types. Please try again."))
      .finally(() => setIsLoadingTypes(false));
  }, []);

  useEffect(() => {
    if (!eventType) {
      setPricing(null);
      return;
    }
    setIsCalculating(true);
    calculatePrice({ event_type: eventType, room_count: parseInt(roomCount, 10) || 0 })
      .then(setPricing)
      .catch(() => setError("Could not calculate price for this selection."))
      .finally(() => setIsCalculating(false));
  }, [eventType, roomCount]);

  const handleContinue = () => {
    if (!eventType) return setError("Please select an event type.");
    if (!pricing) return setError("Price is still calculating — please wait a moment.");
    setError(null);
    onSubmit({
      eventType,
      roomCount: parseInt(roomCount, 10) || 0,
      specialRequests,
      pricing,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Event type</Label>
          <Select value={eventType} onValueChange={setEventType} disabled={isLoadingTypes}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingTypes ? "Loading…" : "Select event type"} />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((t) => (
                <SelectItem key={t.eventType} value={t.eventType}>
                  {t.eventType} — LKR {t.basePrice.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="room_count">Accommodation rooms (LKR 5,000/room/day)</Label>
          <Input
            id="room_count"
            type="number"
            min={0}
            max={5}
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requests">Special requests (optional)</Label>
          <Textarea
            id="special_requests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Dietary preferences, decoration notes, etc."
          />
        </div>

        {pricing && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span>Base price</span>
              <span>LKR {pricing.baseAmount.toLocaleString()}</span>
            </div>
            {pricing.roomCost > 0 && (
              <div className="flex justify-between">
                <span>Rooms ({pricing.roomCount})</span>
                <span>LKR {pricing.roomCost.toLocaleString()}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t pt-2 font-medium">
              <span>Total</span>
              <span>LKR {pricing.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isCalculating} className="flex-1">
          Continue to review
        </Button>
      </CardFooter>
    </Card>
  );
}