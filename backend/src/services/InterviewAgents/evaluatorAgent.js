import dotenv from "dotenv"
dotenv.config();
import evaluatorAgentPrompt from "../AgentsPrompts/evaluatorAgent.prompt.js";
import { GoogleGenAI } from "@google/genai";
import {generateWithOllama} from "../LLM/ollamaService.js"
const ai = new GoogleGenAI({
  apiKey: process.env.EVALUATOR_API_KEY,
});

const evaluateAnswer = async ({
  jobRequirements,
  currentInterviewStage,
  currentQuestion,
  currentQuestionIntent,
  currentTopic,
  currentDifficulty,
  candidateAnswer,
  questionsAskedInCurrentStage,
  stageQuestionLimit,
}) => {
    try {
        const runtimeContext = `

        Job Requirements:
        ${jobRequirements || "Not provided"}

        Current Interview Stage:
        ${currentInterviewStage}

        Current Question:
        ${currentQuestion || "Not provided"}

        Current Question Intent:
        ${currentQuestionIntent || "Not provided"}

        Current Topic:
        ${currentTopic || "Not provided"}

        Current Difficulty:
        ${currentDifficulty || "medium"}

        Questions Asked In Current Stage:
        ${questionsAskedInCurrentStage}

        Stage Question Limit:
        ${stageQuestionLimit}

        Candidate Answer:
        ${candidateAnswer || "Not provided"}

        `;
        const prompt = `
        ${evaluatorAgentPrompt}
        
        Here is the current interview context:
        
        ${runtimeContext}
        `;
        
            const response = generateWithOllama(prompt);

            const generatedEvaluation = JSON.parse(response.message.content);
        
            return generatedEvaluation;
        
    } catch (error) {
        console.log("error while evaluating answer by agent", error)
        throw error;
    }
};

export {evaluateAnswer}