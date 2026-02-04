
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutConfig, Routine, Exercise } from "../types";

export async function generateRoutine(config: WorkoutConfig): Promise<Routine> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Actúa como un entrenador personal de élite. Crea una rutina de entrenamiento personalizada.
    OBJETIVO: ${config.objective}
    DIFICULTAD: ${config.difficulty}
    TIEMPO: ${config.duration} minutos
    
    REGLAS:
    - Para 'Perder Peso', prioriza ejercicios multiarticulares con poco descanso.
    - Para 'Ganar Músculo', enfócate en hipertrofia progresiva.
    - Incluye entre 4 y 7 ejercicios que encajen en el tiempo total.
    - Los descansos deben ser: ${config.restBetweenSets}s entre series y ${config.restBetweenExercises}s entre cambios de ejercicio.
    
    Devuelve un JSON con 'focus' y 'exercises'.
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
      exercises: data.exercises.map((ex: any, idx: number) => ({
        ...ex,
        id: `ex-${idx}`,
        category: ex.category || 'Fuerza',
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&h=600&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      })),
      config: config
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
