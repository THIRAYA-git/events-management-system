import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { getHomePath } from "@/utils/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from "@/components/auth/authStyles";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath = (location.state as { from?: { pathname: string } })?.from
    ?.pathname;

  // Only honour the old destination if it belongs to the role that just logged in
  const resolveRedirect = (role: string) => {
    const home = getHomePath(role); // "/admin", "/restaurant", "/"
    if (
      fromPath &&
      (role === "customer"
        ? !/^\/(admin|organizer|sponsor|restaurant)/.test(fromPath)
        : fromPath.startsWith(home))
    ) {
      return fromPath;
    }
    return home;
  };

const handleSubmit = async (e: SyntheticEvent) => {
      e.preventDefault();
    setIsSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      navigate(resolveRedirect(loggedInUser.role), { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const loggedInUser = await loginWithGoogle(cred.credential);
      navigate(resolveRedirect(loggedInUser.role), { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleWrapRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(320);

  useEffect(() => {
    const el = googleWrapRef.current;
    if (!el) return;
    const update = () =>
      setGoogleWidth(Math.max(200, Math.min(400, Math.floor(el.clientWidth))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <AuthLayout
      title="Sign in to Aazath Plaza"
      subtitle="Enter your email and password to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-violet-700 dark:text-violet-400 hover:underline"
          >
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={authInputClass}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-violet-700 dark:text-violet-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={authInputClass}
          />
        </div>

        <button
          type="submit"
          className={authButtonClass}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-muted" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-muted" />
      </div>

      <div className="flex justify-center">
        <div
          ref={googleWrapRef}
          className="w-full max-w-[320px] min-w-0 overflow-hidden"
        >
          <GoogleLogin
            key={googleWidth}
            onSuccess={handleGoogleSuccess}
            onError={() =>
              toast.error("Google sign-in failed. Please try again.")
            }
            text="signin_with"
            shape="rectangular"
            width={String(googleWidth)}
          />
        </div>
      </div>
    </AuthLayout>
  );
}
