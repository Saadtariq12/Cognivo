import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyCandidateInvitation } from "../api/candidate";
import { ApiError } from "../api/client";
import { persistCandidateInterviewAccess } from "../auth/candidateInterview";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { CandidateLayout } from "../layouts/CandidateLayout";
import { normalizeEmail, validateEmail } from "../lib/validation";

const GENERIC_VERIFY_ERROR =
  "We couldn't verify this invitation. Make sure you're using the email address that received the invitation.";

export const CandidatePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    setFormError("");

    if (nextEmailError) {
      return;
    }

    const invitationToken = typeof token === "string" ? token.trim() : "";
    if (!invitationToken) {
      setFormError(GENERIC_VERIFY_ERROR);
      return;
    }

    setSubmitting(true);
    try {
      const response = await verifyCandidateInvitation({
        email: normalizeEmail(email),
        token: invitationToken,
      });

      persistCandidateInterviewAccess(response.data);
      navigate(`/interview/${invitationToken}/welcome`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
        setFormError(GENERIC_VERIFY_ERROR);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError(GENERIC_VERIFY_ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CandidateLayout>
      <div className="rounded-2xl border border-line bg-white/90 p-5 shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:p-8">
        <h1 className="text-[1.55rem] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[1.75rem]">
          Your interview is ready
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft sm:text-[15px] sm:leading-7">
          Your interview will take approximately 20–30 minutes and will include
          questions designed to assess your skills and understanding relevant to
          the role.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
          <p className="rounded-[10px] border border-sky/250 bg-sky-soft px-3.5 py-3 text-[13px] leading-6 text-ink sm:text-sm">
            Enter the same email address where you received this interview
            invitation. We use it to verify your invitation before you can
            continue.
          </p>
          <Field
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="candidate@example.com"
            value={email}
            onValueChange={setEmail}
            error={emailError}
            disabled={submitting}
          />
          {formError ? (
            <p className="rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-[13px] text-magenta">
              {formError}
            </p>
          ) : null}
          <Button type="submit" loading={submitting} className="mt-1">
            {submitting ? "Verifying invitation..." : "Start interview"}
          </Button>
        </form>
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white/75 px-5 py-5 sm:px-6 sm:py-6">
        <h2 className="text-sm font-semibold tracking-wide text-royal uppercase">
          Before you begin
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-6 text-ink-soft sm:text-sm">
          <li>Make sure you have a stable internet connection.</li>
          <li>Find a quiet environment where you can focus.</li>
          <li>You may be asked to share your entire screen during the interview.</li>
          <li>
            If screen recording is enabled for the interview, the recording may
            be made available to the recruiter for review.
          </li>
        </ul>
      </section>
    </CandidateLayout>
  );
};
