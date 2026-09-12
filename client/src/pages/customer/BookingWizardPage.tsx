import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { HallSelectionStep } from "@/components/booking/HallSelectionStep";
import { EventDetailsStep } from "@/components/booking/EventDetailsStep";
import { fetchAvailableHalls, createBooking } from "@/lib/booking.api";
import type {
  SlotSelection,
  AvailableHallsResponse,
  Hall,
  PriceCalculation,
  BookingResult,
} from "@/types/booking.types";

type Step = "datetime" | "halls" | "details" | "review" | "success";

export default function BookingWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("datetime");
  const [isLoading, setIsLoading] = useState(false);

  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [availability, setAvailability] =
    useState<AvailableHallsResponse | null>(null);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [details, setDetails] = useState<{
    eventType: string;
    roomCount: number;
    specialRequests: string;
    pricing: PriceCalculation;
  } | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const handleSlotSubmit = async (s: SlotSelection) => {
    setIsLoading(true);
    try {
      const avail = await fetchAvailableHalls(s);
      setSlot(s);
      setAvailability(avail);
      setStep("halls");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not check availability."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!slot || !selectedHall || !details) return;
    setIsLoading(true);
    try {
      const booking = await createBooking({
        hall_id: selectedHall.hall_id,
        event_date: slot.event_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        event_type: details.eventType,
        guest_count: slot.guest_count,
        room_count: details.roomCount,
        special_requests: details.specialRequests || undefined,
      });
      setResult(booking);
      setStep("success");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Booking failed. Please try again.";
      toast.error(msg);
      // Conflict/capacity errors mean the slot changed under us — send back to step 1
      if (err?.response?.status === 409) {
        setStep("datetime");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {step === "datetime" && (
        <DateTimeStep onSubmit={handleSlotSubmit} isLoading={isLoading} />
      )}

      {step === "halls" && availability && slot && (
        <HallSelectionStep
          availability={availability}
          guestCount={slot.guest_count}
          onSelect={(hall) => {
            setSelectedHall(hall);
            setStep("details");
          }}
          onBack={() => setStep("datetime")}
        />
      )}

      {step === "details" && (
        <EventDetailsStep
          onSubmit={(d) => {
            setDetails(d);
            setStep("review");
          }}
          onBack={() => setStep("halls")}
        />
      )}

      {step === "review" && slot && selectedHall && details && (
        <Card>
          <CardHeader>
            <CardTitle>Review your booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Hall:</span>{" "}
              {selectedHall.hall_name}
            </p>
            <p>
              <span className="font-medium">Date:</span> {slot.event_date},{" "}
              {slot.start_time}–{slot.end_time}
            </p>
            <p>
              <span className="font-medium">Event type:</span>{" "}
              {details.eventType}
            </p>
            <p>
              <span className="font-medium">Guests:</span> {slot.guest_count}
            </p>
            {details.roomCount > 0 && (
              <p>
                <span className="font-medium">Rooms:</span> {details.roomCount}
              </p>
            )}
            <p className="pt-2 text-base font-semibold">
              Total: LKR {details.pricing.totalAmount.toLocaleString()}
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("details")}>
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Confirming…" : "Confirm booking"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === "success" && result && (
        <Card>
          <CardHeader>
            <CardTitle>Booking confirmed 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Your booking reference is{" "}
              <span className="font-mono font-medium">{result.bookingRef}</span>
              .
            </p>
            <p>Status: {result.status}</p>
            <p className="pt-2 text-base font-semibold">
              Total: LKR {result.pricing.totalAmount.toLocaleString()}
            </p>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Pay later
            </Button>
            <Button
              onClick={() => navigate(`/payment/${result.bookingId}`)}
              className="flex-1"
            >
              Pay now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
