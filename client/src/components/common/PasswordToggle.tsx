import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  wrapperClassName?: string;
}

const defaultInputClass =
  "w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50";

const PasswordToggle = forwardRef<HTMLInputElement, PasswordToggleProps>(
  ({ className = defaultInputClass, wrapperClassName = "", disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={`relative ${wrapperClassName}`}>
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          disabled={disabled}
          className={`${className} pr-10`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);

PasswordToggle.displayName = "PasswordToggle";
export default PasswordToggle;