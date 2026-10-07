import { primaryBtnClass, secondaryBtnClass } from "@/components/booking/bookingStyles";
import type { SponsorOffer } from "@/types/sponsorOffer.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-500",
};

interface Props {
  offers: SponsorOffer[];
  respondingId: number | null;
  onRespond: (offerId: number, action: "accepted" | "rejected") => void;
}

function SponsorLogo({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-lg font-semibold text-gray-500">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function BookingSponsorOffers({ offers, respondingId, onRespond }: Props) {
  if (offers.length === 0) return null;

  return (
    <div className="mt-2 rounded-2xl border border-gray-200! bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Sponsor offers ({offers.length})
      </h3>
      <div className="space-y-3">
        {offers.map((o) => (
          <div key={o.id} className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <SponsorLogo url={o.logo_url} name={o.company_name} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-gray-900">{o.company_name}</span>
                    {o.industry && (
                      <span className="ml-2 text-xs text-gray-400">{o.industry}</span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[o.status] ?? ""}`}
                  >
                    {o.status}
                  </span>
                </div>

                {o.proposed_amount != null && (
                  <p className="mt-1 text-sm text-gray-700">
                    Offered amount:{" "}
                    <span className="font-semibold">
                      LKR {Number(o.proposed_amount).toLocaleString()}
                    </span>
                  </p>
                )}
                {o.message && (
                  <p className="mt-1 text-xs italic text-gray-500">"{o.message}"</p>
                )}
              </div>
            </div>

            {o.status === "pending" && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => onRespond(o.id, "rejected")}
                  disabled={respondingId === o.id}
                  className={`${secondaryBtnClass} text-red-600`}
                >
                  {respondingId === o.id ? "…" : "Reject"}
                </button>
                <button
                  onClick={() => onRespond(o.id, "accepted")}
                  disabled={respondingId === o.id}
                  className={primaryBtnClass}
                >
                  {respondingId === o.id ? "…" : "Accept"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}