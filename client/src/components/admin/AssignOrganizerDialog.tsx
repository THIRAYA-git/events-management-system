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
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 " +
  "placeholder:text-gray-400 focus-visible:border-gray-900 focus-visible:outline-none " +
  "focus-visible:ring-1 focus-visible:ring-gray-900";

const labelClass = "mb-1 block text-xs font-medium text-gray-500";

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
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<
    string | undefined
  >(undefined);

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
    setSelectedOrganizerId(undefined);
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
      const newAssignment = await assignOrganizerToBooking(bookingId, {
        organizerId: Number(selectedOrganizerId),
        roleInEvent,
        agreedFee: Number(agreedFee),
        notes: notes || undefined,
      });
      setAssignedOrganizers((prev) => [...prev, newAssignment]);
      resetForm();
    } catch (err) {
      setError("Failed to assign organizer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent re-assigning an organizer already on this booking
  const unassignedOrganizers = availableOrganizers.filter(
    (org) =>
      !assignedOrganizers.some((a) => a.organizer_id === org.organizer_id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Manage Organizers</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl sm:max-w-md">
        <DialogHeader className="border-b border-gray-100 pb-4 text-left">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Assign event organizer
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Add an organizer to this booking.
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="space-y-5">
            {assignedOrganizers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Currently assigned
                </h4>
                {assignedOrganizers.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {a.business_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {a.role_in_event} · LKR{" "}
                        {Number(a.agreed_fee).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-purple-50 text-purple-700"
                    >
                      {a.specialty}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Assign new organizer
              </h4>

              <div>
                <label className={labelClass}>Organizer</label>
                <Select
                  value={selectedOrganizerId}
                  onValueChange={setSelectedOrganizerId}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select an organizer" />
                  </SelectTrigger>
                  <SelectContent className="border border-gray-200 bg-white shadow-lg">
                    {unassignedOrganizers.map((org) => (
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
                  Notes <span className="text-gray-400">(optional)</span>
                </label>
                <Textarea
                  className={`${fieldClass} h-auto min-h-[80px] py-2`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:bg-gray-100"
              >
                Close
              </Button>
              <Button
                onClick={handleAssign}
                disabled={submitting}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {submitting ? "Assigning…" : "Assign organizer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignOrganizerDialog;
