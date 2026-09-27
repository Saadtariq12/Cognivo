import { createContext } from "react";
import type { StoredAuth } from "./session";

export type AuthContextValue = {
  user: StoredAuth["user"] | null;
  displayName: string | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<"authenticated" | "needs_sign_in">;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
