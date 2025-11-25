import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// In a real scenario, handle missing key gracefully, potentially disabling AI features.
const ai = new GoogleGenAI({ apiKey });

export const optimizeForInstagram = async (text: string): Promise<string> => {
  if (!apiKey) return "Erro: API Key não configurada.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um especialista em Marketing Digital e RH. 
      Analise o seguinte texto de uma vaga de emprego e resuma-o em 3 a 4 bullet points curtos e impactantes (máximo 40 caracteres cada).
      O tom deve ser direto, energético e estilo "Anúncio Patrocinado".
      Responda APENAS com os bullet points.
      
      Texto Original:
      ${text}`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao otimizar texto. Tente novamente.";
  }
};

export const improveText = async (text: string, type: 'title' | 'description'): Promise<string> => {
  if (!apiKey) return text;

  try {
    const prompt = type === 'title' 
      ? `Reescreva o seguinte título de vaga de emprego para ser mais atrativo, profissional e persuasivo em Português do Brasil. Mantenha curto. Texto: "${text}"`
      : `Melhore o seguinte texto descritivo de vaga para torná-lo mais engajador e claro, corrigindo erros gramaticais. Texto: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.replace(/"/g, '').trim() || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};