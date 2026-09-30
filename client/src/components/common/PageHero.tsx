import type { ReactNode } from "react";
import { useHeroImage } from "@/hooks/useHeroImage";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  compact?: boolean;
  imageUrl?: string | null;
}

export default function PageHero({
  title,
  subtitle,
  children,
  compact = false,
  imageUrl,
}: PageHeroProps) {
  const fetched = useHeroImage();
  const image = imageUrl ?? fetched;

  return (
    <section className="relative isolate overflow-hidden bg-violet-800 text-white">
      {image && (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-900/80 via-violet-800/70 to-indigo-700/60" />

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
