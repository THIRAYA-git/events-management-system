import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getHomePath } from "@/utils/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from "@/components/auth/authStyles";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where ProtectedRoute sent the user from, if anywhere
  const from = (location.state as { from?: string })?.from;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      // Honour a deep link the user was redirected from; otherwise go to the role's home
      navigate(from || getHomePath(loggedInUser.role), { replace: true });
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

  return (
    <AuthLayout
      title="Sign in to Aazath Plaza"
      subtitle="Enter your email and password to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-violet-700 hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-violet-700 hover:underline"
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

        <button type="submit" className={authButtonClass} disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}