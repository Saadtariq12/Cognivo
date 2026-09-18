import dotenv from "dotenv"
import OpenAI from "openai";
dotenv.config();
import evaluatorAgentPrompt from "../AgentsPrompts/evaluatorAgent.prompt.js";
import { GoogleGenAI } from "@google/genai";
import { OpenRouter } from "@openrouter/sdk";

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

        Candidate Answer:
        ${candidateAnswer || "Not provided"}

        `;
        const prompt = `
        ${evaluatorAgentPrompt}
        
        Here is the current interview context:
        
        ${runtimeContext}
        `;
        
            const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              },
            });
            const generatedEvaluation = JSON.parse(response.text);
        
            return generatedEvaluation;
        
    } catch (error) {
        console.log("error while evaluating answer by agent", error)
        throw error;
    }
};

export {evaluateAnswer}