import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, RotateCcw, Lock, ChevronRight, CheckCircle2, RefreshCw, Heart, Sparkles, XCircle, Lightbulb, AlertCircle } from 'lucide-react';
import { Task } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { playClickSound, playPopSound } from '@/src/lib/audio';

interface SudokuGameProps {
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  tasks: Task[];
  nickname?: string;
}

// Helper to generate a valid (but simple) solved grid to shuffle
function generateSolvedGrid() {
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill diagonal 3x3 blocks first (they are independent)
  for (let i = 0; i < 9; i += 3) {
    fillBox(grid, i, i);
  }
  
  solveSudoku(grid);
  return grid;
}

function fillBox(grid: number[][], row: number, col: number) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (isUsedInBox(grid, row, col, num));
      grid[row + i][col + j] = num;
    }
  }
}

function isUsedInBox(grid: number[][], rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[rowStart + i][colStart + j] === num) return true;
    }
  }
  return false;
}

function solveSudoku(grid: number[][]) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValidPlacement(grid: number[][], row: number, col: number, num: number) {
  // Check row
  for (let x = 0; x <= 8; x++) if (grid[row][x] === num) return false;
  // Check col
  for (let x = 0; x <= 8; x++) if (grid[x][col] === num) return false;
  // Check box
  let startRow = row - row % 3, startCol = col - col % 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[i + startRow][j + startCol] === num) return false;
  return true;
}

