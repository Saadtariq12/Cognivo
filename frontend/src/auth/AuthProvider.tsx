import { useCallback, useMemo, useState, type ReactNode } from "react";
import { loginRecruiter, logoutRecruiter, registerRecruiter } from "../api/auth";
import { ApiError } from "../api/client";
import { AuthContext } from "./context";
import { getRecruiterDisplayName } from "../lib/displayName";
import {
  clearStoredAuth,
  persistAuth,
  readStoredAuth,
  type StoredAuth,
} from "./session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());

  const login = useCallback(async (input: { email: string; password: string }) => {
    const response = await loginRecruiter(input);
    if (!response.data.user || !response.data.session?.access_token) {
      throw new ApiError("Sign in succeeded, but no session was returned.");
    }

    const nextAuth = {
      user: response.data.user,
      session: response.data.session,
    };
    persistAuth(nextAuth);
    setAuth(nextAuth);
  }, []);

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string }) => {
      const response = await registerRecruiter(input);

      if (response.data.user && response.data.session?.access_token) {
        const nextAuth = {
          user: response.data.user,
          session: response.data.session,
        };
        persistAuth(nextAuth);
        setAuth(nextAuth);
        return "authenticated" as const;
      }

      return "needs_sign_in" as const;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRecruiter();
    } catch {
      // Always clear local session even if the logout request fails.
    } finally {
      clearStoredAuth();
      setAuth(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      displayName: getRecruiterDisplayName(auth?.user ?? null, auth?.session ?? null),
      isAuthenticated: Boolean(auth?.session.access_token),
      login,
      register,
      logout,
    }),
    [auth, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
