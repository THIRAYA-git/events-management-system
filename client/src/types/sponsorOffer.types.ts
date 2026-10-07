export interface CreateSponsorOfferPayload {
  bookingId: number;
  proposedAmount: number;
  message?: string;
}

export interface SponsorOffer {
  id: number;
  booking_id: number;
  proposed_amount: number | string | null;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  direction: "sponsor_to_customer";
  requested_at: string;
  responded_at: string | null;
  company_name: string;
  industry: string | null;
  logo_url: string | null;
}
