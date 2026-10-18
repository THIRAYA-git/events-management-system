import { api } from "@/lib/api";
import type { AvailableRoom, CreateReservationPayload, RoomReservation } from "@/types/room.types";
import type { PayHereCheckoutPayload } from "@/types/payment.types";
import type { RoomPaymentStatus } from "@/types/room.types";

export const getAvailableRooms = async (checkIn: string, checkOut: string) =>
  (await api.get("/rooms/availability", { params: { checkIn, checkOut } })).data.data as AvailableRoom[];

export const createRoomReservation = async (payload: CreateReservationPayload) =>
  (await api.post("/rooms/reservations", payload)).data.data as RoomReservation[];

export const getMyRoomReservations = async () =>
  (await api.get("/rooms/reservations/mine")).data.data as RoomReservation[];

export const cancelRoomReservation = async (id: number) =>
  (await api.patch(`/rooms/reservations/${id}/cancel`)).data.data as RoomReservation;

export const initiateRoomPayment = async (groupRef: string) =>
  (await api.post("/rooms/payments/initiate", { groupRef })).data.data as PayHereCheckoutPayload;

export const fetchRoomPaymentStatus = async (groupRef: string) =>
  (await api.get(`/rooms/payments/${groupRef}`)).data.data as RoomPaymentStatus;