import { getAccessToken } from "../auth/session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getBackendUrl = () => {
  const configured = import.meta.env.VITE_BACKEND_URL?.trim();
  if (!configured) {
    throw new ApiError("The frontend is missing VITE_BACKEND_URL.", 500);
  }

  return configured.replace(/\/$/, "");
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  bearerToken?: string;
};

type BackendEnvelope = {
  success?: boolean;
  message?: string;
};

const fallbackMessage = (status: number) => {
  if (status === 401) {
    return "Invalid email or password.";
  }
  if (status === 400) {
    return "Please check your details and try again.";
  }
  if (status >= 500) {
    return "Something went wrong. Please try again.";
  }
  return "Unable to complete that request.";
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.bearerToken) {
    headers.set("Authorization", `Bearer ${options.bearerToken}`);
  } else if (options.auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      credentials: "include",
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      "Unable to reach Cognivo. Check your connection and try again.",
      0,
    );
  }

  let payload: BackendEnvelope | null = null;
  try {
    payload = (await response.json()) as BackendEnvelope;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const message =
      typeof payload?.message === "string" && payload.message.trim()
        ? payload.message
        : fallbackMessage(response.status);
    throw new ApiError(message, response.status);
  }

  return payload as T;
};
