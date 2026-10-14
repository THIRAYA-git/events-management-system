import type { ReactNode } from "react";

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function StepCard({ title, subtitle, children, footer }: StepCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-6 px-6 py-6">{children}</div>
      {footer && (
        <div className="flex gap-3 border-t border-border bg-muted px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  );
}
