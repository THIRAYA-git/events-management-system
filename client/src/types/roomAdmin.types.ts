export interface RoomGroup {
  group_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  rooms: string;
  room_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_amount: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "paid" | "unpaid";
  payment_method: string | null;
  paid_at: string | null;
  invoice_number: string | null;
  payment_note: string | null;
  created_at: string;
}