import { supabase } from "../config/database.js";

const current_interview_stage = async() => {
    const { data, error } = await supabase
      .from("evaluations")
      .select("current_interview_stage")
      .eq("id", evaluationId)
      .maybeSingle();
    if (error) {
      throw error;
    }
}
const create_evaluation = async ({
  answer_id,
  correctness,
  concepts_covered,
  concepts_missing,
  need_follow_up,
  answer_quality
}) => {
  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      answer_id,
      correctness,
      concepts_covered,
      concepts_missing,
      need_follow_up,
      answer_quality
    })
    .select()
    .single();
  if (error) {
    throw error;
  }

  return data;
};

const store_final_assessment = async (
  session_id,
  technical_score,
  communication_score,
  problem_solving_score,
  eligibility_score,
  strength,
  weaknesses,
  recommendation,
) => {
  const { data, error } = await supabase.from("final_assessments").insert({
    session_id,
    technical_score,
    communication_score,
    problem_solving_score,
    eligibility_score,
    strength,
    weaknesses,
    recommendation,
  })
  .select()
  .single()
  if(error) throw error;
  else return data;
};
export { create_evaluation, current_interview_stage, store_final_assessment  };
