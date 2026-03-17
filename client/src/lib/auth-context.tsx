import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type UserRole, type User } from "./types";

interface AuthContextType {
  role: UserRole;
  user: User | null;
  setRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isHydrated: boolean;
  showProfileSetup: boolean;
  setShowProfileSetup: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // On app load, synchronously read the token and validate it with the server.
  // isHydrated stays false until this completes, preventing premature redirects.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      setIsHydrated(true);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          clearToken();
          setUser(null);
        }
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
        setIsHydrated(true);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Logout endpoint is best-effort
    }
    clearToken();
    setUser(null);
  }, []);

  // setRole is kept for backward compatibility with the top-bar role switcher,
  // but now it is a no-op because the role comes from the real logged-in user.
  const setRole = useCallback((_role: UserRole) => {
    // No-op: role is determined by the logged-in user
  }, []);

  const role: UserRole = (user?.role as UserRole) || "student";

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setRole,
        login,
        logout,
        isLoading,
        isHydrated,
        showProfileSetup,
        setShowProfileSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
