// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);
// const resendFromEmail =
//   process.env.RESEND_FROM_EMAIL || "Cognivo <onboarding@resend.dev>";
// const escapeHtml = (value) =>
//   value.replace(
//     /[&<>'"]/g,
//     (character) =>
//       ({
//         "&": "&amp;",
//         "<": "&lt;",
//         ">": "&gt;",
//         "'": "&#39;",
//         '"': "&quot;",
//       })[character],
//   );

// const sendInvitationEmail = async ({
//   candidateEmail,
//   companyName,
//   jobTitle,
//   invitationUrl,
//   expiresAt,
// }) => {
//   const expiryText = new Date(expiresAt).toLocaleString();
//   const safeCompanyName = escapeHtml(companyName);
//   const safeJobTitle = escapeHtml(jobTitle);
//   const safeInvitationUrl = escapeHtml(invitationUrl);
//   const { data, error } = await resend.emails.send({
//     from: resendFromEmail,
//     to: candidateEmail,
//     subject: `${companyName} invited you to an interview`,
//     text: [
//       `You have been invited to interview for ${jobTitle} at ${companyName}.`,
//       `Start your interview: ${invitationUrl}`,
//       `This link expires on ${expiryText}.`,
//     ].join("\n\n"),
//     html: `
//       <h2>Interview invitation</h2>
//       <p>${safeCompanyName} has invited you to interview for <strong>${safeJobTitle}</strong>.</p>
//       <p><a href="${safeInvitationUrl}">Start Interview</a></p>
//       <p>This link expires on ${expiryText}.</p>
//     `,
//   });

//   if (error || !data?.id) {
//     throw new Error("Invitation email could not be sent");
//   }

//   return data;
// };

// export { sendInvitationEmail };

import { BrevoClient } from "@getbrevo/brevo";

// Initialize the unified Brevo client directly with your API key
const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const escapeHtml = (value) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );

const sendInvitationEmail = async ({
  candidateEmail,
  companyName,
  jobTitle,
  invitationUrl,
  expiresAt,
}) => {
  const expiryText = new Date(expiresAt).toLocaleString();
  const safeCompanyName = escapeHtml(companyName);
  const safeJobTitle = escapeHtml(jobTitle);
  const safeInvitationUrl = escapeHtml(invitationUrl);

  try {
    // Send transactional email using the modern SDK method
    const data = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: companyName,
        email: process.env.BREVO_SENDER_EMAIL || "no-reply@brevo.com",
      },
      to: [{ email: candidateEmail }],
      subject: `${companyName} invited you to an interview`,
      textContent: [
        `You have been invited to an AI interview for ${jobTitle} at ${companyName}.`,
        `Start your interview: ${invitationUrl}`,
        `This link expires on ${expiryText}.`,
      ].join("\n\n"),
      htmlContent: `
        <h2>Interview invitation</h2>
        <p>${safeCompanyName} has invited you to interview for <strong>${safeJobTitle}</strong>.</p>
        <p><a href="${safeInvitationUrl}">Start Interview</a></p>
        <p>This link expires on ${expiryText}.</p>
      `,
    });

    if (!data) {
      throw new Error("Invitation email could not be sent");
    }

    return data;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw new Error("Invitation email could not be sent");
  }
};

export { sendInvitationEmail };