
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

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 mb-1">{title}</h3>
        {subtitle && <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{subtitle}</p>}
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="104"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="112"
            cy="112"
            r="104"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={653.45}
            strokeDashoffset={653.45 - (653.45 * progress) / 100}
            strokeLinecap="round"
            className="text-indigo-600 transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="flex flex-col items-center">
          <span className="text-6xl font-black text-slate-800 font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${isPaused ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
        >
          {isPaused ? 'Reanudar' : 'Pausar'}
        </button>
        <button
          onClick={onComplete}
          className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          Saltar
        </button>
      </div>
    </div>
  );
};

export default Timer;
