import { api } from "@/lib/api";
import type { PayHereCheckoutPayload, PaymentRecord } from "@/types/payment.types";

export const initiatePayment = async (bookingId: number) => {
  const { data } = await api.post<PayHereCheckoutPayload>("/payments/initiate", { bookingId });
  return data;
};

export const fetchPaymentStatus = async (bookingId: number) => {
  const { data } = await api.get<PaymentRecord>(`/payments/${bookingId}`);
  return data;
};