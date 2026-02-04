
import React, { useState, useEffect } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
  title: string;
  subtitle?: string;
}

const Timer: React.FC<TimerProps> = ({ seconds, onComplete, title, subtitle }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, isPaused]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const circumference = 2 * Math.PI * 104;
  const progress = ((seconds - timeLeft) / seconds) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] shadow-2xl border border-indigo-50 w-full animate-in fade-in zoom-in-95">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-slate-900 mb-1">{title}</h3>
        {subtitle && <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest">{subtitle}</p>}
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-8">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
          <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000 ease-linear" />
        </svg>
        <span className="text-6xl font-black text-slate-800 font-mono tracking-tighter">{formatTime(timeLeft)}</span>
      </div>

      <div className="flex gap-4 w-full">
        <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
          {isPaused ? 'Continuar' : 'Pausar'}
        </button>
        <button onClick={onComplete} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          Saltar
        </button>
      </div>
    </div>
  );
};

export default Timer;
