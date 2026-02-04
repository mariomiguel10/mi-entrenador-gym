
import { GoogleGenAI, Type } from "@google/genai";

// Inicialización segura. Si process.env.API_KEY no existe, el shim en index.html evita el crash.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key no encontrada. La generación de rutinas podría fallar.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

export async function generateRoutine(config) {
  const ai = getAIClient();
  
  const prompt = `
    Genera una rutina de fitness altamente personalizada en JSON.
    Objetivo: ${config.objective}
    Nivel: ${config.difficulty}
    Duración: ${config.duration} min
    Descanso series sugerido: ${config.restBetweenSets}s
    Descanso ejercicios sugerido: ${config.restBetweenExercises}s

    Para cada ejercicio, asígnale una categoría obligatoria entre: 'Cardio', 'Fuerza', 'Flexibilidad'.
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
                  category: { type: Type.STRING, description: "Uno de: Cardio, Fuerza, Flexibilidad" }
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
        category: ex.category || 'Fuerza',
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
