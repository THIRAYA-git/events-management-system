import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your account email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If that email is registered, a reset link has been sent. Check your inbox
              (and spam folder) for a message from Aazath Plaza.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="justify-center pt-0">
          <Link to="/login" className="text-sm underline text-muted-foreground">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}