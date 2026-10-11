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
          n <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
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
    "h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
      <p className="mt-1 text-gray-600">
        Review ratings for hall events and room stays, hide inappropriate
        reviews and reply to customers.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-medium uppercase text-gray-500">
            Average rating
          </p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-gray-900">
            {summary ? summary.avg_rating.toFixed(1) : "–"}
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-medium uppercase text-gray-500">
            Total reviews
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {summary?.total ?? "–"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-medium uppercase text-gray-500">
            Awaiting reply
          </p>
          <p className="mt-1 text-3xl font-bold text-orange-600">
            {summary?.awaiting_reply ?? "–"}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-xs font-medium uppercase text-gray-500">Hidden</p>
          <p className="mt-1 text-3xl font-bold text-gray-700">
            {summary?.hidden ?? "–"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Rating</label>
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
          <label className="mb-1 block text-xs text-gray-500">Visibility</label>
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
          <label className="mb-1 block text-xs text-gray-500">Reply</label>
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
          <label className="mb-1 block text-xs text-gray-500">
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
          <label className="mb-1 block text-xs text-gray-500">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Customer, booking ref or text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
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
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Loading feedback…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
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
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {f.customer_name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{f.event_type}</div>
                    <div className="text-xs text-gray-500">{f.booking_ref}</div>
                    {f.room_count > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        + {f.room_count} room{f.room_count > 1 ? "s" : ""}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Stars value={f.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {f.title && (
                      <div className="font-medium text-gray-900">{f.title}</div>
                    )}
                    <div className="line-clamp-2 text-gray-600">
                      {f.comment || (
                        <span className="italic text-gray-400">No comment</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.is_public
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {f.is_public ? "Public" : "Hidden"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.admin_reply
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
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
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
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
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white text-gray-900 ring-gray-200 sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.customer_name} · {selected.booking_ref}
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Review the feedback, then reply or change its visibility.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Stars value={selected.rating} />
                  <span className="text-xs text-gray-500">
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>
                {selected.title && (
                  <p className="font-medium text-gray-900">{selected.title}</p>
                )}
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {selected.comment || "No comment provided."}
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Admin reply
                  </label>
                  <Textarea
                    rows={4}
                    maxLength={1000}
                    placeholder="Write a reply to this customer…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {replyText.length}/1000
                  </p>
                </div>

                {dialogError && (
                  <p className="text-sm text-red-600">{dialogError}</p>
                )}
                {dialogSuccess && (
                  <p className="text-sm text-emerald-600">{dialogSuccess}</p>
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
