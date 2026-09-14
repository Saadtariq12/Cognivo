import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { createFinalAssessment } from "../services/Assessment/assessmentAgent.js";
import { fetchCandidateInfo } from "../models/candidate.model.js";
import { getAllQA } from "../models/questionAnswer.model.js";
import { getAllEvaluations } from "../models/evaluations.model.js";
import { job_requirements } from "../models/interview.model.js";
import { store_final_assessment } from "../models/assessment.model.js";

const final_assessment = asyncHandler(async(req, res) => {
    const {session_id, candidate_id, interview_id} = req.body;
    if(!session_id || !candidate_id){
        throw new APIError(301, 'provide session and candidate id');
    }
    const candidate_info = await fetchCandidateInfo(candidate_id) || { Introduction: null, projects: [], skills: [] };
    const interview_answers = await getAllQA(session_id);
    const allEvaluations = await getAllEvaluations(session_id); 
    const job_requirements_data = await job_requirements(interview_id);
    const final_assessment = await createFinalAssessment({
        candidateIntroduction: candidate_info.Introduction,
        candidateProjects: candidate_info.projects,
        candidateSkills: candidate_info.skills,
        jobRequirements: job_requirements_data,
        interviewData: interview_answers,
        evaluationData: allEvaluations,
    })

    const stored_final_assessment = await store_final_assessment(
      session_id,
      final_assessment.technical_score,
      final_assessment.communication_score,
      final_assessment.problem_solving_score,
      final_assessment.eligibility_score,
      final_assessment.strengths,
      final_assessment.weaknesses,
      final_assessment.recommendation
    );

    return res
    .status(200)
    .json({
        success: true,
        message: "final assessment stored successfully",
        data: {
            stored_final_assessment
        }
    })
})

export {final_assessment}