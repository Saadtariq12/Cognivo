import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import contextExtractorAgentPrompt from "../AgentsPrompts/contextExtractorAgent.prompt.js";

// Initialize Gemini AI client with API key
const ai = new GoogleGenAI({
  apiKey: process.env.CONTEXT_EXTRACTOR_API_KEY,
});

/**
 * Extracts structured candidate information from the candidate's introduction answer
 * 
 * @param {Object} params - The parameters for context extraction
 * @param {string} params.candidateAnswer - The candidate's introduction answer
 * @param {string} [params.jobRequirements] - Optional job requirements for context
 * @returns {Promise<Object>} - Structured extraction with introduction, projects, and skills
 */
const extractContext = async ({ candidateAnswer, jobRequirements }) => {
  try {
    // Build runtime context with candidate's answer and optional job requirements
    const runtimeContext = `
Candidate Answer:
${candidateAnswer || "Not provided"}

Job Requirements:
${jobRequirements || "Not provided"}
`;

    // Combine static prompt with runtime context
    const prompt = `
${contextExtractorAgentPrompt}

Here is the candidate's introduction answer:

${runtimeContext}
`;

    // Call Gemini API to extract structured information
    const response = await ai.models.generateContent({
      model: "Gemini 2.5 Flash Native Audio Dialog",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Parse and return the JSON response
    const extractedContext = JSON.parse(response.text);

    return extractedContext;
  } catch (error) {
    console.error("Context Extractor Agent Error:", error);
    throw error;
  }
};

export { extractContext };
