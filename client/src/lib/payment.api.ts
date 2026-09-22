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

export const downloadInvoice = async (bookingId: number, filename: string) => {
  const response = await api.get(`/payments/${bookingId}/invoice`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};