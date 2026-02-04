
import React, { useState } from 'react';
import { Routine, Exercise } from '../types';
import Timer from './Timer';

interface WorkoutSessionProps {
  routine: Routine;
  onFinish: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ routine, onFinish }) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restType, setRestType] = useState<'set' | 'exercise'>('set');

  const currentExercise = routine.exercises[currentExerciseIdx];
  const nextExercise = routine.exercises[currentExerciseIdx + 1];

  const handleSetComplete = () => {
    if (currentSet < currentExercise.sets) {
      setRestType('set');
      setIsResting(true);
    } else {
      if (currentExerciseIdx < routine.exercises.length - 1) {
        setRestType('exercise');
        setIsResting(true);
      } else {
        onFinish();
      }
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    if (restType === 'set') {
      setCurrentSet(prev => prev + 1);
    } else {
      setCurrentExerciseIdx(prev => prev + 1);
      setCurrentSet(1);
    }
  };

  if (isResting) {
    const restTime = restType === 'set' 
      ? currentExercise.restBetweenSets 
      : currentExercise.restBetweenExercises;
    
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Timer 
          seconds={restTime} 
          title={restType === 'set' ? 'Descanso entre Series' : 'Siguiente Ejercicio'}
          subtitle={restType === 'set' ? `Siguiente: Serie ${currentSet + 1} de ${currentExercise.name}` : `Prepárate para: ${nextExercise.name}`}
          onComplete={handleRestComplete} 
        />
        
        {restType === 'exercise' && nextExercise && (
          <div className="mt-8 flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full animate-pulse">
            <img src={nextExercise.imageUrl} className="w-16 h-16 rounded-xl object-cover" alt="Preview" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">A continuación</p>
              <h4 className="font-bold text-slate-800">{nextExercise.name}</h4>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="relative h-72 sm:h-96 bg-slate-900">
          <img 
            src={currentExercise.imageUrl} 
            alt={currentExercise.name}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <div className="flex items-center gap-2 mb-3">
               <span className="px-3 py-1 bg-indigo-600 text-white rounded-full font-bold text-[10px] uppercase tracking-wider">
                Ejercicio {currentExerciseIdx + 1} de {routine.exercises.length}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">{currentExercise.name}</h2>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Serie</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-indigo-600">{currentSet}</span>
                <span className="text-lg font-bold text-slate-300">/ {currentExercise.sets}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Repeticiones</span>
              <span className="text-4xl font-black text-slate-800">{currentExercise.reps}</span>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Instrucciones</h4>
              <p className="text-slate-600 text-lg leading-relaxed">{currentExercise.description}</p>
            </section>
            
            <section className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100/50">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Técnica Pro
              </h4>
              <p className="text-slate-700 font-medium italic leading-relaxed">{currentExercise.technicalDetails}</p>
            </section>
          </div>

          <button
            onClick={handleSetComplete}
            className="w-full mt-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black rounded-3xl transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 group"
          >
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;
