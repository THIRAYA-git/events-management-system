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
                      ? "border-2 border-violet-600 bg-card text-violet-700 dark:text-violet-400"
                      : "border border-input bg-card text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  active ? "text-violet-700 dark:text-violet-400" : done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 ${done ? "bg-violet-600" : "bg-muted"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
