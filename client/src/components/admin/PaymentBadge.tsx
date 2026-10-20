import type { PaymentStatus } from "@/types/booking.types";

const STYLES: Record<PaymentStatus, string> = {
  paid: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-500/30",
  partial: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-500/30",
  unpaid: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-500/30",
};

export function PaymentBadge({ status }: { status?: PaymentStatus }) {
  const s = status ?? "unpaid";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${STYLES[s]}`}>
      {s}
    </span>
  );
}