import { apiRequest } from "./client";
import type { ApiSuccess, AuthPayload } from "../types/auth";

export const registerRecruiter = (input: {
  fullName: string;
  email: string;
  password: string;
}) =>
  apiRequest<ApiSuccess<AuthPayload>>("/api/auth/register", {
    method: "POST",
    body: input,
  });

export const loginRecruiter = (input: { email: string; password: string }) =>
  apiRequest<ApiSuccess<AuthPayload>>("/api/auth/login", {
    method: "POST",
    body: input,
  });

export const logoutRecruiter = () =>
  apiRequest<ApiSuccess<undefined>>("/api/auth/logout", {
    method: "POST",
    auth: true,
  });
