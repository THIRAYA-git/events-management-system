import { UserCheck, Star } from "lucide-react";
import type { CustomerBookingOrganizer } from "@/types/organizer.types";

const STATUS_META: Record<string, { label: string; className: string }> = {
  assigned: { label: "Awaiting organizer response", className: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", className: "bg-green-50 text-green-700" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600" },
};

interface Props {
  assignments: CustomerBookingOrganizer[];
}

export function BookingOrganizerPanel({ assignments }: Props) {
  if (assignments.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl border border-gray-200! bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <UserCheck className="h-4 w-4 text-violet-600" />
        Event organizer
      </div>

      <ul className="space-y-2">
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
    </div>
  );
}
