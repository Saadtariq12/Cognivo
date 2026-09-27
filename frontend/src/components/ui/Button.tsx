import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "secondary";
  wide?: boolean;
};

export const Button = ({
  children,
  loading = false,
  disabled,
  className,
  variant = "primary",
  wide = true,
  ...props
}: ButtonProps) => {
  const variantClass =
    variant === "secondary"
      ? "border border-line bg-white text-ink shadow-none hover:bg-sky-soft focus-visible:ring-royal/30 disabled:bg-white disabled:text-ink-soft/60"
      : "bg-linear-to-r from-royal to-indigo text-white shadow-[0_8px_20px_-10px_rgba(47,91,234,0.7)] hover:from-[#2751d6] hover:to-[#5b3ad0] focus-visible:ring-magenta/40 disabled:bg-none disabled:bg-indigo/50 disabled:shadow-none";

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold transition duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px disabled:translate-y-0 ${wide ? "w-full" : "w-auto"} ${variantClass} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
