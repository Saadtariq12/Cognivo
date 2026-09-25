import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { evaluateAnswer } from "../services/InterviewAgents/evaluatorAgent.js";
import { generateQuestion } from "../services/InterviewAgents/questionAgent.js";
import { extractContext } from "../services/InterviewAgents/contextExtractorAgent.js";
import { processInterviewFlow } from "../services/Interview/interviewEngine.js";
import { job_requirements } from "../models/interview.model.js";
import {
  storeQuestion,
  storeAnswer,
  getAnswerDetails,
  getPreviousAnswers,
} from "../models/questionAnswer.model.js";
import {
  storeCandidateInfo,
  fetchCandidateInfo,
  intro_exists,
} from "../models/candidate.model.js";
import {
  getEvaluation,
  store_evaluation,
} from "../models/evaluations.model.js";
import { supabase } from "../config/database.js";

const askQuestion = asyncHandler(async (req, res) => {
  try {
    const { session_id, candidate_id, interview_id, previous_answer_id } =
      req.body;

    previous_answer_id ? await getAnswerDetails(previous_answer_id) : null;

    if (!session_id || !candidate_id || !interview_id) {
      throw new APIError(301, "session id or candidate or interview id not provided");
    }

    const jobRequirements = await job_requirements(interview_id);
    const candidate = await fetchCandidateInfo(candidate_id);
    const answer = previous_answer_id
      ? await getAnswerDetails(previous_answer_id)
      : null;
    const evaluation = previous_answer_id
      ? await getEvaluation(previous_answer_id)
      : null;
    const previousQA = previous_answer_id? await getPreviousAnswers(previous_answer_id) : null;
    console.time("question generation ");
    const question = await generateQuestion({
      candidateIntroduction: candidate.introduction,
      candidateProjects: candidate.projects,
      candidateSkills: candidate.initial_claimed_skills,
      jobRequirements: jobRequirements,
      currentInterviewStage:
        evaluation?.current_interview_stage || "introduction",
      currentTopic: answer?.topic,
      moveToNextTopic: evaluation?.move_to_next_topic,
      currentDifficulty: answer?.difficulty,
      increaseDifficulty: evaluation?.increase_difficulty,
      previousQuestionAndAnswer: previousQA,
    });
    console.timeEnd("question generation ");
    const stored_question = await storeQuestion(
      session_id,
      question.question,
      question.intent,
      question.topic,
      question.difficulty
    );
    return res.status(200).json({
      success: true,
      message: "question generated successfully",
      data: {
        stored_question,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "An internal error occurred",
      errorDetails: error.stack || error,
    });
  }
});


const submitAnswer = asyncHandler(async (req, res) => {
  try {
    const { session_id, candidate_id, interview_id, question_id, answer , previous_answer_id} =
      req.body;
    if (
      !session_id ||
      !candidate_id ||
      !interview_id ||
      !question_id ||
      !answer
    ) {
      throw new APIError(
        400,
        "session_id, candidate_id, interview_id, question_id and answer are required",
      );
    }
    const storedAnswer = await storeAnswer(question_id, answer);

    const { count, error: evaluationCountError } = await supabase
      .from("evaluations")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("session_id", session_id);

    if (evaluationCountError) {
      throw new APIError(500, "Failed to determine interview progression");
    }
    const introExists = await intro_exists(candidate_id);

    const noEvaluation = count === 0; //if no evaluation then run context extractor agent

    if (noEvaluation && !introExists) {
      console.time("context extractor");
      const candidateInfo = await extractContext({
        candidateAnswer: answer,
      });
      console.timeEnd("context extractor");
      await storeCandidateInfo(
        candidate_id,
        candidateInfo.introduction,
        candidateInfo.projects,
        candidateInfo.skills,
      );
      const jobRequirements = await job_requirements(interview_id);
      const updatedCandidate = await fetchCandidateInfo(candidate_id);
      const previousQuestionAndAnswer = await getPreviousAnswers(question_id);

      const nextQuestion = await generateQuestion({
        candidateIntroduction: updatedCandidate?.introduction,
        candidateProjects: updatedCandidate?.projects,
        candidateSkills: updatedCandidate?.initial_claimed_skills,
        jobRequirements,
        currentInterviewStage: "technical",
        currentTopic: null,
        moveToNextTopic: true,
        currentDifficulty: "easy",
        increaseDifficulty: false,
        previousQuestionAndAnswer,
      });

      const storedQuestion = await storeQuestion(
        session_id,
        nextQuestion.question,
        nextQuestion.intent,
        nextQuestion.topic,
        nextQuestion.difficulty,
      );

      return res.status(200).json({
        success: true,
        interviewCompleted: false,
        message:
          "Introduction processed and next question generated successfully",
        data: {
          question: storedQuestion,
        },
      });
    } else {
      const currentQuestionDetails = await getAnswerDetails(question_id);

      if (!currentQuestionDetails) {
        throw new APIError(404, "Question/answer details could not be found");
      }

      const candidateDetails = await fetchCandidateInfo(candidate_id);
      const jobRequirements = await job_requirements(interview_id);
      let currentInterviewStage = "technical";
      if (previous_answer_id) {
        const previousEvaluation = await getEvaluation(previous_answer_id);
        currentInterviewStage = previousEvaluation? previousEvaluation.current_interview_stage : "technical";
      }

      const evaluation = await evaluateAnswer({
        candidateIntroduction: candidateDetails?.introduction,
        candidateProjects: candidateDetails?.projects,
        candidateSkills: candidateDetails?.initial_claimed_skills,
        jobRequirements,
        currentQuestion: currentQuestionDetails.question,
        currentQuestionIntent: currentQuestionDetails.question_intent,
        currentInterviewStage,
        candidateAnswer: currentQuestionDetails.answer,
        currentTopic: currentQuestionDetails.topic,
        currentDifficulty: currentQuestionDetails.difficulty,
      });

      const storedEvaluation = await store_evaluation(
        question_id,
        session_id,
        evaluation.correctness,
        evaluation.concepts_covered,
        evaluation.concepts_missing,
        evaluation.skills_demonstrated,
        evaluation.need_follow_up,
        evaluation.move_to_next_topic,
        evaluation.increase_difficulty,
        evaluation.current_interview_stage,
        evaluation.finish_interview,
        evaluation.answer_quality,
        evaluation.evaluation_reasoning
      );

      const interviewResult = await processInterviewFlow({
        session_id,
        candidate_id,
        interview_id,
        answer_id: question_id,
        finish_interview: evaluation.finish_interview,
      });

      return res.status(200).json({
        success: true,
        interviewCompleted: interviewResult.interviewCompleted || false,
        message: interviewResult.message,
        data: {
          evaluation: storedEvaluation,
          ...interviewResult.data,
        },
      });
    }

  } catch (error) {
    console.log(error)
  }
});

export { askQuestion, submitAnswer };