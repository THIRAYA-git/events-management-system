import { api } from "@/lib/api";
import type {
  MenuItem,
  CateringOrder,
  CateringSelectionItem,
} from "@/types/catering.types";

export const listMenuItems = async (): Promise<MenuItem[]> => {
  const { data } = await api.get("/menu-items");
  return data.menuItems;
};

export const createCateringOrder = async (
  bookingId: number,
  payload: {
    menu_items: CateringSelectionItem[];
    guest_count?: number;
    special_notes?: string;
    delivery_time?: string;
  }
): Promise<CateringOrder> => {
  const { data } = await api.post("/catering-orders", {
    booking_id: bookingId,
    ...payload,
  });
  return data.order;
};