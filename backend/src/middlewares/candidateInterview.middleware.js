import { getBearerToken } from "./auth.middleware.js";
import { verifyCandidateAccessToken } from "../services/Invitation/candidateAccessToken.service.js";

const requireCandidateInterviewAccess = (req, res, next) => {
  const accessToken = getBearerToken(req.get("authorization"));

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required",
    });
  }

  const payload = verifyCandidateAccessToken(accessToken);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }

  req.candidate = {
    id: payload.candidate_id,
    interview_id: payload.interview_id,
    session_id: payload.session_id || null,
  };

  if (!req.candidate.id || !req.candidate.interview_id || !req.candidate.session_id) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }

  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }

  const { candidate_id, interview_id, session_id } = req.body;
  if (
    (candidate_id && candidate_id !== req.candidate.id) ||
    (interview_id && interview_id !== req.candidate.interview_id) ||
    (session_id && session_id !== req.candidate.session_id)
  ) {
    return res.status(403).json({
      success: false,
      message: "The requested interview access is not valid",
    });
  }

  if (!candidate_id) {
    req.body.candidate_id = req.candidate.id;
  }
  if (!interview_id) {
    req.body.interview_id = req.candidate.interview_id;
  }
  if (!session_id) {
    req.body.session_id = req.candidate.session_id;
  }

  return next();
};

export { requireCandidateInterviewAccess };
