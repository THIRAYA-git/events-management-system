import { Check } from "lucide-react";

const STEPS = ["Date & time", "Hall", "Details", "Catering", "Review"];

export function WizardSteps({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-center">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-violet-600 text-white"
                    : active
                      ? "border-2 border-violet-600 bg-white text-violet-700"
                      : "border border-gray-300 bg-white text-gray-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  active ? "text-violet-700" : done ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 ${done ? "bg-violet-600" : "bg-gray-200"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
