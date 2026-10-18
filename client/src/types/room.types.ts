export interface AvailableRoom {
  room_id: number;
  room_name: string;
  capacity: number;
  rate_per_day: string;
  total_price: string;
}

export interface RoomReservation {
  reservation_id: number;
  reservation_ref: string;
  room_id: number;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_amount: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "unpaid" | "paid" | "refunded";
  group_ref: string;
transaction_id: string | null;
payment_method: string | null;
paid_at: string | null;
}

export interface CreateReservationPayload {
  roomIds: number[];
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface RoomPaymentStatus {
  group_ref: string;
  status: RoomReservation["status"];
  payment_status: "paid" | "unpaid";
  total_amount: number;
  paid_at: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  rooms: { room_name: string; check_in: string; check_out: string; nights: number }[];
}