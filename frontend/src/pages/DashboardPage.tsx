import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { InviteCandidateModal } from "../components/dashboard/InviteCandidateModal";
import { CognivoMark } from "../components/brand/CognivoMark";
import { Button } from "../components/ui/Button";

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
  </svg>
);

export const DashboardPage = () => {
  const { isAuthenticated, displayName, logout } = useAuth();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleUnauthorized = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-sky-soft via-white to-peach-soft" />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-16 h-110 w-200 rounded-full bg-sky/40 blur-3xl" />
        <div className="absolute top-10 right-0 h-110 w-170 rounded-full bg-peach/80 blur-3xl" />
        <div className="absolute bottom-0 h-75 w-150 rounded-full bg-magenta/45 blur-3xl" />
        <div className="absolute right-[0%] bottom-1 hidden h-80 w-200 rounded-full bg-cyan/80 blur-3xl sm:block" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CognivoMark />
              <p className="text-lg font-semibold tracking-[-0.04em] text-ink">
                Cognivo
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-[10px] px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-white/70 hover:text-ink focus-visible:ring-2 focus-visible:ring-royal/40 focus-visible:outline-none"
            >
              {loggingOut ? "Signing out..." : "Log out"}
            </button>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[2rem]">
                {displayName ? `Hello, ${displayName}` : "Hello"}
              </h1>
              <p className="mt-1 text-sm text-ink-soft sm:text-[15px]">
                Recruiter Dashboard
              </p>
            </div>
            <Button
              type="button"
              wide={false}
              className="w-full gap-2 px-5 lg:w-auto"
              onClick={() => setInviteOpen(true)}
            >
              <CalendarIcon />
              Schedule an interview
            </Button>
          </div>
        </header>

        <section className="mt-8 flex flex-1 items-start">
          <div className="w-full rounded-2xl border border-line bg-white/90 p-6 shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:p-8">
            <p className="text-sm font-semibold tracking-wide text-royal uppercase">
              Get started
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">
              Invite your first candidate
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft sm:text-[15px]">
              Share the role details and send an interview invitation. Cognivo
              will use that context to ask relevant questions during the
              conversation.
            </p>
            <Button
              type="button"
              wide={false}
              className="mt-6 w-full gap-2 px-5 sm:w-auto"
              onClick={() => setInviteOpen(true)}
            >
              <CalendarIcon />
              Schedule an interview
            </Button>
          </div>
        </section>
      </div>

      <InviteCandidateModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onUnauthorized={handleUnauthorized}
      />
    </div>
  );
};
