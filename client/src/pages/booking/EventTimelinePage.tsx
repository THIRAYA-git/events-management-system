import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { ActivityFormDialog } from "@/components/timeline/ActivityFormDialog";
import {
  fetchTimeline,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
} from "@/lib/timeline.api";
import type { TimelineActivity, TimelineFormValues } from "@/types/timeline.types";

const formatTime = (t: string) => t.slice(0, 5); // "08:00:00" -> "08:00"

export default function EventTimelinePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { permissions } = useAuth();
  const canManage = permissions.includes("timeline:manage");

  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TimelineActivity | null>(null);

  const numericBookingId = parseInt(bookingId || "0", 10);

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTimeline(numericBookingId);
      setActivities(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not load timeline.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (numericBookingId) loadTimeline();
  }, [numericBookingId]);

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
      await updateTimelineActivity(numericBookingId, editingActivity.timeline_id, values);
      toast.success("Activity updated.");
    } else {
      await createTimelineActivity(numericBookingId, values);
      toast.success("Activity added.");
    }
    await loadTimeline();
  };

  const handleDelete = async (activity: TimelineActivity) => {
    if (!confirm(`Remove "${activity.activity_name}" from the timeline?`)) return;
    try {
      await deleteTimelineActivity(numericBookingId, activity.timeline_id);
      toast.success("Activity removed.");
      await loadTimeline();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not remove activity.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Event timeline</CardTitle>
            <p className="text-sm text-muted-foreground">Booking #{bookingId}</p>
          </div>
          {canManage && <Button onClick={handleAddClick}>Add activity</Button>}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          )}

          {!isLoading && activities.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activities scheduled yet.
            </p>
          )}

          {!isLoading && activities.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Assigned to</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.timeline_id}>
                    <TableCell className="whitespace-nowrap">
                      {formatTime(activity.start_time)}–{formatTime(activity.end_time)}
                    </TableCell>
                    <TableCell>
                      <div>{activity.activity_name}</div>
                      {activity.notes && (
                        <div className="text-xs text-muted-foreground">{activity.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>{activity.assigned_to || "—"}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(activity)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(activity)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <ActivityFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingActivity={editingActivity}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}