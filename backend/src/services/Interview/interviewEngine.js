// import { generateQuestion } from "../InterviewAgents/questionAgent.js";
// import { createFinalAssessment } from "../Assessment/assessmentAgent.js";
// import { storeQuestion } from "../../models/questionAnswer.model.js";
// import { fetchCandidateInfo } from "../../models/candidate.model.js";
// import { job_requirements } from "../../models/interview.model.js";
// import { getAllQA } from "../../models/questionAnswer.model.js";
// import { getAllEvaluations } from "../../models/evaluations.model.js";
// import { store_final_assessment } from "../../models/assessment.model.js";
// import { getEvaluation } from "../../models/evaluations.model.js";
// import { getAnswerDetails } from "../../models/questionAnswer.model.js";
// import { getPreviousAnswers } from "../../models/questionAnswer.model.js";

// /**
//  * Interview Engine - Orchestrates the interview workflow after answer evaluation
//  *
//  * This engine is responsible for:
//  * 1. Checking if the interview should finish based on evaluation results
//  * 2. Generating the next question if interview continues
//  * 3. Triggering final assessment if interview ends
//  */

// /**
//  * Processes the interview flow after an answer has been evaluated
//  *
//  * @param {Object} params - Interview context parameters
//  * @param {string} params.session_id - Current interview session ID
//  * @param {string} params.candidate_id - Candidate ID
//  * @param {string} params.interview_id - Interview ID
//  * @param {string} params.answer_id - ID of the evaluated answer
//  * @param {boolean} params.finish_interview - Whether the evaluator wants to finish the interview
//  * @returns {Promise<Object>} - Result containing either next question or final assessment
//  */
// const processInterviewFlow = async ({
//   session_id,
//   candidate_id,
//   interview_id,
//   answer_id,
//   finish_interview
// }) => {
//   try {
//     // Check if interview should finish
//     if (finish_interview === true) {
//       return await handleInterviewCompletion({
//         session_id,
//         candidate_id,
//         interview_id
//       });
//     } else {
//       return await generateNextQuestion({
//         session_id,
//         candidate_id,
//         interview_id,
//         answer_id
//       });
//     }
//   } catch (error) {
//     console.error("Interview Engine Error:", error);
//     throw error;
//   }
// };

// /**
//  * Handles interview completion by generating final assessment
//  *
//  * @param {Object} params - Interview context parameters
//  * @returns {Promise<Object>} - Final assessment result
//  */
// const handleInterviewCompletion = async ({
//   session_id,
//   candidate_id,
//   interview_id
// }) => {
//   // Fetch all required data for final assessment
//   const candidate_info = await fetchCandidateInfo(candidate_id);
//   const interview_answers = await getAllQA(session_id);
//   const allEvaluations = await getAllEvaluations(session_id);
//   const jobRequirements = await job_requirements(interview_id);

//   // Build interview data structure for final assessment
//   const interviewData = interview_answers.map((qa) => ({
//     question: qa.question,
//     question_intent: qa.question_intent,
//     candidate_answer: qa.answer,
//     evaluation: {}
//   }));

//   // Call Final Assessment Agent
//   const final_assessment = await createFinalAssessment({
//     candidateIntroduction: candidate_info.Introduction,
//     candidateProjects: candidate_info.projects,
//     candidateSkills: candidate_info.skills,
//     jobRequirements: jobRequirements,
//     interviewData: interviewData,
//     evaluationData: allEvaluations
//   });

//   // Store final assessment
//   const stored_final_assessment = await store_final_assessment(
//     session_id,
//     final_assessment.technical_score,
//     final_assessment.communication_score,
//     final_assessment.problem_solving_score,
//     final_assessment.eligibility_score,
//     final_assessment.strengths,
//     final_assessment.weaknesses,
//     final_assessment.recommendation
//   );

//   return {
//     success: true,
//     interviewCompleted: true,
//     finalAssessment: stored_final_assessment
//   };
// };

// /**
//  * Generates the next question when interview continues
//  *
//  * @param {Object} params - Interview context parameters
//  * @returns {Promise<Object>} - Next question result
//  */
// const generateNextQuestion = async ({
//   session_id,
//   candidate_id,
//   interview_id,
//   answer_id
// }) => {
//   // Fetch required context for question generation
//   const job_Requirements = await job_requirements(interview_id);
//   const candidate = await fetchCandidateInfo(candidate_id);
//   const answer = await getAnswerDetails(answer_id);
//   const evaluation = await getEvaluation(answer_id);
//   const previousQA = await getPreviousAnswers(session_id);

//   // Generate next question using Question Agent
//   const question = await generateQuestion({
//     candidateIntroduction: candidate.Introduction,
//     candidateProjects: candidate.projects,
//     candidateSkills: candidate.skills,
//     jobRequirements: job_Requirements,
//     currentInterviewStage: evaluation?.current_interview_stage || "introduction",
//     currentTopic: answer?.topic,
//     moveToNextTopic: evaluation?.move_to_next_topic,
//     currentDifficulty: answer?.difficulty,
//     increaseDifficulty: evaluation?.increase_difficulty,
//     previousQuestionsAndAnswers: previousQA
//   });

//   // Store the generated question
//   const stored_question = await storeQuestion(
//     session_id,
//     question.question,
//     question.intent
//   );

//   return {
//     success: true,
//     interviewCompleted: false,
//     question: stored_question
//   };
// };

// export { processInterviewFlow };

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
  // If the evaluator says the interview is finished,
  // generate and store the final assessment.
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
    candidateIntroduction: candidateInfo?.Introduction,
    candidateProjects: candidateInfo?.projects,
    candidateSkills: candidateInfo?.skills,

    jobRequirements,

    currentInterviewStage:
      evaluation?.current_interview_stage || "introduction",

    currentTopic: answerDetails?.topic,

    moveToNextTopic: evaluation?.move_to_next_topic || false,

    currentDifficulty: answerDetails?.difficulty || "medium",

    increaseDifficulty: evaluation?.increase_difficulty || false,

    previousQuestionsAndAnswers,
  });

  const storedQuestion = await storeQuestion(
    session_id,
    nextQuestion.question,
    nextQuestion.intent,
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