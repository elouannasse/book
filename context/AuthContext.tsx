"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type StoredUser = User & {
  password?: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, firstName: string, email: string, password: string) => Promise<User>;
};

const AUTH_STORAGE_KEY = "booksfinder_user";
const AUTH_COOKIE_KEY = "booksfinder_user";
const API_BASE = process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
}

function setAuthCookie() {
  document.cookie = `${AUTH_COOKIE_KEY}=1; path=/; samesite=lax`;
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as User);
        setAuthCookie();
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      clearAuthCookie();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        setIsLoading(true);

        try {
          const response = await fetch(
            `${API_BASE}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
            { cache: "no-store" }
          );

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }

          const users = (await response.json()) as StoredUser[];
          const authenticatedUser = users[0];

          if (!authenticatedUser) {
            return null;
          }

          const nextUser = toPublicUser(authenticatedUser);
          setUser(nextUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
          setAuthCookie();
          return nextUser;
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        clearAuthCookie();
      },
      register: async (name, firstName, email, password) => {
        setIsLoading(true);

        try {
          const response = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName: name, email, password })
          });

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }

          const createdUser = (await response.json()) as StoredUser;
          return toPublicUser(createdUser);
        } finally {
          setIsLoading(false);
        }
      }
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
