
import React, { useState } from 'react';
import htm from 'htm';
import { generateRoutine } from './services/geminiService.js';
import WorkoutSession from './components/WorkoutSession.js';
import { db } from './services/supabaseService.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [view, setView] = useState('config'); // config, loading, overview, active, finished
  const [config, setConfig] = useState({
    difficulty: 'Intermedio',
    objective: 'Perder Peso',
    duration: 30,
    restBetweenSets: 45,
    restBetweenExercises: 90
  });
  const [routine, setRoutine] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    startTime: null,
    endTime: null,
    totalExercises: 0
  });

  const startGeneration = async () => {
    setView('loading');
    try {
      const generated = await generateRoutine(config);
      setRoutine(generated);
      setView('overview');
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la IA. Asegúrate de que la API Key sea válida.");
      setView('config');
    }
  };

  const handleFinishSession = () => {
    setSessionStats(prev => ({
      ...prev,
      endTime: Date.now(),
      totalExercises: routine.exercises.length
    }));
    setView('finished');
    
    // Intento de guardado silencioso en Supabase
    db.saveHistory({ routine, config }).catch(() => {
      console.log("Supabase no disponible, historial no guardado en la nube.");
    });
  };

  const getObjectiveIcon = (obj) => {
    switch(obj) {
      case 'Perder Peso': return '🔥';
      case 'Ganar Músculo': return '💪';
      case 'Tonificar': return '✨';
      case 'Resistencia': return '🏃';
      default: return '🎯';
    }
  };

  const renderConfig = () => html`
    <div className="max-w-2xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="mb-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4">SmartFit AI</div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Prepara tu Sesión</h1>
          <p className="text-slate-400 font-medium">Personalizamos cada ejercicio para ti.</p>
        </div>
        
        <div className="space-y-8">
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Objetivo Principal</label>
            <div className="grid grid-cols-2 gap-3">
              ${['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'].map(obj => html`
                <button
                  key=${obj}
                  onClick=${() => setConfig({ ...config, objective: obj })}
                  className=${`p-5 rounded-3xl font-bold border-2 transition-all text-left flex flex-col gap-1 ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100'}`}
                >
                  <span className="text-xl">${getObjectiveIcon(obj)}</span>
                  <span className="text-sm font-black">${obj}</span>
                </button>
              `)}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nivel</label>
              <select 
                value=${config.difficulty}
                onChange=${(e) => setConfig({...config, difficulty: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </section>
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Duración</label>
              <select 
                value=${config.duration}
                onChange=${(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </section>
          </div>

          <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Descanso entre series</span>
                <span className="text-sm font-black text-indigo-600">${config.restBetweenSets}s</span>
             </div>
             <input type="range" min="15" max="120" step="5" value=${config.restBetweenSets} onChange=${(e) => setConfig({...config, restBetweenSets: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </section>

          <button 
            onClick=${startGeneration} 
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            Generar Rutina IA
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const renderOverview = () => html`
    <div className="max-w-3xl mx-auto p-4 py-10 animate-in fade-in zoom-in-95">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white relative">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Rutina Generada</span>
          <h2 className="text-4xl font-black mb-6">Plan de Entrenamiento</h2>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase">${config.objective}</div>
             <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold uppercase">${config.difficulty}</div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="space-y-4 mb-10">
            ${routine?.exercises.map((ex, i) => html`
              <div key=${i} className="p-5 bg-slate-50 rounded-[2rem] flex justify-between items-center border border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 font-black text-indigo-600">${i + 1}</span>
                  <div>
                    <h4 className="font-bold text-slate-800">${ex.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">${ex.category || 'Fuerza'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-indigo-600 font-black text-lg">${ex.sets} x ${ex.reps}</span>
                </div>
              </div>
            `)}
          </div>
          
          <button 
            onClick=${() => {
              setSessionStats({ ...sessionStats, startTime: Date.now() });
              setView('active');
            }} 
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95"
          >
            Comenzar Ahora
          </button>
        </div>
      </div>
    </div>
  `;

  const renderFinished = () => html`
    <div className="max-w-xl mx-auto px-4 py-10 animate-in zoom-in-95">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-50 text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-2">¡Completado!</h2>
        <p className="text-slate-400 font-bold text-xs uppercase mb-10">Has superado el entrenamiento</p>
        
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <span className="block text-2xl font-black text-slate-800">${sessionStats.totalExercises}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ejercicios</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <span className="block text-2xl font-black text-indigo-600">${config.duration}m</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo</span>
          </div>
        </div>

        <button 
          onClick=${() => setView('config')} 
          className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95"
        >
          Nueva Rutina
        </button>
      </div>
    </div>
  `;

  return html`
    <div className="min-h-screen bg-slate-50/50 pb-20">
      ${view === 'config' && renderConfig()}
      ${view === 'loading' && html`
        <div className="flex flex-col h-screen items-center justify-center p-10 text-center space-y-8 animate-in fade-in">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
            <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Consultando Coach AI...</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Optimizando ejercicios para tu nivel ${config.difficulty.toLowerCase()}.</p>
          </div>
        </div>
      `}
      ${view === 'overview' && renderOverview()}
      ${view === 'active' && routine && html`<${WorkoutSession} routine=${routine} onFinish=${handleFinishSession} />`}
      ${view === 'finished' && renderFinished()}
    </div>
  `;
};

export default App;
