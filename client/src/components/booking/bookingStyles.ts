export const fieldLabelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export const fieldInputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:bg-gray-50";

export const primaryBtnClass =
  "inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryBtnClass =
  "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostBtnClass =
  "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100";

export const errorTextClass = "text-sm text-red-600";

// The shadcn colour tokens in index.css are wrapped in hsl() around oklch
// values, which makes classes like bg-primary resolve to nothing. The
// Calendar relies on those tokens, so they are re-declared here, scoped to
// the calendar wrapper only, so it renders correctly without touching the
// rest of the app.
export const CALENDAR_THEME =
  "[--color-primary:oklch(0.541_0.281_293)] [--color-primary-foreground:oklch(0.985_0_0)] [--color-muted:oklch(0.96_0.005_290)] [--color-muted-foreground:oklch(0.55_0.02_285)] [--color-accent:oklch(0.95_0.03_293)] [--color-accent-foreground:oklch(0.35_0.15_293)] [--color-border:oklch(0.9_0.005_286)] [--color-input:oklch(0.9_0.005_286)] [--color-ring:oklch(0.7_0.15_293)] [--color-foreground:oklch(0.2_0_0)] [--color-background:oklch(1_0_0)]";
