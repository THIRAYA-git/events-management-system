import { useEffect, useLayoutEffect, useState } from "react";

export interface TourStep { target: string; title: string; body: string; }

export function useFirstVisitTour(key: string) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (key && !localStorage.getItem(key)) setOpen(true);
  }, [key]);
  const close = () => {
    if (key) localStorage.setItem(key, "done");
    setOpen(false);
  };
  return { open, close, restart: () => setOpen(true) };
}

const findVisible = (target: string) =>
  Array.from(document.querySelectorAll(`[data-tour="${target}"]`)).find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

export default function GuidedTour({ steps, open, onClose }:
  { steps: TourStep[]; open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<TourStep[]>([]);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // keep only the steps whose target is visible on this screen size
  useEffect(() => {
    if (!open) return;
    const visible = steps.filter((s) => findVisible(s.target));
    if (visible.length === 0) { onClose(); return; }
    setActive(visible);
    setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const step = active[i];
  const last = i === active.length - 1;

  useLayoutEffect(() => {
    if (!open || !step) return;
    const el = findVisible(step.target);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step]);

  if (!open || !step || !rect) return null;
  const below = rect.bottom + 200 < window.innerHeight;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Guided tour">
      <div
        className="absolute rounded-lg ring-2 ring-purple-400 transition-all"
        style={{
          top: rect.top - 6, left: rect.left - 6,
          width: rect.width + 12, height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(0,0,0,.6)",
        }}
      />
      <div
        className="absolute w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-white p-4 shadow-xl dark:bg-slate-800 dark:text-white"
        style={{
          top: below ? rect.bottom + 14 : Math.max(rect.top - 190, 12),
          left: Math.min(Math.max(rect.left, 16), window.innerWidth - 304),
        }}
      >
        <p className="text-xs text-slate-500">Step {i + 1} of {active.length}</p>
        <h3 className="font-semibold">{step.title}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-slate-500 underline">Skip tour</button>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="rounded border px-3 py-1 text-sm">Back</button>
            )}
            <button
              onClick={() => (last ? onClose() : setI(i + 1))}
              className="rounded bg-purple-600 px-3 py-1 text-sm text-white"
            >
              {last ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}