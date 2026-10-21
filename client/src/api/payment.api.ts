import { api } from "@/lib/api";

export const recordCashPayment = async (bookingId: number, note?: string) => {
  const res = await api.patch(`/bookings/${bookingId}/payment/cash`, {
    note: note?.trim() || undefined,
  });
  return res.data.data as {
    payment_id: number;
    booking_ref: string;
    amount: string;
  };
};

export const downloadInvoice = async (bookingId: number, filename: string) => {
  const res = await api.get(`/payments/${bookingId}/invoice`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};