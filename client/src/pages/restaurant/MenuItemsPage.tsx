import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  uploadMenuItemImage,
  deleteMenuItem,
} from "@/api/menu.api";
import type { MenuItem, MenuItemPayload } from "@/types/menu.types";

const emptyForm: MenuItemPayload = {
  item_name: "",
  category: "",
  description: "",
  price: 0,
  unit: "per person",
  is_vegetarian: false,
  is_available: true,
};

const PAGE_SIZE = 5;

export default function MenuItemsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuItemPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await listMenuItems(true);
      setItems(all.filter((i) => i.restaurant_id === Number(user?.id)));
    } catch {
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.item_id);
    setForm({
      item_name: item.item_name,
      category: item.category,
      description: item.description ?? "",
      price: item.price,
      unit: item.unit,
      is_vegetarian: item.is_vegetarian,
      is_available: item.is_available,
    });
    setFormOpen(true);
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.item_name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSave = async () => {
    if (!form.item_name.trim() || !form.category.trim() || form.price <= 0) {
      setError("Item name, category and a price above 0 are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await updateMenuItem(editingId, form);
        setItems((prev) =>
          prev.map((i) => (i.item_id === editingId ? updated : i))
        );
      } else {
        const created = await createMenuItem(form);
        setItems((prev) => [...prev, created]);
      }
      setFormOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm("Remove this menu item? This cannot be undone.")) return;
    try {
      await deleteMenuItem(itemId);
      setItems((prev) => prev.filter((i) => i.item_id !== itemId));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete menu item.");
    }
  };

  const handleImagePick = async (itemId: number, file: File) => {
    setUploadingId(itemId);
    setError(null);
    try {
      const updated = await uploadMenuItemImage(itemId, file);
      setItems((prev) => prev.map((i) => (i.item_id === itemId ? updated : i)));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Image upload failed.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Menu Items</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-md border px-3 py-2 text-sm"
          />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">
          {search
            ? "No menu items match your search."
            : "No menu items yet. Add your first one above."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((item) => (
                  <tr key={item.item_id}>
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <Camera className="h-4 w-4" />
                          </div>
                        )}
                        {uploadingId === item.item_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[item.item_id] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) handleImagePick(item.item_id, file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRefs.current[item.item_id]?.click()
                        }
                        className="mt-1 text-xs text-blue-600 hover:underline"
                      >
                        {item.image_url ? "Change" : "Add photo"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.item_name}</div>
                      {item.is_vegetarian && (
                        <span className="text-xs text-green-600">Vegetarian</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">
                      LKR {Number(item.price).toFixed(2)}{" "}
                      <span className="text-xs text-gray-400">/ {item.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          item.is_available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="mr-3 inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Page {currentPage} of {totalPages} ({filtered.length} item
                {filtered.length !== 1 ? "s" : ""})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Item name
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.item_name}
                  onChange={(e) =>
                    setForm({ ...form, item_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Category
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="e.g. Main Course, Starters, Desserts"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Description
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={2}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Unit
                  </label>
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_vegetarian}
                    onChange={(e) =>
                      setForm({ ...form, is_vegetarian: e.target.checked })
                    }
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) =>
                      setForm({ ...form, is_available: e.target.checked })
                    }
                  />
                  Available
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}