import { useState } from "react";
import { UserCheck, UserPlus, Star } from "lucide-react";
import { secondaryBtnClass } from "@/components/booking/bookingStyles";
import { OrganizerPicker } from "@/components/customer/OrganizerPicker";
import type { CustomerBookingOrganizer } from "@/types/organizer.types";

const STATUS_META: Record<string, { label: string; className: string }> = {
  assigned: { label: "Awaiting organizer response", className: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", className: "bg-green-50 text-green-700" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600" },
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
    <div className="mt-2 rounded-2xl border border-gray-200! bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <UserCheck className="h-4 w-4 text-violet-600" />
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
        <p className="mt-2 text-sm text-gray-500">
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
              className: "bg-gray-100 text-gray-600",
            };
            const rating = a.avg_rating !== null ? Number(a.avg_rating) : NaN;
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{a.business_name}</p>
                  <p className="text-xs text-gray-500">
                    {a.specialty}
                    {a.role_in_event ? ` · ${a.role_in_event}` : ""}
                    {!Number.isNaN(rating) && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-amber-600">
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
