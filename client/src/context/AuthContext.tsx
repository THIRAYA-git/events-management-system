import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, setAccessToken } from "@/lib/api";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "@/types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  permissions: string[];
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// /auth/login returns { id, name } but /auth/me returns the raw DB row
// { user_id, full_name }. Normalise every path to the AuthUser shape so the
// UI never loses `name` / `id` after a reload or refreshUser().
type RawUser = Partial<AuthUser> & { user_id?: number; full_name?: string };

const normalizeUser = (raw: RawUser): AuthUser => ({
  ...(raw as AuthUser),
  id: raw.id ?? (raw.user_id as number),
  name: raw.name ?? (raw.full_name as string),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, try to silently restore a session via the refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post<{ accessToken: string }>(
          "/auth/refresh"
        );
        setAccessToken(data.accessToken);
        const meRes = await api.get<{ user: RawUser; permissions: string[] }>(
          "/auth/me"
        );
        setUser(normalizeUser(meRes.data.user));
        setPermissions(meRes.data.permissions);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    const nextUser = normalizeUser(data.user);
    setAccessToken(data.accessToken);
    setUser(nextUser);
    setPermissions(data.permissions);
    return nextUser; // lets the login page redirect by role immediately
  };

    const loginWithGoogle = async (credential: string) => {
    const { data } = await api.post<AuthResponse>("/auth/google", { credential });
    const nextUser = normalizeUser(data.user);
    setAccessToken(data.accessToken);
    setUser(nextUser);
    setPermissions(data.permissions);
    return nextUser;
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    const nextUser = normalizeUser(data.user);
    setAccessToken(data.accessToken);
    setUser(nextUser);
    setPermissions(data.permissions);
    return nextUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      setPermissions([]);
    }
  };

  // Re-fetches /auth/me — call after a profile update so the navbar and
  // any other consumer of `user` picks up the change without a full reload.
  const refreshUser = async () => {
    const { data } = await api.get<{ user: RawUser; permissions: string[] }>(
      "/auth/me"
    );
    setUser(normalizeUser(data.user));
    setPermissions(data.permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
