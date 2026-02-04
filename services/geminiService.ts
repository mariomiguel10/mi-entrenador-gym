
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutConfig, Routine } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRoutine(config: WorkoutConfig): Promise<Routine> {
  const prompt = `
    Genera una rutina de ejercicios de fitness altamente personalizada y efectiva.
    PARÁMETROS DEL USUARIO:
    - Objetivo: ${config.objective} (Si es 'Perder Peso', prioriza ejercicios de alta intensidad/cardio metabólico. Si es 'Ganar Músculo', prioriza hipertrofia funcional. 'Resistencia' implica más reps y poco descanso).
    - Nivel: ${config.difficulty}
    - Duración Total: ${config.duration} minutos
    
    INSTRUCCIONES DE ESTRUCTURA:
    - Selecciona una lista de ejercicios (entre 4 y 8 según la duración).
    - Para cada ejercicio: nombre claro, sets, reps, descripción y tips técnicos.
    - IMPORTANTE: No inventes los tiempos de descanso en el JSON, usa exactamente estos valores proporcionados por el usuario:
      * Descanso entre series: ${config.restBetweenSets} segundos.
      * Descanso entre ejercicios: ${config.restBetweenExercises} segundos.
    
    El formato DEBE ser JSON estrictamente siguiendo el esquema.
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
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  sets: { type: Type.INTEGER },
                  reps: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technicalDetails: { type: Type.STRING },
                  imageUrl: { type: Type.STRING }
                },
                required: ["name", "sets", "reps", "description", "technicalDetails"]
              }
            }
          },
          required: ["focus", "exercises"]
        }
      }
    });

    const data = JSON.parse(response.text.trim()) as any;
    
    // Enrich with user settings and placeholder images
    const routine: Routine = {
      focus: data.focus,
      exercises: data.exercises.map((ex: any, idx: number) => ({
        ...ex,
        id: ex.id || `ex-${idx}`,
        restBetweenSets: config.restBetweenSets,
        restBetweenExercises: config.restBetweenExercises,
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&h=400&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };

    return routine;
  } catch (error) {
    console.error("Error generating routine:", error);
    throw error;
  }
}
