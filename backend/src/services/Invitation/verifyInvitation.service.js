import { findCandidateById } from "../../models/candidate.model.js";
import {
  createInterviewSession,
  findInterviewById,
  findLatestInterviewSession,
} from "../../models/interview.model.js";
import { findInvitationByTokenHash } from "../../models/interviewInvitations.model.js";
import { hashInvitationToken } from "./invitationToken.service.js";
import { createCandidateAccessToken } from "./candidateAccessToken.service.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_INVITATION_ERROR = "Invalid or expired invitation";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeToken = (value) =>
  typeof value === "string" ? value.trim() : "";

const isInvitationUnusable = (invitation) => {
  if (!invitation?.expires_at || new Date(invitation.expires_at) <= new Date()) {
    return true;
  }

  if (invitation.status && invitation.status !== "pending") {
    return true;
  }

  if (invitation.used_at) {
    return true;
  }

  return false;
};

const findOrCreateActiveSession = async (interviewId, candidateId) => {
  const latestSession = await findLatestInterviewSession(
    interviewId,
    candidateId,
  );

  if (!latestSession) {
    return createInterviewSession({ interviewId, candidateId });
  }

  if (latestSession.status === "completed") {
    return null;
  }

  return latestSession;
};

const verifyCandidateInvitation = async ({ email, token } = {}) => {
  const normalizedEmail = normalizeEmail(email);
  const rawToken = normalizeToken(token);

  if (
    !normalizedEmail ||
    !emailPattern.test(normalizedEmail) ||
    normalizedEmail.length > 320 ||
    !rawToken ||
    rawToken.length > 512
  ) {
    throw createHttpError(
      400,
      "Valid email and invitation token are required",
    );
  }

  const invitation = await findInvitationByTokenHash(
    hashInvitationToken(rawToken),
  );

  if (!invitation || isInvitationUnusable(invitation)) {
    throw createHttpError(401, GENERIC_INVITATION_ERROR);
  }

  const candidate = await findCandidateById(invitation.candidate_id);
  const interview = await findInterviewById(invitation.interview_id);
  const invitationEmail = normalizeEmail(candidate?.email);

  if (
    !candidate ||
    !interview ||
    !invitationEmail ||
    invitationEmail !== normalizedEmail
  ) {
    throw createHttpError(401, GENERIC_INVITATION_ERROR);
  }

  const session = await findOrCreateActiveSession(
    invitation.interview_id,
    candidate.id,
  );

  if (!session) {
    throw createHttpError(401, GENERIC_INVITATION_ERROR);
  }

  const access = createCandidateAccessToken({
    candidateId: candidate.id,
    interviewId: invitation.interview_id,
    sessionId: session.id,
  });

  return {
    access_token: access.token,
    token_type: "Bearer",
    expires_at: access.expiresAt,
    candidate_id: candidate.id,
    interview_id: invitation.interview_id,
    session_id: session.id,
  };
};

export { verifyCandidateInvitation };
