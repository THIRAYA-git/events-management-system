import { api } from "@/lib/api";
import type { RoomGroup } from "@/types/roomAdmin.types";

export const fetchRoomGroups = async (): Promise<RoomGroup[]> => {
  const res = await api.get("/rooms/reservations/groups");
  return res.data.data;
};

export const recordRoomCashPayment = async (groupRef: string, note: string) => {
  const res = await api.patch(
    `/rooms/reservations/groups/${groupRef}/cash-payment`,
    { note }
  );
  return res.data.data;
};

// Works for staff (any invoice) and customers (own invoices)
export const downloadRoomInvoice = async (groupRef: string) => {
  const res = await api.get(`/rooms/reservations/groups/${groupRef}/invoice`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Room-Invoice-${groupRef}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};