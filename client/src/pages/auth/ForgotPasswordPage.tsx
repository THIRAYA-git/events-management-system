import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from "@/components/auth/authStyles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
    } finally {
      // Always show the same success state regardless of outcome — the
      // backend deliberately returns 200 whether or not the email exists,
      // so the frontend must not distinguish either (avoids leaking which
      // emails are registered).
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset link."
      footer={
        <Link to="/login" className="font-medium text-violet-700 dark:text-violet-400 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {submitted ? (
        <div className="rounded-md border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 text-sm text-violet-900 dark:text-violet-200">
          If that email is registered, a reset link has been sent. Check your inbox (and
          spam folder) for a message from Aazath Plaza.
        </div>
      ) : (
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
          <button type="submit" className={authButtonClass} disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}