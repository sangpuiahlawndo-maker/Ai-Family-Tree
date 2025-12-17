
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingSource } from "../types";

// Create client only when needed to ensure latest API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function editFamilyImage(imageData: string, prompt: string): Promise<string | null> {
  try {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Please edit this family photo based on this request: ${prompt}. Return the edited image.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    return null;
  }
}

export async function researchFamilyHistory(query: string): Promise<{ text: string, sources: GroundingSource[] }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No specific details found in search records.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Heritage Archive',
        uri: chunk.web?.uri || '#'
      }));

    return { text, sources };
  } catch (error) {
    console.error("Search grounding error:", error);
    return { text: "Failed to connect to global heritage databases. Please check your connection.", sources: [] };
  }
}
