import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import { StepCard } from "@/components/booking/StepCard";
import { WizardSteps } from "@/components/booking/WizardSteps";
import {
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/booking/bookingStyles";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { HallSelectionStep } from "@/components/booking/HallSelectionStep";
import { EventDetailsStep } from "@/components/booking/EventDetailsStep";
import { CateringStep } from "@/components/booking/CateringStep";
import { fetchAvailableHalls, createBooking } from "@/lib/booking.api";
import { createCateringOrder } from "@/lib/catering.api";
import type {
  SlotSelection,
  AvailableHallsResponse,
  BothHallsOption,
  Hall,
  PriceCalculation,
  BookingResult,
} from "@/types/booking.types";
import type { CateringSelectionItem } from "@/types/catering.types";

type Step = "datetime" | "halls" | "details" | "catering" | "review" | "success";

const STEP_INDEX: Record<Exclude<Step, "success">, number> = {
  datetime: 0,
  halls: 1,
  details: 2,
  catering: 3,
  review: 4,
};

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function BookingWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("datetime");
  const [isLoading, setIsLoading] = useState(false);

  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const [availability, setAvailability] =
    useState<AvailableHallsResponse | null>(null);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  // Set only when the customer picked the two-hall option (601–1200 guests).
  const [secondHall, setSecondHall] = useState<Hall | null>(null);
  const [details, setDetails] = useState<{
    eventType: string;
    customEventType?: string;
    roomCount: number;
    specialRequests: string;
    pricing: PriceCalculation;
  } | null>(null);
  const [cateringSelection, setCateringSelection] = useState<CateringSelectionItem[]>([]);
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
        use_both_halls: secondHall !== null,
        event_date: slot.event_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        event_type: details.eventType,
        custom_event_type: details.customEventType,
        guest_count: slot.guest_count,
        room_count: details.roomCount,
        special_requests: details.specialRequests || undefined,
      });
      setResult(booking);

      // Catering is a separate order tied to the now-confirmed booking.
      // If this fails, the booking itself still stands — just warn.
      if (cateringSelection.length > 0) {
        try {
          await createCateringOrder(booking.bookingId, {
            menu_items: cateringSelection,
            guest_count: slot.guest_count,
          });
        } catch (cateringErr: any) {
          toast.error(
            cateringErr?.response?.data?.message ||
              "Booking confirmed, but catering order failed. You can add catering later."
          );
        }
      }

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
    <div>
      <PageHero
        compact
        title="Book a Hall"
        subtitle="Check availability, choose your hall, and confirm your event in a few simple steps."
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {step !== "success" && <WizardSteps current={STEP_INDEX[step]} />}

        {step === "datetime" && (
          <DateTimeStep onSubmit={handleSlotSubmit} isLoading={isLoading} />
        )}

        {step === "halls" && availability && slot && (
          <HallSelectionStep
            availability={availability}
            guestCount={slot.guest_count}
            onSelect={(hall) => {
              setSelectedHall(hall);
              setSecondHall(null);
              setStep("details");
            }}
            onSelectBoth={(option: BothHallsOption) => {
              setSelectedHall(option.primary);
              setSecondHall(option.secondary);
              setStep("details");
            }}
            onBack={() => setStep("datetime")}
          />
        )}

        {step === "details" && (
          <EventDetailsStep
            onSubmit={(d) => {
              setDetails(d);
              setStep("catering");
            }}
            onBack={() => setStep("halls")}
          />
        )}

        {step === "catering" && (
          <CateringStep
            onSubmit={(selection) => {
              setCateringSelection(selection);
              setStep("review");
            }}
            onBack={() => setStep("details")}
            guestCount={slot?.guest_count}
          />
        )}

        {step === "review" && slot && selectedHall && details && (
          <StepCard
            title="Review your booking"
            subtitle="Check everything below before confirming."
            footer={
              <>
                <button
                  onClick={() => setStep("catering")}
                  className={secondaryBtnClass}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`${primaryBtnClass} flex-1`}
                >
                  {isLoading ? "Confirming…" : "Confirm booking"}
                </button>
              </>
            }
          >
            <dl className="-my-2 divide-y divide-border text-sm">
              <SummaryRow
                label="Hall"
                value={
                  secondHall
                    ? `${selectedHall.hall_name} + ${secondHall.hall_name}`
                    : selectedHall.hall_name
                }
              />
              {secondHall && (
                <SummaryRow
                  label="Second hall"
                  value={
                    <span className="text-green-700 dark:text-green-400">
                      {secondHall.hall_name} — complimentary
                    </span>
                  }
                />
              )}
              <SummaryRow
                label="Date"
                value={`${slot.event_date}, ${slot.start_time}–${slot.end_time}`}
              />
              <SummaryRow
                label="Event type"
                value={details.customEventType || details.eventType}
              />
              <SummaryRow label="Guests" value={slot.guest_count} />
              {details.roomCount > 0 && (
                <SummaryRow label="Rooms" value={details.roomCount} />
              )}
              {cateringSelection.length > 0 && (
                <SummaryRow
                  label="Catering"
                  value={`${cateringSelection.length} item${
                    cateringSelection.length > 1 ? "s" : ""
                  } selected`}
                />
              )}
            </dl>
            <div className="flex justify-between rounded-lg border border-violet-100 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-base font-semibold text-violet-900 dark:text-violet-200">
              <span>Total</span>
              <span>LKR {details.pricing.totalAmount.toLocaleString()}</span>
            </div>
          </StepCard>
        )}

        {step === "success" && result && (
          <StepCard
            title="Booking confirmed"
            footer={
              <>
                <button
                  onClick={() => navigate("/")}
                  className={`${secondaryBtnClass} flex-1`}
                >
                  Pay later
                </button>
                <button
                  onClick={() => navigate(`/payment/${result.bookingId}`)}
                  className={`${primaryBtnClass} flex-1`}
                >
                  Pay now
                </button>
              </>
            }
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                Your booking reference is{" "}
                <span className="font-mono font-semibold text-foreground">
                  {result.bookingRef}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">Status: {result.status}</p>
            </div>
            <div className="flex justify-between rounded-lg border border-violet-100 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-base font-semibold text-violet-900 dark:text-violet-200">
              <span>Total</span>
              <span>LKR {result.pricing.totalAmount.toLocaleString()}</span>
            </div>
          </StepCard>
        )}
      </div>
    </div>
  );
}