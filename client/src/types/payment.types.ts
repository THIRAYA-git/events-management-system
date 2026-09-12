export interface PayHereCheckoutPayload {
  merchant_id: string;
  order_id: string;
  amount: string;
  currency: string;
  hash: string;
  notify_url: string;
  return_url: string;
  cancel_url: string;
  items: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export type PaymentStatus = "pending" | "completed" | "failed";

export interface PaymentRecord {
  payment_id: number;
  booking_id: number;
  amount: string;
  payment_method: string;
  status: PaymentStatus;
  currency: string;
  transaction_id: string | null;
  payhere_order_id: string;
  invoice_number: string | null;
  paid_at: string | null;
  created_at: string;
}