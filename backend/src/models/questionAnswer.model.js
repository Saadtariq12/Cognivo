import {supabase} from "../config/database.js"

const getPreviousAnswers = async (sessionId) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .select("question, answer")
    .eq("session_id", sessionId)
     if (error) {
       throw error;
     }

     return data;
};

const getAnswerDetails = async (answerId) => {
    const {data, error} = await supabase
    .from('interview_answers')
    .select('question, question_intent, answer, topic, difficulty')
    .eq('id', answerId)
    .maybeSingle()

    if(error){
        throw error
    }
    return data
}

const storeQuestion = async(
    session_id, question, question_intent
) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .insert({
        session_id,
        question,
        question_intent
    })
    .select()
    .single()
    if(error){
        throw error
    }
    return data
}
const storeAnswer = async (
    questionId, answer
) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .update({answer})
    .eq('id',questionId)
    .select()
    .single()
    if (error) {
        throw error;
    }

    return data;
};

const getAnswerOnly = async(answer_id) => {
    const { data, error } = await supabase
      .from("interview_answers")
      .select("answer")
      .eq("id", answer_id)
      .maybeSingle();
      if(error){
        throw error
      }
      return data;
}

const getAllQA = async(sessionId) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .select('question, question_intent, answer')
    .eq('session_id',sessionId)

    if(error){
        throw error
    }
    return data;
}
export {
  getPreviousAnswers,
  storeAnswer,
  storeQuestion,
  getAnswerDetails,
  getAnswerOnly,
  getAllQA,
};

