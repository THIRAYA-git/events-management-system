import type { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  compact?: boolean;
}

export default function PageHero({
  title,
  subtitle,
  children,
  compact = false,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-700 text-white">
      <div
        className={`mx-auto max-w-6xl px-4 text-center lg:px-6 ${
          compact ? "py-12" : "py-20"
        }`}
      >
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-violet-100">{subtitle}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
