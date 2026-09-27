import { useState, type FormEvent } from "react";
import { createCandidateInvitation } from "../../api/recruiter";
import { ApiError } from "../../api/client";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { TextArea } from "../ui/TextArea";
import { SkillTagsInput } from "./SkillTagsInput";
import {
  mergeSkills,
  normalizeEmail,
  splitSkillTokens,
  validateEmail,
  validateRequiredText,
} from "../../lib/validation";

type InviteCandidateModalProps = {
  open: boolean;
  onClose: () => void;
  onUnauthorized: () => void;
};

const emptyForm = {
  email: "",
  title: "",
  companyName: "",
  description: "",
  skills: [] as string[],
  skillDraft: "",
};

export const InviteCandidateModal = ({
  open,
  onClose,
  onUnauthorized,
}: InviteCandidateModalProps) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<{
    email?: string;
    title?: string;
    companyName?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetAndClose = () => {
    setForm(emptyForm);
    setErrors({});
    setFormError("");
    setSubmitting(false);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const nextErrors = {
      email: validateEmail(form.email),
      title: validateRequiredText(form.title, "Job title", 200),
      companyName: validateRequiredText(form.companyName, "Company name", 200),
    };
    setErrors(nextErrors);
    setFormError("");

    if (nextErrors.email || nextErrors.title || nextErrors.companyName) {
      return;
    }

    const required_skills = mergeSkills(
      form.skills,
      splitSkillTokens(form.skillDraft),
    );

    setSubmitting(true);
    try {
      await createCandidateInvitation({
        email: normalizeEmail(form.email),
        title: form.title.trim(),
        description: form.description.trim(),
        company_name: form.companyName.trim(),
        required_skills,
      });
      setForm(emptyForm);
      setSuccess(true);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        onUnauthorized();
        return;
      }

      setFormError(
        error instanceof ApiError
          ? error.message
          : "The invitation could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Invite a candidate to interview"
      description="Share the role details and Cognivo will tailor the interview to assess the candidate's relevant skills."
    >
      {success ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-[10px] border border-sky/30 bg-sky-soft px-4 py-3">
            <p className="text-sm font-semibold text-ink">
              Invitation sent successfully.
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              The candidate will receive an email with their interview link.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="button" wide={false} className="px-5" onClick={resetAndClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field
            label="Candidate email"
            type="email"
            autoComplete="email"
            placeholder="candidate@example.com"
            value={form.email}
            onValueChange={(email) => setForm((current) => ({ ...current, email }))}
            error={errors.email}
            disabled={submitting}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Job title"
              placeholder="Backend Developer"
              value={form.title}
              onValueChange={(title) => setForm((current) => ({ ...current, title }))}
              error={errors.title}
              disabled={submitting}
            />
            <Field
              label="Company name"
              placeholder="Acme Technologies"
              value={form.companyName}
              onValueChange={(companyName) =>
                setForm((current) => ({ ...current, companyName }))
              }
              error={errors.companyName}
              disabled={submitting}
            />
          </div>
          <TextArea
            label="Job description"
            placeholder="Describe the role, responsibilities and what you are looking for in a candidate..."
            helperText="Recommended for more relevant and in-depth interview questions."
            value={form.description}
            onValueChange={(description) =>
              setForm((current) => ({ ...current, description }))
            }
            disabled={submitting}
            maxLength={10000}
          />
          <SkillTagsInput
            label="Required skills"
            helperText="Recommended so Cognivo can focus questions on the skills that matter for this role."
            skills={form.skills}
            draft={form.skillDraft}
            onSkillsChange={(skills) => setForm((current) => ({ ...current, skills }))}
            onDraftChange={(skillDraft) =>
              setForm((current) => ({ ...current, skillDraft }))
            }
            disabled={submitting}
          />
          {formError ? (
            <p className="rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-[13px] text-magenta">
              {formError}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              wide={false}
              className="w-full px-5 sm:w-auto"
              onClick={resetAndClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              wide={false}
              className="w-full px-5 sm:w-auto"
            >
              {submitting ? "Sending invitation..." : "Send invitation"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
