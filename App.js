
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { generateRoutine } from './services/geminiService.js';
import WorkoutSession from './components/WorkoutSession.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [view, setView] = useState('config');
  const [config, setConfig] = useState({
    difficulty: 'Principiante',
    objective: 'Ganar Músculo',
    duration: 30,
    restBetweenSets: 45,
    restBetweenExercises: 90
  });
  const [routine, setRoutine] = useState(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Cargar historial y sesiones activas al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('smartfit_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error cargando historial", e);
      }
    }

    const savedActive = localStorage.getItem('smartfit_active_session');
    if (savedActive) {
      try {
        const session = JSON.parse(savedActive);
        // Solo restaurar si es de hoy (menos de 2 horas de antigüedad)
        if (Date.now() - session.timestamp < 1000 * 60 * 60 * 2) {
          setActiveSession(session);
        } else {
          localStorage.removeItem('smartfit_active_session');
        }
      } catch (e) {
        console.error("Error cargando sesión activa", e);
      }
    }
  }, []);

  const saveToHistory = (newRoutine) => {
    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      config: { ...config },
      routine: newRoutine
    };
    const updatedHistory = [historyItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('smartfit_history', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id, e) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('smartfit_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (item) => {
    setRoutine(item.routine);
    setConfig(item.config);
    setView('overview');
  };

  const resumeSession = () => {
    setRoutine(activeSession.routine);
    // Podríamos intentar reconstruir el config si fuera necesario, 
    // pero WorkoutSession ya maneja sus índices internos desde activeSession
    setView('active');
  };

  const startGeneration = async () => {
    setView('loading');
    setExpandedExerciseId(null);
    try {
      const generated = await generateRoutine(config);
      if (!generated || generated.exercises.length === 0) throw new Error("No exercises");
      setRoutine(generated);
      saveToHistory(generated);
      setView('overview');
    } catch (err) {
      console.error(err);
      alert("Error al generar la rutina. Revisa tu conexión.");
      setView('config');
    }
  };

  const renderLoading = () => html`
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-6">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
        <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center max-w-xs">
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Diseñando tu plan...</h2>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">Esculpiendo una rutina para ${config.objective.toLowerCase()}.</p>
      </div>
    </div>
  `;

  const renderHistory = () => html`
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
        <div className="mb-10 flex items-center justify-between">
          <button onClick=${() => setView('config')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-black text-slate-900">Tu Historial</h2>
          <div className="w-12"></div>
        </div>

        <div className="space-y-4">
          ${history.length === 0 ? html`
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 font-bold">No hay rutinas guardadas aún.</p>
            </div>
          ` : history.map(item => html`
            <div 
              key=${item.id}
              onClick=${() => loadFromHistory(item)}
              className="group relative bg-slate-50 p-6 rounded-[2rem] border border-transparent hover:border-indigo-200 hover:bg-white transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">${item.date}</p>
                <h4 className="font-bold text-slate-800 text-lg">${item.config.objective}</h4>
                <p className="text-xs text-slate-400 font-medium">${item.config.difficulty} • ${item.config.duration} min</p>
              </div>
              <button 
                onClick=${(e) => deleteFromHistory(item.id, e)}
                className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          `)}
        </div>
      </div>
    </div>
  `;

  const renderConfig = () => html`
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4">SmartFit AI Engine</div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">Tu Coach Personal</h1>
          <p className="text-slate-400 font-medium">Configura tu entrenamiento ideal.</p>
        </div>

        <div className="space-y-10">
          ${activeSession && html`
            <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-200 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div>
                    <h4 className="font-black text-sm uppercase">Entrenamiento en curso</h4>
                    <p className="text-xs opacity-80">${activeSession.routine.exercises[activeSession.exerciseIdx].name}</p>
                 </div>
              </div>
              <button 
                onClick=${resumeSession}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors"
              >
                Retomar Sesión
              </button>
            </div>
          `}

          <section>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Objetivo</label>
            <div className="grid grid-cols-2 gap-3">
              ${['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'].map(obj => html`
                <button
                  key=${obj}
                  onClick=${() => setConfig(prev => ({ ...prev, objective: obj }))}
                  className=${`p-5 rounded-3xl font-bold border-2 transition-all flex flex-col items-start gap-1 ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-50 text-slate-500'}`}
                >
                  <span className="text-lg">${obj}</span>
                </button>
              `)}
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Nivel</label>
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                ${['Principiante', 'Intermedio', 'Avanzado'].map(diff => html`
                  <button
                    key=${diff}
                    onClick=${() => setConfig(prev => ({ ...prev, difficulty: diff }))}
                    className=${`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${config.difficulty === diff ? 'bg-white text-indigo-600' : 'text-slate-500'}`}
                  >
                    ${diff}
                  </button>
                `)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Tiempo (min)</label>
              <div className="flex justify-between gap-2 p-1.5 bg-slate-100 rounded-2xl">
                ${[15, 30, 45, 60].map(dur => html`
                  <button
                    key=${dur}
                    onClick=${() => setConfig(prev => ({ ...prev, duration: dur }))}
                    className=${`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${config.duration === dur ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                  >
                    ${dur}
                  </button>
                `)}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <button
              onClick=${startGeneration}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95"
            >
              Generar Mi Rutina
            </button>
            
            ${history.length > 0 && html`
              <button
                onClick=${() => setView('history')}
                className="w-full py-4 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver Historial (${history.length})
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;

  const renderOverview = () => html`
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-4xl font-black">Tu Rutina</h2>
            <button onClick=${() => setView('config')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold">${config.objective}</div>
            <div className="px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold">${config.duration} min</div>
          </div>
        </div>
        
        <div className="p-8 sm:p-12">
          <div className="space-y-5 mb-12">
            ${routine?.exercises.map((ex, i) => {
              const isExpanded = expandedExerciseId === ex.id;
              return html`
                <div 
                  key=${ex.id} 
                  onClick=${() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className=${`flex flex-col p-6 rounded-[2rem] border transition-all cursor-pointer ${isExpanded ? 'border-indigo-400 bg-indigo-50/30' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className="w-12 h-12 flex items-center justify-center rounded-2xl font-black bg-white text-indigo-600 border border-slate-100">${i + 1}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">${ex.name}</h4>
                      <p className="text-xs font-bold text-slate-400">${ex.sets} series x ${ex.reps}</p>
                    </div>
                  </div>
                  ${isExpanded && html`
                    <div className="mt-8 pt-8 border-t border-slate-200/50">
                       <p className="text-slate-600 text-sm mb-4">${ex.description}</p>
                       <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                         <p className="text-indigo-600 text-xs font-black uppercase mb-1">Técnica</p>
                         <p className="text-slate-700 text-xs italic">${ex.technicalDetails}</p>
                       </div>
                    </div>
                  `}
                </div>
              `;
            })}
          </div>
          <button
            onClick=${() => { setView('active'); setActiveSession(null); }}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95"
          >
            Comenzar Entrenamiento
          </button>
        </div>
      </div>
    </div>
  `;

  const renderFinished = () => {
    const totalSetsCompleted = routine?.exercises.reduce((acc, ex) => acc + ex.sets, 0) || 0;
    const motivationalMessages = {
      'Perder Peso': '¡Gran trabajo quemando calorías! Estás un paso más cerca de tu versión más ligera.',
      'Ganar Músculo': '¡Vaya fuerza! Tus músculos están agradeciendo este estímulo hoy.',
      'Tonificar': 'Definición pura. Cada repetición cuenta para esculpir tu mejor forma.',
      'Resistencia': '¡Qué pulmones! Tu capacidad cardiovascular acaba de subir de nivel.'
    };

    return html`
      <div className="max-w-lg mx-auto text-center px-4 py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-2">¡Sesión Épica!</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">Has superado tus límites hoy</p>
          
          <div className="bg-slate-50 p-8 rounded-3xl mb-8 border border-slate-100 flex justify-between">
            <div className="text-center flex-1">
              <span className="block text-2xl font-black text-slate-800">${totalSetsCompleted}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Series Totales</span>
            </div>
            <div className="w-px bg-slate-200 mx-4"></div>
            <div className="text-center flex-1">
              <span className="block text-2xl font-black text-indigo-600">${config.duration}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutos</span>
            </div>
          </div>

          <p className="text-slate-600 font-medium leading-relaxed italic mb-12 text-lg">
            "${motivationalMessages[config.objective] || '¡Sigue así, vas por el buen camino!'}"
          </p>
          
          <button
            onClick=${() => { setView('config'); setRoutine(null); }}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            Listo por Hoy
          </button>
        </div>
      </div>
    `;
  };

  return html`
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      <div className="w-full max-w-6xl pb-10">
        ${view === 'config' && renderConfig()}
        ${view === 'history' && renderHistory()}
        ${view === 'loading' && renderLoading()}
        ${view === 'overview' && renderOverview()}
        ${view === 'active' && routine && html`
          <${WorkoutSession} 
            routine=${routine} 
            initialState=${activeSession}
            onFinish=${() => { setView('finished'); setActiveSession(null); localStorage.removeItem('smartfit_active_session'); }} 
          />
        `}
        ${view === 'finished' && renderFinished()}
      </div>
    </div>
  `;
};

export default App;
