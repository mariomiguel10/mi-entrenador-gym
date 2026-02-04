
import React, { useState } from 'react';
import { generateRoutine } from './services/geminiService';
import { WorkoutConfig, Routine, ViewState, Difficulty, Objective, Duration } from './types';
import WorkoutSession from './components/WorkoutSession';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('config');
  const [config, setConfig] = useState<WorkoutConfig>({
    difficulty: 'Intermedio',
    objective: 'Ganar Músculo',
    duration: 30,
    restBetweenSets: 60,
    restBetweenExercises: 90
  });
  const [routine, setRoutine] = useState<Routine | null>(null);

  const startGeneration = async () => {
    setView('loading');
    try {
      const generated = await generateRoutine(config);
      setRoutine(generated);
      setView('overview');
    } catch (err) {
      alert("Error al conectar con el Coach AI. Reintenta.");
      setView('config');
    }
  };

  const renderConfig = () => (
    <div className="max-w-xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="glass-card p-10 rounded-[3rem] shadow-2xl border border-white">
        <header className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">SmartFit v2.0</div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Diseña tu sesión</h1>
        </header>

        <div className="space-y-8">
          {/* Objetivo */}
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Meta principal</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'] as Objective[]).map(obj => (
                <button
                  key={obj}
                  onClick={() => setConfig({ ...config, objective: obj })}
                  className={`p-4 rounded-2xl font-bold border-2 transition-all text-left ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-indigo-200'}`}
                >
                  <span className="block text-lg">{obj === 'Perder Peso' ? '🔥' : obj === 'Ganar Músculo' ? '💪' : obj === 'Tonificar' ? '✨' : '🏃'}</span>
                  <span className="text-sm font-bold">{obj}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Dificultad y Tiempo */}
          <div className="grid grid-cols-2 gap-6">
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nivel</label>
              <select 
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value as Difficulty})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </section>
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tiempo (min)</label>
              <div className="flex justify-between p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {[15, 30, 45, 60].map(t => (
                  <button
                    key={t}
                    onClick={() => setConfig({...config, duration: t as Duration})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${config.duration === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Descansos */}
          <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descanso entre series</span>
               <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black">{config.restBetweenSets}s</span>
            </div>
            <input 
              type="range" min="15" max="120" step="5"
              value={config.restBetweenSets}
              onChange={(e) => setConfig({...config, restBetweenSets: parseInt(e.target.value)})}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </section>

          <button
            onClick={startGeneration}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
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

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] p-10 text-center animate-in fade-in duration-700">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
        <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-2">Creando tu plan...</h2>
      <p className="text-slate-400 font-medium">Nuestro Coach AI está analizando tus metas de {config.objective.toLowerCase()}.</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {view === 'config' && renderConfig()}
      {view === 'loading' && renderLoading()}
      {view === 'overview' && routine && (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 p-10 text-white">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Sesión Preparada</span>
              <h2 className="text-4xl font-black mb-6">Lista de Ejercicios</h2>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase">{config.objective}</span>
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase">{config.difficulty}</span>
              </div>
            </div>
            <div className="p-8 space-y-4">
              {routine.exercises.map((ex, i) => (
                <div key={ex.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-xl font-black text-xs">{i+1}</span>
                    <h4 className="font-bold text-slate-800">{ex.name}</h4>
                  </div>
                  <span className="text-sm font-black text-indigo-600">{ex.sets} x {ex.reps}</span>
                </div>
              ))}
              <button 
                onClick={() => setView('active')}
                className="w-full mt-6 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Comenzar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
      {view === 'active' && routine && (
        <WorkoutSession routine={routine} onFinish={() => setView('finished')} />
      )}
      {view === 'finished' && (
        <div className="max-w-lg mx-auto px-4 py-12 text-center animate-in zoom-in-90">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-emerald-100">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">¡Completado!</h2>
            <p className="text-slate-500 mb-10 font-medium">Has superado tu entrenamiento hoy. Cada sesión cuenta.</p>
            <button 
              onClick={() => setView('config')}
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100"
            >
              Nueva Rutina
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
