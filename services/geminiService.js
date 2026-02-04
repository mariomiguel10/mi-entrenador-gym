
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRoutine(config) {
  const prompt = `
    Genera una rutina de fitness personalizada en JSON.
    Objetivo: ${config.objective}
    Nivel: ${config.difficulty}
    Duración: ${config.duration} min
    Descanso series: ${config.restBetweenSets}s
    Descanso ejercicios: ${config.restBetweenExercises}s
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            focus: { type: "STRING" },
            exercises: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  sets: { type: "INTEGER" },
                  reps: { type: "STRING" },
                  description: { type: "STRING" },
                  technicalDetails: { type: "STRING" }
                }
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
        restBetweenSets: config.restBetweenSets,
        restBetweenExercises: config.restBetweenExercises,
        imageUrl: `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&h=400&auto=format&fit=crop&exercise=${encodeURIComponent(ex.name)}`
      }))
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
