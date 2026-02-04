
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import Timer from './Timer.js';

const html = htm.bind(React.createElement);

const WorkoutSession = ({ routine, onFinish, onUpdate, initialState }) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(initialState?.exerciseIdx || 0);
  const [currentSet, setCurrentSet] = useState(initialState?.set || 1);
  const [isResting, setIsResting] = useState(false);
  const [restType, setRestType] = useState('set');
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentExercise = routine.exercises[currentExerciseIdx];
  const nextExercise = routine.exercises[currentExerciseIdx + 1];

  useEffect(() => {
    if (onUpdate) {
      onUpdate({ routine, exerciseIdx: currentExerciseIdx, set: currentSet });
    }
  }, [currentExerciseIdx, currentSet, routine, onUpdate]);

  const handleSetComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
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
      setShowDetails(false);
    }, 200);
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

  const totalSets = routine.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = routine.exercises.slice(0, currentExerciseIdx).reduce((acc, ex) => acc + ex.sets, 0) + (currentSet - 1);
  const progressPercent = (completedSets / totalSets) * 100;

  if (isResting) {
    const restTime = restType === 'set' 
      ? currentExercise.restBetweenSets 
      : currentExercise.restBetweenExercises;
    
    return html`
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <${Timer} 
          seconds=${restTime} 
          title=${restType === 'set' ? 'Descanso entre Series' : 'Siguiente Ejercicio'}
          subtitle=${restType === 'set' ? `Siguiente: Serie ${currentSet + 1}` : nextExercise?.name}
          onComplete=${handleRestComplete} 
        />
        <div className="mt-8 w-full max-w-md">
           <div className="flex justify-between mb-2 px-1">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso Total</span>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">${Math.round(progressPercent)}%</span>
           </div>
           <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
             <div className="h-full bg-indigo-600 transition-all duration-500" style=${{ width: `${progressPercent}%` }}></div>
           </div>
        </div>
      </div>
    `;
  }

  return html`
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-20">
          <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style=${{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="relative h-72 sm:h-96 bg-slate-900">
          <img src=${currentExercise.imageUrl} alt=${currentExercise.name} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <span className="inline-block self-start px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase mb-3">${currentExercise.category}</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">${currentExercise.name}</h2>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-6 mb-10 text-center">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Serie Actual</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-indigo-600">${currentSet}</span>
                <span className="text-lg font-bold text-slate-300">/ ${currentExercise.sets}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Repeticiones</span>
              <span className="text-4xl font-black text-slate-800">${currentExercise.reps}</span>
            </div>
          </div>

          <div className="mb-10">
            <button 
              onClick=${() => setShowDetails(!showDetails)}
              className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">¿Cómo se hace?</span>
              <svg className=${`w-5 h-5 text-indigo-500 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            ${showDetails && html`
              <div className="mt-4 p-8 bg-indigo-50/30 rounded-3xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-6">
                  <p className="text-slate-600 text-base leading-relaxed font-medium">${currentExercise.description}</p>
                  <div className="pt-4 border-t border-indigo-100/50 italic text-slate-700 font-semibold pl-4 border-l-4 border-indigo-200">${currentExercise.technicalDetails}</div>
                </div>
              </div>
            `}
          </div>

          <button 
            onClick=${handleSetComplete} 
            className=${`w-full py-6 bg-indigo-600 text-white text-xl font-black rounded-[2rem] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 ${isAnimating ? 'scale-95 bg-indigo-700' : 'active:scale-95 hover:bg-indigo-700'}`}
          >
            ${currentSet === currentExercise.sets && currentExerciseIdx === routine.exercises.length - 1 ? 'Finalizar Entrenamiento' : 'Completar Serie'}
            <svg xmlns="http://www.w3.org/2000/svg" className=${`h-6 w-6 ${isAnimating ? 'animate-bounce' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

export default WorkoutSession;
