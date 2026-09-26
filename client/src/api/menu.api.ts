import { api } from "@/lib/api";
import type { MenuItem, MenuItemPayload } from "@/types/menu.types";

export const listMenuItems = async (all = false): Promise<MenuItem[]> => {
  const { data } = await api.get<{ menuItems: MenuItem[] }>(
    `/menu-items${all ? "?all=true" : ""}`
  );
  return data.menuItems;
};

export const createMenuItem = async (payload: MenuItemPayload): Promise<MenuItem> => {
  const { data } = await api.post<{ menuItem: MenuItem }>("/menu-items", payload);
  return data.menuItem;
};

export const updateMenuItem = async (
  itemId: number,
  payload: Partial<MenuItemPayload>
): Promise<MenuItem> => {
  const { data } = await api.patch<{ menuItem: MenuItem }>(`/menu-items/${itemId}`, payload);
  return data.menuItem;
};

export const uploadMenuItemImage = async (itemId: number, file: File): Promise<MenuItem> => {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<{ menuItem: MenuItem }>(`/menu-items/${itemId}/image`, form);
  return data.menuItem;
};

export const deleteMenuItem = async (itemId: number): Promise<void> => {
  await api.delete(`/menu-items/${itemId}`);
};