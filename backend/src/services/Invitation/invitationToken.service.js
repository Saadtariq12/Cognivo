import { createHash, randomBytes } from "node:crypto";

const DEFAULT_EXPIRATION_HOURS = 48;

const getInvitationExpirationHours = () => {
  const configuredHours = Number(process.env.INVITATION_EXPIRATION_HOURS);
  return Number.isFinite(configuredHours) && configuredHours > 0
    ? configuredHours
    : DEFAULT_EXPIRATION_HOURS;
};

const hashInvitationToken = (rawToken) =>
  createHash("sha256").update(rawToken).digest("hex");

const createInvitationToken = () => {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashInvitationToken(rawToken);
  const expiresAt = new Date(
    Date.now() + getInvitationExpirationHours() * 60 * 60 * 1000,
  );

  return { rawToken, tokenHash, expiresAt };
};

export { createInvitationToken, hashInvitationToken };
