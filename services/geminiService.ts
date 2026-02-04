
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutConfig, Routine } from "../types";

export async function generateRoutine(config: WorkoutConfig): Promise<Routine> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Eres un entrenador personal de élite. Genera una rutina de entrenamiento optimizada.
    OBJETIVO: ${config.objective}
    NIVEL: ${config.difficulty}
    TIEMPO: ${config.duration} minutos
    
    INSTRUCCIONES:
    - Si el objetivo es 'Perder Peso', usa circuitos metabólicos de alta intensidad.
    - Si es 'Ganar Músculo', usa rangos de hipertrofia funcional.
    - El número de ejercicios debe ser ideal para ${config.duration} min (entre 4-8).
    - Los descansos ya están definidos por el usuario: ${config.restBetweenSets}s entre series y ${config.restBetweenExercises}s entre ejercicios.
    
    Devuelve un JSON con 'focus' (un resumen de la sesión) y 'exercises'.
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
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&h=600&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
