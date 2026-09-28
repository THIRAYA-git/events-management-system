import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { AUTH_HERO_IMAGE } from "./authStyles";

const HIGHLIGHTS = [
  "Real-time hall availability",
  "Transparent pricing by event type",
  "Catering, rooms and organisers in one place",
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  formWidthClass?: string;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  formWidthClass = "max-w-md",
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — stays put while a long form (register) scrolls */}
      <aside className="relative hidden bg-violet-800 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-violet-800/80 to-indigo-700/70" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <span className="text-xl font-semibold tracking-tight">Aazath Plaza</span>

          <div>
            <h2 className="text-4xl font-semibold leading-tight">
              Host. Celebrate.
              <br />
              Remember.
            </h2>
            <p className="mt-4 max-w-md text-violet-100">
              Weddings, engagements, birthdays and more. Book your event at Aazath Plaza in
              a few minutes.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-violet-50">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-violet-200" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-violet-200">
            © {new Date().getFullYear()} Aazath Plaza Reception Hall
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-white px-6 py-12">
        <div className={`w-full ${formWidthClass}`}>
          <p className="mb-8 text-lg font-semibold text-violet-700 lg:hidden">Aazath Plaza</p>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        </div>
      </main>
    </div>
  );
}