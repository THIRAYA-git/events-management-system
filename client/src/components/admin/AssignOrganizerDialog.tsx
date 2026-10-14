import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  getAllOrganizers,
  getOrganizersForBooking,
  assignOrganizerToBooking,
} from "@/api/organizer.api";
import type {
  Organizer,
  BookingOrganizerAssignment,
} from "@/types/organizer.types";

interface AssignOrganizerDialogProps {
  bookingId: number;
  trigger?: React.ReactNode;
}

// Explicit colours so the form doesn't depend on shadcn CSS variables
const fieldClass =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none " +
  "focus-visible:ring-1 focus-visible:ring-gray-900";

// Long option text must truncate instead of stretching the dialog
const selectTriggerClass = `${fieldClass} min-w-0 overflow-hidden [&>span]:min-w-0 [&>span]:truncate`;

const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

const AssignOrganizerDialog: FC<AssignOrganizerDialogProps> = ({
  bookingId,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableOrganizers, setAvailableOrganizers] = useState<Organizer[]>(
    []
  );
  const [assignedOrganizers, setAssignedOrganizers] = useState<
    BookingOrganizerAssignment[]
  >([]);
  // "" (not undefined) so the Select shows its placeholder after a reset
  const [selectedOrganizerId, setSelectedOrganizerId] = useState("");

  const [roleInEvent, setRoleInEvent] = useState("");
  const [agreedFee, setAgreedFee] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [organizers, assignments] = await Promise.all([
        getAllOrganizers({ isAvailable: true }),
        getOrganizersForBooking(bookingId),
      ]);
      setAvailableOrganizers(organizers);
      setAssignedOrganizers(assignments);
    } catch (err) {
      setError("Failed to load organizers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedOrganizerId("");
    setRoleInEvent("");
    setAgreedFee("");
    setNotes("");
  };

  const handleAssign = async () => {
    if (!selectedOrganizerId || !roleInEvent || !agreedFee) {
      setError("Organizer, role, and agreed fee are required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await assignOrganizerToBooking(bookingId, {
        organizerId: Number(selectedOrganizerId),
        roleInEvent,
        agreedFee: Number(agreedFee),
        notes: notes || undefined,
      });

      // The create response has no business name or specialty, so reload the
      // list from the server. Fall back to the raw row if that reload fails.
      try {
        setAssignedOrganizers(await getOrganizersForBooking(bookingId));
      } catch {
        setAssignedOrganizers((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to assign organizer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // One organizer per booking: once someone is assigned, the form is hidden.
  const hasOrganizer = assignedOrganizers.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Manage Organizers</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-card p-6 shadow-xl sm:max-w-md">
        <DialogHeader className="border-b border-border pb-4 text-left">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {hasOrganizer ? "Event organizer" : "Assign event organizer"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {hasOrganizer
              ? "This booking already has an organizer."
              : "Add an organizer to this booking."}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="min-w-0 space-y-5">
            {hasOrganizer && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assigned organizer
                </h4>
                {assignedOrganizers.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {a.business_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.role_in_event}
                        {a.agreed_fee != null &&
                          ` · LKR ${Number(a.agreed_fee).toLocaleString()}`}
                      </p>
                    </div>
                    {a.specialty && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400"
                      >
                        {a.specialty}
                      </Badge>
                    )}
                  </div>
                ))}
                <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Only one organizer can be assigned to a booking.
                </p>
              </div>
            )}

            {!hasOrganizer && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assign new organizer
                </h4>

                <div className="min-w-0">
                  <label className={labelClass}>Organizer</label>
                  <Select
                    value={selectedOrganizerId}
                    onValueChange={setSelectedOrganizerId}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select an organizer" />
                    </SelectTrigger>
                    <SelectContent className="border border-border bg-card shadow-lg">
                      {availableOrganizers.map((org) => (
                        <SelectItem
                          key={org.organizer_id}
                          value={String(org.organizer_id)}
                        >
                          {org.business_name} — {org.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className={labelClass}>Role in event</label>
                  <Input
                    className={fieldClass}
                    placeholder="e.g. Decoration Lead"
                    value={roleInEvent}
                    onChange={(e) => setRoleInEvent(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Agreed fee (LKR)</label>
                  <Input
                    className={fieldClass}
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Notes <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    className={`${fieldClass} h-auto min-h-[80px] py-2`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-md bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted"
              >
                Close
              </Button>
              {!hasOrganizer && (
                <Button
                  onClick={handleAssign}
                  disabled={submitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting && (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
                  {submitting ? "Assigning…" : "Assign organizer"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignOrganizerDialog;
