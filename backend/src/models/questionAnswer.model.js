import {supabase} from "../config/database.js"

const getPreviousAnswers = async (previous_answer_id) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .select("question, answer")
    .eq("id", previous_answer_id)
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
    session_id, question, question_intent, topic, difficulty
) => {
    const {data,error} = await supabase
    .from('interview_answers')
    .insert({
        session_id,
        question,
        question_intent,
        topic,
        difficulty,
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

const getQuestionsAskedInStage = async (sessionId, stage) => {
    const { data: questions, error: questionsError } = await supabase
      .from('interview_answers')
      .select('id')
      .eq('session_id', sessionId)
      .not('answer', 'is', null)

    if (questionsError) {
      throw questionsError;
    }

    const { data: evaluations, error: evaluationsError } = await supabase
      .from('evaluations')
      .select('answer_id, current_interview_stage')
      .eq('session_id', sessionId);

    if (evaluationsError) {
      throw evaluationsError;
    }

    const stageByAnswerId = new Map(
      evaluations.map((evaluation) => [
        evaluation.answer_id,
        evaluation.current_interview_stage,
      ]),
    );

    let questionStage = 'introduction';
    let questionsAsked = 0;

    questions.forEach((question, index) => {
      if (questionStage === stage) {
        questionsAsked += 1;
      }

      const evaluatedNextStage = stageByAnswerId.get(question.id);
      if (evaluatedNextStage) {
        questionStage = evaluatedNextStage;
      } else if (index === 0) {
        // The existing introduction flow does not store an evaluation.
        questionStage = 'technical';
      }
    });

    return questionsAsked;
};
export {
  getPreviousAnswers,
  storeAnswer,
  storeQuestion,
  getAnswerDetails,
  getAnswerOnly,
  getAllQA,
  getQuestionsAskedInStage,
};

