import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { recordCashPayment } from "@/api/payment.api";
import type { AdminBooking } from "@/types/booking.types";

interface Props {
  booking: AdminBooking;
  onClose: () => void;
  onDone: () => void;
}

export default function MarkPaidDialog({ booking, onClose, onDone }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const due = Number(booking.total_amount) - Number(booking.amount_paid ?? 0);
  const fmt = (n: number) =>
    `LKR ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await recordCashPayment(booking.booking_id, note);
      onDone();
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to record payment. Please try again."
      );
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Record Cash Payment
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {booking.booking_ref} — {booking.customer_name}
        </p>

        <div className="mt-4 rounded-lg border border-border bg-muted/60 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cash to be received
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {fmt(due)}
          </div>
        </div>

        <label className="mb-1 mt-4 block text-xs font-medium text-muted-foreground">
          Note / receipt no. (optional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="e.g. Receipt #1042"
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={submit}
            disabled={saving || due <= 0}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm cash received
          </button>
        </div>
      </div>
    </div>
  );
}