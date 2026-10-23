import { useState } from "react";
import { UserCheck, UserPlus, Star } from "lucide-react";
import { secondaryBtnClass } from "@/components/booking/bookingStyles";
import { OrganizerPicker } from "@/components/customer/OrganizerPicker";
import type { CustomerBookingOrganizer } from "@/types/organizer.types";

const STATUS_META: Record<string, { label: string; className: string }> = {
  assigned: { label: "Awaiting organizer response", className: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  confirmed: { label: "Confirmed", className: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400" },
  in_progress: { label: "Preparing your event", className: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
};

interface Props {
  bookingId: number;
  assignments: CustomerBookingOrganizer[];
  /** true when the booking is active and the customer may pick an organizer */
  canAssign: boolean;
  onAssigned: (assignment: CustomerBookingOrganizer) => void;
}

export function BookingOrganizerPanel({ bookingId, assignments, canAssign, onAssigned }: Props) {
  const [picking, setPicking] = useState(false);

  const showAssign = canAssign && assignments.length === 0;
  if (assignments.length === 0 && !showAssign) return null;

  return (
    <div className="mt-2 rounded-2xl border border-border! bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          Event organizer
        </div>
        {showAssign && !picking && (
          <button onClick={() => setPicking(true)} className={`${secondaryBtnClass} gap-2`}>
            <UserPlus className="h-4 w-4" />
            Assign organizer
          </button>
        )}
      </div>

      {showAssign && !picking && (
        <p className="mt-2 text-sm text-muted-foreground">
          No organizer yet. Choose one to handle decorations and event coordination.
        </p>
      )}

      {showAssign && picking && (
        <OrganizerPicker
          bookingId={bookingId}
          onCancel={() => setPicking(false)}
          onAssigned={(a) => {
            setPicking(false);
            onAssigned(a);
          }}
        />
      )}

      {assignments.length > 0 && (
        <ul className="mt-2 space-y-2">
          {assignments.map((a) => {
            const meta = STATUS_META[a.status] ?? {
              label: a.status,
              className: "bg-muted text-muted-foreground",
            };
            const rating = a.avg_rating !== null ? Number(a.avg_rating) : NaN;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.business_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.specialty}
                    {a.role_in_event ? ` · ${a.role_in_event}` : ""}
                    {!Number.isNaN(rating) && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        {rating.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
