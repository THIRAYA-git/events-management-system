import type { ReactNode } from "react";
import { Check, CreditCard, Loader2, X } from "lucide-react";

export type PaymentTone = "loading" | "waiting" | "success" | "cancelled" | "error";

const TONES: Record<
  PaymentTone,
  { circle: string; ring: string; bar: string }
> = {
  loading: { circle: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", ring: "ring-violet-100 dark:ring-violet-500/30", bar: "bg-violet-500" },
  waiting: { circle: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", ring: "ring-violet-100 dark:ring-violet-500/30", bar: "bg-violet-500" },
  success: { circle: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400", ring: "ring-green-100 dark:ring-green-500/30", bar: "bg-green-500" },
  cancelled: { circle: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400", ring: "ring-amber-100 dark:ring-amber-500/30", bar: "bg-amber-500" },
  error: { circle: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400", ring: "ring-red-100 dark:ring-red-500/30", bar: "bg-red-500" },
};

function ToneIcon({ tone }: { tone: PaymentTone }) {
  const cls = "h-8 w-8";
  if (tone === "loading") return <Loader2 className={`${cls} animate-spin`} />;
  if (tone === "waiting") return <CreditCard className={cls} />;
  if (tone === "success") return <Check className={cls} strokeWidth={3} />;
  return <X className={cls} strokeWidth={3} />;
}

// ── Formatters (Sri Lanka Standard Time, UTC+05:30) ─────────────────────────
export const formatLkr = (amount: string | number, currency = "LKR") =>
  `${currency} ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatPaidAt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Colombo",
      }) + " (SLST)"
    : "—";

export const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ── Card ────────────────────────────────────────────────────────────────────
interface PaymentStatusCardProps {
  tone: PaymentTone;
  title: string;
  message?: string;
  /** Big highlighted figure, e.g. the amount paid. */
  highlight?: { label: string; value: string };
  /** Label / value rows shown as a receipt-style list. */
  rows?: { label: string; value: string }[];
  /** Buttons. */
  children?: ReactNode;
}

export function PaymentStatusCard({
  tone,
  title,
  message,
  highlight,
  rows,
  children,
}: PaymentStatusCardProps) {
  const t = TONES[tone];
  const busy = tone === "loading" || tone === "waiting";

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <section
        className="overflow-hidden rounded-2xl border border-border! bg-card shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className={`h-1.5 w-full ${t.bar} ${busy ? "animate-pulse" : ""}`} />

        <div className="px-6 pb-6 pt-8 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-8 ${t.circle} ${t.ring}`}
          >
            <ToneIcon tone={tone} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-foreground">{title}</h1>
          {message && (
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          )}

          {highlight && (
            <div className="mt-6 rounded-xl bg-muted px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {highlight.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{highlight.value}</p>
            </div>
          )}

          {rows && rows.length > 0 && (
            <dl className="mt-5 divide-y divide-border! rounded-xl border border-border! text-left text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">{r.label}</dt>
                  <dd className="break-all text-right font-medium text-foreground">{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {children && (
          <div className="flex flex-col gap-2 border-t border-border! bg-muted px-6 py-4">
            {children}
          </div>
        )}
      </section>
    </div>
  );
}