import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMyBookingAssignments } from "@/api/organizer.api";
import type { OrganizerAssignment } from "@/types/organizer.types";

const STATUS_STYLES: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_OPTIONS = ["all", "assigned", "confirmed", "completed"];

export default function OrganizerEventRequestsPage() {
  const [assignments, setAssignments] = useState<OrganizerAssignment[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBookingAssignments();
        setAssignments(data);
      } catch {
        setError("Failed to load event assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    statusFilter === "all" ? assignments : assignments.filter((a) => a.status === statusFilter);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No event assignments found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{a.booking_ref}</span>{" "}
                  <span className="text-gray-500">— {a.customer_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{a.event_type}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status] ?? ""}`}>
                  {a.status}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-600">
                {new Date(a.event_date).toLocaleDateString()}
              </div>

              <div className="mb-1 text-sm">
                <span className="font-medium">{a.role_in_event}</span>
              </div>

              <div className="text-sm text-gray-600">
                Agreed fee: <span className="font-medium">LKR {Number(a.agreed_fee).toFixed(2)}</span>
              </div>

              {a.notes && <p className="mt-2 text-xs italic text-gray-500">Note: {a.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}