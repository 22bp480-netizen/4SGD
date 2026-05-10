import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Smile, Frown, Meh, Sun, Moon, Droplets, Utensils, MessageSquareHeart, Sparkles, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Habit, EmotionEntry } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { getHabitFeedback } from '@/src/lib/gemini';
import { playClickSound, playPopSound } from '@/src/lib/audio';

interface WellnessProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  emotions: EmotionEntry[];
  setEmotions: React.Dispatch<React.SetStateAction<EmotionEntry[]>>;
  nickname?: string;
}

const EMOTION_SUGGESTIONS: Record<string, { note: string; recommended: string[] }> = {
  happy: {
    note: "Your energy is wonderful! Why not use this momentum for a productive deep-work session?",
    recommended: ['Drink Water', 'Take a Break']
  },
  calm: {
    note: "Perfect state for mindfulness or light reading. Keep this peace going.",
    recommended: ['Read a Page', 'Take a Break']
  },
  tired: {
    note: "Your body is asking for rest. Don't push too hard today.",
    recommended: ['7+ Hours Sleep', 'Eat a Healthy Meal']
  },
  sad: {
    note: "It's okay to feel this way. Be gentle with yourself. Maybe reach out to a friend?",
    recommended: ['Take a Break', 'Drink Water']
  },
  overwhelmed: {
    note: "Breathe. Let's break things down into tiny steps. Physical hydration helps clarity.",
    recommended: ['Drink Water', 'Take a Break']
  },
};

