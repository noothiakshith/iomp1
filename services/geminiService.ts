import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from "../constants";

// Attempt to get API_KEY from environment variables.
// As per instructions, assume this variable is pre-configured and accessible in the execution context.
// In a standard browser-only frontend, `process.env` is not typically available unless injected by a build tool.
// For this service to work with real API calls, API_KEY must be resolvable.
const API_KEY = typeof process !== 'undefined' && process.env && process.env.API_KEY 
                ? process.env.API_KEY 
                : undefined;

let ai: GoogleGenAI | null = null;
let initError: Error | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log("GoogleGenAI client initialized successfully with API_KEY.");
  } catch (error: any) {
    console.error("Failed to initialize GoogleGenAI with API_KEY. Ensure the key is valid. Falling back to error state.", error);
    initError = error;
    ai = null; 
  }
} else {
  const warnMsg = "Gemini API key (process.env.API_KEY) is not available in the execution context. GeminiService will not be able to make real API calls.";
  console.warn(warnMsg);
  initError = new Error(warnMsg);
}

export const askQuestionToModel = async (
  promptContent: string
): Promise<string> => {
  if (!ai) {
    const unavailableMsg = "Gemini AI service is not available. API key might be missing, invalid, or client failed to initialize.";
    console.error(unavailableMsg, initError);
    // Instead of returning a mock string, reject the promise to allow for proper error handling in App.tsx
    return Promise.reject(new Error(unavailableMsg + (initError ? ` Details: ${initError.message}` : '')));
  }

  // Attempt actual API call
  try {
    console.log(`Attempting actual Gemini API call with model ${GEMINI_MODEL_TEXT}...`);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: promptContent,
    });
    
    // Accessing the text directly as per the @google/genai guidelines for GenerateContentResponse
    return response.text;

  } catch (error: any) {
    console.error("Error calling actual Gemini API:", error);
    let errorMessage = "Sorry, an error occurred while communicating with the AI.";
    if (error.message) {
        if (error.message.includes("API key not valid")) {
            errorMessage = "Error: The configured Gemini API key is not valid. (Actual API Error)";
        } else if (error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit")) {
            errorMessage = "Error: Gemini API quota or rate limit exceeded. Please try again later. (Actual API Error)";
        } else {
            errorMessage = `Error: ${error.message} (Actual API Error)`;
        }
    }
    // Reject the promise to allow for proper error handling in App.tsx
    return Promise.reject(new Error(errorMessage));
  }
};
