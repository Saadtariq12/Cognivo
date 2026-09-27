import { apiRequest } from "./client";
import type { ApiSuccess } from "../types/auth";
import type { CandidateInterviewAccess } from "../auth/candidateInterview";

export const verifyCandidateInvitation = (input: { email: string; token: string }) =>
  apiRequest<ApiSuccess<CandidateInterviewAccess>>("/api/candidate/verify-invitation", {
    method: "POST",
    body: input,
  });
