import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Search, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminFeedbackSummary,
  listAdminFeedback,
  replyToFeedback,
  setFeedbackVisibility,
} from "@/api/feedback.api";
import type { AdminFeedback, FeedbackSummary } from "@/types/feedback.types";

const PAGE_SIZE = 15;

const errMsg = (e: unknown, fallback: string): string => {
  const m = (e as { response?: { data?: { message?: string } } })?.response
    ?.data?.message;
  return m || fallback;
};

const Stars = ({ value }: { value: number }) => (
  <span
    className="inline-flex items-center gap-0.5"
    aria-label={`${value} out of 5`}
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`h-4 w-4 ${
          n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
        }`}
      />
    ))}
  </span>
);

interface Filters {
  rating: string;
  visibility: string; // "" | "public" | "hidden"
  reply: string; // "" | "replied" | "awaiting"
  rooms: string; // "" | "with" | "without"
}

const emptyFilters: Filters = {
  rating: "",
  visibility: "",
  reply: "",
  rooms: "",
};

const AdminFeedbackPage = () => {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);

  const [selected, setSelected] = useState<AdminFeedback | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSuccess, setDialogSuccess] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await getAdminFeedbackSummary());
    } catch {
      /* summary is secondary; the list shows its own error */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminFeedback({
        rating: filters.rating ? Number(filters.rating) : undefined,
        is_public:
          filters.visibility === "public"
            ? true
            : filters.visibility === "hidden"
            ? false
            : undefined,
        has_reply:
          filters.reply === "replied"
            ? true
            : filters.reply === "awaiting"
            ? false
            : undefined,
        has_rooms:
          filters.rooms === "with"
            ? true
            : filters.rooms === "without"
            ? false
            : undefined,
        q: debouncedSearch || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setItems(res.feedback);
      setTotal(res.total);
    } catch (e) {
      setError(errMsg(e, "Failed to load feedback."));
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(0);
  };

  const openDialog = (f: AdminFeedback) => {
    setSelected(f);
    setReplyText(f.admin_reply ?? "");
    setDialogError(null);
    setDialogSuccess(null);
  };

  const applyUpdate = (updated: AdminFeedback) => {
    // PATCH responses omit the joined columns, so merge onto the existing row
    setItems((prev) =>
      prev.map((i) =>
        i.feedback_id === updated.feedback_id ? { ...i, ...updated } : i
      )
    );
    setSelected((s) =>
      s && s.feedback_id === updated.feedback_id ? { ...s, ...updated } : s
    );
    loadSummary();
  };

  const handleReply = async () => {
    if (!selected) return;
    setSaving(true);
    setDialogError(null);
    setDialogSuccess(null);
    try {
      applyUpdate(await replyToFeedback(selected.feedback_id, replyText));
      setDialogSuccess(
        "Reply saved. The customer will see it on their dashboard."
      );
    } catch (e) {
      setDialogError(errMsg(e, "Could not save the reply."));
    } finally {
      setSaving(false);
    }
  };

  const handleVisibility = async () => {
    if (!selected) return;
    setSaving(true);
    setDialogError(null);
    try {
      applyUpdate(
        await setFeedbackVisibility(selected.feedback_id, !selected.is_public)
      );
      setDialogSuccess(
        selected.is_public ? "Review hidden." : "Review published."
      );
    } catch (e) {
      setDialogError(errMsg(e, "Could not update visibility."));
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectClass =
    "h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-3 md:p-0.5">
      <h1 className="text-2xl font-bold text-foreground">Customer Feedback</h1>
      <p className="mt-1 text-muted-foreground">
        Review ratings for hall events and room stays, hide inappropriate
        reviews and reply to customers.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Average rating
          </p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-foreground">
            {summary ? summary.avg_rating.toFixed(1) : "–"}
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Total reviews
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {summary?.total ?? "–"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Awaiting reply
          </p>
          <p className="mt-1 text-3xl font-bold text-orange-600 dark:text-orange-400">
            {summary?.awaiting_reply ?? "–"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase text-muted-foreground">Hidden</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {summary?.hidden ?? "–"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border bg-card p-5">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Rating</label>
          <select
            className={selectClass}
            value={filters.rating}
            onChange={(e) => updateFilter("rating", e.target.value)}
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Visibility</label>
          <select
            className={selectClass}
            value={filters.visibility}
            onChange={(e) => updateFilter("visibility", e.target.value)}
          >
            <option value="">All</option>
            <option value="public">Public</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Reply</label>
          <select
            className={selectClass}
            value={filters.reply}
            onChange={(e) => updateFilter("reply", e.target.value)}
          >
            <option value="">All</option>
            <option value="awaiting">Awaiting reply</option>
            <option value="replied">Replied</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Booking type
          </label>
          <select
            className={selectClass}
            value={filters.rooms}
            onChange={(e) => updateFilter("rooms", e.target.value)}
          >
            <option value="">Hall events and room stays</option>
            <option value="with">Includes rooms</option>
            <option value="without">Hall only</option>
          </select>
        </div>
        <div className="ml-auto w-full sm:w-72">
          <label className="mb-1 block text-xs text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border border-input pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Customer, booking ref or text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Loading feedback…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-600 dark:text-red-400">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No feedback matches these filters.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              items.map((f) => (
                <tr
                  key={f.feedback_id}
                  className="border-b last:border-0 align-top"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {f.customer_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{f.event_type}</div>
                    <div className="text-xs text-muted-foreground">{f.booking_ref}</div>
                    {f.room_count > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                        + {f.room_count} room{f.room_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Stars value={f.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {f.title && (
                      <div className="font-medium text-foreground">{f.title}</div>
                    )}
                    <div className="line-clamp-2 text-muted-foreground">
                      {f.comment || (
                        <span className="italic text-muted-foreground">No comment</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.is_public
                            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {f.is_public ? "Public" : "Hidden"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.admin_reply
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400"
                        }`}
                      >
                        {f.admin_reply ? "Replied" : "Awaiting reply"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(f)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} review{total === 1 ? "" : "s"} · page {page + 1} of{" "}
          {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Manage dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card text-foreground ring-gray-200 sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.customer_name} · {selected.booking_ref}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Review the feedback, then reply or change its visibility.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Stars value={selected.rating} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>
                {selected.title && (
                  <p className="font-medium text-foreground">{selected.title}</p>
                )}
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {selected.comment || "No comment provided."}
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Admin reply
                  </label>
                  <Textarea
                    rows={4}
                    maxLength={1000}
                    placeholder="Write a reply to this customer…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {replyText.length}/1000
                  </p>
                </div>

                {dialogError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{dialogError}</p>
                )}
                {dialogSuccess && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{dialogSuccess}</p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  onClick={handleVisibility}
                  disabled={saving}
                >
                  {selected.is_public ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Hide review
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Publish review
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReply}
                  disabled={saving || !replyText.trim()}
                >
                  {selected.admin_reply ? "Update reply" : "Send reply"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedbackPage;
