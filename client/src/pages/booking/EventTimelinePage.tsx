import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ActivityFormDialog } from "@/components/timeline/ActivityFormDialog";
import {
  fetchTimeline,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
} from "@/lib/timeline.api";
import {
  TIMELINE_CATEGORIES,
  CATEGORY_LABELS,
  type TimelineActivity,
  type TimelineBookingSummary,
  type TimelineCategory,
  type TimelineFormValues,
} from "@/types/timeline.types";

const formatTime = (t: string) => t.slice(0, 5); // "08:00:00" -> "08:00"

// event_date arrives as "YYYY-MM-DD"; parse as local to avoid a day shift
const formatEventDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-LK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const BADGE: Record<TimelineCategory, string> = {
  setup: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  catering:
    "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400",
  decoration:
    "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  cleanup:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  other: "bg-muted text-foreground",
};

const DOT: Record<TimelineCategory, string> = {
  setup: "bg-blue-500",
  catering: "bg-orange-500",
  decoration: "bg-purple-500",
  cleanup: "bg-green-500",
  other: "bg-gray-400",
};

const CHIP =
  "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground";

const eventTypeLabel = (b: TimelineBookingSummary) =>
  b.event_type === "Other" && b.custom_event_type
    ? b.custom_event_type
    : b.event_type;

export default function EventTimelinePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { permissions } = useAuth();
  const canManage = permissions.includes("timeline:manage");

  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [booking, setBooking] = useState<TimelineBookingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] =
    useState<TimelineActivity | null>(null);
  const [filter, setFilter] = useState<TimelineCategory | "all">("all");

  const numericBookingId = parseInt(bookingId || "0", 10);
  const halls = booking?.halls ?? [];
  const showHall = halls.length > 1;

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTimeline(numericBookingId);
      setActivities(data.activities);
      setBooking(data.booking);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not load timeline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (numericBookingId) loadTimeline();
  }, [numericBookingId]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? activities
        : activities.filter((a) => a.category === filter),
    [activities, filter]
  );

  const handleAddClick = () => {
    setEditingActivity(null);
    setDialogOpen(true);
  };

  const handleEditClick = (activity: TimelineActivity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: TimelineFormValues) => {
    if (editingActivity) {
      await updateTimelineActivity(
        numericBookingId,
        editingActivity.timeline_id,
        values
      );
      toast.success("Activity updated.");
    } else {
      await createTimelineActivity(numericBookingId, values);
      toast.success("Activity added.");
    }
    await loadTimeline();
  };

  const handleDelete = async (activity: TimelineActivity) => {
    if (!confirm(`Remove "${activity.activity_name}" from the timeline?`))
      return;
    try {
      await deleteTimelineActivity(numericBookingId, activity.timeline_id);
      toast.success("Activity removed.");
      await loadTimeline();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not remove activity.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={canManage ? "/admin/schedule" : "/my-bookings"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {canManage ? "Back to schedule" : "Back to my bookings"}
      </Link>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Manage Event Timelines
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              {booking && (
                <span className="font-medium text-foreground">
                  {eventTypeLabel(booking)}
                </span>
              )}
              {booking && <span className="text-muted-foreground">•</span>}
              <span className="text-muted-foreground">
                {booking ? booking.booking_ref : `Booking #${bookingId}`}
              </span>
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add activity
            </button>
          )}
        </div>

        {booking && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={CHIP}>{formatEventDate(booking.event_date)}</span>
            <span className={CHIP}>
              {formatTime(booking.event_start_time)}–
              {formatTime(booking.event_end_time)}
            </span>
            <span className={CHIP}>{eventTypeLabel(booking)}</span>{" "}
            <span className={CHIP}>{booking.guest_count} guests</span>
            <span className={CHIP}>
              {halls.map((h) => h.hall_name).join(" + ")}
            </span>
          </div>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      {!isLoading && activities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({activities.length})
          </button>
          {TIMELINE_CATEGORIES.map((c) => {
            const count = activities.filter((a) => a.category === c).length;
            if (count === 0) return null;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  filter === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {CATEGORY_LABELS[c]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading timeline…
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-input bg-card py-14 text-center">
            <CalendarClock className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No activities scheduled yet
            </p>
            {canManage && (
              <p className="mt-1 text-sm text-muted-foreground">
                Add the first setup, catering, decoration or cleanup task.
              </p>
            )}
          </div>
        )}

        {!isLoading && activities.length > 0 && visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : CATEGORY_LABELS[filter].toLowerCase()}{" "}
            activities.
          </p>
        )}

        {!isLoading && visible.length > 0 && (
          <ol>
            {visible.map((a, i) => (
              <li key={a.timeline_id} className="flex gap-3 sm:gap-4">
                {/* time */}
                <div className="w-14 shrink-0 pt-4 text-right sm:w-16">
                  <div className="text-sm font-semibold text-foreground">
                    {formatTime(a.start_time)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(a.end_time)}
                  </div>
                </div>

                {/* rail */}
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-5 h-3 w-3 shrink-0 rounded-full ring-4 ring-gray-50 ${
                      DOT[a.category]
                    }`}
                  />
                  {i < visible.length - 1 && (
                    <span className="w-px flex-1 bg-muted" />
                  )}
                </div>

                {/* card */}
                <div className="mb-4 min-w-0 flex-1 rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {a.activity_name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          BADGE[a.category]
                        }`}
                      >
                        {CATEGORY_LABELS[a.category]}
                      </span>
                    </div>
                    {canManage && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {(showHall || a.assigned_to) && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {showHall && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {a.hall_name || "All halls"}
                        </span>
                      )}
                      {a.assigned_to && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {a.assigned_to}
                        </span>
                      )}
                    </div>
                  )}

                  {a.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {a.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {canManage && (
        <ActivityFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingActivity={editingActivity}
          halls={halls}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
