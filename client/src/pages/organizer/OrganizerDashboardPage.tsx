import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMyOrganizerProfile, getMyBookingAssignments } from "@/api/organizer.api";
import type { Organizer, OrganizerAssignment } from "@/types/organizer.types";

const STATUS_STYLES: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export default function OrganizerDashboardPage() {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [assignments, setAssignments] = useState<OrganizerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profile, list] = await Promise.all([
          getMyOrganizerProfile(),
          getMyBookingAssignments(),
        ]);
        setOrganizer(profile);
        setAssignments(list);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error ?? "Organizer profile not found."}
      </div>
    );
  }

  const counts = {
    assigned: assignments.filter((a) => a.status === "assigned").length,
    confirmed: assignments.filter((a) => a.status === "confirmed").length,
    completed: assignments.filter((a) => a.status === "completed").length,
  };

  const recent = [...assignments]
    .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">{organizer.business_name}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              organizer.is_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {organizer.is_verified ? "verified" : "unverified"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              organizer.is_available ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {organizer.is_available ? "available" : "unavailable"}
          </span>
        </div>
        <p className="text-sm text-gray-500">{organizer.specialty}</p>
        {organizer.avg_rating != null && (
          <p className="mt-1 text-xs text-gray-400">
            ★ {Number(organizer.avg_rating).toFixed(1)} ({organizer.total_reviews} review
            {organizer.total_reviews !== 1 ? "s" : ""})
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-yellow-700">{counts.assigned}</div>
          <div className="text-xs text-gray-500">Assigned</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-blue-700">{counts.confirmed}</div>
          <div className="text-xs text-gray-500">Confirmed</div>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 text-center">
          <div className="text-2xl font-semibold text-green-700">{counts.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Recent Assignments</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">No event assignments yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 text-sm"
              >
                <div>
                  <span className="font-medium">{a.booking_ref}</span>{" "}
                  <span className="text-gray-500">— {a.customer_name}</span>
                  <span className="ml-2 text-xs text-gray-400">{a.event_type}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status] ?? ""}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}