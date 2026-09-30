import type { ReactNode } from "react";

interface StepCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function StepCard({ title, subtitle, children, footer }: StepCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="space-y-6 px-6 py-6">{children}</div>
      {footer && (
        <div className="flex gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  );
}
