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
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
      {" "}
      {/* Brand panel — stays put while a long form (register) scrolls */}
      <aside className="relative hidden bg-violet-800 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-violet-800/80 to-indigo-700/70" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <span className="text-xl font-semibold tracking-tight">
            Aazath Plaza
          </span>

          <div>
            <h2 className="text-4xl font-semibold leading-tight">
              Host. Celebrate.
              <br />
              Remember.
            </h2>
            <p className="mt-4 max-w-md text-violet-100">
              Weddings, engagements, birthdays and more. Book your event at
              Aazath Plaza in a few minutes.
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
      <main className="flex min-w-0 items-center justify-center bg-card px-4 py-8 sm:px-6 sm:py-12">
        <div
          className={`auth-shine w-full rounded-2xl p-[2px] ${formWidthClass}`}
        >
          <div className="rounded-2xl bg-card p-5 sm:p-8">
            <p className="mb-8 text-lg font-semibold text-violet-700 dark:text-violet-400 lg:hidden">
              Aazath Plaza
            </p>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
