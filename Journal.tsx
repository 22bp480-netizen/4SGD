import React, { useState } from 'react';
import { Send, User, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { getTutorAdvice } from '@/src/lib/gemini';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { playClickSound, playPopSound } from '@/src/lib/audio';

interface AITutorProps {
  nickname?: string;
}

export default function AITutor({ nickname }: AITutorProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: `Hi ${nickname || ''}! I'm Lumina, your AI tutor. Stuck on something or just want to learn a new topic? I'm here to help in a way that works for you.` }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    playClickSound();
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const advice = await getTutorAdvice(userMessage);
      playPopSound();
      setMessages(prev => [...prev, { role: 'bot', content: advice }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having a little trouble connecting right now. Maybe try again in a moment?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
       <header className="mb-6">
        <h2 className="text-3xl font-display font-extrabold text-natural-earth flex items-center gap-2">
          <BrainCircuit className="text-natural-green-strong" /> Lumina AI
        </h2>
        <p className="text-text-muted">Ask any question, no matter how small. Learning is exploratory.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 px-2 mb-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              msg.role === 'user' ? "bg-natural-blue-muted/40" : "bg-natural-green-muted/40"
            )}>
              {msg.role === 'user' ? <User size={20} className="text-natural-blue-strong" /> : <Sparkles size={20} className="text-natural-green-deep" />}
            </div>
            <div className={cn(
              "p-4 rounded-3xl",
              msg.role === 'user' 
                ? "bg-natural-blue-muted/20 text-natural-earth rounded-tr-sm" 
                : "bento-card bg-white border-none text-natural-earth rounded-tl-sm shadow-sm"
            )}>
              <div className="prose prose-sm prose-slate max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-10 h-10 rounded-2xl bg-natural-green-muted/40 flex items-center justify-center shrink-0 animate-pulse">
               <Sparkles size={20} className="text-natural-green-deep" />
            </div>
            <div className="p-4 rounded-3xl bento-card bg-white border-none shadow-sm flex items-center gap-2 italic text-text-muted">
               Lumina is thinking...
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-[#E6DFD6] shadow-lg flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Lumina anything..."
          className="flex-1 bg-white/50 border-natural-green-muted/30 focus:border-natural-green-strong outline-none p-4 rounded-2xl transition-colors text-natural-earth placeholder:italic"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="p-4 bg-natural-blue-strong text-white rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 active:scale-95"
        >
          <Send size={24} />
        </button>
      </div>
    </div>
  );
}
