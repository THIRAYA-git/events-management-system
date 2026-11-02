import { useState } from "react";
import {
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/booking/bookingStyles";
import { AccountDetailsFields } from "@/components/customer/AccountDetailsFields";
import {
  emptyAccountDetails,
  formatAccountDetails,
  validateAccountDetails,
  type AccountDetails,
} from "@/lib/accountDetails";
import type { SponsorOffer } from "@/types/sponsorOffer.types";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  accepted:
    "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground",
};

interface Props {
  offers: SponsorOffer[];
  respondingId: number | null;
  onRespond: (
    offerId: number,
    action: "accepted" | "rejected",
    paymentDetails?: string
  ) => void;
}

function SponsorLogo({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        className="h-12 w-12 shrink-0 rounded-lg border border-border bg-card object-cover"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-semibold text-muted-foreground">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function BookingSponsorOffers({
  offers,
  respondingId,
  onRespond,
}: Props) {
  // Account details typed for each pending offer, keyed by offer id
  const [forms, setForms] = useState<Record<number, AccountDetails>>({});

  if (offers.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl border border-border! bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Sponsor offers ({offers.length})
      </h3>
      <div className="space-y-3">
        {offers.map((o) => {
          const form = forms[o.id] ?? emptyAccountDetails;
          const invalid = validateAccountDetails(form) !== null;
          return (
            <div key={o.id} className="rounded-xl bg-muted p-4">
              <div className="flex items-start gap-3">
                <SponsorLogo url={o.logo_url} name={o.company_name} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium text-foreground">
                        {o.company_name}
                      </span>
                      {o.industry && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {o.industry}
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        STATUS_STYLES[o.status] ?? ""
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  {o.proposed_amount != null && (
                    <p className="mt-1 text-sm text-foreground">
                      Offered amount:{" "}
                      <span className="font-semibold">
                        LKR {Number(o.proposed_amount).toLocaleString()}
                      </span>
                    </p>
                  )}
                  {o.message && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      "{o.message}"
                    </p>
                  )}
                </div>
              </div>

              {o.status === "pending" && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs font-medium text-foreground">
                    Your account details (needed to accept). The sponsor sees
                    them only after you accept.
                  </p>
                  <AccountDetailsFields
                    value={form}
                    onChange={(v) => setForms((f) => ({ ...f, [o.id]: v }))}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onRespond(o.id, "rejected")}
                      disabled={respondingId === o.id}
                      className={`${secondaryBtnClass} text-red-600 dark:text-red-400`}
                    >
                      {respondingId === o.id ? "…" : "Reject"}
                    </button>
                    <button
                      onClick={() =>
                        onRespond(o.id, "accepted", formatAccountDetails(form))
                      }
                      disabled={respondingId === o.id || invalid}
                      className={primaryBtnClass}
                    >
                      {respondingId === o.id ? "…" : "Accept"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
