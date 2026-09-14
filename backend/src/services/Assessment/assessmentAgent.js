import dotenv from "dotenv";
dotenv.config();
import assessmentAgentPrompt from "../AgentsPrompts/assessmentAgent.prompt.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.ASSESSMENT_API_KEY,
});

const createFinalAssessment = async ({
  candidateIntroduction,
  candidateProjects,
  candidateSkills,
  jobRequirements,
  interviewData, // question, question_intent, candidate_answer, evaluation
  evaluationData
}) => {
  try {
    const runtimeContext = `

        Candidate Introduction:
        ${candidateIntroduction}

        Candidate Projects:
        ${candidateProjects}

        Candidate Skills:
        ${candidateSkills}

        Job Requirements:
        ${jobRequirements}

        Interview Data:
        ${JSON.stringify(interviewData || [])}  

        Evaluation Data:
        ${JSON.stringify(evaluationData || [])}  
        
        `;
    const prompt = `
        ${assessmentAgentPrompt}
        here is the interview context:
        ${runtimeContext}
        `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const generatedAssessment = JSON.parse(response.text);

    return generatedAssessment;
  } catch (error) {
    console.log("error in assessment agent: ", error);
    throw error;
  }
};

export {createFinalAssessment}