import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Image as ImageIcon, Trash2, Save, Type, Pencil, Plus, Sparkles, Book as BookIcon, ChevronLeft, ChevronRight, X, Eraser } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { playClickSound, playPopSound } from '@/src/lib/audio';
import { JournalEntry } from '@/src/types';

// Simple Canvas Drawing Component
const DrawingCanvas = ({ 
  initialData, 
  onSave, 
  isReadOnly = false 
}: { 
  initialData?: string; 
  onSave?: (data: string) => void;
  isReadOnly?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8C5F5B'); // Default peach-strong
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Re-draw initial data if exists
        if (initialData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, parent.clientWidth, parent.clientHeight);
          };
          img.src = initialData;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isReadOnly) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL());
    }
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath(); // Reset path
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isReadOnly || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (onSave) onSave('');
  };

  return (
    <div className="relative w-full h-full bg-natural-beige/10 rounded-2xl overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none"
      />
      {!isReadOnly && (
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button onClick={clear} className="p-2 bg-white/80 rounded-full shadow-sm hover:text-natural-peach-strong">
            <Eraser size={16} />
          </button>
          <div className="flex flex-col gap-1 p-1 bg-white/80 rounded-full shadow-sm">
            {['#8C5F5B', '#547BA0', '#A3B18A', '#000000'].map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-4 h-4 rounded-full border border-white",
                  color === c ? "ring-2 ring-natural-earth" : ""
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Journal({ nickname }: { nickname?: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('lumina_journal');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry> | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [image, setImage] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<string | null>(null);
  const [isOpeningCover, setIsOpeningCover] = useState(false);
  const [pageDirection, setPageDirection] = useState(0); // -1 for left, 1 for right
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openEntry = (entry: Partial<JournalEntry>, index: number) => {
    setIsOpeningCover(true);
    setCurrentEntry(entry);
    setCurrentIndex(index);
    setImage(entry.image || null);
    setDrawing(entry.drawing || null);
    setIsEditing(true);
    setPageDirection(0);
    setTimeout(() => setIsOpeningCover(false), 800);
  };

  const flipToNext = () => {
    if (currentIndex < entries.length - 1) {
      playClickSound();
      setPageDirection(1);
      const nextIdx = currentIndex + 1;
      const entry = entries[nextIdx];
      setCurrentIndex(nextIdx);
      setCurrentEntry(entry);
      setImage(entry.image || null);
      setDrawing(entry.drawing || null);
    }
  };

  const flipToPrev = () => {
    if (currentIndex > 0) {
      playClickSound();
      setPageDirection(-1);
      const prevIdx = currentIndex - 1;
      const entry = entries[prevIdx];
      setCurrentIndex(prevIdx);
      setCurrentEntry(entry);
      setImage(entry.image || null);
      setDrawing(entry.drawing || null);
    }
  };

  const deleteEntry = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Using a simpler approach without window.confirm to avoid iFrame issues
    playPopSound();
    const updated = entries.filter(entry => entry.id !== id);
    setEntries(updated);
    localStorage.setItem('lumina_journal', JSON.stringify(updated));
  };

  const saveEntry = () => {
    playPopSound();
    const newEntry: JournalEntry = {
      id: currentEntry?.id || Date.now().toString(),
      title: currentEntry?.title || 'Daily Reflection',
      content: currentEntry?.content || '',
      image: image || undefined,
      drawing: drawing || undefined,
      timestamp: currentEntry?.timestamp || new Date().toISOString()
    };

    const updated = currentEntry?.id 
      ? entries.map(e => e.id === currentEntry.id ? newEntry : e)
      : [newEntry, ...entries];
    
    setEntries(updated);
    localStorage.setItem('lumina_journal', JSON.stringify(updated));
    closeEditor();
  };

  const closeEditor = () => {
    playClickSound();
    setIsEditing(false);
    setCurrentEntry(null);
    setImage(null);
    setDrawing(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-8 px-2 md:px-4">
      <header className="mb-4 md:mb-12 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-natural-earth leading-tight">Your Chronicles</h1>
          <p className="text-[10px] md:text-base text-text-muted italic">A sacred space for your thoughts, {nickname}.</p>
        </div>
        <button 
          onClick={() => {
            playPopSound();
            openEntry({ title: '', content: '' }, -1);
          }}
          className="w-full md:w-auto group flex items-center justify-center gap-3 bg-natural-earth text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl font-black shadow-lg hover:scale-105 transition-all active:scale-95 text-xs md:text-base"
        >
          <BookIcon className="w-[18px] h-[18px] md:w-5 md:h-5" />
          Create Entry
        </button>
      </header>

      {/* Entry Shelves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
        {entries.map((entry, idx) => (
          <motion.div
            key={entry.id}
            layoutId={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group cursor-pointer perspective-1000 relative"
          >
            {/* Dedicated Delete Button Layer */}
            <div className="absolute -top-2 -right-2 z-[100] pointer-events-auto">
              <button 
                onClick={(e) => deleteEntry(e, entry.id)}
                className="p-2.5 bg-white shadow-xl rounded-full text-natural-peach-strong hover:bg-natural-peach-strong hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-natural-earth/10 flex items-center justify-center"
                title="Delete memory"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div 
              onClick={() => {
                playClickSound();
                openEntry(entry, idx);
              }}
              className="relative h-64 w-48 mx-auto transform-style-3d group-hover:rotate-x-10 group-hover:-rotate-y-10 transition-transform duration-500"
            >
               {/* Page Stack Effect */}
               <div className="absolute inset-0 left-3 top-1 bottom-1 bg-white border border-natural-earth/10 rounded-r-xl shadow-sm -z-10 translate-x-1" />
               <div className="absolute inset-0 left-3 top-2 bottom-2 bg-white border border-natural-earth/10 rounded-r-xl shadow-sm -z-20 translate-x-2" />
               
               {/* Book Spine */}
               <div className="absolute left-0 top-0 bottom-0 w-4 bg-natural-earth/90 rounded-l-md z-10 shadow-inner" />
               {/* Cover */}
               <div className="absolute inset-0 left-2 bg-natural-beige border-2 border-natural-earth/20 rounded-r-xl shadow-2xl flex flex-col p-4 justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  <div className="space-y-4">
                    <Sparkles className="text-natural-yellow-strong opacity-40" size={24} />
                    <h3 className="font-display font-black text-natural-earth line-clamp-3 text-sm italic">{entry.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[10px] font-bold text-natural-earth/40 uppercase tracking-tighter">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </p>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}

        {entries.length === 0 && !isEditing && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-32 h-32 bg-natural-beige/30 rounded-full flex items-center justify-center">
              <BookIcon size={64} className="text-natural-earth opacity-20" />
            </div>
            <div className="max-w-xs">
              <p className="font-display font-black text-xl text-natural-earth">Your story starts here.</p>
              <p className="text-sm text-text-muted italic mt-2">Click below to open your first chronicle and start preserving your legacy.</p>
            </div>
          </div>
        )}
      </div>

      {/* Book Editor Overlay */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-natural-earth/50 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 perspective-2000"
          >
            <motion.div 
              layoutId={currentEntry?.id || 'new'}
              initial={{ rotateY: -110, opacity: 0, x: -100 }}
              animate={{ rotateY: 0, opacity: 1, x: 0 }}
              exit={{ rotateY: -110, opacity: 0, x: -100 }}
              transition={{ type: "spring", damping: 30, stiffness: 100 }}
              style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
              className="w-full max-w-6xl h-full md:max-h-[850px] bg-[#F9F6F1] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:border-[12px] border-natural-earth/10 relative"
            >
              {/* Cover Animation Overlay (Realistic Flip) */}
              <AnimatePresence>
                {isOpeningCover && (
                  <motion.div 
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -140 }}
                    exit={{ rotateY: 0 }}
                    transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                    style={{ transformOrigin: "left center", zIndex: 100, transformStyle: "preserve-3d" }}
                    className="absolute inset-0 bg-natural-beige rounded-r-[28px] shadow-2xl flex flex-col p-12 justify-between border-l-[20px] border-natural-earth"
                  >
                    {/* Inner shadow/page effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="space-y-8">
                       <Sparkles size={64} className="text-natural-yellow-strong opacity-40" />
                       <h2 className="text-5xl font-display font-black text-natural-earth italic leading-tight">
                         {currentEntry?.title || 'Daily Reflection'}
                       </h2>
                    </div>
                    <div className="pb-8">
                       <p className="text-lg font-bold text-natural-earth/30 uppercase tracking-[0.4em]">
                         Lumina Chronicles
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-natural-earth/5 bg-white/40">
                <button onClick={closeEditor} className="p-2 md:p-3 text-natural-earth hover:bg-white rounded-2xl transition-colors">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="flex items-center gap-2 md:gap-4">
                  <span className="hidden sm:block text-[8px] md:text-[10px] font-black uppercase text-natural-earth/40 tracking-[0.2em]">
                    Chronicle Mode • {currentEntry?.id ? 'Editing' : 'New Draft'}
                  </span>
                  <button 
                    onClick={saveEntry}
                    className="flex items-center gap-1.5 md:gap-2 bg-natural-earth text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                    Seal Entry
                  </button>
                </div>
              </div>

              {/* TWO PAGE SPREAD */}
              <motion.div 
                key={currentEntry?.id}
                initial={{ 
                  rotateY: pageDirection === 1 ? 90 : pageDirection === -1 ? -90 : 0,
                  opacity: 0 
                }}
                animate={{ 
                  rotateY: 0, 
                  opacity: isOpeningCover ? 0 : 1 
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ transformStyle: "preserve-3d", transformOrigin: pageDirection === 1 ? "right center" : "left center" }}
                className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
              >
                {/* Book Center Binding Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-natural-earth/10 z-10 hidden md:block" />
                <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-natural-earth/5 to-transparent z-10 -translate-x-1/2 hidden md:block" />

                {/* Left Page: Textual Expression */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-white flex flex-col space-y-4 md:space-y-6">
                  {currentIndex > 0 && (
                     <button 
                       onClick={flipToPrev}
                       className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 md:w-12 h-16 md:h-20 bg-white/10 hover:bg-natural-earth/5 flex items-center justify-center rounded-r-3xl transition-all"
                     >
                       <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-natural-earth/20" />
                     </button>
                  )}
                  <div className="space-y-1 md:space-y-2">
                    <input 
                      value={currentEntry?.title || ''}
                      onChange={e => setCurrentEntry({...currentEntry, title: e.target.value})}
                      placeholder="Give it a name..."
                      className="w-full text-2xl md:text-3xl font-display font-black text-natural-earth outline-none bg-transparent placeholder:opacity-20 italic"
                    />
                    <p className="text-[8px] md:text-[10px] font-bold text-natural-earth/40 uppercase tracking-widest px-1">
                      {new Date(currentEntry?.timestamp || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <textarea 
                    value={currentEntry?.content || ''}
                    onChange={e => setCurrentEntry({...currentEntry, content: e.target.value})}
                    placeholder="Pour your heart onto the silence..."
                    className="flex-1 w-full text-base md:text-lg text-natural-earth/80 leading-[1.6] md:leading-[1.8] outline-none bg-transparent resize-none italic placeholder:opacity-10 min-h-[200px] md:min-h-[300px]"
                  />
                </div>

                {/* Right Page: Visual Expression */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-[#FAF8F5] flex flex-col space-y-6 md:space-y-8 relative">
                  {currentIndex < entries.length - 1 && (
                     <button 
                       onClick={flipToNext}
                       className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 md:w-12 h-16 md:h-20 bg-white/10 hover:bg-natural-earth/5 flex items-center justify-center rounded-l-3xl transition-all"
                     >
                       <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-natural-earth/20" />
                     </button>
                  )}
                  {/* Drawing Section */}
                  <div className="space-y-2 md:space-y-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[8px] md:text-[10px] font-black uppercase text-natural-earth/40 tracking-widest flex items-center gap-2">
                        <Pencil className="w-2.5 h-2.5 md:w-3 md:h-3" /> Sketchpad
                      </h4>
                    </div>
                    <div className="flex-1 min-h-[250px] md:min-h-[350px] relative border-2 border-natural-earth/5 rounded-[24px] md:rounded-[32px] overflow-hidden bg-white/50">
                      <DrawingCanvas 
                        key={currentEntry?.id || 'new'}
                        initialData={drawing || undefined} 
                        onSave={(data) => setDrawing(data)} 
                      />
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[8px] md:text-[10px] font-black uppercase text-natural-earth/40 tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-2.5 h-2.5 md:w-3 md:h-3" /> Captured Moment
                      </h4>
                    </div>
                    <div className="relative group aspect-video bg-white/50 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-natural-earth/10 flex items-center justify-center overflow-hidden">
                      {image ? (
                        <>
                          <img src={image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button onClick={() => setImage(null)} className="p-3 md:p-4 bg-white rounded-full text-natural-peach-strong shadow-xl hover:scale-110 transition-transform">
                                <Trash2 className="w-[18px] h-[18px] md:w-6 md:h-6" />
                             </button>
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center gap-2 text-natural-earth/20 hover:text-natural-earth/40 transition-colors"
                        >
                          <ImageIcon className="w-8 h-8 md:w-12 md:h-12" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Attach Visual Memory</span>
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .perspective-2000 { perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-x-10 { transform: rotateX(10deg); }
        .rotate-y-10 { transform: rotateY(10deg); }
        .-rotate-y-10 { transform: rotateY(-10deg); }
      `}</style>
    </div>
  );
}

