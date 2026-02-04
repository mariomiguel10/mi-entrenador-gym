
import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Timer = ({ seconds, onComplete, title, subtitle }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isPaused, setIsPaused] = useState(false);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio context not supported or blocked", e);
    }
  };

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) {
      playBeep();
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, isPaused]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = ((seconds - timeLeft) / seconds) * 100;

  return html`
    <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 mb-1">${title}</h3>
        ${subtitle && html`<p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">${subtitle}</p>`}
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
          <circle cx="112" cy="112" r="104" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="653.45" strokeDashoffset=${653.45 - (653.45 * progress) / 100} strokeLinecap="round" className="text-indigo-600 transition-all duration-1000 ease-linear" />
        </svg>
        <span className="text-6xl font-black text-slate-800 font-mono">${formatTime(timeLeft)}</span>
      </div>

      <div className="flex gap-4 w-full">
        <button onClick=${() => setIsPaused(!isPaused)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-50 text-slate-600">
          ${isPaused ? 'Reanudar' : 'Pausar'}
        </button>
        <button onClick=${onComplete} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">
          Saltar
        </button>
      </div>
    </div>
  `;
};

export default Timer;
