
import React, { useState } from 'react';
import { generateRoutine } from './services/geminiService.ts';
import { WorkoutConfig, Routine, ViewState, Difficulty, Objective, Duration } from './types.ts';
import WorkoutSession from './components/WorkoutSession.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('config');
  const [config, setConfig] = useState<WorkoutConfig>({
    difficulty: 'Intermedio',
    objective: 'Ganar Músculo',
    duration: 30,
    restBetweenSets: 45,
    restBetweenExercises: 90
  });
  const [routine, setRoutine] = useState<Routine | null>(null);

  const handleStartGeneration = async () => {
    setView('loading');
    try {
      const generated = await generateRoutine(config);
      setRoutine(generated);
      setView('overview');
    } catch (err) {
      console.error(err);
      alert("Error de conexión. Intenta de nuevo.");
      setView('config');
    }
  };

  const renderConfig = () => (
    <div className="max-w-xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="glass-card p-8 sm:p-12 rounded-[3rem] shadow-2xl">
        <header className="text-center mb-10">
          <div className="inline-block px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">SmartFit AI Engine</div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight">Diseña tu sesión</h1>
          <p className="text-slate-400 font-medium mt-2">Configuración personalizada con IA</p>
        </header>

        <div className="space-y-10">
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Objetivo</label>
            <div className="grid grid-cols-2 gap-3">
              {(['Perder Peso', 'Ganar Músculo', 'Tonificar', 'Resistencia'] as Objective[]).map(obj => (
                <button
                  key={obj}
                  onClick={() => setConfig({ ...config, objective: obj })}
                  className={`p-5 rounded-3xl font-bold border-2 transition-all text-left flex flex-col gap-1 ${config.objective === obj ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-[1.02]' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-indigo-100'}`}
                >
                  <span className="text-xl">{obj === 'Perder Peso' ? '🔥' : obj === 'Ganar Músculo' ? '💪' : obj === 'Tonificar' ? '✨' : '🏃'}</span>
                  <span className="text-sm font-black">{obj}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Nivel</label>
              <select 
                value={config.difficulty}
                onChange={(e) => setConfig({...config, difficulty: e.target.value as Difficulty})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </section>
            <section>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tiempo</label>
              <select 
                value={config.duration}
                onChange={(e) => setConfig({...config, duration: parseInt(e.target.value) as Duration})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </section>
          </div>

          <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descanso entre series</span>
                <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-100">${config.restBetweenSets}s</span>
             </div>
             <input type="range" min="15" max="120" step="5" value={config.restBetweenSets} onChange={(e) => setConfig({...config, restBetweenSets: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </section>

          <button 
            onClick={handleStartGeneration} 
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            Generar Rutina AI
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] p-10 text-center animate-in fade-in duration-1000">
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-full border-8 border-indigo-50"></div>
        <div className="absolute inset-0 rounded-full border-8 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Entrenador AI trabajando...</h2>
      <p className="text-slate-400 font-medium">Diseñando tu plan de {config.objective.toLowerCase()}</p>
    </div>
  );

  const renderOverview = () => (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-10 text-white text-center">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 block">Sesión Preparada</span>
          <h2 className="text-4xl font-black mb-6">Tu Rutina</h2>
          <div className="flex justify-center gap-2">
             <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{config.objective}</span>
             <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{config.difficulty}</span>
          </div>
        </div>
        <div className="p-8 sm:p-12 space-y-4">
          {routine?.exercises.map((ex, i) => (
            <div key={ex.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl border border-slate-200 font-black text-indigo-600">{i+1}</span>
                <h4 className="font-bold text-slate-800 text-lg">{ex.name}</h4>
              </div>
              <span className="text-indigo-600 font-black text-xl">{ex.sets} x {ex.reps}</span>
            </div>
          ))}
          <button onClick={() => setView('active')} className="w-full mt-8 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 transition-all transform active:scale-95">Empezar Entrenamiento</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-10">
      {view === 'config' && renderConfig()}
      {view === 'loading' && renderLoading()}
      {view === 'overview' && renderOverview()}
      {view === 'active' && routine && <WorkoutSession routine={routine} onFinish={() => setView('finished')} />}
      {view === 'finished' && (
        <div className="max-w-lg mx-auto px-4 py-20 text-center animate-in zoom-in-90 duration-500">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-emerald-50">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">¡Completado!</h2>
            <p className="text-slate-400 mb-12 font-semibold">Has superado tu entrenamiento. Disciplina es la clave.</p>
            <button onClick={() => setView('config')} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-slate-800 transition-all">Nueva Sesión</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
