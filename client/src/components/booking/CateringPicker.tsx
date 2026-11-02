import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, Utensils, X } from "lucide-react";
import { primaryBtnClass } from "@/components/booking/bookingStyles";
import type { MenuItem, Restaurant } from "@/types/catering.types";

const lkr = (n: number) => `LKR ${n.toLocaleString()}`;

// The app-wide border colour rule outranks Tailwind utilities, hence the "!".
const CARD = "rounded-xl border border-border! bg-card";

function Photo({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-linear-to-br from-violet-100 to-violet-50 text-violet-300 ${className}`}>
        <Utensils className="h-8 w-8" />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}

interface CateringPickerProps {
  items: MenuItem[];
  restaurants: Restaurant[];
  quantities: Record<number, number>;
  onQuantityChange: (itemId: number, qty: number) => void;
  guestCount?: number;
}

export function CateringPicker({ items: allItems, restaurants, quantities, onQuantityChange, guestCount }: CateringPickerProps) {
  const [restaurant, setRestaurant] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  // Items shown below are only those of the chosen restaurant.
  const items = useMemo(
    () => (restaurant === null ? allItems : allItems.filter((i) => i.restaurant_id === restaurant)),
    [allItems, restaurant]
  );

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    items.forEach((i) => map.set(i.category, [...(map.get(i.category) ?? []), i]));
    return [...map.entries()].map(([name, list]) => ({
      name,
      items: list,
      cover: list.find((i) => i.image_url)?.image_url ?? null,
    }));
  }, [items]);

  const selected = allItems.filter((i) => (quantities[i.item_id] ?? 0) > 0);
  const total = selected.reduce((s, i) => s + Number(i.price) * quantities[i.item_id], 0);
  const selectedIn = (name: string) =>
    items.filter((i) => i.category === name && (quantities[i.item_id] ?? 0) > 0).length;

  const addItem = (item: MenuItem) => {
    const perPerson = /person/i.test(item.unit) && guestCount ? guestCount : 1;
    onQuantityChange(item.item_id, perPerson);
  };

  const restaurantName = restaurants.find((r) => r.restaurant_id === restaurant)?.name;

  // ── Level 1: restaurants ─────────────────────────────────────────────────
  const restaurantCards = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {restaurants.map((r) =>
        r.available_items > 0 ? (
          <button
            key={r.restaurant_id}
            onClick={() => {
              setRestaurant(r.restaurant_id);
              setCategory(null);
            }}
            className={`${CARD} p-4 text-left transition hover:border-violet-400! hover:shadow-md`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15 text-lg font-bold text-violet-700 dark:text-violet-400">
              {r.name.charAt(0).toUpperCase()}
            </div>
            <p className="mt-3 font-semibold text-foreground">{r.name}</p>
            <p className="text-xs font-medium text-green-600 dark:text-green-400">Available for your event</p>
          </button>
        ) : (
          <div
            key={r.restaurant_id}
            aria-disabled="true"
            className="cursor-not-allowed rounded-xl border border-border! bg-muted p-4 opacity-60 grayscale"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
              {r.name.charAt(0).toUpperCase()}
            </div>
            <p className="mt-3 font-semibold text-muted-foreground">{r.name}</p>
            <p className="text-xs font-medium text-muted-foreground">Not available yet</p>
          </div>
        )
      )}
    </div>
  );

  const crumb = (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <button
        onClick={() => {
          setRestaurant(null);
          setCategory(null);
        }}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-violet-700"
      >
        <ChevronLeft className="h-4 w-4" /> Restaurants
      </button>
      {restaurant && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <button
            onClick={() => setCategory(null)}
            className={category ? "text-muted-foreground hover:text-violet-700" : "font-semibold text-foreground"}
          >
            {restaurantName}
          </button>
        </>
      )}
      {category && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="font-semibold text-foreground">{category}</span>
        </>
      )}
    </div>
  );

  // ── Selection summary ────────────────────────────────────────────────────
  const summary = selected.length > 0 && (
    <div className="rounded-xl border border-violet-200! dark:border-violet-500/30! bg-violet-50 dark:bg-violet-500/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
          Your selection · {selected.length} item{selected.length > 1 ? "s" : ""}
        </p>
        <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">{lkr(total)}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {selected.map((i) => (
          <span
            key={i.item_id}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-200! dark:border-violet-500/30! bg-card py-1 pl-3 pr-1.5 text-xs text-foreground"
          >
            {i.item_name} × {quantities[i.item_id]}
            <button
              onClick={() => onQuantityChange(i.item_id, 0)}
              aria-label={`Remove ${i.item_name}`}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-violet-700 dark:text-violet-400">
        Catering is billed and paid separately to the restaurant — not part of your hall payment.
      </p>
    </div>
  );

  // ── Level 2: categories ──────────────────────────────────────────────────
  const categoryGrid = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {categories.map((c) => {
        const count = selectedIn(c.name);
        return (
          <button
            key={c.name}
            onClick={() => setCategory(c.name)}
            className={`${CARD} group overflow-hidden text-left transition hover:border-violet-400! hover:shadow-md`}
          >
            <div className="relative">
              <Photo src={c.cover} alt={c.name} className="h-28 w-full transition group-hover:scale-105" />
              {count > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">
                  {count} selected
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.items.length} item{c.items.length > 1 ? "s" : ""}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );

  // ── Level 3: item cards ──────────────────────────────────────────────────
  const activeItems = categories.find((c) => c.name === category)?.items ?? [];
  const itemGrid = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activeItems.map((item) => {
        const qty = quantities[item.item_id] ?? 0;
        return (
          <div key={item.item_id} className={`${CARD} flex flex-col overflow-hidden shadow-sm`}>
            <div className="relative">
              <Photo src={item.image_url} alt={item.item_name} className="h-36 w-full" />
              {item.is_vegetarian && (
                <span className="absolute left-2 top-2 rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  Veg
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="font-semibold text-foreground">{item.item_name}</p>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              )}
              <p className="mt-2 text-sm font-semibold text-violet-800 dark:text-violet-200">
                {lkr(Number(item.price))} <span className="font-normal text-muted-foreground">{item.unit}</span>
              </p>

              <div className="mt-auto pt-3">
                {qty === 0 ? (
                  <button onClick={() => addItem(item)} className={`${primaryBtnClass} w-full`}>
                    Add
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-violet-300! dark:border-violet-500/30! bg-violet-50 dark:bg-violet-500/10 p-1">
                    <button
                      onClick={() => onQuantityChange(item.item_id, qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded bg-card text-violet-700 dark:text-violet-400 shadow-sm hover:bg-violet-100 dark:hover:bg-violet-500/20"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => onQuantityChange(item.item_id, Math.max(0, Number(e.target.value) || 0))}
                      aria-label={`${item.item_name} quantity`}
                      className="w-full min-w-0 bg-transparent text-center text-sm font-semibold text-violet-900 dark:text-violet-200 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => onQuantityChange(item.item_id, qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded bg-violet-600 text-white hover:bg-violet-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      {restaurant && crumb}
      {!restaurant && (
        <>
          <p className="text-sm text-muted-foreground">Choose a restaurant to order from.</p>
          {restaurantCards}
        </>
      )}
      {restaurant && !category && (
        <>
          <p className="text-sm text-muted-foreground">Pick a category to see the dishes.</p>
          {categoryGrid}
        </>
      )}
      {restaurant && category && itemGrid}
      {summary}
    </div>
  );
}