export default function SudokuGame({ streak, setStreak, tasks, nickname }: SudokuGameProps) {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  const [xp, setXp] = useState(() => Number(localStorage.getItem('lumina_xp') || 0));
  const [level, setLevel] = useState(() => Number(localStorage.getItem('lumina_level') || 1));

  const isLocked = tasks.length > 0 && tasks.some(t => !t.completed);

  useEffect(() => {
    localStorage.setItem('lumina_xp', xp.toString());
    localStorage.setItem('lumina_level', level.toString());
    
    // Level up logic
    const xpNeeded = level * 100;
    if (xp >= xpNeeded) {
      setXp(xp - xpNeeded);
      setLevel(level + 1);
      playPopSound();
    }
  }, [xp, level]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateSudoku = () => {
    const solved = generateSolvedGrid();
    setSolution(solved);
    
    // Poke holes (around 40-50 holes for easy/medium)
    const puzzles: (number | null)[][] = solved.map(row => [...row]);
    let attempts = 45;
    while (attempts > 0) {
      let r = Math.floor(Math.random() * 9);
      let c = Math.floor(Math.random() * 9);
      if (puzzles[r][c] !== null) {
        puzzles[r][c] = null;
        attempts--;
      }
    }

    setGrid(puzzles);
    setInitialGrid(JSON.parse(JSON.stringify(puzzles)));
    setIsGameWon(false);
    setIsGameOver(false);
    setLives(3);
    setHintsRemaining(3);
    setErrorCells(new Set());
    setSelectedCell(null);
  };

  useEffect(() => {
    generateSudoku();
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (isLocked || isGameOver || isGameWon) return;
    if (initialGrid[r][c] !== null) return;
    playClickSound();
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (n: number) => {
    if (!selectedCell || isGameOver || isGameWon) return;
    const [r, c] = selectedCell;
    
    // Check correctness
    if (solution[r][c] === n) {
      playPopSound();
      setXp(prev => prev + 10);
      const newGrid = [...grid];
      newGrid[r][c] = n;
      setGrid(newGrid);
      
      // Remove from errors if it was there
      if (errorCells.has(`${r}-${c}`)) {
        const newErrors = new Set(errorCells);
        newErrors.delete(`${r}-${c}`);
        setErrorCells(newErrors);
      }

      // Check win condition
      const isFull = newGrid.every((row, ri) => 
        row.every((cell, ci) => cell === solution[ri][ci])
      );
      if (isFull) {
        setIsGameWon(true);
        setXp(prev => prev + 100);
        const lastWin = localStorage.getItem('lumina_last_win_date');
        const today = new Date().toDateString();
        if (lastWin !== today) {
          setStreak(prev => prev + 1);
          localStorage.setItem('lumina_last_win_date', today);
        }
      }
      
      if (isMobile) setSelectedCell(null);
    } else {
      // Incorrect placement
      playPopSound();
      const newErrors = new Set(errorCells);
      newErrors.add(`${r}-${c}`);
      setErrorCells(newErrors);
      
      const nextLives = lives - 1;
      setLives(nextLives);
      
      if (nextLives <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const useHint = () => {
    if (hintsRemaining <= 0 || isGameOver || isGameWon) return;
    playClickSound();
    
    // Find a random empty cell or fill current selected if valid
    const [r, c] = selectedCell || [-1, -1];
    
    if (r !== -1 && initialGrid[r][c] === null && grid[r][c] === null) {
      const newGrid = [...grid];
      newGrid[r][c] = solution[r][c];
      setGrid(newGrid);
      setHintsRemaining(prev => prev - 1);
      
      if (errorCells.has(`${r}-${c}`)) {
        const newErrors = new Set(errorCells);
        newErrors.delete(`${r}-${c}`);
        setErrorCells(newErrors);
      }
    } else {
      const emptyCells: [number, number][] = [];
      grid.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          if (cell === null) emptyCells.push([ri, ci]);
        });
      });

      if (emptyCells.length > 0) {
        const [hr, hc] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = [...grid];
        newGrid[hr][hc] = solution[hr][hc];
        setGrid(newGrid);
        setHintsRemaining(prev => prev - 1);
        setSelectedCell([hr, hc]);
      }
    }
  };

  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 bg-natural-yellow-muted rounded-2xl flex items-center justify-center text-natural-yellow-strong shadow-inner">
          <Lock size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-display font-extrabold text-natural-earth leading-tight">Reward Locked</h2>
          <p className="text-text-muted max-w-md mt-2 italic px-4">
            Finish all your academic tasks for today to unlock the daily challenge and keep your streak alive!
          </p>
        </div>
        
        <div className="w-full max-w-sm space-y-4 px-4">
          <div className="bento-card p-6 space-y-4 text-left border-none shadow-sm">
            <h4 className="font-bold text-natural-earth flex items-center gap-2">
              <CheckCircle2 size={18} className="text-natural-green-strong" /> Task Progress
            </h4>
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                   <div className={cn("w-2 h-2 rounded-full ring-4 ring-white shadow-sm", t.completed ? "bg-natural-green-strong" : "bg-natural-peach-strong")} />
                   <span className={cn("text-sm font-semibold", t.completed ? "line-through opacity-40 text-natural-earth" : "text-natural-earth")}>{t.title}</span>
                </div>
              )) : (
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted italic py-4">No tasks created yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 px-1">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-3xl font-display font-extrabold text-natural-earth flex items-center justify-center md:justify-start gap-2 md:gap-3">
            <Gamepad2 className="text-natural-peach-strong w-6 h-6 md:w-8 md:h-8" /> Sudoku
          </h2>
          <p className="text-[10px] md:text-base text-text-muted italic">A moment for you, {nickname || 'Alex'}.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-accent-deep tracking-widest">Level {level}</span>
              <div className="w-32 h-2 bg-natural-beige rounded-full overflow-hidden border border-[#E6DFD6]">
                 <motion.div 
                   className="h-full bg-accent-strong" 
                   animate={{ width: `${(xp / (level * 100)) * 100}%` }}
                 />
              </div>
            </div>
            <span className="text-[8px] font-bold text-text-muted">{xp} / {level * 100} XP</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-white/40 backdrop-blur-md px-4 py-2 md:px-6 md:py-4 rounded-2xl md:rounded-3xl border border-[#E6DFD6]">
             <Trophy className="text-natural-yellow-strong w-5 h-5 md:w-7 md:h-7" />
             <div>
                <p className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Streak</p>
                <p className="font-display font-bold text-natural-earth text-sm md:text-lg leading-none">{streak} Days</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Lives</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <Heart 
                    key={i} 
                    size={18} 
                    className={cn(
                      "transition-all",
                      i <= lives ? "text-natural-peach-strong fill-natural-peach-strong" : "text-natural-earth/20"
                    )} 
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={useHint}
                disabled={hintsRemaining <= 0}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all",
                  hintsRemaining > 0 ? "bg-natural-yellow-muted text-natural-yellow-strong shadow-sm hover:scale-105" : "opacity-40 grayscale"
                )}
              >
                <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                {hintsRemaining}
              </button>
              <button 
                onClick={generateSudoku}
                className="p-2 bg-white border border-[#E6DFD6] rounded-xl text-text-muted hover:bg-natural-beige transition-colors"
                title="New Game"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="bento-card bg-white p-2 md:p-4 shadow-xl aspect-square max-w-[500px] mx-auto w-full border-none relative">
             <div className="grid grid-cols-9 h-full border-2 border-natural-earth/50">
               {grid.map((row, rIdx) => 
                  row.map((cell, cIdx) => (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={cn(
                        "flex items-center justify-center text-lg md:text-xl font-bold border border-natural-beige transition-all relative overflow-hidden",
                        initialGrid[rIdx][cIdx] !== null ? "bg-natural-beige text-natural-green-deep border-natural-green-muted/20" : "bg-white text-natural-blue-strong hover:bg-natural-blue-muted/30",
                        selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx ? "bg-natural-yellow-muted/40 ring-4 ring-natural-yellow-muted/20 z-10" : "",
                        errorCells.has(`${rIdx}-${cIdx}`) ? "bg-natural-peach-muted/40 text-natural-peach-strong" : "",
                        (rIdx + 1) % 3 === 0 && rIdx !== 8 ? "border-b-2 border-b-natural-earth/30" : "",
                        (cIdx + 1) % 3 === 0 && cIdx !== 8 ? "border-r-2 border-r-natural-earth/30" : ""
                      )}
                    >
                      {cell}
                      {errorCells.has(`${rIdx}-${cIdx}`) && (
                        <div className="absolute top-0.5 right-0.5">
                          <XCircle size={8} className="text-natural-peach-strong" />
                        </div>
                      )}
                    </button>
                  ))
               )}
             </div>

             {/* Mobile Input Overlay */}
             <AnimatePresence>
               {isMobile && selectedCell && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
                 >
                    <div className="flex justify-between w-full mb-4 px-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-earth">Select Number</span>
                       <button onClick={() => setSelectedCell(null)} className="text-text-muted hover:text-natural-peach-strong"><XCircle size={20} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button
                          key={n}
                          onClick={() => handleNumberInput(n)}
                          className="aspect-square bg-white border-2 border-natural-beige rounded-2xl flex items-center justify-center font-black text-2xl text-natural-earth active:scale-90 transition-all shadow-sm"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const [r, c] = selectedCell;
                        const next = [...grid];
                        next[r][c] = null;
                        setGrid(next);
                        setErrorCells(prev => {
                          const nextErrors = new Set(prev);
                          nextErrors.delete(`${r}-${c}`);
                          return nextErrors;
                        });
                        setSelectedCell(null);
                      }}
                      className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-natural-peach-strong hover:opacity-70 transition-opacity"
                    >
                      Clear Cell
                    </button>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        <div className={cn("space-y-6", isMobile && "hidden")}>
           <div className="bento-card p-6 bg-white border-none shadow-sm space-y-6">
             <div>
               <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Input Controls</h4>
               <div className="grid grid-cols-3 gap-3">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                   <button
                     key={n}
                     onClick={() => handleNumberInput(n)}
                     disabled={isGameOver || isGameWon}
                     className="w-full aspect-square bg-white border border-natural-beige rounded-2xl flex items-center justify-center font-bold text-xl text-natural-earth hover:bg-natural-blue-muted/20 active:scale-90 transition-all shadow-sm"
                   >
                     {n}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="pt-4 border-t border-natural-beige flex flex-col gap-3">
               <button
                 onClick={() => {
                   if (selectedCell) {
                      const [r, c] = selectedCell;
                      const next = [...grid];
                      next[r][c] = null;
                      setGrid(next);
                      if (errorCells.has(`${r}-${c}`)) {
                        const newErrors = new Set(errorCells);
                        newErrors.delete(`${r}-${c}`);
                        setErrorCells(newErrors);
                      }
                   }
                 }}
                 className="w-full py-4 bg-natural-peach-muted/10 text-natural-peach-strong rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-natural-peach-muted/20 transition-colors"
               >
                 Clear Cell
               </button>
               <button 
                 onClick={generateSudoku}
                 className="w-full py-4 bg-white border border-[#E6DFD6] rounded-2xl text-text-muted font-bold flex items-center justify-center gap-2 hover:bg-natural-beige transition-colors text-xs uppercase tracking-widest"
               >
                 <RefreshCw size={14} /> Reset Game
               </button>
             </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isGameWon && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-natural-earth/40 backdrop-blur-md p-6"
           >
             <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center space-y-6 max-w-sm border-4 border-natural-green-muted">
                <div className="w-20 h-20 bg-natural-yellow-muted mx-auto rounded-3xl flex items-center justify-center text-natural-yellow-strong animate-bounce shadow-inner">
                  <Trophy size={40} />
                </div>
                <div>
                   <h3 className="text-3xl font-display font-black text-natural-earth">Brilliant!</h3>
                   <p className="text-text-muted mt-2">Puzzle solved. Your focus is sharp and your streak is safe today.</p>
                </div>
                <button 
                  onClick={() => setIsGameWon(false)}
                  className="w-full py-4 bg-natural-green-strong text-white font-black rounded-2xl shadow-lg shadow-natural-green-muted/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  Continue Journey <ChevronRight size={18} />
                </button>
             </div>
           </motion.div>
        )}

        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-natural-earth/60 backdrop-blur-md p-6"
           >
             <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center space-y-6 max-w-sm border-4 border-natural-peach-muted">
                <div className="w-20 h-20 bg-natural-peach-muted mx-auto rounded-3xl flex items-center justify-center text-natural-peach-strong shadow-inner">
                  <AlertCircle size={40} />
                </div>
                <div>
                   <h3 className="text-3xl font-display font-black text-natural-earth">Oops!</h3>
                   <p className="text-text-muted mt-2">No more lives! Sudoku is a test of patience. Want to try again?</p>
                </div>
                <button 
                  onClick={generateSudoku}
                  className="w-full py-4 bg-natural-earth text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Try Again
                </button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
