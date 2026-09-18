import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listMenuItems } from "@/lib/catering.api";
import type { MenuItem, CateringSelectionItem } from "@/types/catering.types";

interface CateringStepProps {
  onSubmit: (selection: CateringSelectionItem[]) => void;
  onBack: () => void;
}

export function CateringStep({ onSubmit, onBack }: CateringStepProps) {
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

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const selection: CateringSelectionItem[] = Object.entries(quantities).map(
    ([itemId, quantity]) => ({ item_id: Number(itemId), quantity })
  );

  const estimatedTotal = selection.reduce((sum, sel) => {
    const item = items.find((i) => i.item_id === sel.item_id);
    return sum + (item ? Number(item.price) * sel.quantity : 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add catering (optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Menu provided by{" "}
          <span className="font-medium">Althaf Restaurant</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading menu…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          categories.map((category) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium">{category}</h4>
              {items
                .filter((i) => i.category === category)
                .map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.item_name}</p>
                        {item.is_vegetarian && (
                          <Badge variant="secondary">Veg</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        LKR {Number(item.price).toLocaleString()} {item.unit}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      value={quantities[item.item_id] ?? 0}
                      onChange={(e) =>
                        setQty(item.item_id, Number(e.target.value))
                      }
                      className="w-20"
                    />
                  </div>
                ))}
            </div>
          ))
        )}

        {selection.length > 0 && (
          <p className="text-right text-base font-semibold">
            Estimated catering total: LKR {estimatedTotal.toLocaleString()}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="ghost" onClick={() => onSubmit([])} className="flex-1">
          Skip catering
        </Button>
        <Button onClick={() => onSubmit(selection)} className="flex-1">
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
