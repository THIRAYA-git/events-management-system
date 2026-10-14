import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import {
  TIMELINE_CATEGORIES,
  CATEGORY_LABELS,
  type TimelineActivity,
  type TimelineFormValues,
  type TimelineHall,
} from "@/types/timeline.types";

const EMPTY_FORM: TimelineFormValues = {
  activity_name: "",
  category: "setup",
  hall_id: "",
  start_time: "",
  end_time: "",
  assigned_to: "",
  notes: "",
};

const LABEL = "block text-xs font-medium text-muted-foreground mb-1";
const FIELD =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingActivity: TimelineActivity | null;
  halls: TimelineHall[];
  onSubmit: (values: TimelineFormValues) => Promise<void>;
}

// Converts "08:00:00" (from the API) to "08:00" (for an <input type="time">)
const toInputTime = (t: string) => t.slice(0, 5);

export function ActivityFormDialog({
  open,
  onOpenChange,
  editingActivity,
  halls,
  onSubmit,
}: ActivityFormDialogProps) {
  const [values, setValues] = useState<TimelineFormValues>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A hall picker only makes sense when the booking spans both halls
  const showHallPicker = halls.length > 1;

  useEffect(() => {
    if (editingActivity) {
      setValues({
        activity_name: editingActivity.activity_name,
        category: editingActivity.category,
        hall_id: editingActivity.hall_id ? String(editingActivity.hall_id) : "",
        start_time: toInputTime(editingActivity.start_time),
        end_time: toInputTime(editingActivity.end_time),
        assigned_to: editingActivity.assigned_to || "",
        notes: editingActivity.notes || "",
      });
    } else {
      setValues(EMPTY_FORM);
    }
    setError(null);
  }, [editingActivity, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!values.activity_name.trim()) return setError("Activity name is required.");
    if (!values.start_time || !values.end_time) return setError("Start and end time are required.");
    if (values.start_time >= values.end_time) return setError("Start time must be before end time.");

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not save activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editingActivity ? "Edit activity" : "Add activity"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Schedule a task for this event.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="activity_name" className={LABEL}>
              Activity name
            </label>
            <input
              id="activity_name"
              className={FIELD}
              value={values.activity_name}
              onChange={(e) => setValues({ ...values, activity_name: e.target.value })}
              placeholder="e.g. Stage setup, Dinner service, Floor cleanup"
              autoFocus
            />
          </div>

          <div
            className={`grid grid-cols-1 gap-4 ${showHallPicker ? "sm:grid-cols-2" : ""}`}
          >
            <div>
              <label htmlFor="category" className={LABEL}>
                Category
              </label>
              <select
                id="category"
                className={FIELD}
                value={values.category}
                onChange={(e) =>
                  setValues({
                    ...values,
                    category: e.target.value as TimelineFormValues["category"],
                  })
                }
              >
                {TIMELINE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            {showHallPicker && (
              <div>
                <label htmlFor="hall_id" className={LABEL}>
                  Hall
                </label>
                <select
                  id="hall_id"
                  className={FIELD}
                  value={values.hall_id}
                  onChange={(e) => setValues({ ...values, hall_id: e.target.value })}
                >
                  <option value="">All halls</option>
                  {halls.map((h) => (
                    <option key={h.hall_id} value={h.hall_id}>
                      {h.hall_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_time" className={LABEL}>
                Start time
              </label>
              <input
                id="start_time"
                type="time"
                className={FIELD}
                value={values.start_time}
                onChange={(e) => setValues({ ...values, start_time: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="end_time" className={LABEL}>
                End time
              </label>
              <input
                id="end_time"
                type="time"
                className={FIELD}
                value={values.end_time}
                onChange={(e) => setValues({ ...values, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="assigned_to" className={LABEL}>
              Assigned to (optional)
            </label>
            <input
              id="assigned_to"
              className={FIELD}
              value={values.assigned_to}
              onChange={(e) => setValues({ ...values, assigned_to: e.target.value })}
              placeholder="e.g. Event Coordinator, Althaf Hotel"
            />
          </div>

          <div>
            <label htmlFor="notes" className={LABEL}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className={FIELD}
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isSubmitting ? "Saving…" : editingActivity ? "Save changes" : "Add activity"}
          </button>
        </div>
      </div>
    </div>
  );
}