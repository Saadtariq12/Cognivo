import { generateQuestion } from "../InterviewAgents/questionAgent.js";
import { createFinalAssessment } from "../Assessment/assessmentAgent.js";
import { fetchCandidateInfo } from "../../models/candidate.model.js";
import {
  getAnswerDetails,
  getPreviousAnswers,
  storeQuestion,
  getAllQA,
} from "../../models/questionAnswer.model.js";
import {
  getEvaluation,
  getAllEvaluations,
} from "../../models/evaluations.model.js";
import { job_requirements } from "../../models/interview.model.js";
import { store_final_assessment } from "../../models/assessment.model.js";

const processInterviewFlow = async ({
  session_id,
  candidate_id,
  interview_id,
  answer_id,
  finish_interview,
}) => {
  if (finish_interview === true) {
    const candidateInfo = await fetchCandidateInfo(candidate_id);
    const interviewData = await getAllQA(session_id);
    const evaluationData = await getAllEvaluations(session_id);
    const jobRequirements = await job_requirements(interview_id);

    const finalAssessment = await createFinalAssessment({
      candidateIntroduction: candidateInfo?.Introduction,
      candidateProjects: candidateInfo?.projects,
      candidateSkills: candidateInfo?.skills,
      jobRequirements,
      interviewData,
      evaluationData,
    });

    const storedFinalAssessment = await store_final_assessment(
      session_id,
      finalAssessment.technical_score,
      finalAssessment.communication_score,
      finalAssessment.problem_solving_score,
      finalAssessment.eligibility_score,
      finalAssessment.strengths,
      finalAssessment.weaknesses,
      finalAssessment.recommendation,
    );

    return {
      success: true,
      interviewCompleted: true,
      message: "Interview completed successfully",
      data: {
        finalAssessment: storedFinalAssessment,
      },
    };
  }

  // If the interview is not finished, get the latest
  // answer and evaluation to determine what the next
  // question should look like.
  const answerDetails = await getAnswerDetails(answer_id);
  const evaluation = await getEvaluation(answer_id);
  const candidateInfo = await fetchCandidateInfo(candidate_id);
  const jobRequirements = await job_requirements(interview_id);
  const previousQuestionsAndAnswers = await getPreviousAnswers(session_id);

  const nextQuestion = await generateQuestion({
    candidateIntroduction: candidateInfo?.introduction,
    candidateProjects: candidateInfo?.projects,
    candidateSkills: candidateInfo?.initial_claimed_skills,
    jobRequirements,
    currentInterviewStage:
      evaluation?.current_interview_stage || "technical",
    currentTopic: answerDetails?.topic,
    moveToNextTopic: evaluation?.move_to_next_topic || false,
    currentDifficulty: answerDetails?.difficulty || "easy",
    increaseDifficulty: evaluation?.increase_difficulty || false,
    previousQuestionsAndAnswers,
  });

  const storedQuestion = await storeQuestion(
    session_id,
    nextQuestion.question,
    nextQuestion.intent,
    nextQuestion.topic,
    nextQuestion.difficulty
  );

  return {
    success: true,
    interviewCompleted: false,
    message: "Next question generated successfully",
    data: {
      question: storedQuestion,
    },
  };
};

export { processInterviewFlow };