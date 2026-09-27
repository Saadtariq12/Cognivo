import { apiRequest } from "./client";
import type { ApiSuccess } from "../types/auth";

export type InvitationInput = {
  email: string;
  title: string;
  description: string;
  company_name: string;
  required_skills: string[];
};

export const createCandidateInvitation = (input: InvitationInput) =>
  apiRequest<ApiSuccess<{ expires_at?: string }>>("/api/recruiter/invitations", {
    method: "POST",
    auth: true,
    body: input,
  });
