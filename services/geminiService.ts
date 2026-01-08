import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { LeadScore } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (aiInstance) return aiInstance;

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    throw new Error("Gemini API Key is missing");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
};

export const generateLeadScore = async (
  companyName: string,
  industry: string,
  observations: string
): Promise<LeadScore | null> => {
  try {
    const ai = getAI();
    const prompt = `
      Analyze this prospect for Yourgency (Marketing Agency for Home Services).
      Company: ${companyName}
      Industry: ${industry}
      Observations: ${observations}

      Return a JSON object with scores (1-10) for:
      - fit (Service alignment, size)
      - need (Website quality, SEO presence, AI visibility)
      - timing (Seasonality, buying signals)
      - readiness (Budget, attitude)

      Also calculate the composite score: (Fit * 2 + Need * 3 + Timing * 2 + Readiness * 3) / 10.
      Provide a short 'rationale' string summarizing why.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fit: { type: Type.NUMBER },
            need: { type: Type.NUMBER },
            timing: { type: Type.NUMBER },
            readiness: { type: Type.NUMBER },
            composite: { type: Type.NUMBER },
            rationale: { type: Type.STRING },
          },
          required: ["fit", "need", "timing", "readiness", "composite", "rationale"]
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as LeadScore;
    }
    return null;
  } catch (error) {
    console.error("Error scoring lead:", error);
    return null;
  }
};

export const generateDeepAnalysis = async (
  companyName: string,
  industry: string,
  observations: string
): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `
      Perform a deep strategic analysis for this prospect using your advanced reasoning capabilities.
      Company: ${companyName}
      Industry: ${industry}
      Observations: ${observations}
      
      Provide a comprehensive report covering:
      1. Hidden opportunities in their market.
      2. Specific competitive weaknesses inferred from the observations.
      3. A step-by-step 90-day domination plan.
      4. Potential objections and how to counter them psychologically.
      
      Be extremely detailed and tactical.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    return response.text || "Could not generate deep analysis.";
  } catch (error) {
    console.error("Error generating deep analysis:", error);
    return "Error generating analysis. Please try again.";
  }
};

export const chatWithYourgency = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  useMaps: boolean = false
) => {
  try {
    let model = 'gemini-3-flash-preview';
    let tools: any[] | undefined = undefined;

    if (useMaps) {
      model = 'gemini-2.5-flash';
      tools = [{ googleMaps: {} }];
    }

    const ai = getAI();
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });

    return {
      text: response.text || "No response generated.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};

export const draftOutreachEmail = async (
  companyName: string,
  painPoints: string[],
  stage: string
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a short, punchy outreach email for ${companyName}.
      Stage: ${stage}.
      Pain Points observed: ${painPoints.join(', ')}.
      Focus on value, not features. Mention Yourgency's specific expertise in their trade.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "Could not generate email.";
  } catch (error) {
    console.error("Error drafting email", error);
    return "Error generating email.";
  }
}

export const generateMorningBrief = async (
  prospects: any[]
): Promise<{
  summary: string;
  actionItems: string[];
  risks: string[];
} | null> => {
  try {
    const ai = getAI();
    // Filter for relevant context to save tokens/noise
    const activeDeals = prospects.filter(p =>
      p.stage !== 'CLOSED_LOST' &&
      p.stage !== 'CLOSED_WON'
    ).map(p => ({
      name: p.companyName,
      stage: p.stage,
      score: p.score?.composite || 'N/A',
      lastContact: p.lastContact || 'Never',
      revenue: p.revenueRange
    }));

    const prompt = `
        Act as a high-performance Sales Director. Generate a "Morning Brief" for the user based on their active pipeline.
        
        Active Pipeline Context:
        ${JSON.stringify(activeDeals)}

        Task:
        1. identifying 3 critical "Action Items" (e.g. stalled deals, high-value opportunities).
        2. identifying 2-3 "Risks" (e.g. deals rotting in prospect stage, missing follow-ups).
        3. writing a 2-sentence motivational summary of the pipeline health.

        Output purely valid JSON:
        {
            "summary": "...",
            "actionItems": ["...", "..."],
            "risks": ["...", "..."]
        }
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Error generating morning brief:", error);
    return null;
  }
};