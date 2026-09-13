import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { TimelineActivity, TimelineFormValues } from "@/types/timeline.types";

const EMPTY_FORM: TimelineFormValues = {
  activity_name: "",
  start_time: "",
  end_time: "",
  assigned_to: "",
  notes: "",
};

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingActivity: TimelineActivity | null;
  onSubmit: (values: TimelineFormValues) => Promise<void>;
}

// Converts "08:00:00" (from the API) to "08:00" (for an <input type="time">)
const toInputTime = (t: string) => t.slice(0, 5);

export function ActivityFormDialog({
  open,
  onOpenChange,
  editingActivity,
  onSubmit,
}: ActivityFormDialogProps) {
  const [values, setValues] = useState<TimelineFormValues>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingActivity) {
      setValues({
        activity_name: editingActivity.activity_name,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingActivity ? "Edit activity" : "Add activity"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_name">Activity name</Label>
            <Input
              id="activity_name"
              value={values.activity_name}
              onChange={(e) => setValues({ ...values, activity_name: e.target.value })}
              placeholder="e.g. Setup, Catering delivery, Cleanup"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start time</Label>
              <Input
                id="start_time"
                type="time"
                value={values.start_time}
                onChange={(e) => setValues({ ...values, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End time</Label>
              <Input
                id="end_time"
                type="time"
                value={values.end_time}
                onChange={(e) => setValues({ ...values, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned to (optional)</Label>
            <Input
              id="assigned_to"
              value={values.assigned_to}
              onChange={(e) => setValues({ ...values, assigned_to: e.target.value })}
              placeholder="e.g. Event Coordinator, Althab Restaurant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : editingActivity ? "Save changes" : "Add activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}