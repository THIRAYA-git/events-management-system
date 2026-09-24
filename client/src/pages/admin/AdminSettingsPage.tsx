import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword } from "@/api/profile.api";
import AvatarUploader from "@/components/common/AvatarUploader";

export function AdminSettingsPage() {
  const { user, refreshUser, logout } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.profile_image ?? null);
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
      setProfileError(err?.response?.data?.message ?? "Failed to update profile.");
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
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      // Backend clears the refresh token on password change, so the
      // current session is invalid server-side — log out locally too.
      await logout();
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message ?? "Failed to change password.");
      setPasswordSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your account details and password.</p>

      <div className="mt-6 grid max-w-2xl gap-6">
        {/* Profile section */}
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-lg border border-gray-200 bg-white p-5"
        >
          <h2 className="text-base font-medium text-gray-800">Profile</h2>

          <div className="mt-4">
            <AvatarUploader
              currentUrl={avatarUrl}
              name={user?.name}
              onUploaded={handleAvatarUploaded}
            />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <input
                type="tel"
                value={phone ?? ""}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-400">Email cannot be changed here.</p>
            </div>
          </div>

          {profileError && <p className="mt-3 text-sm text-red-600">{profileError}</p>}
          {profileMessage && (
            <p className="mt-3 flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" /> {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="mt-4 flex items-center gap-2 rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Profile
          </button>
        </form>

        {/* Password section */}
        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-lg border border-gray-200 bg-white p-5"
        >
          <h2 className="text-base font-medium text-gray-800">Change Password</h2>
          <p className="mt-1 text-xs text-gray-400">
            You'll be signed out after changing your password.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {passwordError && <p className="mt-3 text-sm text-red-600">{passwordError}</p>}

          <button
            type="submit"
            disabled={passwordSaving}
            className="mt-4 flex items-center gap-2 rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {passwordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}