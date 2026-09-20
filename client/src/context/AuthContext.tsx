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
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
        const meRes = await api.get<{ user: AuthUser; permissions: string[] }>(
          "/auth/me"
        );
        setUser(meRes.data.user);
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
    setAccessToken(data.accessToken);
    setUser(data.user);
    setPermissions(data.permissions);
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setPermissions(data.permissions);
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
    const { data } = await api.get<{ user: AuthUser; permissions: string[] }>(
      "/auth/me"
    );
    setUser(data.user);
    setPermissions(data.permissions);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        login,
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
