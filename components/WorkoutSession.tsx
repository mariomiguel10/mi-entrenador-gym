
import React, { useState } from 'react';
import { Routine, Exercise } from '../types.ts';
import Timer from './Timer.tsx';

interface WorkoutSessionProps {
  routine: Routine;
  onFinish: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ routine, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  const currentEx = routine.exercises[currentIdx];
  const totalSetsInRoutine = routine.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = routine.exercises.slice(0, currentIdx).reduce((acc, ex) => acc + ex.sets, 0) + (currentSet - 1);
  const progressPercent = (completedSets / totalSetsInRoutine) * 100;

  const handleSetComplete = () => {
    if (currentSet < currentEx.sets) {
      setIsResting(true);
    } else {
      if (currentIdx < routine.exercises.length - 1) {
        setIsResting(true);
      } else {
        onFinish();
      }
    }
  };

  const handleRestEnd = () => {
    setIsResting(false);
    if (currentSet < currentEx.sets) {
      setCurrentSet(s => s + 1);
    } else {
      setCurrentIdx(i => i + 1);
      setCurrentSet(1);
    }
    setShowTechnical(false);
  };

  if (isResting) {
    const isExerciseChange = currentSet === currentEx.sets;
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-500">
        <Timer 
          seconds={isExerciseChange ? routine.config.restBetweenExercises : routine.config.restBetweenSets}
          title={isExerciseChange ? "Siguiente Ejercicio" : "Recuperación"}
          subtitle={isExerciseChange ? routine.exercises[currentIdx + 1]?.name : `Prepárate para la Serie ${currentSet + 1}`}
          onComplete={handleRestEnd}
        />
        <div className="mt-10 px-4">
           <div className="flex justify-between mb-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Esfuerzo completado</span>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{Math.round(progressPercent)}%</span>
           </div>
           <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
             <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-right-10 duration-500">
      {/* Barra de progreso superior fija */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 z-[100]">
        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="relative h-72 sm:h-[450px]">
          <img src={currentEx.imageUrl} className="w-full h-full object-cover" alt={currentEx.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <span className="inline-block self-start px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase mb-3 tracking-widest">{currentEx.category}</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">{currentEx.name}</h2>
          </div>
        </div>

        <div className="p-8 sm:p-14">
          <div className="grid grid-cols-2 gap-6 mb-12 text-center">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serie Actual</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-indigo-600 tracking-tighter">{currentSet}</span>
                <span className="text-xl font-bold text-slate-300">/ {currentEx.sets}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Repeticiones</span>
              <span className="text-5xl font-black text-slate-800 tracking-tighter">{currentEx.reps}</span>
            </div>
          </div>

          <div className="mb-12">
             <button onClick={() => setShowTechnical(!showTechnical)} className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100 transition-colors border border-slate-100">
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Detalles de Técnica</span>
                <svg className={`w-5 h-5 text-indigo-500 transform transition-transform ${showTechnical ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
             </button>
             {showTechnical && (
               <div className="mt-4 p-8 bg-indigo-50/40 rounded-3xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                  <p className="text-slate-700 text-lg font-medium leading-relaxed italic mb-4">{currentEx.description}</p>
                  <div className="text-sm font-bold text-indigo-600 border-l-4 border-indigo-200 pl-4">{currentEx.technicalDetails}</div>
               </div>
             )}
          </div>

          <button onClick={handleSetComplete} className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-indigo-100 transition-all transform active:scale-[0.98] hover:bg-indigo-700">Completar Serie</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;
