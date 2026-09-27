import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AuthLayout } from "../layouts/AuthLayout";
import {
  normalizeEmail,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validatePassword,
} from "../lib/validation";

export const RegisterPage = () => {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);
    setFormError("");

    if (
      nextErrors.fullName ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        password,
      });

      if (result === "authenticated") {
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/login", {
        replace: true,
        state: { notice: "Account created. Sign in to continue." },
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to create your account right now.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start screening candidates with Cognivo."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-royal transition hover:text-magenta focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-royal/30 focus-visible:outline-none"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Full Name"
          autoComplete="name"
          placeholder="Jordan Lee"
          value={fullName}
          onValueChange={setFullName}
          error={errors.fullName}
          disabled={submitting}
        />
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onValueChange={setEmail}
          error={errors.email}
          disabled={submitting}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onValueChange={setPassword}
          error={errors.password}
          disabled={submitting}
        />
        <Field
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
          error={errors.confirmPassword}
          disabled={submitting}
        />
        {formError ? (
          <p className="rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-[13px] text-magenta">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={submitting} className="mt-1">
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
};
