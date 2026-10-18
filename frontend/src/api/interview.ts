import type { CandidateInterviewAccess } from "../auth/candidateInterview";
import { apiRequest } from "./client";
import type { ApiSuccess } from "../types/auth";

export type InterviewQuestion = {
  id: string;
  question: string;
};

type StoredQuestion = InterviewQuestion & {
  session_id?: string;
  question_intent?: string;
  topic?: string;
  difficulty?: string;
};

export type StartInterviewResponse = ApiSuccess<{
  stored_question: StoredQuestion;
}>;

export type SubmitAnswerResponse = ApiSuccess<{
  evaluation?: unknown;
  question?: StoredQuestion;
  finalAssessment?: unknown;
}> & {
  interviewCompleted: boolean;
};

const accessBody = (access: CandidateInterviewAccess) => ({
  session_id: access.session_id,
  candidate_id: access.candidate_id,
  interview_id: access.interview_id,
});

export const startInterview = (access: CandidateInterviewAccess) =>
  apiRequest<StartInterviewResponse>("/api/interview/start", {
    method: "POST",
    bearerToken: access.access_token,
    body: accessBody(access),
  });

export const submitInterviewAnswer = ({
  access,
  questionId,
  answer,
  previousAnswerId,
}: {
  access: CandidateInterviewAccess;
  questionId: string;
  answer: string;
  previousAnswerId?: string;
}) =>
  apiRequest<SubmitAnswerResponse>("/api/interview/answer", {
    method: "POST",
    bearerToken: access.access_token,
    body: {
      ...accessBody(access),
      question_id: questionId,
      answer,
      ...(previousAnswerId ? { previous_answer_id: previousAnswerId } : {}),
    },
  });
