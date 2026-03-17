import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, User, setTokens, clearTokens, getStoredTokens } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("nebko_user");
    const tokens = getStoredTokens();
    if (stored && tokens) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Demo bypass
    if (email === "test@test.de") {
      const demoUser: User = { id: "demo-001", name: "Test Benutzer", email: "test@test.de" };
      setTokens({ accessToken: "demo-token", refreshToken: "demo-refresh" });
      localStorage.setItem("nebko_user", JSON.stringify(demoUser));
      setUser(demoUser);
      return;
    }
    const res = await authApi.login(email, password);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    localStorage.setItem("nebko_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    localStorage.setItem("nebko_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
