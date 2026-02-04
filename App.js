
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { generateRoutine } from './services/geminiService.js';
import WorkoutSession from './components/WorkoutSession.js';
import { db } from './services/supabaseService.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [view, setView] = useState('config');
  const [isSyncing, setIsSyncing] = useState(false);
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
  const [exerciseFilter, setExerciseFilter] = useState('Todas');
  const [isFavorite, setIsFavorite] = useState(false);

  // Cargar datos desde la base de datos al iniciar
  useEffect(() => {
    const initData = async () => {
      setIsSyncing(true);
      try {
        const savedHistory = await db.getHistory();
        setHistory(savedHistory);

        const savedActive = await db.getActiveSession();
        if (savedActive) {
          if (Date.now() - savedActive.timestamp < 1000 * 60 * 60 * 4) {
            setActiveSession(savedActive);
          } else {
            await db.clearActiveSession();
          }
        }
      } catch (e) {
        console.error("Error cargando datos de Supabase. Usando LocalStorage como respaldo.", e);
        const localHistory = localStorage.getItem('smartfit_history');
        if (localHistory) setHistory(JSON.parse(localHistory));
      } finally {
        setIsSyncing(false);
      }
    };
    initData();
  }, []);

  const saveToHistory = async (newRoutine, asFavorite = false) => {
    const historyItem = {
      config: { ...config, isFavorite: asFavorite },
      routine: newRoutine
    };
    
    try {
      const savedItem = await db.saveHistory(historyItem);
      setHistory(prev => [savedItem, ...prev].slice(0, 15));
    } catch (e) {
      console.error("Error guardando en DB, guardando localmente:", e);
      const localItem = {
        ...historyItem,
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      const updatedHistory = [localItem, ...history].slice(0, 15);
      setHistory(updatedHistory);
      localStorage.setItem('smartfit_history', JSON.stringify(updatedHistory));
    }
  };

  const toggleFavoriteCurrent = () => {
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    alert(nextVal ? "Añadido a favoritos (se guardará al finalizar)" : "Eliminado de favoritos");
  };

  const deleteFromHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await db.deleteHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const loadFromHistory = (item) => {
    setRoutine(item.routine);
    setConfig(item.config);
    setIsFavorite(item.config.isFavorite || false);
    setView('overview');
  };

  const resumeSession = () => {
    setRoutine(activeSession.routine);
    setConfig(activeSession.config || config);
    setView('active');
  };

  const startGeneration = async () => {
    setView('loading');
    setExpandedExerciseId(null);
    setIsFavorite(false);
    try {
      const generated = await generateRoutine(config);
      if (!generated || generated.exercises.length === 0) throw new Error("No exercises");
      setRoutine(generated);
      await saveToHistory(generated, false);
      setView('overview');
    } catch (err) {
      console.error(err);
      alert("Error al generar la rutina. Revisa tu conexión.");
      setView('config');
    }
  };

  const updateRoutineRest = (type, value) => {
    const newRoutine = { ...routine };
    newRoutine.exercises = newRoutine.exercises.map(ex => ({
      ...ex,
      [type === 'sets' ? 'restBetweenSets' : 'restBetweenExercises']: parseInt(value)
    }));
    setRoutine(newRoutine);
    setConfig(prev => ({ 
      ...prev, 
      [type === 'sets' ? 'restBetweenSets' : 'restBetweenExercises']: parseInt(value) 
    }));
  };

  const filteredExercises = routine?.exercises.filter(ex => 
    exerciseFilter === 'Todas' || ex.category === exerciseFilter
  ) || [];

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
          <button onClick=${() => setView('config')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
             <h2 className="text-2xl font-black text-slate-900">Tu Historial</h2>
             <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">PostgreSQL Cloud Sync</p>
          </div>
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
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">${item.date}</p>
                  ${item.config.isFavorite && html`<span className="text-amber-400">★</span>`}
                </div>
                <h4 className="font-bold text-slate-800 text-lg">${item.config.objective}</h4>
                <p className="text-xs text-slate-400 font-medium">${item.config.difficulty} • ${item.config.duration} min</p>
              </div>
              <button 
                onClick=${(e) => deleteFromHistory(item.id, e)}
                className="p-3 text-slate-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        ${isSyncing && html`
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 overflow-hidden">
            <div className="h-full bg-indigo-600 animate-[progress_2s_ease-in-out_infinite]" style=${{width: '30%'}}></div>
          </div>
        `}
        
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4">SmartFit AI Cloud</div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">Tu Coach Personal</h1>
          <p className="text-slate-400 font-medium">Configura tu entrenamiento ideal.</p>
        </div>

        <div className="space-y-10">
          ${activeSession && html`
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs uppercase text-indigo-400">Sesión Pendiente</h4>
                    <p className="text-sm font-bold truncate">${activeSession.routine.exercises[activeSession.exerciseIdx].name}</p>
                 </div>
              </div>
              <button 
                onClick=${resumeSession}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors"
              >
                Retomar Entrenamiento
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
            
            <button
              onClick=${() => setView('history')}
              className="w-full py-4 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Historial (${history.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const renderOverview = () => html`
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in zoom-in-95">
      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-black">Tu Rutina</h2>
              <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-1">Configuración personalizada</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick=${toggleFavoriteCurrent}
                className=${`p-3 rounded-xl transition-all ${isFavorite ? 'bg-amber-400 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill=${isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button onClick=${() => setView('config')} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">${config.objective}</div>
            <div className="px-4 py-2 bg-white/10 rounded-2xl text-xs font-bold border border-white/10">${config.duration} min</div>
            <div className="px-4 py-2 bg-indigo-500 rounded-2xl text-xs font-bold border border-white/10">${routine?.focus || 'General'}</div>
          </div>
        </div>
        
        <div className="p-8 sm:p-12">
          <!-- Filtro de Ejercicios -->
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por tipo</label>
             <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl overflow-x-auto scrollbar-hide">
               ${['Todas', 'Cardio', 'Fuerza', 'Flexibilidad'].map(f => html`
                 <button 
                  key=${f}
                  onClick=${() => setExerciseFilter(f)}
                  className=${`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${exerciseFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                 >
                  ${f}
                 </button>
               `)}
             </div>
          </div>

          <div className="space-y-5 mb-12">
            ${filteredExercises.length === 0 ? html`
              <p className="text-center py-10 text-slate-400 font-bold">No hay ejercicios de tipo ${exerciseFilter}</p>
            ` : filteredExercises.map((ex, i) => {
              const isExpanded = expandedExerciseId === ex.id;
              return html`
                <div 
                  key=${ex.id} 
                  onClick=${() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className=${`flex flex-col p-6 rounded-[2rem] border transition-all cursor-pointer ${isExpanded ? 'border-indigo-400 bg-indigo-50/30' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className="w-12 h-12 flex items-center justify-center rounded-2xl font-black bg-white text-indigo-600 border border-slate-100">${i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-lg">${ex.name}</h4>
                        <span className="text-[8px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-md font-black uppercase">${ex.category}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-400">${ex.sets} series x ${ex.reps}</p>
                    </div>
                  </div>
                  ${isExpanded && html`
                    <div className="mt-8 pt-8 border-t border-slate-200/50">
                       <p className="text-slate-600 text-sm mb-4 leading-relaxed">${ex.description}</p>
                       <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                         <p className="text-indigo-600 text-[10px] font-black uppercase mb-1">Técnica</p>
                         <p className="text-slate-700 text-xs italic font-medium leading-relaxed">${ex.technicalDetails}</p>
                       </div>
                    </div>
                  `}
                </div>
              `;
            })}
          </div>

          <!-- Ajuste de Descansos -->
          <div className="mb-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Personalizar Descansos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-bold text-slate-700">Entre Series</span>
                    <span className="text-sm font-black text-indigo-600 bg-white px-3 py-1 rounded-xl border border-slate-100">${config.restBetweenSets}s</span>
                  </div>
                  <input 
                    type="range" min="15" max="120" step="5"
                    value=${config.restBetweenSets}
                    onChange=${(e) => updateRoutineRest('sets', e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-bold text-slate-700">Entre Ejercicios</span>
                    <span className="text-sm font-black text-indigo-600 bg-white px-3 py-1 rounded-xl border border-slate-100">${config.restBetweenExercises}s</span>
                  </div>
                  <input 
                    type="range" min="30" max="180" step="10"
                    value=${config.restBetweenExercises}
                    onChange=${(e) => updateRoutineRest('exercises', e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
            </div>
          </div>

          <button
            onClick=${() => { setView('active'); setActiveSession(null); }}
            className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 hover:bg-indigo-700"
          >
            Iniciar Sesión
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const renderFinished = () => {
    const totalSetsCompleted = routine?.exercises.reduce((acc, ex) => acc + ex.sets, 0) || 0;
    const totalExercises = routine?.exercises.length || 0;
    
    const motivationalMessages = {
      'Perder Peso': '¡Gran trabajo quemando calorías! Estás un paso más cerca de tu versión más ligera.',
      'Ganar Músculo': '¡Vaya fuerza! Tus músculos están agradeciendo este estímulo hoy.',
      'Tonificar': 'Definición pura. Cada repetición cuenta para esculpir tu mejor forma.',
      'Resistencia': '¡Qué pulmones! Tu capacidad cardiovascular acaba de subir de nivel.'
    };

    return html`
      <div className="max-w-xl mx-auto text-center px-4 py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-50 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-10"></div>
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">¡Sesión Épica!</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-10">Has superado tus límites hoy</p>
          
          <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-10 border border-slate-100 flex flex-wrap justify-between items-center shadow-inner">
            <div className="text-center flex-1 min-w-[80px]">
              <span className="block text-2xl font-black text-slate-800">${totalExercises}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ejercicios</span>
            </div>
            <div className="w-px h-10 bg-slate-200 mx-2"></div>
            <div className="text-center flex-1 min-w-[80px]">
              <span className="block text-2xl font-black text-indigo-600">${totalSetsCompleted}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Series</span>
            </div>
            <div className="w-px h-10 bg-slate-200 mx-2"></div>
            <div className="text-center flex-1 min-w-[80px]">
              <span className="block text-2xl font-black text-slate-800">${config.duration}m</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tiempo</span>
            </div>
          </div>

          <div className="relative mb-12 p-6 bg-indigo-50/30 rounded-[2rem] border-2 border-indigo-100/50">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-indigo-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01701C7.91244 16 7.01701 16.8954 7.01701 18V21M17.017 21V18C17.017 15.2386 14.7784 13 12.017 13H9.01701C6.25559 13 4.01701 15.2386 4.01701 18V21M17 3H7C5.89543 3 5 3.89543 5 5V7C5 8.10457 5.89543 9 7 9H17C18.1046 9 19 8.10457 19 7V5C19 3.89543 18.1046 3 17 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                 <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01701C7.91244 16 7.01701 16.8954 7.01701 18V21M17.017 21V18C17.017 15.2386 14.7784 13 12.017 13H9.01701C6.25559 13 4.01701 15.2386 4.01701 18V21M17 3H7C5.89543 3 5 3.89543 5 5V7C5 8.10457 5.89543 9 7 9H17C18.1046 9 19 8.10457 19 7V5C19 3.89543 18.1046 3 17 3Z" />
               </svg>
             </div>
             <p className="text-slate-600 font-medium leading-relaxed italic text-lg text-center pt-2">
               "${motivationalMessages[config.objective] || '¡Sigue así, vas por el buen camino!'}"
             </p>
          </div>
          
          <button
            onClick=${() => { setView('config'); setRoutine(null); }}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95 hover:bg-indigo-700"
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
            onFinish=${async () => { 
              await db.clearActiveSession();
              setView('finished'); 
              setActiveSession(null); 
            }} 
            onUpdate=${async (sessionData) => {
              await db.saveActiveSession({ ...sessionData, config: { ...config, isFavorite } });
            }}
          />
        `}
        ${view === 'finished' && renderFinished()}
      </div>
    </div>
  `;
};

export default App;
