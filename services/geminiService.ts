import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { GroundingMetadata } from '../types';
import { GEMINI_MODEL_TEXT, GEMINI_JSON_RESPONSE_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Variable d'environnement API_KEY non définie. Les appels à l'API Gemini échoueront.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface GeminiRepositoryAnalysisResponse {
  analysis: string;
  rating: number; // Note de 0 à 10, -1 si erreur d'évaluation
}

export const analyzeRepositoryWithGemini = async (
  userPrompt: string
): Promise<{ analysis: string; rating: number; groundingMetadata?: GroundingMetadata }> => {
  if (!API_KEY) {
    throw new Error("API_KEY non configurée. Impossible d'analyser le dépôt.");
  }
  if (!userPrompt.trim()) {
    throw new Error("Le prompt pour l'analyse ne peut pas être vide.");
  }

  const fullPrompt = `${userPrompt.trim()}\n${GEMINI_JSON_RESPONSE_INSTRUCTION}`;

  try {
    const contents: Content[] = [{ role: "user", parts: [{text: fullPrompt}] }];
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: contents,
      config: {
        responseMimeType: "application/json", 
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    let parsedData: GeminiRepositoryAnalysisResponse;
    try {
        parsedData = JSON.parse(jsonStr);
    } catch (e) {
        console.error('Réponse Gemini non JSON ou malformée:', jsonStr, e);
        throw new Error("L'analyse Gemini a retourné une réponse malformée. Veuillez réessayer. Contenu brut: " + jsonStr.substring(0,100) + "...");
    }

    if (typeof parsedData.analysis !== 'string' || typeof parsedData.rating !== 'number') {
        console.error('Champs manquants ou de type incorrect dans la réponse JSON de Gemini:', parsedData);
        throw new Error("L'analyse Gemini n'a pas retourné tous les champs attendus (analyse et note).");
    }
    
    if (parsedData.rating < -1 || parsedData.rating > 10) {
        console.warn(`Note Gemini (${parsedData.rating}) en dehors de la plage attendue [-1, 10]. Ajustement à -1.`);
        parsedData.rating = -1; 
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    
    return { 
        analysis: parsedData.analysis, 
        rating: parsedData.rating, 
        groundingMetadata 
    };

  } catch (error) {
    console.error('Erreur lors de l\'analyse du dépôt avec Gemini :', error);
    if (error instanceof Error) {
        throw new Error(`${error.message}`);
    }
    throw new Error('Une erreur inconnue est survenue lors de l\'analyse du dépôt avec Gemini.');
  }
};