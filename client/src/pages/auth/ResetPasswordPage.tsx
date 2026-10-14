import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from "@/components/auth/authStyles";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password: newPassword });
      toast.success("Password reset successfully. Please sign in.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to reset password. The link may have expired — request a new one.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToSignIn = (
    <Link to="/login" className="font-medium text-violet-700 dark:text-violet-400 hover:underline">
      Back to sign in
    </Link>
  );

  if (!token) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This reset link is missing its token. Request a new one below."
        footer={backToSignIn}
      >
        <Link to="/forgot-password" className={`${authButtonClass} block text-center`}>
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={backToSignIn}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="new-password" className={authLabelClass}>
            New password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className={authLabelClass}>
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </div>
        <button type="submit" className={authButtonClass} disabled={isSubmitting}>
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}