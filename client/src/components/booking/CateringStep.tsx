import { useEffect, useState } from "react";
import { StepCard } from "@/components/booking/StepCard";
import { CateringPicker } from "@/components/booking/CateringPicker";
import {
  primaryBtnClass,
  secondaryBtnClass,
  ghostBtnClass,
  errorTextClass,
} from "@/components/booking/bookingStyles";
import { listMenuItems } from "@/lib/catering.api";
import type { MenuItem, CateringSelectionItem } from "@/types/catering.types";

interface CateringStepProps {
  onSubmit: (selection: CateringSelectionItem[]) => void;
  onBack: () => void;
  guestCount?: number;
}

export function CateringStep({ onSubmit, onBack, guestCount }: CateringStepProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const menuItems = await listMenuItems();
        setItems(menuItems.filter((i) => i.is_available));
      } catch {
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setQty = (itemId: number, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = qty;
      }
      return next;
    });
  };

  const selection: CateringSelectionItem[] = Object.entries(quantities).map(
    ([itemId, quantity]) => ({ item_id: Number(itemId), quantity })
  );

  return (
    <StepCard
      title="Add catering (optional)"
      subtitle="Choose a restaurant, then browse its menu by category."
      footer={
        <>
          <button onClick={onBack} className={secondaryBtnClass}>
            Back
          </button>
          <button onClick={() => onSubmit([])} className={`${ghostBtnClass} flex-1`}>
            Skip catering
          </button>
          <button
            onClick={() => onSubmit(selection)}
            className={`${primaryBtnClass} flex-1`}
          >
            Continue
          </button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-gray-500">Loading menu…</p>
      ) : error ? (
        <p className={errorTextClass}>{error}</p>
      ) : (
        <CateringPicker
          items={items}
          quantities={quantities}
          onQuantityChange={setQty}
          guestCount={guestCount}
        />
      )}
    </StepCard>
  );
}