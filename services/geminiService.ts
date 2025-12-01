import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchNextValue = async (): Promise<any> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return {
      value: Math.floor(Math.random() * 10) + 1,
      reasoning: "Simulation Mode: Random generation due to missing API key.",
      mood_vector: "SIMULATED"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a random "emotional state" value between 1 and 10 for a visualization system. 1 is calm/abstract, 10 is intense/chaotic. Provide a short scientific reasoning string.',
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.NUMBER, description: "A number between 1.0 and 10.0" },
            reasoning: { type: Type.STRING, description: "Scientific justification for this state change" },
            mood_vector: { type: Type.STRING, description: "Short hex code or vector name for the mood" }
          },
          required: ["value", "reasoning", "mood_vector"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of error
    return {
      value: 5.5,
      reasoning: "Error State: Fallback initiated.",
      mood_vector: "ERROR"
    };
  }
};
