import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getMyBookingAssignments } from "@/api/organizer.api";
import type { OrganizerAssignment } from "@/types/organizer.types";

// Accepted events only. Pending requests are handled on Event Requests.
type Tab = "active" | "completed";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  in_progress: "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400",
  completed: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
};

// Date-only strings are parsed as local time to avoid the UTC off-by-one-day bug
const toDay = (value: string) => {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const todayMs = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
};

export default function OrganizerManageEventsPage() {
  const [assignments, setAssignments] = useState<OrganizerAssignment[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyBookingAssignments();
        setAssignments(data.filter((a) => ["confirmed", "in_progress", "completed"].includes(a.status)));
      } catch {
        setError("Failed to load your events.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = useMemo(
    () =>
      assignments
        .filter((a) => a.status !== "completed")
        .sort((a, b) => toDay(a.event_date) - toDay(b.event_date)),
    [assignments]
  );
  const completed = useMemo(
    () =>
      assignments
        .filter((a) => a.status === "completed")
        .sort((a, b) => toDay(b.event_date) - toDay(a.event_date)),
    [assignments]
  );
  const list = tab === "active" ? active : completed;
  const today = todayMs();

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Manage Confirmed Events</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Events you accepted: plan arrangements, coordinate partners and update progress.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { key: "active", label: "Active", count: active.length },
            { key: "completed", label: "Completed", count: completed.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              tab === t.key
                ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tab === "active"
            ? "No confirmed events to manage. Accept a request on Event Requests and it will appear here."
            : "No completed events yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => {
            const day = toDay(a.event_date);
            const overdue = a.status !== "completed" && day < today;
            const isToday = a.status !== "completed" && day === today;
            return (
              <div key={a.id} className="rounded-md border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{a.booking_ref}</span>{" "}
                    <span className="text-muted-foreground">— {a.customer_name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{a.event_type}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[a.status] ?? ""}`}>
                    {STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {new Date(day).toLocaleDateString()}
                  {a.event_start_time && a.event_end_time && (
                    <span>
                      · {a.event_start_time}–{a.event_end_time}
                    </span>
                  )}
                  {a.guest_count ? <span>· {a.guest_count} guests</span> : null}
                  {overdue && (
                    <span className="rounded-full bg-red-100 dark:bg-red-500/15 px-2 py-0.5 text-xs text-red-700 dark:text-red-400">
                      Overdue
                    </span>
                  )}
                  {isToday && (
                    <span className="rounded-full bg-orange-100 dark:bg-orange-500/15 px-2 py-0.5 text-xs text-orange-700 dark:text-orange-400">
                      Today
                    </span>
                  )}
                </div>

                <div className="mb-3 text-sm font-medium">{a.role_in_event}</div>

                <Link
                  to={`/organizer/events/${a.id}`}
                  className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  {a.status === "completed" ? "View event" : "Manage event"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
