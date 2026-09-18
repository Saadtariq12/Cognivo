import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import questionAgentPrompt from "../AgentsPrompts/questionAgent.prompt.js";

const ai = new GoogleGenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

const generateQuestion = async ({
  candidateIntroduction,
  candidateProjects,
  candidateSkills,
  jobRequirements,
  currentInterviewStage,
  currentTopic,
  moveToNextTopic,
  currentDifficulty,
  increaseDifficulty,
  previousQuestionAndAnswer,
}) => {
  try {
    const runtimeContext = `
    Candidate Introduction:
    ${candidateIntroduction || "Not provided"}

    Candidate Projects:
    ${candidateProjects || "Not provided"}

    Candidate Skills:
    ${candidateSkills || "Not provided"}

    Job Requirements:
    ${jobRequirements || "Not provided"}

    Current Interview Stage:
    ${currentInterviewStage || "Introduction"}

    Current Topic:
    ${currentTopic || "Not provided"}

    Move To Next Topic:
    ${moveToNextTopic || "Not provided"}

    Current Difficulty:
    ${currentDifficulty || "easy"}

    Previous Questions and Answers:
    ${JSON.stringify(previousQuestionAndAnswer || [])}
    `;

        const prompt = `
    ${questionAgentPrompt}

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

    const generatedQuestion = JSON.parse(response.text);

    return generatedQuestion;
  } catch (error) {
    console.error("Question Agent Error:", error);

    throw error;
  }
};

export { generateQuestion };
