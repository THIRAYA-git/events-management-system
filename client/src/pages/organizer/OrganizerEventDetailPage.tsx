import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addChecklistItem,
  deleteChecklistItem,
  getAssignmentDetail,
  setChecklistItemDone,
  updateAssignmentProgress,
} from "@/api/organizer.api";
import type {
  AssignmentDetail,
  ChecklistCategory,
  ChecklistItem,
  ProgressStatus,
} from "@/types/organizer.types";

const STEPS = [
  { key: "confirmed", label: "Scheduled" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
] as const;

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  decoration: "Decoration",
  seating: "Seating",
  equipment: "Equipment",
  other: "Other",
};
const CATEGORIES = Object.keys(CATEGORY_LABELS) as ChecklistCategory[];

const hhmm = (t: string | null | undefined) => (t ? String(t).slice(0, 5) : "");

// Date-only strings are parsed as local time to avoid the UTC off-by-one-day bug
const toDay = (value: string) => {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const formatDate = (value: string) =>
  new Date(toDay(value)).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const card = "rounded-md border border-border bg-card p-4";
const heading = "mb-3 text-sm font-semibold text-foreground";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export default function OrganizerEventDetailPage() {
  const { assignmentId } = useParams();
  const id = Number(assignmentId);

  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressBusy, setProgressBusy] = useState(false);

  const [newCategory, setNewCategory] = useState<ChecklistCategory>("decoration");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Invalid event.");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setDetail(await getAssignmentDetail(id));
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const grouped = useMemo(() => {
    const g: Record<ChecklistCategory, ChecklistItem[]> = {
      decoration: [],
      seating: [],
      equipment: [],
      other: [],
    };
    detail?.checklist.forEach((i) => g[i.category]?.push(i));
    return g;
  }, [detail]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-3">
        <Link to="/organizer/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
        <div className="rounded-md border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error ?? "Event not found."}
        </div>
      </div>
    );
  }

  const { assignment, booking } = detail;
  const status = assignment.status;
  const stepIndex = STEPS.findIndex((s) => s.key === status);
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const eventHasStarted = toDay(booking.event_date) <= todayMs;

  const doneCount = detail.checklist.filter((i) => i.is_done).length;

  const nextAction: { target: ProgressStatus; label: string } | null =
    status === "confirmed"
      ? { target: "in_progress", label: "Start preparation" }
      : status === "in_progress"
      ? { target: "completed", label: "Mark event completed" }
      : null;

  const handleProgress = async (target: ProgressStatus) => {
    if (
      target === "completed" &&
      !window.confirm("Mark this event as completed? The checklist will be locked.")
    )
      return;
    setProgressBusy(true);
    try {
      const updated = await updateAssignmentProgress(id, target);
      setDetail((d) =>
        d
          ? {
              ...d,
              assignment: { ...d.assignment, status: updated.status },
              canEditChecklist: updated.status === "in_progress",
            }
          : d
      );
      toast.success(target === "completed" ? "Event marked as completed." : "Event marked as in progress.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not update progress.");
    } finally {
      setProgressBusy(false);
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    try {
      const updated = await setChecklistItemDone(id, item.item_id, !item.is_done);
      setDetail((d) =>
        d ? { ...d, checklist: d.checklist.map((i) => (i.item_id === item.item_id ? updated : i)) } : d
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not update the item.");
    }
  };

  const handleDelete = async (item: ChecklistItem) => {
    try {
      await deleteChecklistItem(id, item.item_id);
      setDetail((d) => (d ? { ...d, checklist: d.checklist.filter((i) => i.item_id !== item.item_id) } : d));
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not remove the item.");
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const item = await addChecklistItem(id, newCategory, name);
      setDetail((d) => (d ? { ...d, checklist: [...d.checklist, item] } : d));
      setNewName("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not add the item.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link to="/organizer/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div>
        <h1 className="text-xl font-semibold">
          {booking.booking_ref} <span className="font-normal text-muted-foreground">— {booking.event_type}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(booking.event_date)} · {hhmm(booking.event_start_time)}–{hhmm(booking.event_end_time)}
        </p>
      </div>

      {/* Progress */}
      <div className={card}>
        <h2 className={heading}>Event progress</h2>
        {status === "assigned" ? (
          <p className="text-sm text-muted-foreground">
            Accept this request from the Event Requests page to start planning.
          </p>
        ) : (
          <>
            <ol className="flex items-center">
              {STEPS.map((s, i) => {
                const reached = i <= stepIndex;
                return (
                  <li key={s.key} className="flex flex-1 items-center last:flex-none">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                          reached ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i < stepIndex || status === "completed" ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className={`text-sm ${reached ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`mx-3 h-px flex-1 ${i < stepIndex ? "bg-violet-600" : "bg-border"}`} />
                    )}
                  </li>
                );
              })}
            </ol>

            {nextAction && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleProgress(nextAction.target)}
                  disabled={progressBusy || (nextAction.target === "completed" && !eventHasStarted)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {progressBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {nextAction.label}
                </button>
                {nextAction.target === "completed" && !eventHasStarted && (
                  <span className="text-xs text-muted-foreground">Available on the event date.</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Event details */}
        <div className={card}>
          <h2 className={heading}>Event details</h2>
          <Row label="Customer">{booking.customer_name}</Row>
          {booking.customer_phone && <Row label="Phone">{booking.customer_phone}</Row>}
          <Row label="Guests">{booking.guest_count}</Row>
          <Row label="Hall">
            {detail.halls.length > 0 ? detail.halls.map((h) => h.hall_name).join(", ") : "Not assigned yet"}
          </Row>
          {booking.room_count > 0 && <Row label="Rooms">{booking.room_count}</Row>}
          <Row label="Your role">{assignment.role_in_event ?? "Event Organizer"}</Row>
          {booking.special_requests && (
            <div className="mt-2 rounded-md bg-muted/50 p-2 text-sm">
              <span className="text-xs font-medium text-muted-foreground">Customer requirements</span>
              <p className="mt-0.5">{booking.special_requests}</p>
            </div>
          )}
          {assignment.notes && (
            <p className="mt-2 text-xs italic text-muted-foreground">Request note: {assignment.notes}</p>
          )}
        </div>

        {/* Partners */}
        <div className={card}>
          <h2 className={heading}>Partners</h2>

          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Catering</h3>
          {detail.catering.length === 0 ? (
            <p className="mb-3 text-sm text-muted-foreground">No catering order for this booking.</p>
          ) : (
            <div className="mb-3 space-y-2">
              {detail.catering.map((c) => (
                <div key={c.order_id} className="rounded-md border border-border p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.guest_count} guests</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{c.status}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {c.menu_items.map((m) => `${m.item_name} ×${m.quantity}`).join(", ")}
                  </p>
                  {c.delivery_time && (
                    <p className="text-xs text-muted-foreground">Delivery: {hhmm(c.delivery_time)}</p>
                  )}
                  {c.special_notes && <p className="text-xs italic text-muted-foreground">{c.special_notes}</p>}
                </div>
              ))}
            </div>
          )}

          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sponsors</h3>
          {detail.sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accepted sponsors.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {detail.sponsors.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span className="font-medium">{s.company_name}</span>
                  <span className="text-muted-foreground">
                    {s.proposed_amount ? `LKR ${Number(s.proposed_amount).toLocaleString()}` : s.industry ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Checklist */}
      {status !== "assigned" && (
        <div className={card}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Arrangement checklist</h2>
            <span className="text-xs text-muted-foreground">
              {doneCount} of {detail.checklist.length} done
            </span>
          </div>

          {detail.checklist.length > 0 && (
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-violet-600 transition-all"
                style={{ width: `${(doneCount / detail.checklist.length) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-4">
            {CATEGORIES.filter((c) => grouped[c].length > 0).map((c) => (
              <div key={c}>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[c]}
                </h3>
                <ul className="divide-y divide-border">
                  {grouped[c].map((item) => (
                    <li key={item.item_id} className="flex items-center gap-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.is_done}
                        disabled={!detail.canEditChecklist}
                        onChange={() => handleToggle(item)}
                        className="h-4 w-4 accent-violet-600"
                        aria-label={item.item_name}
                      />
                      <span className={`flex-1 ${item.is_done ? "text-muted-foreground line-through" : ""}`}>
                        {item.item_name}
                      </span>
                      {detail.canEditChecklist && (
                        <button
                          onClick={() => handleDelete(item)}
                          aria-label={`Remove ${item.item_name}`}
                          className="text-muted-foreground transition hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {detail.checklist.length === 0 && (
              <p className="text-sm text-muted-foreground">No checklist items yet.</p>
            )}
          </div>

          {detail.canEditChecklist ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
                className="rounded-md border border-input bg-card px-2 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                maxLength={150}
                placeholder="Add an item, e.g. Backup generator"
                className="min-w-48 flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-violet-500"
              />
              <button
                onClick={handleAdd}
                disabled={adding || !newName.trim()}
                className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">The checklist is locked because the event is completed.</p>
          )}
        </div>
      )}

      {/* Timeline (read-only, managed by staff) */}
      {detail.timeline.length > 0 && (
        <div className={card}>
          <h2 className={heading}>Event schedule</h2>
          <ul className="divide-y divide-border text-sm">
            {detail.timeline.map((t) => (
              <li key={t.timeline_id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <span className="font-medium">{t.activity_name}</span>
                  <span className="ml-2 text-xs capitalize text-muted-foreground">{t.category}</span>
                  {t.assigned_to && <span className="ml-2 text-xs text-muted-foreground">· {t.assigned_to}</span>}
                </div>
                <span className="whitespace-nowrap text-muted-foreground">
                  {hhmm(t.start_time)}–{hhmm(t.end_time)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
