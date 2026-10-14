export const fieldLabelClass = "mb-1.5 block text-sm font-medium text-foreground";

export const fieldInputClass =
"w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:bg-muted";
export const primaryBtnClass =
  "inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryBtnClass =
  "inline-flex items-center justify-center rounded-md border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60";
"inline-flex items-center justify-center rounded-md border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60";
export const ghostBtnClass =
  "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted";

export const errorTextClass = "text-sm text-red-600 dark:text-red-400";

// The shadcn colour tokens in index.css are wrapped in hsl() around oklch
// values, which makes classes like bg-primary resolve to nothing. The
// Calendar relies on those tokens, so they are re-declared here, scoped to
// the calendar wrapper only, so it renders correctly without touching the
// rest of the app.
export const CALENDAR_THEME =
  "[--primary:oklch(0.541_0.281_293)] [--primary-foreground:oklch(0.985_0_0)]";