import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword } from "@/api/profile.api";
import AvatarUploader from "@/components/common/AvatarUploader";
import PasswordToggle from "@/components/common/PasswordToggle";

export function AccountSettingsPage() {
  const { user, refreshUser, logout } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.profile_image ?? null
  );
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleAvatarUploaded = async (url: string) => {
    setAvatarUrl(url); // show immediately, independent of /auth/me
    await refreshUser();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await updateProfile({ full_name: fullName, phone: phone || null });
      await refreshUser();
      setProfileMessage("Profile updated successfully.");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message ?? "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      // Backend clears the refresh token on password change, so the
      // current session is invalid server-side — log out locally too.
      await logout();
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message ?? "Failed to change password."
      );
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your profile photo, contact details and password.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Profile section */}
        <div className="auth-shine flex rounded-2xl p-[2px]">
          <form
            onSubmit={handleProfileSubmit}
            className="flex flex-1 flex-col rounded-2xl bg-card p-5"
          >
            <h2 className="text-base font-medium text-foreground">Profile</h2>

            <div className="mt-3">
              <AvatarUploader
                currentUrl={avatarUrl}
                name={user?.name}
                onUploaded={handleAvatarUploaded}
              />
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm text-muted-foreground"
                >
                  Full name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm text-muted-foreground"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone ?? ""}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed here.
                </p>
              </div>
            </div>

            {profileError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {profileError}
              </p>
            )}
            {profileMessage && (
              <p className="mt-3 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" /> {profileMessage}
              </p>
            )}

            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Password section */}
        <div className="auth-shine flex rounded-2xl p-[2px]">
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-1 flex-col rounded-2xl bg-card p-5"
          >
            <h2 className="text-base font-medium text-foreground">
              Change Password
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You'll be signed out after changing your password.
            </p>

            {/* Tells the password manager which account this form belongs to */}
            <input
              type="text"
              name="username"
              value={user?.email ?? ""}
              autoComplete="username"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
            />

            <div className="mt-3 space-y-3">
              <div>
                <label
                  htmlFor="current_password"
                  className="block text-sm text-muted-foreground"
                >
                  Current password
                </label>
                <PasswordToggle
                  wrapperClassName="mt-1"
                  id="current_password"
                  name="current_password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm text-muted-foreground"
                >
                  New password
                </label>
                <PasswordToggle
                  wrapperClassName="mt-1"
                  id="new_password"
                  name="new_password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm text-muted-foreground"
                >
                  Confirm new password
                </label>
                <PasswordToggle
                  wrapperClassName="mt-1"
                  id="confirm_password"
                  name="confirm_password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {passwordError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {passwordError}
              </p>
            )}

            <div className="mt-auto pt-4">
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}