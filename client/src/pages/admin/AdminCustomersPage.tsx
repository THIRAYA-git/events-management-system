import { useEffect, useState, useCallback } from "react";
import { listUsers } from "@/lib/user.api";
import { listBookings } from "@/lib/booking.api";
import type { AdminCustomer } from "@/types/user.types";
import type { AdminBooking } from "@/types/booking.types";
import {
  Loader2,
  X,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, string> = {
  pending:
    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  completed: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<AdminBooking[]>([]);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUsers({ role: "customer", page, limit: PAGE_SIZE });
      setCustomers(res.users);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError("Failed to load customers. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCustomer = async (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setIsDrawerLoading(true);
    setCustomerBookings([]);
    try {
      const res = await listBookings({
        customer_id: customer.user_id,
        limit: 50,
        offset: 0,
      });
      setCustomerBookings(res.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedCustomer(null);
    setCustomerBookings([]);
  };

  const formatDate = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-LK", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const formatCurrency = (amount: string) =>
    `LKR ${Number(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
    })}`;

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Customers
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse customer accounts and their booking history.
      </p>

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="mt-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full max-w-sm rounded-md border border-input px-3 py-1.5 text-sm"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading customers…
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No customers match this search.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((c) => (
                <tr key={c.user_id} className="hover:bg-muted">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.full_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.booking_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        <ShieldOff className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openCustomer(c)}
                      className="rounded-md bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-input px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Customer Detail Drawer ──────────────────────────────────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-md overflow-y-auto bg-card shadow-lg">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedCustomer.full_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Customer #{selectedCustomer.user_id}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-2 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {selectedCustomer.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {selectedCustomer.phone ?? "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Joined {formatDate(selectedCustomer.created_at)}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Booking History ({customerBookings.length})
              </h3>

              {isDrawerLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading bookings…
                </div>
              ) : customerBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No bookings yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {customerBookings.map((b) => (
                    <div
                      key={b.booking_id}
                      className="rounded-md border border-border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {b.booking_ref}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            STATUS_BADGE[b.status]
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {b.hall_name} · {b.event_type} ·{" "}
                        {formatDate(b.event_date)}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {b.guest_count} guests ·{" "}
                        {formatCurrency(b.total_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
