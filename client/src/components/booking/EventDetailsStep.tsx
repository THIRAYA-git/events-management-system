import { useEffect, useState } from "react";
import { StepCard } from "@/components/booking/StepCard";
import {
  fieldInputClass,
  fieldLabelClass,
  primaryBtnClass,
  secondaryBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { fetchEventPricing, calculatePrice } from "@/lib/booking.api";
import type { EventPricingOption, PriceCalculation } from "@/types/booking.types";

// event_pricing row used for any event the customer types themselves
const OTHER_EVENT_TYPE = "Other";
const MAX_CUSTOM_LENGTH = 100;

interface EventDetailsStepProps {
  onSubmit: (details: {
    eventType: string;
    customEventType?: string;
    roomCount: number;
    specialRequests: string;
    pricing: PriceCalculation;
  }) => void;
  onBack: () => void;
  // True when the customer picked the two-hall option in the previous step
  useBothHalls?: boolean;
}

export function EventDetailsStep({
  onSubmit,
  onBack,
  useBothHalls = false,
}: EventDetailsStepProps) {
  const [eventTypes, setEventTypes] = useState<EventPricingOption[]>([]);
  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [roomCount, setRoomCount] = useState("0");
  const [specialRequests, setSpecialRequests] = useState("");
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOther = eventType === OTHER_EVENT_TYPE;

  const displayPrice = (t: EventPricingOption) =>
    useBothHalls && t.bothHallsPrice != null ? t.bothHallsPrice : t.basePrice;

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
    calculatePrice({
      event_type: eventType,
      use_both_halls: useBothHalls,
      room_count: parseInt(roomCount, 10) || 0,
    })
      .then(setPricing)
      .catch(() => setError("Could not calculate price for this selection."))
      .finally(() => setIsCalculating(false));
  }, [eventType, roomCount, useBothHalls]);

  const handleContinue = () => {
    if (!eventType) return setError("Please select an event type.");
    const custom = customEventType.trim();
    if (isOther && !custom) return setError("Please type your event type.");
    if (!pricing) return setError("Price is still calculating — please wait a moment.");
    setError(null);
    onSubmit({
      eventType,
      customEventType: isOther ? custom : undefined,
      roomCount: parseInt(roomCount, 10) || 0,
      specialRequests,
      pricing,
    });
  };

  return (
    <StepCard
      title="Event details"
      subtitle="Tell us about the occasion. Your total updates as you choose."
      footer={
        <>
          <button onClick={onBack} className={secondaryBtnClass}>
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={isCalculating}
            className={`${primaryBtnClass} flex-1`}
          >
            Continue
          </button>
        </>
      }
    >
      <div>
        <label htmlFor="event_type" className={fieldLabelClass}>
          Event type
        </label>
        <select
          id="event_type"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setError(null);
          }}
          disabled={isLoadingTypes}
          className={fieldInputClass}
        >
          <option value="" disabled>
            {isLoadingTypes ? "Loading…" : "Select event type"}
          </option>
          {eventTypes.map((t) => (
            <option key={t.eventType} value={t.eventType}>
              {t.eventType === OTHER_EVENT_TYPE ? "Other (type your own)" : t.eventType} — LKR{" "}
              {displayPrice(t).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {isOther && (
        <div>
          <label htmlFor="custom_event_type" className={fieldLabelClass}>
            Your event type
          </label>
          <input
            id="custom_event_type"
            type="text"
            value={customEventType}
            onChange={(e) => setCustomEventType(e.target.value)}
            maxLength={MAX_CUSTOM_LENGTH}
            placeholder="e.g. Engagement party, Graduation dinner"
            className={fieldInputClass}
            autoFocus
          />
        </div>
      )}

      <div>
        <label htmlFor="room_count" className={fieldLabelClass}>
          Accommodation rooms (LKR 5,000/room/day)
        </label>
        <input
          id="room_count"
          type="number"
          min={0}
          max={5}
          value={roomCount}
          onChange={(e) => setRoomCount(e.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div>
        <label htmlFor="special_requests" className={fieldLabelClass}>
          Special requests (optional)
        </label>
        <textarea
          id="special_requests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
          placeholder="Dietary preferences, decoration notes, etc."
          className={fieldInputClass}
        />
      </div>

      {pricing && (
        <div className="rounded-lg border border-violet-100 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 p-4 text-sm">
          <div className="flex justify-between text-foreground">
            <span>Base price</span>
            <span>LKR {pricing.baseAmount.toLocaleString()}</span>
          </div>
          {pricing.roomCost > 0 && (
            <div className="mt-1 flex justify-between text-foreground">
              <span>Rooms ({pricing.roomCount})</span>
              <span>LKR {pricing.roomCost.toLocaleString()}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-violet-200 dark:border-violet-500/30 pt-2 font-semibold text-violet-900 dark:text-violet-200">
            <span>Total</span>
            <span>LKR {pricing.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {error && <p className={errorTextClass}>{error}</p>}
    </StepCard>
  );
}