import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Flame, 
  Calendar as CalendarIcon, 
  Heart, 
  Timer, 
  ChevronRight,
  BrainCircuit,
  Play,
  Pause,
  RotateCcw,
  BarChart2,
  TrendingUp,
  Award,
  Sparkles,
  Book as BookIcon,
  Gamepad2
} from 'lucide-react';
import { Task, Habit } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { playClickSound, playPopSound } from '@/src/lib/audio';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  streak: number;
  nickname?: string;
  onNavigate: (view: any) => void;
}

export default function Dashboard({ tasks, habits, streak, nickname, onNavigate }: DashboardProps) {
  const incompleteTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const completedHabits = habits.filter(h => h.value).length;

  // Study Timer Integrated
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

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
          setTimerMode(timerMode === 'focus' ? 'break' : 'focus');
          setMinutes(timerMode === 'focus' ? 5 : 25);
          setSeconds(0);
          playPopSound();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, timerMode]);

  return (
    <div className="space-y-3 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <header className="hidden md:block">
        <h2 className="text-3xl font-display font-extrabold text-natural-earth mb-2">Welcome back, {nickname || 'Alex'}!</h2>
        <p className="text-text-muted">Your pastel sanctuary is ready. What's the plan today?</p>
      </header>

      {/* Streak Hero */}
      <div className="grid grid-cols-1">
         <motion.div 
           whileHover={{ scale: 1.01 }}
           className="bento-card p-4 md:p-6 bg-natural-peach-muted/40 border-2 border-white flex flex-col items-center justify-center text-center space-y-2 cursor-pointer shadow-sm overflow-hidden relative h-24 md:h-32"
           onClick={() => onNavigate('game')}
         >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Flame className="size-[60px] md:size-[80px]" />
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-natural-peach-strong shadow-sm">
                 <Flame size={24} className="fill-current md:w-7 md:h-7" />
              </div>
              <div className="text-left">
                 <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-natural-peach-strong">Current Streak</p>
                 <p className="text-2xl md:text-3xl font-display font-black text-natural-earth">{streak} Days</p>
              </div>
            </div>
         </motion.div>
      </div>

      {/* Main Row: Timer and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Study Timer - 5 cols */}
        <div className="lg:col-span-5 bento-card p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-natural-blue-muted/30">
          <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-2 text-natural-blue-strong">
            <Timer size={16} md:size={18} />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Focus Session</span>
          </div>
          
          <div className="relative w-36 h-36 md:w-48 md:h-48 flex items-center justify-center mb-4 md:mb-6">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-black/5"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className={timerMode === 'focus' ? "text-natural-blue-strong" : "text-natural-green-strong"}
                strokeDasharray={283}
                strokeDashoffset={283 - ((minutes * 60 + seconds) / (timerMode === 'focus' ? 25 * 60 : 5 * 60) * 283)}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-display font-black text-natural-earth">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-text-muted font-bold uppercase">{timerMode}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { playClickSound(); setIsActive(!isActive); }}
              className={cn(
                "p-4 rounded-2xl shadow-md transition-all active:scale-95",
                isActive ? "bg-natural-earth text-white" : "bg-natural-blue-strong text-white"
              )}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button 
              onClick={() => { playPopSound(); setIsActive(false); setMinutes(timerMode === 'focus' ? 25 : 5); setSeconds(0); }}
              className="p-4 bg-white rounded-2xl shadow-md text-text-muted hover:text-natural-earth transition-all"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Analysis Section - 7 cols */}
        <div className="lg:col-span-7 bento-card p-6 bg-natural-green-muted/30">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-xl">
                <BarChart2 size={18} className="text-natural-green-strong" />
              </div>
              <h3 className="font-display font-bold text-natural-earth">Activity Analysis</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-natural-green-strong uppercase bg-white/50 px-2 py-1 rounded-lg">
              <TrendingUp size={12} />
              <span>Higher today</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Studying Stats */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-2">
                <span className="text-text-muted uppercase tracking-wider">Studying Time</span>
                <span className="text-natural-blue-strong">4.2h Today</span>
              </div>
              <div className="h-2.5 bg-white rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '65%' }}
                   className="h-full bg-natural-blue-strong rounded-full"
                />
              </div>
            </div>

            {/* Productivity (Tasks) */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-2">
                <span className="text-text-muted uppercase tracking-wider">Productivity</span>
                <span className="text-natural-green-strong">{tasks.filter(t => t.completed).length} Tasks Done</span>
              </div>
              <div className="h-2.5 bg-white rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: tasks.length > 0 ? `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` : '40%' }}
                   className="h-full bg-natural-green-strong rounded-full"
                />
              </div>
            </div>

            {/* Hobby/Wellbeing */}
            <div>
              <div className="flex justify-between text-[10px] font-bold mb-2">
                <span className="text-text-muted uppercase tracking-wider">Wellbeing</span>
                <span className="text-natural-peach-strong">{completedHabits} Habits Kept</span>
              </div>
              <div className="h-2.5 bg-white rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: habits.length > 0 ? `${(completedHabits / habits.length) * 100}%` : '50%' }}
                   className="h-full bg-natural-peach-strong rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="p-3 bg-white/40 rounded-2xl text-center border border-white/60">
              <p className="text-[10px] font-bold text-text-muted uppercase">Focus</p>
              <p className="text-lg font-black text-natural-earth">88%</p>
            </div>
            <div className="p-3 bg-white/40 rounded-2xl text-center border border-white/60">
              <p className="text-[10px] font-bold text-text-muted uppercase">Tasks</p>
              <p className="text-lg font-black text-natural-earth">{tasks.filter(t => t.completed).length}</p>
            </div>
            <div className="p-3 bg-white/40 rounded-2xl text-center border border-white/60">
              <p className="text-[10px] font-bold text-text-muted uppercase">Mood</p>
              <p className="text-lg font-black text-natural-earth">Calm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Streak Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bento-card p-4 md:p-6 flex flex-col justify-between bg-natural-yellow-muted/30"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-natural-yellow-muted rounded-2xl">
              <Flame className="text-natural-yellow-strong" size={20} />
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-wider">Consistency</span>
          </div>
          <div className="mt-2 md:mt-4">
            <p className="text-2xl md:text-3xl font-display font-bold text-natural-earth">{streak} Days</p>
            <p className="text-xs md:text-sm text-text-muted">Daily goal streak</p>
          </div>
          <button 
            onClick={() => { playClickSound(); onNavigate('game'); }}
            className="mt-3 md:mt-6 w-full py-2 md:py-3 bg-white rounded-xl text-natural-yellow-strong font-bold hover:bg-natural-yellow-muted transition-colors flex items-center justify-center gap-2 text-xs"
          >
            Daily Game <ChevronRight size={14} />
          </button>
        </motion.div>

        {/* Tasks Summary */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bento-card p-4 md:p-6"
        >
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-natural-green-muted rounded-2xl">
              <CheckCircle2 className="text-natural-green-strong" size={20} />
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-wider">Learning</span>
          </div>
          <h3 className="text-lg font-display font-bold text-natural-earth mb-2 md:mb-4">Recent Tasks</h3>
          <div className="space-y-2">
            {incompleteTasks.length > 0 ? incompleteTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 bg-white/50 rounded-xl border border-white/50">
                <div className="w-1.5 h-1.5 rounded-full bg-natural-green-strong" />
                <span className="text-xs text-natural-earth truncate font-semibold">{task.title}</span>
              </div>
            )) : (
              <p className="text-xs text-text-muted italic">All clear!</p>
            )}
          </div>
          <button 
            onClick={() => { playClickSound(); onNavigate('tasks'); }}
            className="mt-2 text-natural-green-strong text-xs font-bold flex items-center gap-1 hover:underline"
          >
            Manage <ChevronRight size={12} />
          </button>
        </motion.div>

        {/* Wellness Summary */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bento-card p-4 md:p-6 bg-natural-peach-muted/30"
        >
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-2 md:p-3 bg-natural-peach-muted rounded-2xl">
              <Heart className="text-natural-peach-strong" size={20} />
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-wider">Health</span>
          </div>
          <h3 className="text-lg font-display font-bold text-natural-earth mb-1 md:mb-2">Care</h3>
          <p className="text-xs md:text-sm text-text-muted mb-2 md:mb-4">{completedHabits}/{habits.length} habits</p>
          <div className="w-full bg-natural-beige h-1.5 md:h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: habits.length > 0 ? `${(completedHabits / habits.length) * 100}%` : '0%' }}
              className="bg-natural-green-strong h-full"
            />
          </div>
          <button 
            onClick={() => { playClickSound(); onNavigate('wellness'); }}
            className="mt-3 md:mt-6 w-full py-2 bg-white rounded-xl text-natural-peach-strong font-bold hover:bg-natural-peach-muted transition-colors text-xs text-center"
          >
            Update Habits
          </button>
        </motion.div>

      </div>

      {/* Quick Tools */}
      <section>
        <h3 className="text-base md:text-xl font-display font-bold text-natural-earth mb-2 md:mb-4">Quick Tools</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <button onClick={() => { playClickSound(); onNavigate('tutor'); }} className="p-3 md:p-4 bg-white border border-white rounded-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3 group">
            <BrainCircuit className="text-natural-yellow-strong group-hover:rotate-12 transition-transform w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-natural-earth text-xs md:text-sm">AI Tutor</span>
          </button>
          <button onClick={() => { playClickSound(); onNavigate('calendar'); }} className="p-3 md:p-4 bg-white border border-white rounded-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3 group">
            <CalendarIcon className="text-natural-green-deep group-hover:rotate-12 transition-transform w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-natural-earth text-xs md:text-sm">Planner</span>
          </button>
          <button onClick={() => { playClickSound(); onNavigate('journal'); }} className="p-3 md:p-4 bg-white border border-white rounded-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3 group">
            <BookIcon className="text-natural-blue-strong group-hover:rotate-12 transition-transform w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-natural-earth text-xs md:text-sm">Journal</span>
          </button>
          <button onClick={() => { playClickSound(); onNavigate('game'); }} className="p-3 md:p-4 bg-white border border-white rounded-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3 group">
            <Gamepad2 className="text-accent-strong group-hover:rotate-12 transition-transform w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-natural-earth text-xs md:text-sm">Play</span>
          </button>
        </div>
      </section>
    </div>
  );
}
