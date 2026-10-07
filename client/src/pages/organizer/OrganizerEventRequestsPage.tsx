import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMyBookingAssignments } from "@/api/organizer.api";
import type { OrganizerAssignment } from "@/types/organizer.types";

const STATUS_STYLES: Record<string, string> = {
  assigned: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const STATUS_OPTIONS = ["all", "assigned", "confirmed", "completed"];

type DateFilter = "all" | "overdue" | "today" | "upcoming";
type DateBucket = "overdue" | "today" | "upcoming" | "past";

const DATE_TABS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
];

// Midnight timestamp for a date string. Date-only strings (YYYY-MM-DD) are
// parsed as local time to avoid the UTC off-by-one-day bug.
const toDay = (value: string) => {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const getBucket = (a: OrganizerAssignment): DateBucket => {
  const eventDay = toDay(a.event_date);
  const today = toDay(new Date().toISOString().slice(0, 10) + "T00:00:00");
  if (eventDay === today) return "today";
  if (eventDay > today) return "upcoming";
  // Past event: only "overdue" if the work isn't finished
  return a.status === "completed" ? "past" : "overdue";
};

export default function OrganizerEventRequestsPage() {
  const [assignments, setAssignments] = useState<OrganizerAssignment[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
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

  // Counts respect the status dropdown, so the pills always match the list
  const counts = useMemo(() => {
    const c: Record<DateFilter, number> = { all: 0, overdue: 0, today: 0, upcoming: 0 };
    assignments
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .forEach((a) => {
        c.all++;
        const b = getBucket(a);
        if (b !== "past") c[b]++;
      });
    return c;
  }, [assignments, statusFilter]);

  const filtered = useMemo(() => {
    const list = assignments
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) => dateFilter === "all" || getBucket(a) === dateFilter);

    // Overdue: most recent first. Everything else: nearest date first.
    const dir = dateFilter === "overdue" ? -1 : 1;
    return [...list].sort((a, b) => dir * (toDay(a.event_date) - toDay(b.event_date)));
  }, [assignments, statusFilter, dateFilter]);

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

      <div className="mb-4 flex flex-wrap gap-2">
        {DATE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDateFilter(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              dateFilter === t.key
                ? t.key === "overdue"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
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
        <p className="text-sm text-gray-500">No event assignments match these filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const bucket = getBucket(a);
            return (
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

                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                  {new Date(a.event_date).toLocaleDateString()}
                  {bucket === "overdue" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      Overdue
                    </span>
                  )}
                  {bucket === "today" && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                      Today
                    </span>
                  )}
                </div>

                <div className="mb-1 text-sm">
                  <span className="font-medium">{a.role_in_event}</span>
                </div>

                <div className="text-sm text-gray-600">
                  Agreed fee: <span className="font-medium">LKR {Number(a.agreed_fee).toFixed(2)}</span>
                </div>

                {a.notes && <p className="mt-2 text-xs italic text-gray-500">Note: {a.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}