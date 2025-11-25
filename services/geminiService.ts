import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { fileToGenerativePart } from "../utils/fileHelper";

export const analyzeAppVideo = async (
  videoFiles: File[],
  userPrompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (videoFiles.length === 0) {
    throw new Error("No video files provided.");
  }

  // Convert all videos to base64 parts in parallel
  const videoParts = await Promise.all(
    videoFiles.map(async (file) => {
      const videoBase64 = await fileToGenerativePart(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: videoBase64
        }
      };
    })
  );
  
  // Prepare contents
  // We use gemini-2.5-flash for excellent video understanding and speed.
  // We attach user text prompt first, then all video parts.
  const modelId = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: userPrompt ? 
              `Context provided by user: "${userPrompt}". \n\nThe user has provided ${videoFiles.length} video part(s). Analyze them as a continuous sequence to understand the full app functionality.` : 
              `Analyze the attached ${videoFiles.length} video part(s) as a continuous demonstration of the app. Identify all features and flows.`
          },
          ...videoParts
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature for more factual analysis
      }
    });

    return response.text || "No analysis generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Improved error messages
    if (error.message?.includes("401") || error.message?.includes("UNAUTHENTICATED")) {
       throw new Error("Authentication failed. The API Key provided is invalid or expired.");
    }
    if (error.message?.includes("413") || error.message?.includes("Payload Too Large")) {
      throw new Error("The video data is too large for the API request. Please reduce the video size or length.");
    }
    
    throw new Error(error.message || "An unexpected error occurred during analysis.");
  }
};