import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const resendFromEmail =
  process.env.RESEND_FROM_EMAIL || "Cognivo <onboarding@resend.dev>";

export { resend, resendFromEmail };