export default function Wellness({ habits, setHabits, emotions, setEmotions, nickname }: WellnessProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(emotions[0]?.emotion || null);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const toggleHabit = (id: string) => {
    const newHabits = habits.map(h => h.id === id ? { ...h, value: !h.value } : h);
    setHabits(newHabits);
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      playPopSound();
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        value: false,
        type: 'custom'
      };
      setHabits(prev => [...prev, newHabit]);
      setNewHabitName('');
      setShowAddHabit(false);
    }
  };

  const removeHabit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remove this habit?')) {
      playClickSound();
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const addEmotion = (emotion: string) => {
    const newEntry: EmotionEntry = {
      id: Date.now().toString(),
      emotion,
      note: '',
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...emotions].slice(0, 50);
    setEmotions(updated);
    setSelectedEmotion(emotion);
  };

  const requestFeedback = async () => {
    setIsGettingFeedback(true);
    try {
      const res = await getHabitFeedback(habits);
      setFeedback(res);
    } catch (err) {
      setFeedback("Keep going! You're doing your best.");
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const emotionIcons: any = {
    happy: { icon: Smile, color: 'bg-natural-yellow-muted/40 text-natural-yellow-strong', label: 'Happy' },
    calm: { icon: Sun, color: 'bg-natural-green-muted/40 text-natural-green-strong', label: 'Calm' },
    tired: { icon: Moon, color: 'bg-natural-blue-muted/40 text-natural-blue-strong', label: 'Tired' },
    sad: { icon: Frown, color: 'bg-natural-peach-muted/40 text-natural-peach-strong', label: 'Sad' },
    overwhelmed: { icon: Meh, color: 'bg-natural-earth/10 text-natural-earth', label: 'Stressed' },
  };

  const suggestion = useMemo(() => selectedEmotion ? EMOTION_SUGGESTIONS[selectedEmotion] : null, [selectedEmotion]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-display font-extrabold text-natural-earth">Wellness</h2>
          <p className="text-[10px] md:text-sm text-text-muted italic">Balance is something you create.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/40 rounded-xl md:rounded-2xl border border-[#E6DFD6] backdrop-blur-sm self-start">
           <div className="px-2 md:px-3 py-0.5 md:py-1 bg-natural-green-strong text-white rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Self-Care</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        {/* Emotion Tracker - PRIMARY ROW */}
        <div className="lg:col-span-12 space-y-3 md:space-y-4">
          <div className="bento-card p-3 md:p-8 flex flex-col items-center gap-3 md:gap-8 bg-gradient-to-b from-white/60 to-transparent">
            <h3 className="text-[10px] md:text-lg font-bold text-natural-earth uppercase tracking-widest text-center">How are you feeling, {nickname || 'Alex'}?</h3>
            <div className="flex flex-wrap justify-center gap-3 md:gap-12">
              {Object.entries(emotionIcons).map(([key, value]: any) => (
                <button
                  key={key}
                  onClick={() => addEmotion(key)}
                  className="flex flex-col items-center gap-1 md:gap-3 group relative"
                >
                  <div className={cn(
                    "w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-md md:shadow-lg transition-all duration-300 border-[3px] md:border-4 border-white",
                    selectedEmotion === key ? "ring-2 md:ring-4 ring-accent-strong scale-110" : "hover:scale-110",
                    value.color
                  )}>
                    <value.icon className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <span className={cn(
                    "text-[7px] md:text-xs font-bold tracking-widest uppercase transition-colors",
                    selectedEmotion === key ? "text-accent-deep" : "text-text-muted group-hover:text-natural-earth"
                  )}>
                    {value.label}
                  </span>
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-2xl bg-white/80 p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 border-accent-muted shadow-sm text-center space-y-2"
                >
                  <p className="text-xs md:text-sm text-natural-earth font-medium italic">"{suggestion.note}"</p>
                  <div className="pt-1 flex flex-wrap justify-center gap-2">
                    {suggestion.recommended.map(rec => (
                      <span key={rec} className="px-2 py-0.5 md:px-3 md:py-1 bg-accent-muted/40 text-accent-deep rounded-full text-[8px] md:text-[10px] font-bold border border-accent-strong/20">
                        {rec}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Habit Tracker */}
        <div className="lg:col-span-7 space-y-2 md:space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base md:text-xl font-display font-bold text-natural-earth flex items-center gap-2">
              <Heart className="text-natural-peach-strong" size={18} /> Foundations
            </h3>
            <button 
              onClick={() => { playPopSound(); setShowAddHabit(true); }}
              className="p-2 bg-white/60 hover:bg-white text-accent-strong rounded-xl border border-accent-muted shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <AnimatePresence>
              {showAddHabit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-5 bg-white border-2 border-accent-strong rounded-3xl shadow-lg space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-accent-deep tracking-wider ml-1">New Habit</label>
                    <input 
                      autoFocus
                      value={newHabitName}
                      onChange={e => setNewHabitName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addHabit()}
                      placeholder="e.g. Read 10 pages"
                      className="w-full p-3 bg-natural-beige/30 border-none outline-none rounded-2xl text-sm font-bold text-natural-earth"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddHabit(false)} className="flex-1 py-3 text-xs font-bold text-text-muted">Cancel</button>
                    <button onClick={addHabit} className="flex-1 py-3 bg-accent-strong text-white rounded-2xl text-xs font-bold shadow-md">Add</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {habits.map(habit => {
              const isRecommended = suggestion?.recommended.includes(habit.name);
              return (
                <motion.button
                  layout
                  key={habit.id}
                  onClick={() => {
                    playClickSound();
                    toggleHabit(habit.id);
                  }}
                  className={cn(
                    "p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all flex flex-col gap-2 md:gap-4 text-left relative overflow-hidden group",
                    habit.value 
                      ? "bg-natural-green-muted/40 border-natural-green-strong/40 shadow-inner" 
                      : "bg-white/70 border-[#E6DFD6] shadow-sm hover:border-natural-green-strong/50",
                    isRecommended && !habit.value && "ring-1 md:ring-2 ring-accent-strong ring-offset-2"
                  )}
                >
                  <button 
                    onClick={(e) => removeHabit(e, habit.id)}
                    className="absolute top-2 right-2 p-1 text-text-muted opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  {isRecommended && !habit.value && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent-strong text-white px-2 py-0.5 rounded-full text-[8px] font-bold uppercase">
                      <Sparkles size={8} /> Suggested
                    </div>
                  )}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center",
                      habit.value ? "bg-natural-green-muted" : "bg-natural-beige"
                    )}>
                      {habit.name.includes('Water') && <Droplets size={16} className="text-natural-blue-strong" />}
                      {habit.name.includes('Meal') && <Utensils size={16} className="text-natural-peach-strong" />}
                      {habit.name.includes('Sleep') && <Moon size={16} className="text-natural-blue-strong" />}
                      {habit.name.includes('Break') && <Sun size={16} className="text-natural-yellow-strong" />}
                      {!['Water', 'Meal', 'Sleep', 'Break'].some(k => habit.name.includes(k)) && <CheckCircle2 size={16} className="text-accent-strong" />}
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-bold text-natural-earth leading-tight">{habit.name}</p>
                      <p className="text-[8px] md:text-[10px] text-text-muted font-bold uppercase tracking-wider">{habit.value ? 'Done' : 'Pending'}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-full h-1.5 md:h-2 rounded-full bg-natural-beige overflow-hidden",
                    habit.value ? "bg-natural-green-muted" : "bg-natural-beige"
                  )}>
                    <div className={cn("h-full transition-all duration-700", habit.value ? "w-full bg-natural-green-strong" : "w-0")} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Reflections */}
        <div className="lg:col-span-5 space-y-3 md:space-y-6">
          <div className="bg-natural-peach-muted/20 p-3 md:p-6 rounded-[20px] md:rounded-[32px] border border-natural-peach-muted/50 space-y-2 md:space-y-4">
             <div className="flex items-center justify-between">
                <span className="font-bold text-natural-peach-strong flex items-center gap-1 text-[10px] md:text-base">
                  <MessageSquareHeart className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" /> Lumina Advice
                </span>
                <button 
                  onClick={requestFeedback}
                  disabled={isGettingFeedback}
                  className="text-[8px] md:text-[10px] font-bold bg-white px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-sm hover:shadow active:scale-95 transition-all text-natural-peach-strong border border-natural-peach-muted uppercase tracking-widest"
                >
                  {isGettingFeedback ? "Analysing..." : "AI Consult"}
                </button>
             </div>
             <p className="text-[10px] md:text-xs text-natural-earth italic leading-relaxed">
               {feedback || "Personalized wellness strategies based on your habits."}
             </p>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h4 className="text-[8px] md:text-[10px] font-bold text-text-muted tracking-widest uppercase ml-1">Mood History</h4>
            <div className="space-y-2 md:space-y-3">
              {emotions.slice(0, 3).map(entry => {
                const config = emotionIcons[entry.emotion];
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 md:p-4 bento-card bg-white/40">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={cn("p-1.5 md:p-2 rounded-lg md:rounded-xl border border-white", config?.color)}>
                        {config ? <config.icon className="w-3 h-3 md:w-4 md:h-4" /> : <Meh className="w-3 h-3 md:w-4 md:h-4" />}
                      </div>
                      <span className="text-xs md:text-sm font-bold text-natural-earth capitalize">{entry.emotion}</span>
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

