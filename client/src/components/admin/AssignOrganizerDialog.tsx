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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Event Organizer</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-4">
            {assignedOrganizers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Currently Assigned</h4>
                {assignedOrganizers.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{a.business_name}</p>
                      <p className="text-muted-foreground">
                        {a.role_in_event} · LKR{" "}
                        {Number(a.agreed_fee).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{a.specialty}</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-medium">Assign New Organizer</h4>

              <Select
                value={selectedOrganizerId}
                onValueChange={setSelectedOrganizerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organizer" />
                </SelectTrigger>
                <SelectContent>
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

              <Input
                placeholder="Role in event (e.g. Decoration Lead)"
                value={roleInEvent}
                onChange={(e) => setRoleInEvent(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Agreed fee (LKR)"
                value={agreedFee}
                onChange={(e) => setAgreedFee(e.target.value)}
              />

              <Textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                onClick={handleAssign}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Assigning…" : "Assign Organizer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignOrganizerDialog;
