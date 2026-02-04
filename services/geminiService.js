
import { GoogleGenAI, Type } from "@google/genai";

export async function generateRoutine(config) {
  // Inicialización directa según directrices
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como entrenador personal experto, genera una rutina de fitness en formato JSON.
    Objetivo: ${config.objective}
    Nivel de experiencia: ${config.difficulty}
    Tiempo disponible: ${config.duration} minutos
    Descanso entre series solicitado: ${config.restBetweenSets} segundos
    Descanso entre ejercicios solicitado: ${config.restBetweenExercises} segundos

    REGLAS:
    - El número de ejercicios debe ser proporcional al tiempo (mínimo 4, máximo 8).
    - Incluye ejercicios variados y seguros para el nivel indicado.
    - Las repeticiones deben ser acordes al objetivo (ej. 8-12 para ganar músculo, +15 para resistencia).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focus: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  reps: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technicalDetails: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "description", "technicalDetails"]
              }
            }
          },
          required: ["focus", "exercises"]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    
    return {
      focus: data.focus,
      exercises: data.exercises.map((ex, idx) => ({
        ...ex,
        id: `ex-${idx}`,
        category: ex.category || 'Fuerza',
        restBetweenSets: config.restBetweenSets,
        restBetweenExercises: config.restBetweenExercises,
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&h=400&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };
  } catch (error) {
    console.error("Gemini SDK Error:", error);
    throw error;
  }
}
