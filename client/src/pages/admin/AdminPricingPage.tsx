import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { listAllEventPricing, updateEventPricing } from "@/api/pricing.api";
import type { EventPricing } from "@/types/pricing.types";
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

const lkr = (n: number | null) =>
  n === null ? "Same as base" : `LKR ${n.toLocaleString("en-LK")}`;

export default function AdminPricingPage() {
  const [rows, setRows] = useState<EventPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [editing, setEditing] = useState<EventPricing | null>(null);
  const [base, setBase] = useState("");
  const [both, setBoth] = useState("");
  const [desc, setDesc] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setRows(await listAllEventPricing());
    } catch {
      setMsg({ ok: false, text: "Could not load prices" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (r: EventPricing) => {
    setEditing(r);
    setBase(String(r.basePrice));
    setBoth(r.bothHallsPrice === null ? "" : String(r.bothHallsPrice));
    setDesc(r.description ?? "");
    setActive(r.isActive);
    setErr("");
  };

  const save = async () => {
    if (!editing) return;
    const b = Number(base);
    const bh = both.trim() === "" ? null : Number(both);
    if (base.trim() === "" || Number.isNaN(b) || b < 0)
      return setErr("Enter a valid base price (0 or more).");
    if (bh !== null && (Number.isNaN(bh) || bh < 0))
      return setErr("Enter a valid both-halls price or leave it empty.");
    if (bh !== null && bh < b)
      return setErr("Both-halls price cannot be lower than the base price.");

    setSaving(true);
    setErr("");
    try {
      await updateEventPricing(editing.eventType, {
        base_price: b,
        both_halls_price: bh,
        description: desc.trim() || null,
        is_active: active,
      });
      setMsg({
        ok: true,
        text: `${editing.eventType} updated. New bookings will use the new price.`,
      });
      setEditing(null);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Could not save the price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Event Pricing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Changes apply to new bookings only. Existing bookings keep the price
          they were made with.
        </p>
      </div>

      {msg && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            msg.ok
              ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Event type</th>
              <th className="px-4 py-2">Price (1 hall)</th>
              <th className="px-4 py-2">Price (both halls)</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No event types found
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.eventType}
                className="text-gray-900 dark:text-gray-100"
              >
                <td className="px-4 py-2 font-medium">{r.eventType}</td>
                <td className="px-4 py-2">{lkr(r.basePrice)}</td>
                <td className="px-4 py-2">{lkr(r.bothHallsPrice)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {r.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => openEdit(r)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/30"
                    aria-label={`Edit ${r.eventType} price`}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit price: {editing?.eventType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="base">Price for one hall (LKR)</Label>
              <Input
                id="base"
                type="number"
                min={0}
                step="0.01"
                value={base}
                onChange={(e) => setBase(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="both">Price for both halls (LKR, optional)</Label>
              <Input
                id="both"
                type="number"
                min={0}
                step="0.01"
                value={both}
                onChange={(e) => setBoth(e.target.value)}
                placeholder="Leave empty to use the base price"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Available for booking
            </label>
            {err && (
              <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
