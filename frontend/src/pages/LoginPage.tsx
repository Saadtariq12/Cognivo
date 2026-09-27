import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AuthLayout } from "../layouts/AuthLayout";
import { normalizeEmail, validateEmail } from "../lib/validation";

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice =
    typeof location.state === "object" &&
    location.state &&
    "notice" in location.state &&
    typeof location.state.notice === "string"
      ? location.state.notice
      : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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
      email: validateEmail(email),
      password: password ? "" : "Password is required.",
    };
    setErrors(nextErrors);
    setFormError("");

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: normalizeEmail(email), password });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to sign in right now.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your Cognivo workspace."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-royal transition hover:text-magenta focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-royal/30 focus-visible:outline-none"
          >
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onValueChange={setPassword}
          error={errors.password}
          disabled={submitting}
        />
        {notice && !formError ? (
          <p className="rounded-[10px] border border-sky/30 bg-sky-soft px-3 py-2.5 text-[13px] text-royal">
            {notice}
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-[10px] border border-magenta/20 bg-peach-soft px-3 py-2.5 text-[13px] text-magenta">
            {formError}
          </p>
        ) : null}
        <Button type="submit" loading={submitting} className="mt-1">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
};
