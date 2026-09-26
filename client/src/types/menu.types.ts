export interface MenuItem {
  item_id: number;
  item_name: string;
  category: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  is_vegetarian: boolean;
  is_available: boolean;
  restaurant_id: number;
  created_at: string;
}

export interface MenuItemPayload {
  item_name: string;
  category: string;
  description?: string | null;
  price: number;
  unit?: string;
  is_vegetarian?: boolean;
  is_available?: boolean;
}