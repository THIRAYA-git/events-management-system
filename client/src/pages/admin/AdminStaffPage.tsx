import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Unlock, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  setStaffStatus,
  unlockStaff,
} from "@/api/staff.api";
import type { StaffMember, StaffRole, StaffFilters } from "@/types/staff.types";

const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Admin",
  front_desk: "Front Desk",
};

const ROLE_STYLE: Record<StaffRole, string> = {
  admin: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
  front_desk: "bg-muted text-foreground",
};

const fieldClass =
  "h-10 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground";

const actionBase =
  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  password: string;
}
const EMPTY_FORM: FormState = {
  full_name: "",
  email: "",
  phone: "",
  role: "front_desk",
  password: "",
};

const errMsg = (e: any) =>
  e?.response?.data?.message || "Something went wrong.";
const isLocked = (s: StaffMember) =>
  !!s.locked_until && new Date(s.locked_until) > new Date();
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const AdminStaffPage = () => {
  const { user } = useAuth();
  const myId = (user as any)?.id;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<StaffFilters["role"]>("");
  const [status, setStatus] = useState<StaffFilters["status"]>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchStaff({ search, role, status });
      setStaff(data.staff);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  // Debounce so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({
      full_name: s.full_name,
      email: s.email,
      phone: s.phone ?? "",
      role: s.role,
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return toast.error("Full name is required.");
    if (!editing) {
      if (!form.email.trim()) return toast.error("Email is required.");
      if (form.password.length < 8)
        return toast.error("Password must be at least 8 characters.");
    }
    setSaving(true);
    try {
      const res = editing
        ? await updateStaff(editing.user_id, {
            full_name: form.full_name,
            phone: form.phone,
            role: form.role,
          })
        : await createStaff(form);
      toast.success(res.message);
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: StaffMember) => {
    if (
      s.is_active &&
      !window.confirm(
        `Deactivate ${s.full_name}? They will be signed out and unable to log in.`
      )
    )
      return;
    try {
      const res = await setStaffStatus(s.user_id, !s.is_active);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const handleUnlock = async (s: StaffMember) => {
    try {
      const res = await unlockStaff(s.user_id);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Staffs</h1>
          <p className="text-muted-foreground mt-1">
            Create, update, and deactivate staff accounts.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Staff
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Search</label>
          <input
            className={`${fieldClass} w-64`}
            placeholder="Name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Role</label>
          <select
            className={fieldClass}
            value={role}
            onChange={(e) => setRole(e.target.value as StaffFilters["role"])}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="front_desk">Front Desk</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <select
            className={fieldClass}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as StaffFilters["status"])
            }
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-4">Staff</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Last login</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-muted-foreground"
                >
                  No staff accounts found.
                </td>
              </tr>
            ) : (
              staff.map((s) => {
                const isSelf = s.user_id === myId;
                return (
                  <tr
                    key={s.user_id}
                    className={s.is_active ? "" : "bg-muted"}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            s.is_active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {initials(s.full_name)}
                        </div>
                        <div>
                          <div
                            className={`font-medium ${
                              s.is_active ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {s.full_name}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {s.phone ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          ROLE_STYLE[s.role]
                        }`}
                      >
                        {ROLE_LABEL[s.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            s.is_active
                              ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                        {isLocked(s) && (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {s.last_login ? (
                        <>
                          <div>
                            {new Date(s.last_login).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(s.last_login).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {isLocked(s) && (
                          <button
                            onClick={() => handleUnlock(s)}
                            className={`${actionBase} border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20`}
                          >
                            <Unlock className="h-4 w-4" /> Unlock
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(s)}
                          className={`${actionBase} border-border bg-card text-foreground hover:bg-muted`}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        {s.is_active ? (
                          !isSelf && (
                            <button
                              onClick={() => handleToggleActive(s)}
                              className={`${actionBase} border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20`}
                            >
                              <UserX className="h-4 w-4" /> Deactivate
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleToggleActive(s)}
                            className={`${actionBase} border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20`}
                          >
                            <UserCheck className="h-4 w-4" /> Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card text-foreground ring-gray-200 sm:max-w-md">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-semibold">
              {editing ? "Edit staff account" : "Add staff account"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editing
                ? "Email cannot be changed. A role change takes effect on the user's next login."
                : "The staff member can log in immediately with this password."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="full_name" className="text-xs text-muted-foreground">
                Full name
              </label>
              <input
                id="full_name"
                className={fieldClass}
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={fieldClass}
                disabled={!!editing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-xs text-muted-foreground">
                Phone
              </label>
              <input
                id="phone"
                className={fieldClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-xs text-muted-foreground">
                Role
              </label>
              <select
                id="role"
                className={fieldClass}
                value={form.role}
                disabled={editing?.user_id === myId}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as StaffRole })
                }
              >
                <option value="front_desk">Front Desk</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {!editing && (
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs text-muted-foreground">
                  Temporary password
                </label>
                <input
                  id="password"
                  type="password"
                  className={fieldClass}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="bg-muted">
            <button
              onClick={() => setDialogOpen(false)}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
