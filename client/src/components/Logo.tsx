import fullLogo from "../assets/aazath-plaza-logo.svg";
import fullLogoLight from "../assets/aazath-plaza-logo-light.svg";
import iconLogo from "../assets/aazath-plaza-icon.svg";

type Props = {
  variant?: "full" | "icon" | "lockup";
  tone?: "dark" | "light" | "auto";
  className?: string;
  iconClassName?: string;
};

const LOCKUP = {
  dark: {
    name: "text-violet-950",
    accent: "text-violet-600",
    tag: "text-gray-500",
  },
  light: {
    name: "text-white",
    accent: "text-amber-200",
    tag: "text-violet-200",
  },
  auto: {
    name: "text-violet-950 dark:text-white",
    accent: "text-violet-600 dark:text-amber-200",
    tag: "text-gray-500 dark:text-violet-200",
  },
};

export default function Logo({
  variant = "full",
  tone = "dark",
  className = "h-9 w-auto",
  iconClassName = "h-9 w-9",
}: Props) {
  if (variant === "icon") {
    return <img src={iconLogo} alt="Aazath Plaza" className={className} />;
  }

  if (variant === "lockup") {
    const c = LOCKUP[tone];
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <img src={iconLogo} alt="" className={`${iconClassName} shrink-0`} />
        <span className="leading-tight">
          <span className={`block text-xl font-bold tracking-tight ${c.name}`}>
            Aazath <span className={c.accent}>Plaza</span>
          </span>
          <span
            className={`block text-[10px] font-medium uppercase tracking-[0.2em] ${c.tag}`}
          >
            Events Management
          </span>
        </span>
      </span>
    );
  }

  if (tone === "auto") {
    return (
      <>
        <img
          src={fullLogo}
          alt="Aazath Plaza"
          className={`${className} dark:hidden`}
        />
        <img
          src={fullLogoLight}
          alt=""
          aria-hidden
          className={`${className} hidden dark:block`}
        />
      </>
    );
  }

  return (
    <img
      src={tone === "light" ? fullLogoLight : fullLogo}
      alt="Aazath Plaza"
      className={className}
    />
  );
}
