export interface MenuItem {
  item_id: number;
  item_name: string;
  category: string;
  description: string | null;
  price: string; // numeric column comes back as string from pg
  unit: string;
  image_url: string | null;
  is_vegetarian: boolean;
  is_available: boolean;
  restaurant_id: number;
  created_at: string;
}

export interface CateringSelectionItem {
  item_id: number;
  quantity: number;
}

export interface CateringOrderLine {
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export interface CateringOrder {
  order_id: number;
  booking_id: number;
  menu_items: CateringOrderLine[];
  total_cost: string;
  guest_count: number;
  status: string;
  special_notes: string | null;
  delivery_time: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}