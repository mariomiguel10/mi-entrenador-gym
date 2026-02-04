
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutConfig, Routine } from "../types.ts";

export async function generateRoutine(config: WorkoutConfig): Promise<Routine> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Eres un entrenador personal de élite de SmartFit AI. Diseña una rutina de entrenamiento avanzada.
    OBJETIVO ESPECÍFICO: ${config.objective}
    NIVEL DE DIFICULTAD: ${config.difficulty}
    TIEMPO ESTIMADO: ${config.duration} minutos
    DESCANSO ENTRE SERIES: ${config.restBetweenSets} segundos
    DESCANSO ENTRE EJERCICIOS: ${config.restBetweenExercises} segundos
    
    INSTRUCCIONES:
    - Diseña entre 4 y 7 ejercicios que maximicen el tiempo disponible.
    - Las repeticiones deben ser acordes al objetivo (ej: 8-12 para hipertrofia, 15-20 para resistencia).
    - Los detalles técnicos deben centrarse en la seguridad biomecánica.
    
    Devuelve un JSON estrictamente estructurado con 'focus' y 'exercises'.
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

    const data = JSON.parse(response.text || '{}');
    
    return {
      focus: data.focus,
      config: config,
      exercises: data.exercises.map((ex: any, idx: number) => ({
        ...ex,
        id: `ex-${idx}`,
        category: ex.category || 'Fuerza',
        imageUrl: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&h=600&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };
  } catch (error) {
    console.error("Gemini Engine Error:", error);
    throw error;
  }
}
