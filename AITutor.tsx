import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Gamepad2, BookOpen, 
  Heart, Timer as TimerIcon, PenTool, LayoutDashboard,
  BrainCircuit, Utensils, Droplets, Moon, Settings as SettingsIcon, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Task, Habit, EmotionEntry, JournalEntry } from '@/src/types';
import { playClickSound, playPopSound } from '@/src/lib/audio';

// Components (to be created)
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import StudyTimer from './components/StudyTimer';
import AITutor from './components/AITutor';
import Wellness from './components/Wellness';
import SudokuGame from './components/SudokuGame';
import Journal from './components/Journal';
import CalendarPlanner from './components/CalendarPlanner';
import Settings from './components/Settings';
import Companion from './components/Companion';

type View = 'dashboard' | 'tasks' | 'study' | 'tutor' | 'wellness' | 'game' | 'journal' | 'calendar' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [nickname, setNickname] = useState(() => localStorage.getItem('lumina_nickname') || '');
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('lumina_nickname'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('lumina_dark') === 'true');

  useEffect(() => {
    localStorage.setItem('lumina_nickname', nickname);
  }, [nickname]);

  const handleFinishOnboarding = (name: string) => {
    if (name.trim()) {
      setNickname(name);
      setShowOnboarding(false);
      sessionStorage.setItem('lumina_welcomed', 'true');
    }
  };

  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('lumina_welcomed') && !!localStorage.getItem('lumina_nickname'));

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem('lumina_welcomed', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('lumina_accent') || 'green');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lumina_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lumina_habits');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Drink Water', value: false, type: 'health' },
      { id: '2', name: 'Eat a Healthy Meal', value: false, type: 'health' },
      { id: '3', name: '7+ Hours Sleep', value: false, type: 'health' },
      { id: '4', name: 'Take a Break', value: false, type: 'health' },
    ];
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('lumina_streak');
    return saved ? parseInt(saved) : 0;
  });
  const [wellnessEmotions, setWellnessEmotions] = useState<EmotionEntry[]>(() => {
    const saved = localStorage.getItem('lumina_emotions');
    return saved ? JSON.parse(saved) : [];
  });
  const [moodEntries, setMoodEntries] = useState<EmotionEntry[]>(() => {
    const saved = localStorage.getItem('lumina_moods');
    return saved ? JSON.parse(saved) : [];
  });

  const currentMood = wellnessEmotions[0]?.emotion;

  useEffect(() => {
    localStorage.setItem('lumina_emotions', JSON.stringify(wellnessEmotions));
  }, [wellnessEmotions]);

  useEffect(() => {
    localStorage.setItem('lumina_moods', JSON.stringify(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    localStorage.setItem('lumina_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lumina_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lumina_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lumina_dark', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lumina_accent', accentColor);
    const themes: any = {
      green: { muted: '#DCE4D1', strong: '#A3B18A', deep: '#4A5D23' },
      blue: { muted: '#B4D4EE', strong: '#547BA0', deep: '#2D4B6A' },
      peach: { muted: '#EAC0BD', strong: '#8C5F5B', deep: '#5C3D3A' },
      yellow: { muted: '#F3E99F', strong: '#A69A3B', deep: '#6B6327' },
    };
    const theme = themes[accentColor];
    const root = document.documentElement;
    root.style.setProperty('--theme-accent-muted', theme.muted);
    root.style.setProperty('--theme-accent-strong', theme.strong);
    root.style.setProperty('--theme-accent-deep', theme.deep);
  }, [accentColor]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, color: 'bg-natural-green-muted text-natural-green-deep' },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, color: 'bg-natural-peach-muted text-natural-peach-strong' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'bg-natural-green-muted text-natural-green-strong' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'bg-natural-blue-muted text-natural-blue-strong' },
    { id: 'wellness', label: 'Wellness', icon: Heart, color: 'bg-natural-peach-muted text-natural-peach-strong' },
    { id: 'tutor', label: 'AI Tutor', icon: BrainCircuit, color: 'bg-natural-blue-muted text-natural-blue-strong' },
    { id: 'game', label: 'Play', icon: Gamepad2, color: 'bg-natural-peach-muted text-natural-peach-strong' },
    { id: 'settings', label: 'Setup', icon: SettingsIcon, color: 'bg-natural-green-muted text-natural-green-deep' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard tasks={tasks} streak={streak} habits={habits} nickname={nickname} onNavigate={setActiveView} />;
      case 'tasks': return <TaskManager tasks={tasks} setTasks={setTasks} nickname={nickname} />;
      case 'wellness': return <Wellness habits={habits} setHabits={setHabits} emotions={wellnessEmotions} setEmotions={setWellnessEmotions} nickname={nickname} />;
      case 'calendar': return (
        <CalendarPlanner 
          tasks={tasks} 
          setTasks={setTasks} 
          nickname={nickname} 
          moodEntries={moodEntries}
          setMoodEntries={setMoodEntries}
          onNavigate={setActiveView} 
        />
      );
      case 'journal': return <Journal nickname={nickname} />;
      case 'tutor': return <AITutor nickname={nickname} />;
      case 'game': return <SudokuGame streak={streak} setStreak={setStreak} tasks={tasks} nickname={nickname} />;
      case 'settings': return <Settings darkMode={darkMode} setDarkMode={setDarkMode} accentColor={accentColor} setAccentColor={setAccentColor} />;
      default: return <Dashboard tasks={tasks} streak={streak} habits={habits} nickname={nickname} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className={cn(
      "flex h-screen bg-bg-primary overflow-hidden font-sans transition-all duration-300 relative",
      "p-2 md:p-6 gap-2 md:gap-6"
    )}>
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-natural-earth/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-2xl border-4 border-white max-w-sm w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-accent-muted/40 rounded-full flex items-center justify-center mx-auto">
                <BrainCircuit size={40} className="text-accent-strong" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-natural-earth dark:text-white">Welcome to Lumina</h2>
                <p className="text-sm text-text-muted italic mt-1">What should we call you?</p>
              </div>
              <input 
                autoFocus
                placeholder="Your nickname..."
                className="w-full p-4 bg-natural-beige/50 dark:bg-white/5 border-2 border-transparent focus:border-accent-strong outline-none rounded-2xl text-center font-bold text-natural-earth dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    playPopSound();
                    handleFinishOnboarding((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  playPopSound();
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleFinishOnboarding(input.value);
                }}
                className="w-full p-4 bg-accent-strong text-white font-bold rounded-2xl shadow-lg shadow-accent-muted hover:opacity-90 transition-all"
              >
                Start Journey
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col gap-4 hidden md:flex">
        <div className="p-4 mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-accent-strong flex items-center gap-2">
              <BrainCircuit size={32} /> Lumina
            </h1>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                playClickSound();
                setActiveView(item.id as View);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition-all duration-200",
                activeView === item.id 
                  ? "bg-accent-muted text-accent-deep shadow-sm" 
                  : "text-text-muted hover:bg-white/50 hover:text-text-main"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto bento-card border-none bg-natural-peach-muted/30 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-natural-peach-strong">{streak} Day Streak!</span>
          </div>
          <p className="text-[10px] opacity-70">Consistent daily learning works wonders.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-3 md:gap-6 overflow-hidden min-w-0">
        <header className="flex items-center justify-between bg-white/40 p-3 md:p-4 rounded-2xl border border-[#E6DFD6] backdrop-blur-md max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-natural-earth/60 uppercase tracking-widest">
                {activeView === 'dashboard' ? 'Overview' : 'Workspace'}
              </span>
              <h2 className="text-lg font-bold text-natural-earth capitalize">
                {activeView === 'dashboard' 
                  ? `Welcome back, ${nickname || 'Alex'}` 
                  : navItems.find(n => n.id === activeView)?.label || activeView.replace('-', ' ')}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Lumina Session</div>
              <div className="text-sm font-semibold truncate max-w-[120px]">{nickname || 'Alex'}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent-strong flex items-center justify-center font-bold text-white shadow-sm ring-4 ring-accent-muted/30">
              {nickname?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-1 pb-28 md:pb-6 max-w-5xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Welcome Toast */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-800 px-6 py-3 rounded-full shadow-2xl border-2 border-accent-strong flex items-center gap-3"
            >
              <div className="bg-accent-strong text-white p-1 rounded-lg">
                <Sparkles size={16} />
              </div>
              <span className="font-bold text-natural-earth dark:text-white">Welcome back, {nickname}!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Nav Bottom */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white/95 dark:bg-black/80 backdrop-blur-xl border border-[#E6DFD6] dark:border-white/10 flex items-center p-1.5 z-30 rounded-[28px] shadow-xl font-sans overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex flex-nowrap items-center px-1 gap-1">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                playClickSound();
                setActiveView(item.id as View);
              }}
              className={cn(
                "p-2.5 rounded-[20px] transition-all flex flex-col items-center gap-1 min-w-[56px] shrink-0", 
                activeView === item.id ? "bg-accent-strong text-white shadow-md scale-105" : "text-text-muted hover:bg-black/5"
              )}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <Companion 
        streak={streak} 
        currentMood={currentMood}
      />
    </div>
  );
}
