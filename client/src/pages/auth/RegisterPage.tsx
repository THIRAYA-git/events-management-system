import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/auth.types";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authInputClass,
  authLabelClass,
  authButtonClass,
} from "@/components/auth/authStyles";

// Matches PUBLIC_ROLES in auth.controller.js — the only roles a person can
// self-assign at signup. Staff roles (admin/manager/front_desk) are
// deliberately excluded and can only be granted by an existing admin.
const PUBLIC_ROLES: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "organizer", label: "Event Organizer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "restaurant", label: "Restaurant Partner" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // register() logs the user in immediately (the backend issues
      // tokens on successful registration), so go straight to the app.
      await register({
        full_name: fullName,
        email,
        password,
        phone,
        role,
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Aazath Plaza to get started."
      formWidthClass="max-w-lg"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-violet-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="full-name" className={authLabelClass}>
              Full name
            </label>
            <input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your full name"
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className={authLabelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              placeholder="Phone number"
              className={authInputClass}
            />
          </div>
        </div>

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
          <label htmlFor="role" className={authLabelClass}>
            I am a
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={authInputClass}
          >
            {PUBLIC_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={authLabelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className={authLabelClass}>
              Confirm password
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
        </div>

        <button type="submit" className={authButtonClass} disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}