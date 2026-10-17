import { api } from "@/lib/api";
import type {
  MenuItem,
  CateringOrder,
  CateringSelectionItem,
  CateringOrderListResponse,
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

// Admin/front_desk/restaurant table view across all bookings.
// hideDeliveredThrough (YYYY-MM-DD): hides delivered orders on/before that day.
// dateFilter + today (YYYY-MM-DD, client local date): event-date filter.
export const listAllCateringOrders = async (
  params: {
    status?: string;
    limit?: number;
    offset?: number;
    hideDeliveredThrough?: string;
    dateFilter?: "overdue" | "today" | "upcoming";
    today?: string;
  } = {}
): Promise<CateringOrderListResponse> => {
  const { data } = await api.get("/catering-orders", { params });
  return data;
};

export const updateCateringOrderStatus = async (
  orderId: number,
  status: string
): Promise<CateringOrder> => {
  const { data } = await api.patch(`/catering-orders/${orderId}/status`, { status });
  return data.cateringOrder;
};