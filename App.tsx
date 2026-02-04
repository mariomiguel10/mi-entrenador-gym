
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
      setRoutine(generated);
      setView('overview');
    } catch (err) {
      alert("Error al generar la rutina. Inténtalo de nuevo.");
      setView('config');
    }
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-6">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
        <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center max-w-sm">
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Esculpiendo tu rutina...</h2>
        <p className="text-slate-500 font-medium">Nuestra IA está diseñando un entrenamiento optimizado para {config.objective.toLowerCase()}.</p>
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-slate-50">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4">SmartFit AI 2.0</div>
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">Tu Coach Personal</h1>
          <p className="text-slate-400 font-medium">Define tus metas y nosotros haremos el resto.</p>
        </div>

        <div className="space-y-10">
          <section>
            <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Objetivo Principal</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'] as Objective[]).map(obj => (
                <button
                  key={obj}
                  onClick={() => setConfig(prev => ({ ...prev, objective: obj }))}
                  className={`p-5 rounded-2xl font-bold border-2 transition-all flex flex-col items-start gap-1 ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-indigo-100 hover:bg-white'}`}
                >
                  <span className="text-lg">{obj}</span>
                  <span className={`text-[10px] uppercase opacity-60 ${config.objective === obj ? 'text-white' : 'text-slate-400'}`}>
                    {obj === 'Perder Peso' ? 'Quemagrasas' : obj === 'Ganar Músculo' ? 'Hipertrofia' : 'Definición'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Nivel</label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                {(['Principiante', 'Intermedio', 'Avanzado'] as Difficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setConfig(prev => ({ ...prev, difficulty: diff }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${config.difficulty === diff ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Duración (min)</label>
              <div className="flex justify-between gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                {([15, 30, 45, 60] as Duration[]).map(dur => (
                  <button
                    key={dur}
                    onClick={() => setConfig(prev => ({ ...prev, duration: dur }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${config.duration === dur ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Ajustes de Descanso</h4>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">Entre Series</span>
                  <span className="text-sm font-black text-indigo-600">{config.restBetweenSets}s</span>
                </div>
                <input 
                  type="range" min="15" max="120" step="5"
                  value={config.restBetweenSets}
                  onChange={(e) => setConfig(prev => ({ ...prev, restBetweenSets: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600">Entre Ejercicios</span>
                  <span className="text-sm font-black text-indigo-600">{config.restBetweenExercises}s</span>
                </div>
                <input 
                  type="range" min="30" max="180" step="10"
                  value={config.restBetweenExercises}
                  onChange={(e) => setConfig(prev => ({ ...prev, restBetweenExercises: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </section>

          <button
            onClick={startGeneration}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 transition-all transform hover:-translate-y-1"
          >
            Generar Mi Rutina
          </button>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-50">
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Resumen del Plan</span>
            <h2 className="text-4xl font-black mb-6">Lista de Entrenamiento</h2>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.objective}</div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.difficulty}</div>
              <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">{config.duration} min</div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>
        
        <div className="p-8 sm:p-12">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 px-2">Pulsa en un ejercicio para ver detalles</p>
          <div className="space-y-4 mb-12">
            {routine?.exercises.map((ex, i) => {
              const isExpanded = expandedExerciseId === ex.id;
              return (
                <div 
                  key={ex.id} 
                  onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                  className={`flex flex-col p-5 bg-slate-50 rounded-3xl border transition-all cursor-pointer group hover:bg-white ${isExpanded ? 'border-indigo-400 bg-white ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-100'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-sm shadow-sm border transition-colors ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-slate-100'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg transition-colors ${isExpanded ? 'text-indigo-600' : 'text-slate-800'}`}>
                        {ex.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {ex.sets} series <span className="mx-1">•</span> {ex.reps} reps
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img 
                          src={ex.imageUrl} 
                          className="w-full md:w-32 h-32 object-cover rounded-2xl shadow-md" 
                          alt={ex.name} 
                        />
                        <div className="flex-1 space-y-4">
                          <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</h5>
                            <p className="text-slate-600 text-sm leading-relaxed">{ex.description}</p>
                          </div>
                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Técnica Recomendada</h5>
                            <p className="text-slate-700 text-xs italic font-medium leading-relaxed">{ex.technicalDetails}</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="text-center bg-white px-3 py-2 rounded-xl border border-slate-100 flex-1">
                              <p className="text-[9px] font-black text-slate-300 uppercase">Descanso Set</p>
                              <p className="text-xs font-bold text-indigo-600">{ex.restBetweenSets}s</p>
                            </div>
                            <div className="text-center bg-white px-3 py-2 rounded-xl border border-slate-100 flex-1">
                              <p className="text-[9px] font-black text-slate-300 uppercase">Descanso Ej.</p>
                              <p className="text-xs font-bold text-indigo-600">{ex.restBetweenExercises}s</p>
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
              className="flex-1 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all border-2 border-transparent hover:border-slate-100"
            >
              Ajustar Datos
            </button>
            <button
              onClick={() => setView('active')}
              className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
            >
              Comenzar Ahora
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinished = () => (
    <div className="max-w-md mx-auto text-center px-4 py-10">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-50">
        <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">¡Objetivo Cumplido!</h2>
        <p className="text-slate-500 mb-12 font-medium leading-relaxed italic">"El único entrenamiento malo es el que no ocurrió."</p>
        
        <div className="bg-slate-50 p-6 rounded-3xl mb-12 border border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sesión finalizada</p>
          <p className="text-2xl font-black text-slate-800">{config.duration} min • {config.objective}</p>
        </div>

        <button
          onClick={() => setView('config')}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-100"
        >
          Nueva Rutina
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      <div className="w-full max-w-6xl">
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
