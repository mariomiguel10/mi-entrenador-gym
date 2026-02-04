
import React, { useState } from 'react';
import { generateRoutine } from './services/geminiService';
import { WorkoutConfig, Routine, ViewState, Difficulty, Objective, Duration } from './types';
import WorkoutSession from './components/WorkoutSession';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('config');
  const [config, setConfig] = useState<WorkoutConfig>({
    difficulty: 'Principiante',
    objective: 'Ganar Músculo',
    duration: 30,
    restBetweenSets: 45,
    restBetweenExercises: 90
  });
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const startGeneration = async () => {
    setView('loading');
    setExpandedExerciseId(null);
    try {
      const generated = await generateRoutine(config);
      if (!generated || generated.exercises.length === 0) throw new Error("No exercises");
      setRoutine(generated);
      setView('overview');
    } catch (err) {
      console.error(err);
      alert("Hubo un problema al generar tu rutina. Por favor, revisa tu conexión o intenta con otros parámetros.");
      setView('config');
    }
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-6 animate-in fade-in duration-700">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
        <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center max-w-xs">
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Diseñando tu plan...</h2>
        <p className="text-slate-500 font-medium leading-relaxed">Estamos seleccionando los ejercicios que mejor se adaptan a tu objetivo de <span className="text-indigo-600 font-bold">{config.objective.toLowerCase()}</span>.</p>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100/50">
        <div className="mb-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4">SmartFit AI Engine</div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tracking-tight">Tu Coach Personal</h1>
          <p className="text-slate-400 font-medium">Configura tu entrenamiento ideal en segundos.</p>
        </div>

        <div className="space-y-10">
          <section>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">¿Cuál es tu meta?</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'] as Objective[]).map(obj => (
                <button
                  key={obj}
                  onClick={() => setConfig(prev => ({ ...prev, objective: obj }))}
                  className={`p-5 rounded-3xl font-bold border-2 transition-all flex flex-col items-start gap-1 text-left ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100 hover:bg-white'}`}
                >
                  <span className="text-lg leading-tight">{obj}</span>
                  <span className={`text-[10px] uppercase opacity-70 font-black tracking-wider ${config.objective === obj ? 'text-white' : 'text-slate-400'}`}>
                    {obj === 'Perder Peso' ? 'Metabólico' : obj === 'Ganar Músculo' ? 'Fuerza' : 'Definición'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Nivel</label>
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
                {(['Principiante', 'Intermedio', 'Avanzado'] as Difficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setConfig(prev => ({ ...prev, difficulty: diff }))}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${config.difficulty === diff ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Tiempo (min)</label>
              <div className="flex justify-between gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50">
                {([15, 30, 45, 60] as Duration[]).map(dur => (
                  <button
                    key={dur}
                    onClick={() => setConfig(prev => ({ ...prev, duration: dur }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${config.duration === dur ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Personalizar Descansos</h4>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Entre Series</span>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{config.restBetweenSets}s</span>
                </div>
                <input 
                  type="range" min="15" max="120" step="5"
                  value={config.restBetweenSets}
                  onChange={(e) => setConfig(prev => ({ ...prev, restBetweenSets: parseInt(e.target.value) }))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-bold text-slate-700">Entre Ejercicios</span>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{config.restBetweenExercises}s</span>
                </div>
                <input 
                  type="range" min="30" max="180" step="10"
                  value={config.restBetweenExercises}
                  onChange={(e) => setConfig(prev => ({ ...prev, restBetweenExercises: parseInt(e.target.value) }))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </section>

          <button
            onClick={startGeneration}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            Generar Mi Rutina
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Tu Plan Estratégico</span>
            <h2 className="text-4xl font-black mb-6 leading-tight">Lista de Ejercicios</h2>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.objective}</div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.difficulty}</div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.duration} min</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </div>
        
        <div className="p-8 sm:p-12">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8 px-2 border-l-4 border-indigo-600">Haz clic en cada tarjeta para ver la técnica</p>
          <div className="space-y-5 mb-12">
            {routine?.exercises.map((ex, i) => {
              const isExpanded = expandedExerciseId === ex.id;
              return (
                <div 
                  key={ex.id} 
                  onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className={`flex flex-col p-6 rounded-[2rem] border transition-all cursor-pointer group ${isExpanded ? 'border-indigo-400 bg-indigo-50/30 ring-4 ring-indigo-50/50 shadow-lg' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white shadow-sm hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-base shadow-sm border transition-all ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-slate-100'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg sm:text-xl transition-colors ${isExpanded ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-200/50 px-2 py-0.5 rounded-md">
                          {ex.sets} series
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-200/50 px-2 py-0.5 rounded-md">
                          {ex.reps} reps
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 border border-slate-100 shadow-sm">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-indigo-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-slate-200/50 animate-in fade-in slide-in-from-top-6 duration-300">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="relative group/img overflow-hidden rounded-[1.5rem] shadow-xl md:w-48">
                          <img 
                            src={ex.imageUrl} 
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover/img:scale-110" 
                            alt={ex.name} 
                          />
                          <div className="absolute inset-0 bg-indigo-600/10 group-hover/img:bg-transparent transition-colors"></div>
                        </div>
                        <div className="flex-1 space-y-6">
                          <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                              Descripción del ejercicio
                            </h5>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">{ex.description}</p>
                          </div>
                          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                              💡 Tips de Ejecución
                            </h5>
                            <p className="text-slate-700 text-xs italic font-semibold leading-relaxed">{ex.technicalDetails}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-lg shadow-indigo-100">
                              <p className="text-[9px] font-black opacity-80 uppercase mb-0.5">Descanso Set</p>
                              <p className="text-lg font-black">{ex.restBetweenSets}s</p>
                            </div>
                            <div className="text-center bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg shadow-slate-200">
                              <p className="text-[9px] font-black opacity-80 uppercase mb-0.5">Descanso Ej.</p>
                              <p className="text-lg font-black">{ex.restBetweenExercises}s</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setView('config')}
              className="flex-1 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-[1.5rem] transition-all border-2 border-transparent active:scale-95"
            >
              Volver atrás
            </button>
            <button
              onClick={() => setView('active')}
              className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] font-black text-xl shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-95 group"
            >
              ¡Comenzar Sesión!
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinished = () => (
    <div className="max-w-lg mx-auto text-center px-4 py-10 animate-in zoom-in-90 duration-500">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-50">
        <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-10"></div>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">¡Misión Cumplida!</h2>
        <p className="text-slate-500 mb-12 font-medium leading-relaxed italic text-lg">Has completado tu entrenamiento con éxito. ¡Sigue así!</p>
        
        <div className="bg-slate-50 p-8 rounded-[2rem] mb-12 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Resumen de la Sesión</p>
          <div className="flex items-center justify-center gap-6">
             <div className="text-center">
               <span className="block text-2xl font-black text-slate-800">{config.duration}m</span>
               <span className="text-[10px] uppercase font-bold text-slate-400">Duración</span>
             </div>
             <div className="w-px h-10 bg-slate-200"></div>
             <div className="text-center">
               <span className="block text-2xl font-black text-indigo-600">{config.objective.split(' ')[0]}</span>
               <span className="text-[10px] uppercase font-bold text-slate-400">Meta</span>
             </div>
          </div>
        </div>

        <button
          onClick={() => setView('config')}
          className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-indigo-100 transform active:scale-95"
        >
          Nueva Rutina
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      <div className="w-full max-w-6xl pb-10">
        {view === 'config' && renderConfig()}
        {view === 'loading' && renderLoading()}
        {view === 'overview' && renderOverview()}
        {view === 'active' && routine && (
          <WorkoutSession 
            routine={routine} 
            onFinish={() => setView('finished')} 
          />
        )}
        {view === 'finished' && renderFinished()}
      </div>
    </div>
  );
};

export default App;
