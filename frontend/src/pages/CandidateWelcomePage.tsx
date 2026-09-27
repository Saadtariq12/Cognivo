import { Navigate, useParams } from "react-router-dom";
import { readCandidateInterviewAccess } from "../auth/candidateInterview";
import { CandidateLayout } from "../layouts/CandidateLayout";

export const CandidateWelcomePage = () => {
  const { token } = useParams();
  const access = readCandidateInterviewAccess();

  if (!access) {
    return <Navigate to={token ? `/interview/${token}` : "/login"} replace />;
  }

  return (
    <CandidateLayout>
      <div className="rounded-2xl border border-line bg-white/90 px-5 py-10 text-center shadow-[0_20px_50px_-32px_rgba(18,26,51,0.28)] sm:px-8 sm:py-12">
        <p className="text-[1.2rem] leading-8 font-semibold tracking-[-0.03em] text-ink sm:text-[1.35rem] sm:leading-9">
          Welcome, your interview will be conducted shortly.
        </p>
      </div>
    </CandidateLayout>
  );
};
