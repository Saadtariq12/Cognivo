import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCandidate,
  deleteCandidate,
  findCandidateByEmail,
} from "../models/candidate.model.js";
import { createInterview, deleteInterview } from "../models/interview.model.js";
import {
  createInvitation,
  deleteInvitation,
} from "../models/interviewInvitations.model.js";
import { sendInvitationEmail } from "../services/emailServices/invitationEmail.service.js";
import { createInvitationToken } from "../services/Invitation/invitationToken.service.js";

// const DEFAULT_INTERVIEW_DURATION_MINUTES = 20;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const getInvitationInput = (body = {}) => {
  const email = normalizeText(body.email).toLowerCase();
  const title = normalizeText(body.title);
  const description = normalizeText(body.description);
  const company_name = normalizeText(body.company_name);
  const requiredSkills = Array.isArray(body.required_skills)
    ? body.required_skills
        .map((skill) => (typeof skill === "string" ? skill.trim() : null))
        .filter(Boolean)
    : null;

  if (
    !email ||
    !emailPattern.test(email) ||
    !title ||
    !company_name ||
    !requiredSkills
  ) {
    return null;
  }

  if (
    email.length > 320 ||
    title.length > 200 ||
    company_name.length > 200
  ) {
    return null;
  }

  return { email, title, company_name, description, requiredSkills };
};

const inviteCandidate = asyncHandler(async (req, res) => {
  const input = getInvitationInput(req.body);
  if (!input) {
    return res.status(400).json({
      success: false,
      message:
        "Valid email, title, description, company name, and required skills are required",
    });
  }

  const recruiterId = req.user.id;
  let candidate;
  let candidateWasCreated = false;
  let interview;
  let invitation;

  try {
    candidate = await findCandidateByEmail(input.email);
    if (!candidate) {
      candidate = await createCandidate(input.email);
      candidateWasCreated = true;
    }

    interview = await createInterview({
      recruiterId,
      title: input.title,
      description: input.description,
      requiredSkills: input.requiredSkills,
    });

    const { rawToken, tokenHash, expiresAt } = createInvitationToken();
    invitation = await createInvitation({
      interviewId: interview.id,
      candidateId: candidate.id,
      recruiterId,
      tokenHash,
      expiresAt,
    });

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    await sendInvitationEmail({
      candidateEmail: candidate.email,
      companyName: input.company_name,
      jobTitle: input.title,
      invitationUrl: `${frontendUrl}/interview/${rawToken}`,
      expiresAt: invitation.expires_at,
    });

    return res.status(201).json({
      success: true,
      message: "Candidate invitation sent successfully",
      data: { expires_at: invitation.expires_at },
    });
  } catch (error) {
    // Keep the database consistent when email delivery fails.
    if (invitation?.id) {
      try {
        await deleteInvitation(invitation.id);
      } catch (cleanupError) {
        console.error("Failed to clean up invitation:", cleanupError.message);
      }
    }
    if (interview?.id) {
      try {
        await deleteInterview(interview.id);
      } catch (cleanupError) {
        console.error("Failed to clean up interview:", cleanupError.message);
      }
    }
    if (candidateWasCreated && candidate?.id) {
      try {
        await deleteCandidate(candidate.id);
      } catch (cleanupError) {
        console.error("Failed to clean up candidate:", cleanupError.message);
      }
    }

    console.error("Failed to create candidate invitation:", error.message);
    return res.status(500).json({
      success: false,
      message: "Candidate invitation could not be sent",
    });
  }
});

export { inviteCandidate };
