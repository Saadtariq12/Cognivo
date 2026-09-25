import { createHmac, timingSafeEqual } from "node:crypto";

const CANDIDATE_ACCESS_PURPOSE = "candidate_interview_access";
const DEFAULT_ACCESS_TOKEN_EXPIRATION_MINUTES = 120;

const getAccessTokenExpirationMinutes = () => {
  const configuredMinutes = Number(
    process.env.CANDIDATE_ACCESS_TOKEN_EXPIRATION_MINUTES,
  );
  return Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_ACCESS_TOKEN_EXPIRATION_MINUTES;
};

const getCandidateAccessTokenSecret = () => {
  const secret = process.env.CANDIDATE_INTERVIEW_TOKEN_SECRET;
  if (!secret) {
    throw new Error("CANDIDATE_INTERVIEW_TOKEN_SECRET is not configured");
  }
  return secret;
};

const signEncodedPayload = (encodedPayload) =>
  createHmac("sha256", getCandidateAccessTokenSecret())
    .update(encodedPayload)
    .digest("base64url");

const signaturesMatch = (providedSignature, expectedSignature) => {
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
};

const createCandidateAccessToken = ({
  candidateId,
  interviewId,
  sessionId,
}) => {
  const expiresInMinutes = getAccessTokenExpirationMinutes();
  const expiresAtSeconds =
    Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const payload = {
    candidate_id: candidateId,
    interview_id: interviewId,
    session_id: sessionId || null,
    purpose: CANDIDATE_ACCESS_PURPOSE,
    exp: expiresAtSeconds,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const token = `${encodedPayload}.${signEncodedPayload(encodedPayload)}`;

  return {
    token,
    expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
    expiresInSeconds: expiresInMinutes * 60,
  };
};

const verifyCandidateAccessToken = (token) => {
  if (typeof token !== "string" || !token) {
    return null;
  }

  const [encodedPayload, signature, ...extraParts] = token.split(".");
  if (!encodedPayload || !signature || extraParts.length > 0) {
    return null;
  }

  let expectedSignature;
  try {
    expectedSignature = signEncodedPayload(encodedPayload);
  } catch {
    return null;
  }

  if (!signaturesMatch(signature, expectedSignature)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  if (
    !payload ||
    payload.purpose !== CANDIDATE_ACCESS_PURPOSE ||
    typeof payload.exp !== "number" ||
    payload.exp * 1000 <= Date.now() ||
    !payload.candidate_id ||
    !payload.interview_id
  ) {
    return null;
  }

  return payload;
};

export {
  CANDIDATE_ACCESS_PURPOSE,
  createCandidateAccessToken,
  verifyCandidateAccessToken,
};
