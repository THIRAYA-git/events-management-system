/** Any metric can be null when its query failed on the server. */
export interface DashboardAttention {
  organizerPending: number | null;
  organizerNeedsReassign: number | null;
  cateringPending: number | null;
  /** undefined when the current role is not allowed to see feedback */
  feedback?: {
    lowRated: number | null;
    total: number | null;
    avgRating: number | null;
  } | null;
}
