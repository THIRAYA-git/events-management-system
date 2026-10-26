import type { ReactNode } from "react";

interface Props {
  text: string;
  children: ReactNode;
  align?: "center" | "right";
}

/** Hover/focus tooltip. Use align="right" for buttons at a container's right edge. */
export default function Hint({ text, children, align = "center" }: Props) {
  const pos = align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full ${pos} z-50 mb-2 w-max max-w-[14rem] rounded-md bg-slate-900 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-slate-700`}
      >
        {text}
      </span>
    </span>
  );
}
