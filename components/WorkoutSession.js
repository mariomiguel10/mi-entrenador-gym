
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import Timer from './Timer.js';

const html = htm.bind(React.createElement);

const WorkoutSession = ({ routine, onFinish, initialState }) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(initialState?.exerciseIdx || 0);
  const [currentSet, setCurrentSet] = useState(initialState?.set || 1);
  const [isResting, setIsResting] = useState(false);
  const [restType, setRestType] = useState('set');
  const [showDetails, setShowDetails] = useState(false);

  const currentExercise = routine.exercises[currentExerciseIdx];
  const nextExercise = routine.exercises[currentExerciseIdx + 1];

  // Persistir estado de la sesión
  useEffect(() => {
    localStorage.setItem('smartfit_active_session', JSON.stringify({
      routine,
      exerciseIdx: currentExerciseIdx,
      set: currentSet,
      timestamp: Date.now()
    }));
  }, [currentExerciseIdx, currentSet, routine]);

  const handleSetComplete = () => {
    if (currentSet < currentExercise.sets) {
      setRestType('set');
      setIsResting(true);
    } else {
      if (currentExerciseIdx < routine.exercises.length - 1) {
        setRestType('exercise');
        setIsResting(true);
      } else {
        localStorage.removeItem('smartfit_active_session');
        onFinish();
      }
    }
    setShowDetails(false);
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

  // Cálculo de progreso
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
          subtitle=${restType === 'set' ? `Serie ${currentSet + 1} de ${currentExercise.name}` : nextExercise?.name}
          onComplete=${handleRestComplete} 
        />
        <div className="mt-8 w-full max-w-md">
           <div className="flex justify-between mb-2 px-1">
             <span className="text-[10px] font-black text-slate-400 uppercase">Progreso Total</span>
             <span className="text-[10px] font-black text-indigo-600 uppercase">${Math.round(progressPercent)}%</span>
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="relative h-72 sm:h-96 bg-slate-900">
          <img src=${currentExercise.imageUrl} alt=${currentExercise.name} className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 flex flex-col justify-end p-8 sm:p-12">
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">${currentExercise.name}</h2>
          </div>
          <div className="absolute top-6 left-6 right-6">
             <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-white transition-all duration-500" style=${{ width: `${progressPercent}%` }}></div>
             </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-6 mb-8 text-center">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Serie</span>
              <span className="text-4xl font-black text-indigo-600">${currentSet} / ${currentExercise.sets}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reps</span>
              <span className="text-4xl font-black text-slate-800">${currentExercise.reps}</span>
            </div>
          </div>

          <div className="mb-8">
            <button 
              onClick=${() => setShowDetails(!showDetails)}
              className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ver Técnica y Detalles</span>
              <svg className=${`w-5 h-5 text-indigo-500 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            ${showDetails && html`
              <div className="mt-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Descripción</h5>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">${currentExercise.description}</p>
                <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Técnica Pro</h5>
                <p className="text-slate-700 text-sm italic font-semibold leading-relaxed border-l-4 border-indigo-200 pl-4">${currentExercise.technicalDetails}</p>
              </div>
            `}
          </div>

          <button onClick=${handleSetComplete} className="w-full py-6 bg-indigo-600 text-white text-xl font-black rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3">
            Completar Serie
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

export default WorkoutSession;
