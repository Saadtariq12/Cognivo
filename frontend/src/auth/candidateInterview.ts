export type CandidateInterviewAccess = {
  access_token: string;
  token_type?: string;
  expires_at?: string;
  candidate_id: string;
  interview_id: string;
  session_id: string;
};

const CANDIDATE_INTERVIEW_STORAGE_KEY = "cognivo.candidate.interview";

const isAccess = (value: unknown): value is CandidateInterviewAccess => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const access = value as CandidateInterviewAccess;
  return (
    typeof access.access_token === "string" &&
    access.access_token.length > 0 &&
    typeof access.candidate_id === "string" &&
    typeof access.interview_id === "string" &&
    typeof access.session_id === "string"
  );
};

export const readCandidateInterviewAccess = (): CandidateInterviewAccess | null => {
  try {
    const raw = localStorage.getItem(CANDIDATE_INTERVIEW_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isAccess(parsed)) {
      localStorage.removeItem(CANDIDATE_INTERVIEW_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(CANDIDATE_INTERVIEW_STORAGE_KEY);
    return null;
  }
};

export const persistCandidateInterviewAccess = (
  access: CandidateInterviewAccess,
) => {
  localStorage.setItem(CANDIDATE_INTERVIEW_STORAGE_KEY, JSON.stringify(access));
};

export const getCandidateAccessToken = () =>
  readCandidateInterviewAccess()?.access_token ?? null;
