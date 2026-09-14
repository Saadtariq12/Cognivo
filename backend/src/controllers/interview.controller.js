import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { evaluateAnswer } from "../services/InterviewAgents/evaluatorAgent.js"; //returns generatedEvaluation
import { generateQuestion } from "../services/InterviewAgents/questionAgent.js";
import { extractContext } from "../services/InterviewAgents/contextExtractorAgent.js";
import { processInterviewFlow } from "../services/Interview/interviewEngine.js";
import { job_requirements } from "../models/interview.model.js";
import {
  storeQuestion,
  storeAnswer,
  getAnswerDetails,
  getAnswerOnly,
  getPreviousAnswers,
} from "../models/questionAnswer.model.js";
import {
  storeCandidateInfo,
  fetchCandidateInfo,
} from "../models/candidate.model.js";
import {
  current_interview_stage,
  getEvaluation,
  store_evaluation,
} from "../models/evaluations.model.js";

const submitAnswer = async (req, res) => {
  try {
    const { session_id, question_id, answer } = req.body;

    if (!session_id || !question_id || !answer) {
      return res.status(400).json({
        success: false,
        message: "session_id, question_id and answer are required",
      });
    }
    console.time("storing question")
    const stored_answer = await storeAnswer(question_id, answer);
    console.timeEnd('storing question')
    return res.status(200).json({
      success: true,
      message: "Answer received successfully",
      data: {
        session_id,
        question_id,
        answer,
      },
    });
  } catch (error) {
    console.error("Error receiving candidate answer:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process candidate answer",
    });
  }
};

const askQuestion = asyncHandler(async (req, res) => {
  try {
    const { session_id, candidate_id, interview_id, previous_answer_id } =
      req.body;

    previous_answer_id ? await getAnswerDetails(previous_answer_id) : null;

    if (!session_id || !candidate_id) {
      throw new APIerror(301, "session id or candidate id not provided");
    }

    const jobRequirements = await job_requirements(interview_id);
    const candidate = await fetchCandidateInfo(candidate_id);
    const answer = previous_answer_id
      ? await getAnswerDetails(previous_answer_id)
      : null;
    const evaluation = previous_answer_id
      ? await getEvaluation(previous_answer_id)
      : null;
    const previousQA = await getPreviousAnswers(session_id);
    console.time("question generation ");
    const question = await generateQuestion({
      candidateIntroduction: candidate.introduction,
      candidateProjects: candidate.projects,
      candidateSkills: candidate.skills,
      jobRequirements: jobRequirements,
      currentInterviewStage:
        evaluation?.current_interview_stage || "introduction",
      currentTopic: answer?.topic,
      moveToNextTopic: evaluation?.move_to_next_topic,
      currentDifficulty: answer?.difficulty,
      increaseDifficulty: evaluation?.increase_difficulty,
      previousQuestionsAndAnswers: previousQA,
    });

    const stored_question = await storeQuestion(
      session_id,
      question.question,
      question.intent,
    );
    console.timeEnd("question generation ");
    return res.status(200).json({
      success: true,
      message: "question generated successfully",
      data: {
        stored_question,
      },
    });
  } catch (error) {
    // 1. Logs the exact error object/stack trace to your terminal
    console.error("❌ DEBUG ERROR in askQuestion:", error);

    // 2. Returns a clean JSON response to your HTTP client
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "An internal error occurred",
      errorDetails: error.stack || error,
    });
  }
});

const generateEvaluation = asyncHandler(async (req, res) => {
  const { answer_id, candidate_id, session_id, interview_id } = req.body;
  if (!answer_id || !session_id) {
    throw new APIerror(300, "please provide answer id and session id");
  }
  const get_candidate_info = await fetchCandidateInfo(candidate_id);
  const isEmpty = (val) => {
    if (val === null || val === undefined) return true;
    if (typeof val === "string" && val.trim() === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  };
  const { introduction, projects, skills } = get_candidate_info || {};
  const AnyFieldMissing =
    !get_candidate_info ||
    isEmpty(introduction) ||
    isEmpty(projects) ||
    isEmpty(skills);

  if (AnyFieldMissing) {
    const jobRequirements = await job_requirements(interview_id);
    const answerData = await getAnswerOnly(answer_id);
    const answer = answerData?.answer || "";
    const Candidate_Info = await extractContext({
      candidateAnswer: answer,
      jobRequirements: jobRequirements,
    }); //returns intro, projects, skills

    const stored_info = await storeCandidateInfo(
      candidate_id,
      Candidate_Info.introduction,
      Candidate_Info.projects,
      Candidate_Info.skills,
    );
    return res.status(200).json({
      success: true,
      message: "intro stored successfully",
    });
  } else {
    //evaluation agent
    const current_question_details = await getAnswerDetails(answer_id); //question, question_intent, answer, topic, difficulty
    const candidate_details = await fetchCandidateInfo(candidate_id);
    const jobRequirements = await job_requirements(interview_id);
    console.time("evaluation")
    const evaluation = await evaluateAnswer({
      candidateIntroduction: candidate_details.introduction,
      candidateProjects: candidate_details.projects,
      candidateSkills: candidate_details.skills,
      jobRequirements: jobRequirements,
      currentQuestion: current_question_details.question,
      currentQuestionIntent: current_question_details.question_intent,
      candidateAnswer: current_question_details.answer,
      currentTopic: current_question_details.topic,
      currentDifficulty: current_question_details.difficulty,
    });
    console.timeEnd('evaluation')
    const stored_evaluation = await store_evaluation(
      answer_id,
      session_id,
      evaluation.correctness,
      evaluation.concepts_covered,
      evaluation.concepts_missing,
      evaluation.need_follow_up,
      evaluation.move_to_next_topic,
      evaluation.increase_difficulty,
      evaluation.current_interview_stage,
      evaluation.finish_interview,
      evaluation.answer_quality,
    );

    // Use Interview Engine to determine next step
    const interviewResult = await processInterviewFlow({
      session_id,
      candidate_id,
      interview_id,
      answer_id,
      finish_interview: evaluation.finish_interview,
    });

    return res.status(200).json({
      success: true,
      message: "evaluation stored successfully",
      data: {
        stored_evaluation,
      },
    });
  }
});

export { submitAnswer, askQuestion, generateEvaluation };
