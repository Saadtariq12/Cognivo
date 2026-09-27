import { useId, type TextareaHTMLAttributes } from "react";

type TextAreaProps = {
  label: string;
  helperText?: string;
  error?: string;
  value: string;
  onValueChange: (value: string) => void;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

export const TextArea = ({
  label,
  helperText,
  error,
  value,
  onValueChange,
  id,
  className,
  ...textareaProps
}: TextAreaProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <textarea
        {...textareaProps}
        id={fieldId}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`min-h-[104px] w-full resize-y rounded-[10px] border bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/55 ${
          error
            ? "border-magenta/60 focus:border-magenta focus:ring-2 focus:ring-magenta/15"
            : "border-line focus:border-royal focus:ring-2 focus:ring-sky/25"
        } ${className ?? ""}`}
      />
      {helperText && !error ? (
        <p id={helperId} className="text-[12.5px] leading-5 text-ink-soft">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[12.5px] text-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
};
