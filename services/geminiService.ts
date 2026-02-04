
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutConfig, Routine } from "../types.ts";

export async function generateRoutine(config: WorkoutConfig): Promise<Routine> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Eres un entrenador personal de élite. Diseña una rutina de entrenamiento de alta eficiencia.
    OBJETIVO: ${config.objective}
    DIFICULTAD: ${config.difficulty}
    TIEMPO: ${config.duration} minutos
    DESCANSOS: ${config.restBetweenSets}s entre series, ${config.restBetweenExercises}s entre ejercicios.
    
    REGLAS:
    - Selecciona entre 4 y 7 ejercicios clave.
    - Asegúrate de que el volumen de trabajo (series/reps) sea coherente con el objetivo y la dificultad.
    - Devuelve un JSON con 'focus' (un resumen motivador) y 'exercises'.
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
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&h=600&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
