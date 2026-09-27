import type { AuthSession, RecruiterUser } from "../types/auth";

const readString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const nameFromMetadata = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const metadata = value as Record<string, unknown>;
  return readString(metadata.full_name) ?? readString(metadata.fullName);
};

const nameFromJwt = (accessToken: string) => {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    return nameFromMetadata(payload.user_metadata) ?? readString(payload.full_name);
  } catch {
    return null;
  }
};

export const getRecruiterDisplayName = (
  user: RecruiterUser | null,
  session: AuthSession | null,
) =>
  nameFromMetadata(session?.user?.user_metadata) ??
  (session?.access_token ? nameFromJwt(session.access_token) : null) ??
  (user ? nameFromMetadata(user) : null);
