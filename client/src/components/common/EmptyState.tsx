import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { primaryBtnClass } from "@/components/booking/bookingStyles";

interface Props {
  icon: LucideIcon;
  title: string;
  hint: string;
  steps?: string[];
  action?: { label: string; to: string };
}

export default function EmptyState({
  icon: Icon,
  title,
  hint,
  steps,
  action,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-input! bg-card px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {hint}
      </p>
      {steps && (
        <ol className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-sm text-muted-foreground">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      )}
      {action && (
        <Link to={action.to} className={`${primaryBtnClass} mt-5`}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
