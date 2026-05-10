import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { playClickSound, playPopSound } from '@/src/lib/audio';

export default function StudyTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          // Auto switch mode
          setMode(mode === 'focus' ? 'break' : 'focus');
          setMinutes(mode === 'focus' ? 5 : 25);
          setSeconds(0);
          // Simple notification sound or visual
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode]);

  const toggle = () => {
    playClickSound();
    setIsActive(!isActive);
  };

  const reset = () => {
    playPopSound();
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    playClickSound();
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
       <header className="text-center mb-10 w-full">
        <h2 className="text-3xl font-display font-extrabold text-natural-earth">Deep Focus</h2>
        <p className="text-text-muted italic">Rest is productive. Focus is intentional.</p>
      </header>

      <div className={cn(
        "w-80 h-80 rounded-full flex flex-col items-center justify-center relative shadow-2xl transition-all duration-500 border-8",
        mode === 'focus' ? "bg-natural-blue-muted/10 border-natural-blue-muted/30" : "bg-natural-green-muted/10 border-natural-green-muted/30"
      )}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={mode} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            {mode === 'focus' ? <BookOpen className="text-natural-blue-strong mb-2" size={32} /> : <Coffee className="text-natural-green-strong mb-2" size={32} />}
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              {mode === 'focus' ? 'Focus Session' : 'Short Break'}
            </span>
          </motion.div>
        </AnimatePresence>

        <span className="text-7xl font-display font-black text-natural-earth tracking-tighter">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>

        {/* Progress Orbit */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className={cn(
              "transition-all duration-1000",
              mode === 'focus' ? "text-natural-blue-strong" : "text-natural-green-strong"
            )}
            strokeDasharray={100}
            strokeDashoffset={100 - ((minutes * 60 + seconds) / (mode === 'focus' ? 25 * 60 : 5 * 60) * 100)}
          />
        </svg>
      </div>

      <div className="flex gap-4 mt-12 bg-white/70 backdrop-blur-md p-3 rounded-full shadow-lg border border-[#E6DFD6]">
        <button 
          onClick={reset}
          className="p-4 text-text-muted hover:text-natural-earth hover:bg-white/50 rounded-full transition-colors"
        >
          <RotateCcw size={24} />
        </button>
        <button 
          onClick={toggle}
          className={cn(
            "p-5 text-white rounded-full shadow-lg transition-transform active:scale-95",
            mode === 'focus' ? "bg-natural-blue-strong" : "bg-natural-green-strong",
            isActive ? "bg-opacity-80" : ""
          )}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
        </button>
        <div className="w-px bg-natural-beige mx-1" />
        <button 
           onClick={() => switchMode(mode === 'focus' ? 'break' : 'focus')}
           className="p-4 text-text-muted hover:text-natural-earth hover:bg-white/50 rounded-full transition-colors"
        >
          <motion.div animate={{ rotate: 180 }}>
            {mode === 'focus' ? <Coffee size={24} /> : <BookOpen size={24} />}
          </motion.div>
        </button>
      </div>

      <div className="mt-12 text-center text-sm italic opacity-60 text-text-muted">
        "Take deep breaths. You're doing great."
      </div>
    </div>
  );
}
