import { supabase } from "../config/database.js";

const createInterview = async ({
  recruiterId,
  title,
  description,
  requiredSkills,
  duration,
}) => {
  const { data, error } = await supabase
    .from("interviews")
    .insert({
      recruiter_id: recruiterId,
      title,
      description,
      required_skills: requiredSkills,
      duration,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const deleteInterview = async (interviewId) => {
  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId);

  if (error) {
    throw error;
  }
};
const job_requirements = async (id) => {
  const { data, error } = await supabase
    .from("interviews")
    .select("title, description, required_skills")
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
};

const findInterviewById = async (interviewId) => {
  const { data, error } = await supabase
    .from("interviews")
    .select("id")
    .eq("id", interviewId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const findLatestInterviewSession = async (interviewId, candidateId) => {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, status")
    .eq("interview_id", interviewId)
    .eq("candidate_id", candidateId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const createInterviewSession = async ({ interviewId, candidateId }) => {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      interview_id: interviewId,
      candidate_id: candidateId,
    })
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const store_endtime = async(session_id,endtime) => {
    const {data, error} = await supabase
    .from("interview_sessions")
    .update({ended_at : endtime})
    .eq("id", session_id)

    if(error){
        throw error
    }
    return data
}
export {
  createInterview,
  createInterviewSession,
  deleteInterview,
  findInterviewById,
  findLatestInterviewSession,
  job_requirements,
  store_endtime,
};
