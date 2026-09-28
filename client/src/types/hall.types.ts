export interface Hall {
  hall_id: number;
  hall_name: string;
  floor_number: number;
  capacity: number;
  description: string | null;
  base_price: string;
  image_url: string | null;
  amenities: string | null;
}