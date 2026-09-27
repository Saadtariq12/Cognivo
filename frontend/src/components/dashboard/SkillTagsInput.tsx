import { type KeyboardEvent } from "react";
import { mergeSkills, splitSkillTokens } from "../../lib/validation";

type SkillTagsInputProps = {
  label: string;
  helperText?: string;
  skills: string[];
  draft: string;
  onSkillsChange: (skills: string[]) => void;
  onDraftChange: (draft: string) => void;
  disabled?: boolean;
};

export const SkillTagsInput = ({
  label,
  helperText,
  skills,
  draft,
  onSkillsChange,
  onDraftChange,
  disabled = false,
}: SkillTagsInputProps) => {
  const fieldId = `${label.replace(/\s+/g, "-").toLowerCase()}-skills`;
  const helperId = `${fieldId}-helper`;

  const commitDraft = (raw: string) => {
    const tokens = splitSkillTokens(raw);
    if (!tokens.length) {
      onDraftChange("");
      return;
    }

    onSkillsChange(mergeSkills(skills, tokens));
    onDraftChange("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && skills.length) {
      onSkillsChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <div
        className={`flex min-h-12 flex-wrap items-center gap-2 rounded-[10px] border bg-white px-2.5 py-2 transition ${
          disabled
            ? "border-line"
            : "border-line focus-within:border-royal focus-within:ring-2 focus-within:ring-sky/25"
        }`}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-sky-soft px-2.5 py-1 text-[13px] font-medium text-ink"
          >
            {skill}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSkillsChange(skills.filter((item) => item !== skill))}
              className="flex h-4 w-4 items-center justify-center rounded-full text-ink-soft hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:outline-none"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={fieldId}
          value={draft}
          disabled={disabled}
          aria-describedby={helperText ? helperId : undefined}
          onChange={(event) => {
            const value = event.target.value;
            if (value.includes(",")) {
              commitDraft(value);
              return;
            }
            onDraftChange(value);
          }}
          onKeyDown={onKeyDown}
          placeholder={skills.length ? "Add another skill" : "Type a skill and press Enter"}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-[15px] text-ink outline-none placeholder:text-ink-soft/55"
        />
      </div>
      {helperText ? (
        <p id={helperId} className="text-[12.5px] leading-5 text-ink-soft">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
