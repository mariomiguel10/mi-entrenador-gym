
export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';
export type Objective = 'Perder Peso' | 'Ganar Músculo' | 'Tonificar' | 'Resistencia';
export type Duration = 15 | 30 | 45 | 60;

export interface WorkoutConfig {
  difficulty: Difficulty;
  objective: Objective;
  duration: Duration;
  restBetweenSets: number; // in seconds
  restBetweenExercises: number; // in seconds
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  description: string;
  technicalDetails: string;
  imageUrl: string;
  restBetweenSets: number;
  restBetweenExercises: number;
}

export interface Routine {
  focus: string;
  exercises: Exercise[];
}

export type ViewState = 'config' | 'loading' | 'overview' | 'active' | 'finished';
