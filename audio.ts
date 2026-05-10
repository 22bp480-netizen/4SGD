import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Plus, Trash2, X, CheckSquare, Square, Smile, Meh, Frown, Timer, TrendingUp } from 'lucide-react';
import { Task, EmotionEntry } from '@/src/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playPopSound } from '@/src/lib/audio';

interface CalendarPlannerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  moodEntries: EmotionEntry[];
  setMoodEntries: React.Dispatch<React.SetStateAction<EmotionEntry[]>>;
  nickname?: string;
  onNavigate: (view: any) => void;
}

const MOODS = [
  { icon: Smile, label: 'Happy', color: 'text-natural-green-strong' },
  { icon: Meh, label: 'Neutral', color: 'text-natural-yellow-strong' },
  { icon: Frown, label: 'Sad', color: 'text-natural-peach-strong' },
];

export default function CalendarPlanner({ tasks, setTasks, moodEntries, setMoodEntries, nickname }: CalendarPlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    playClickSound();
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };
  const nextMonth = () => {
    playClickSound();
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedDay) return;
    playPopSound();
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      completed: false,
      dueDate: selectedDay.toISOString(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    playPopSound();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    
    // Auto-remove completed tasks
    setTimeout(() => {
        setTasks(prev => prev.filter(t => !t.completed));
    }, 800);
  };

  const deleteTask = (taskId: string) => {
    playPopSound();
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSetMood = (emotion: string) => {
    if (!selectedDay) return;
    playPopSound();
    const newEntry: EmotionEntry = {
      id: Date.now().toString(),
      emotion,
      note: '',
      timestamp: selectedDay.toISOString()
    };
    setMoodEntries(prev => [...prev.filter(m => !isSameDay(new Date(m.timestamp), selectedDay)), newEntry]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-display font-extrabold text-natural-earth uppercase tracking-tight">Your Journey, {nickname || 'Alex'}</h2>
          <p className="text-[10px] md:text-sm text-text-muted italic">Time is a river. Navigate it with intention.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 bg-white/40 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-[#E6DFD6] shadow-sm scale-90 md:scale-100">
          <button onClick={prevMonth} className="p-1 md:p-2 hover:bg-natural-beige rounded-xl transition-colors text-text-muted"><ChevronLeft size={18} /></button>
          <span className="font-display font-bold text-natural-earth min-w-24 md:min-w-32 text-center text-xs md:text-base">{format(currentDate, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="p-1 md:p-2 hover:bg-natural-beige rounded-xl transition-colors text-text-muted"><ChevronRight size={18} /></button>
        </div>
      </header>

      {/* Stats Summary Row for Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bento-card p-4 bg-pastel-indigo/30 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm text-natural-blue-strong">
               <Timer size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase">Focus Time</p>
               <p className="text-xl font-black text-natural-earth">12.5h <span className="text-[10px] font-normal opacity-60">this month</span></p>
            </div>
         </div>
         <div className="bento-card p-4 bg-pastel-mint/30 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm text-natural-green-strong">
               <TrendingUp size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase">Productivity</p>
               <p className="text-xl font-black text-natural-earth">78% <span className="text-[10px] font-normal opacity-60">completion rate</span></p>
            </div>
         </div>
         <div className="bento-card p-4 bg-pastel-rose/30 flex items-center gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm text-accent-strong">
               <Smile size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase">Average Mood</p>
               <p className="text-xl font-black text-natural-earth">Positive</p>
            </div>
         </div>
      </div>

      <div className="bento-card overflow-hidden border-none shadow-sm bg-white/40 backdrop-blur-sm">
        <div className="grid grid-cols-7 border-b border-[#E6DFD6] bg-natural-beige/30">
           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
             <div key={day} className="py-4 text-center text-[10px] uppercase font-bold text-natural-green-deep tracking-widest">{day}</div>
           ))}
        </div>
        <div className="grid grid-cols-7">
          {Array(monthStart.getDay()).fill(null).map((_, i) => (
             <div key={`empty-${i}`} className="aspect-square border-r border-b border-[#E6DFD6] bg-natural-beige/10" />
          ))}
          {days.map(day => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
            const dayMood = moodEntries.find(m => isSameDay(new Date(m.timestamp), day));
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()} 
                onClick={() => {
                  playClickSound();
                  setSelectedDay(day);
                }}
                className={cn(
                  "aspect-square border-r border-b border-[#E6DFD6] p-1 md:p-2 flex flex-col gap-1 transition-colors hover:bg-natural-green-muted/20 cursor-pointer",
                  isToday ? "bg-natural-blue-muted/10" : "bg-white/40"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                   <span className={cn(
                      "text-[9px] md:text-[10px] font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full transition-all",
                      isToday ? "bg-natural-green-strong text-white shadow-lg shadow-natural-green-muted" : "text-text-muted hover:text-natural-earth"
                   )}>
                     {format(day, 'd')}
                   </span>
                   <div className="flex gap-0.5 items-center">
                     {dayMood && (
                        <div className={cn("text-xs", MOODS.find(m => m.label === dayMood.emotion)?.color)}>
                          {React.createElement(MOODS.find(m => m.label === dayMood.emotion)?.icon || Smile, { size: 10 })}
                        </div>
                     )}
                     {dayTasks.some(t => !t.completed) && (
                        <div className="w-1 h-1 rounded-full bg-accent-strong" />
                     )}
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 pr-1 pointer-events-none">
                   {dayTasks.map(task => (
                      <div key={task.id} className={cn(
                        "text-[7px] md:text-[9px] font-bold p-0.5 md:p-1 rounded-md border-l-2 truncate shadow-sm",
                        task.completed 
                          ? "bg-natural-green-muted text-natural-green-deep border-natural-green-strong opacity-60" 
                          : "bg-natural-blue-muted text-natural-blue-strong border-natural-blue-strong"
                      )}>
                        {task.title}
                      </div>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task & Mood Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-natural-earth/40 backdrop-blur-sm p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-primary w-full max-w-lg rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border-4 border-white flex flex-col"
            >
              <div className="p-4 md:p-6 border-b border-[#E6DFD6] flex justify-between items-center bg-white/60 backdrop-blur-md">
                <div className="flex flex-col">
                  <h3 className="text-lg md:text-xl font-display font-bold text-natural-earth">
                    {format(selectedDay, 'MMMM d, yyyy')}
                  </h3>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Plan your day</p>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 text-text-muted hover:text-natural-earth transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {/* Mood Tracker */}
                <div className="space-y-3">
                   <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">How are you feeling?</h4>
                   <div className="flex gap-4">
                      {MOODS.map(mood => {
                        const isSelected = moodEntries.find(m => isSameDay(new Date(m.timestamp), selectedDay))?.emotion === mood.label;
                        return (
                          <button
                            key={mood.label}
                            onClick={() => handleSetMood(mood.label)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-3 rounded-2xl flex-1 transition-all border-2",
                              isSelected ? "bg-white border-accent-strong shadow-md scale-105" : "bg-white/40 border-transparent hover:bg-white/60"
                            )}
                          >
                            <mood.icon className={mood.color} size={24} />
                            <span className="text-[10px] font-extrabold uppercase text-text-muted">{mood.label}</span>
                          </button>
                        )
                      })}
                   </div>
                </div>

                {/* Existing Tasks */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tasks for this day</h4>
                  {tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDay)).length === 0 ? (
                    <p className="text-sm text-text-muted italic py-4 text-center">No tasks scheduled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDay)).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bento-card bg-white/40 group">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleTask(task.id)} className="text-accent-strong">
                              {task.completed ? <CheckSquare size={20} className="fill-current" /> : <Square size={20} />}
                            </button>
                            <span className={cn(
                              "font-bold text-natural-earth",
                              task.completed && "line-through opacity-40"
                            )}>
                              {task.title}
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-text-muted hover:text-natural-peach-strong opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Task */}
                <div className="pt-4 border-t border-[#E6DFD6] space-y-4">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Add New Task</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      placeholder="What needs to be done?"
                      className="flex-1 bg-white/50 border border-[#E6DFD6] focus:border-accent-strong outline-none p-4 rounded-2xl transition-all text-natural-earth font-semibold placeholder:italic"
                    />
                    <button 
                      onClick={handleAddTask}
                      className="p-4 bg-accent-strong text-white rounded-2xl shadow-lg shadow-accent-muted hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-natural-beige/30 text-center">
                 <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase italic">
                    Focus on the journey, not just the destination.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
