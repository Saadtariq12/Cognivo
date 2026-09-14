import { supabase } from "../config/database.js";

const current_interview_stage = async(answer_id) => {
    const {data,error} = await supabase
    .from('evaluations')
    .select('current_interview_stage')
    .eq('answer_id', answer_id)
    if(error){
        throw error 
    }
    return data
} 

const getAllEvaluations = async(session_id) => {
    const {data, error} = await supabase
    .from('evaluations')
    .select("correctness, concepts_covered, concepts_missing, answer_quality")
    .eq("session_id", session_id)

    if(error){
        throw error
    }
    return data;
}

const getEvaluation = async(answer_id) => {
    const {data, error} = await supabase
    .from('evaluations')
    .select('move_to_next_topic, increase_difficulty, current_interview_stage')
    .eq('answer_id', answer_id)
    .maybeSingle()
    
    if(error) throw error;

    return data;
}

const store_evaluation = async(
  answer_id,
  session_id,
  correctness,
  concepts_covered,
  concepts_missing,
  need_follow_up,
  move_to_next_topic,
  increase_difficulty,
  current_interview_stage,
  finish_interview,
  answer_quality
) => {
    const {data,error} = await supabase
    .from('evaluations')
    .insert({
        answer_id,
        session_id,
        correctness,
        concepts_covered,
        concepts_missing,
        need_follow_up,
        move_to_next_topic,
        increase_difficulty,
        current_interview_stage,
        finish_interview,
        answer_quality
    })

    if(error){
        throw error
    }
    return data;
};

export {current_interview_stage, getAllEvaluations, getEvaluation, store_evaluation}