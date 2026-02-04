
import React, { useState } from 'react';
import { Routine, Exercise } from '../types';
import Timer from './Timer';

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
  
  const handleNext = () => {
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

  const progress = ((currentIdx * 100) / routine.exercises.length) + ((currentSet * 100) / (routine.exercises.length * currentEx.sets));

  if (isResting) {
    const isNextEx = currentSet === currentEx.sets;
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <Timer 
          seconds={isNextEx ? routine.config.restBetweenExercises : routine.config.restBetweenSets}
          title={isNextEx ? "Siguiente Ejercicio" : "Descanso entre Series"}
          subtitle={isNextEx ? routine.exercises[currentIdx + 1]?.name : `Serie ${currentSet + 1} de ${currentEx.name}`}
          onComplete={handleRestEnd}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Barra de progreso global */}
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-100 z-50">
        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="relative h-64 sm:h-80">
          <img src={currentEx.imageUrl} className="w-full h-full object-cover" alt={currentEx.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-10">
            <h2 className="text-4xl font-black text-white">{currentEx.name}</h2>
            <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mt-2">{currentEx.category}</p>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serie</span>
              <span className="text-3xl font-black text-indigo-600">{currentSet} <span className="text-slate-300 text-lg">/ {currentEx.sets}</span></span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Objetivo</span>
              <span className="text-3xl font-black text-slate-800">{currentEx.reps}</span>
            </div>
          </div>

          <div className="mb-10">
            <button 
              onClick={() => setShowTechnical(!showTechnical)}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4"
            >
              {showTechnical ? 'Ocultar técnica' : 'Ver técnica correcta'}
              <svg className={`w-3 h-3 transform transition-transform ${showTechnical ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {showTechnical && (
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-slate-700 text-sm font-medium leading-relaxed italic">{currentEx.technicalDetails}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transform active:scale-95"
          >
            Completar Serie
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;
