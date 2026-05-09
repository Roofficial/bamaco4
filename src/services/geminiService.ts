import { GoogleGenAI, Type } from "@google/genai";

// Standard way to access GEMINI_API_KEY in this environment as per gemini-api skill
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SymptomAnalysis {
  possibleConditions: {
    name: string;
    likelihood: "Low" | "Medium" | "High";
    description: string;
  }[];
  recommendations: string[];
  urgency: "Routine" | "Urgent" | "Emergency";
}

export async function analyzeSymptoms(symptoms: string, history: string): Promise<SymptomAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following symptoms and medical history. Provide a structured medical assessment.
    Symptoms: ${symptoms}
    History: ${history}`,
    config: {
      systemInstruction: "You are a highly experienced medical triage AI. Your goal is to provide a preliminary assessment based on symptoms. Always include a disclaimer that this is not a final diagnosis and the user should consult a professional.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          possibleConditions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                likelihood: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                description: { type: Type.STRING }
              },
              required: ["name", "likelihood", "description"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          urgency: { type: Type.STRING, enum: ["Routine", "Urgent", "Emergency"] }
        },
        required: ["possibleConditions", "recommendations", "urgency"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getHealthInsights(data: any): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide personalized health insights based on this data: ${JSON.stringify(data)}`,
    config: {
      systemInstruction: "You are a health coach. Provide concise, actionable insights based on health tracking data and environmental factors like air quality."
    }
  });
  return response.text || "No insights available at this time.";
}
