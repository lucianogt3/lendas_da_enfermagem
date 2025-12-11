import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Rarity } from "../types";

// Helper to initialize AI
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to strip Markdown code blocks from JSON response
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  // Remove markdown code blocks if present (```json ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/, "").replace(/```$/, "");
  }
  return cleaned;
};

export const generateQuizQuestion = async (
  topic: string,
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
): Promise<QuizQuestion> => {
  try {
    const ai = getAI();
    // Prompt extremamente simplificado e direto para evitar erros de formatação
    const prompt = `
      Gere UMA pergunta de quiz para enfermagem.
      Tópico: ${topic}
      Dificuldade: ${difficulty}
      
      IMPORTANTE: Responda APENAS com o JSON cru. Sem markdown, sem explicações extras.
      Formato obrigatório:
      {
        "question": "Texto da pergunta aqui?",
        "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
        "correctIndex": 0,
        "explanation": "Por que a opção 1 está correta."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
        // Force low temperature for deterministic formatting
        temperature: 0.2, 
      },
    });

    const rawText = response.text || "{}";
    const cleanedText = cleanJson(rawText);
    const data = JSON.parse(cleanedText);
    
    // Validação básica
    if (!data.question || !Array.isArray(data.options)) {
        throw new Error("JSON Inválido retornado pela IA");
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      difficulty,
      topic,
      question: data.question,
      options: data.options,
      correctIndex: typeof data.correctIndex === 'number' ? data.correctIndex : 0,
      explanation: data.explanation || "Sem explicação."
    };
  } catch (error) {
    console.error("Error generating question:", error);
    // Fallback question if API fails - evita travar a UI
    return {
      id: "fallback-" + Date.now(),
      question: `(Fallback) Qual é a conduta padrão em ${topic}?`,
      options: ["Verificar sinais vitais", "Ignorar sintomas", "Alta imediata", "Aguardar 24h"],
      correctIndex: 0,
      explanation: "A IA encontrou um erro momentâneo, mas a verificação de sinais vitais é sempre crucial.",
      difficulty: difficulty,
      topic: topic
    };
  }
};

export const generateStickerImage = async (
  prompt: string,
  rarity: Rarity
): Promise<string> => {
  try {
    const ai = getAI();
    
    const fullPrompt = `
      Medical illustration sticker of: ${prompt}. 
      Style: Clean vector art, vibrant colors, white sticker contour/border, isolated on white background. 
      Professional medical aesthetic but gamified.
      Rarity Level Visuals: ${rarity}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: fullPrompt }]
      },
    });
    
    // Find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("No image generated");

  } catch (error) {
    console.error("Error generating sticker:", error);
    return `https://picsum.photos/300/300?random=${Math.random()}`;
  }
};
