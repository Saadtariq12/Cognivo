import type { AuthPayload, AuthSession, RecruiterUser } from "../types/auth";

const AUTH_STORAGE_KEY = "cognivo.auth";

export type StoredAuth = {
  user: RecruiterUser;
  session: AuthSession;
};

const isSession = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as AuthSession;
  return typeof session.access_token === "string" && session.access_token.length > 0;
};

const isUser = (value: unknown): value is RecruiterUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as RecruiterUser;
  return typeof user.id === "string" && typeof user.email === "string";
};

export const readStoredAuth = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (!isUser(parsed.user) || !isSession(parsed.session)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return { user: parsed.user, session: parsed.session };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const persistAuth = (payload: AuthPayload) => {
  if (!payload.user || !payload.session?.access_token) {
    clearStoredAuth();
    return;
  }

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: payload.user,
      session: payload.session,
    } satisfies StoredAuth),
  );
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = () => readStoredAuth()?.session.access_token ?? null;
