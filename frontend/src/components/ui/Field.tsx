import { useId, useState, type InputHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  error?: string;
  value: string;
  onValueChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

const EyeIcon = ({ off }: { off?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className="h-[18px] w-[18px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {off ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4 10.5 7-0.5 1-1.2 2-2.1 2.9" />
        <path d="M6.1 6.1C4.4 7.3 3.1 8.9 1.5 12c1.5 3 5.5 7 10.5 7 1.4 0 2.7-.3 3.9-.8" />
      </>
    ) : (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const Field = ({
  label,
  error,
  value,
  onValueChange,
  id,
  type = "text",
  className,
  ...inputProps
}: FieldProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          id={fieldId}
          type={resolvedType}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-[10px] border bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink-soft/55 ${
            isPassword ? "pr-12" : ""
          } ${
            error
              ? "border-magenta/60 focus:border-magenta focus:ring-2 focus:ring-magenta/15"
              : "border-line focus:border-royal focus:ring-2 focus:ring-sky/25"
          } ${className ?? ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft transition hover:bg-sky-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:outline-none"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            <EyeIcon off={visible} />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-[12.5px] text-magenta">
          {error}
        </p>
      ) : null}
    </div>
  );
};
