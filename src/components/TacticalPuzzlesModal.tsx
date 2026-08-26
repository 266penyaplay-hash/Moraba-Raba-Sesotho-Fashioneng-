import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PUZZLE_CATEGORIES,
  PUZZLES_LIBRARY,
  PuzzleCategory,
  PuzzleDefinition,
  loadSolvedPuzzles,
  saveSolvedPuzzle,
} from '../constants/puzzles';
import { INITIAL_POINTS } from '../engine/morabaraba';
import { BoardPoint, PlayerId } from '../types';
import { CattleToken } from './CattleTokens';
import {
  X,
  Zap,
  Shield,
  Target,
  Compass,
  Flame,
  Award,
  Trophy,
  Crown,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { auth, saveCloudTacticalPuzzles } from '../services/firebase';

interface TacticalPuzzlesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TacticalPuzzlesModal: React.FC<TacticalPuzzlesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory | 'all'>('all');
  const [activePuzzle, setActivePuzzle] = useState<PuzzleDefinition | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>(() => loadSolvedPuzzles());
  const [boardPieces, setBoardPieces] = useState<Record<string, PlayerId | null>>({});
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSolvedIds(loadSolvedPuzzles());
    }
  }, [isOpen]);

  const initPuzzle = (puz: PuzzleDefinition) => {
    setActivePuzzle(puz);
    const fresh: Record<string, PlayerId | null> = {};
    Object.keys(INITIAL_POINTS).forEach((id) => {
      fresh[id] = puz.initialBoard[id] || null;
    });
    setBoardPieces(fresh);
    setSelectedPointId(null);
    setIsSolved(false);
    setErrorMessage(null);
    setShowHint(false);
  };

  if (!isOpen) return null;

  const filteredPuzzles =
    selectedCategory === 'all'
      ? PUZZLES_LIBRARY
      : PUZZLES_LIBRARY.filter((p) => p.category === selectedCategory);

  const handlePointClick = (pointId: string) => {
    if (!activePuzzle || isSolved) return;
    setErrorMessage(null);

    const piece = boardPieces[pointId];

    if (activePuzzle.phase === 'placing') {
      if (piece !== null) {
        setErrorMessage('Point already occupied.');
        return;
      }

      if (pointId === activePuzzle.solution.to) {
        const updated = { ...boardPieces, [pointId]: 'obsidian' as PlayerId };
        if (activePuzzle.solution.capturePointId) {
          updated[activePuzzle.solution.capturePointId] = null;
        }
        setBoardPieces(updated);
        handleSolveSuccess(activePuzzle.id);
      } else {
        setErrorMessage('Incorrect placement. Look for the decisive alignment.');
        sound.playBlunder();
      }
    } else {
      // Movement phase
      if (!selectedPointId) {
        if (piece !== 'obsidian') {
          setErrorMessage('Select your Obsidian cow to move.');
          return;
        }
        setSelectedPointId(pointId);
        sound.playSelect();
      } else {
        if (pointId === selectedPointId) {
          setSelectedPointId(null);
          return;
        }

        if (
          selectedPointId === activePuzzle.solution.from &&
          pointId === activePuzzle.solution.to
        ) {
          const updated = { ...boardPieces };
          updated[selectedPointId] = null;
          updated[pointId] = 'obsidian';
          if (activePuzzle.solution.capturePointId) {
            updated[activePuzzle.solution.capturePointId] = null;
          }
          setBoardPieces(updated);
          handleSolveSuccess(activePuzzle.id);
        } else {
          setErrorMessage('Move does not achieve the strategic objective. Try again.');
          setSelectedPointId(null);
          sound.playBlunder();
        }
      }
    }
  };

  const handleSolveSuccess = (puzId: string) => {
    setIsSolved(true);
    sound.playMill();
    sound.playFanfare();
    const updated = saveSolvedPuzzle(puzId);
    setSolvedIds(updated);

    try {
      if (auth.currentUser) {
        saveCloudTacticalPuzzles(auth.currentUser.uid, updated);
      }
    } catch (err) {
      console.warn('Tactical puzzle cloud sync warning:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-[660px] bg-[#120E0B] border border-[#3D2C1B] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.98)] text-[#E9E0CE] space-y-4 my-auto overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#2B2016] pb-3 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D9A855]/15 text-[#D9A855] border border-[#D9A855]/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                  TACTICAL ARCHIVES · MORABARABA PUZZLES
                </span>
                <span className="text-[10px] font-bold text-[#A89C8F]">
                  {solvedIds.length}/{PUZZLES_LIBRARY.length} Solved
                </span>
              </div>
              <h2 className="font-['Syne'] font-extrabold text-xl sm:text-2xl text-[#F4EAD7] tracking-tight uppercase">
                Tactical Academy
              </h2>
              <p className="text-xs text-[#A89C8F]">
                Train specific tactical patterns: mills, defense, forks, escapes, and endgames.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] transition-colors border border-[#2B2016]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* If a puzzle is actively open */}
          {activePuzzle ? (
            <div className="space-y-3 overflow-y-auto pr-1">
              {/* Back to List bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActivePuzzle(null)}
                  className="text-xs text-[#D9A855] hover:underline flex items-center gap-1 font-semibold"
                >
                  ← Back to Puzzle Library
                </button>
                <span className="text-[10px] font-mono uppercase text-[#A89C8F]">
                  {activePuzzle.location} · {activePuzzle.difficulty}
                </span>
              </div>

              {/* Prompt Box */}
              <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#2E2015] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-['Syne'] font-bold text-[#F4EAD7]">
                    {activePuzzle.title}
                  </h3>
                  <span className="text-[#D9A855] font-semibold">
                    {'★'.repeat(activePuzzle.stars)}
                  </span>
                </div>
                <p className="text-xs text-[#D5C6B1]">{activePuzzle.prompt}</p>
              </div>

              {/* Board Canvas */}
              <div className="relative w-full max-w-[320px] mx-auto aspect-square rounded-2xl overflow-hidden bg-[#1A1612] border-2 border-[#4A3722] p-2.5 shadow-inner">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="10" y="10" width="80" height="80" fill="none" stroke="#6E5030" strokeWidth="1.2" />
                  <rect x="23" y="23" width="54" height="54" fill="none" stroke="#6E5030" strokeWidth="1.2" />
                  <rect x="36" y="36" width="28" height="28" fill="none" stroke="#6E5030" strokeWidth="1.2" />

                  <line x1="50" y1="10" x2="50" y2="36" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="50" y1="64" x2="50" y2="90" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="10" y1="50" x2="36" y2="50" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="64" y1="50" x2="90" y2="50" stroke="#6E5030" strokeWidth="1.2" />

                  <line x1="10" y1="10" x2="36" y2="36" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="90" y1="10" x2="64" y2="36" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="10" y1="90" x2="36" y2="64" stroke="#6E5030" strokeWidth="1.2" />
                  <line x1="90" y1="90" x2="64" y2="64" stroke="#6E5030" strokeWidth="1.2" />

                  {(Object.entries(INITIAL_POINTS) as [string, BoardPoint][]).map(([id, pt]) => {
                    const piece = boardPieces[id];
                    const isSelected = selectedPointId === id;

                    return (
                      <g
                        key={`puz-pt-${id}`}
                        onClick={() => handlePointClick(id)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4.4"
                          fill="#120E0A"
                          stroke={isSelected ? '#FFE79A' : '#4E3721'}
                          strokeWidth={isSelected ? '1.8' : '1.1'}
                        />
                        {piece === null && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="2.6"
                            fill="none"
                            stroke="#2B1E13"
                            strokeWidth="0.8"
                            strokeDasharray="1 1"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {(Object.entries(INITIAL_POINTS) as [string, BoardPoint][]).map(([id, pt]) => {
                  const piece = boardPieces[id];
                  if (!piece) return null;
                  const isSelected = selectedPointId === id;

                  return (
                    <div
                      key={`puz-token-${id}`}
                      style={{
                        position: 'absolute',
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => handlePointClick(id)}
                      className="cursor-pointer pointer-events-auto z-10"
                    >
                      <CattleToken player={piece} size={30} isSelected={isSelected} viewAngle="top" />
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#38140E] border border-[#FF5A62]/40 text-[#FFA8A8] text-xs justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Solved Victory Box */}
              {isSolved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-[#291F11] to-[#17120B] border border-[#D9A855]/60 text-center space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-[#D9A855]">
                    <CheckCircle2 className="w-5 h-5" />
                    <h4 className="font-['Syne'] font-bold text-sm text-[#F4EAD7] uppercase">
                      PUZZLE SOLVED!
                    </h4>
                  </div>
                  <p className="text-xs text-[#D5C6B1] italic">
                    {activePuzzle.explanation}
                  </p>
                  <button
                    onClick={() => setActivePuzzle(null)}
                    className="py-2 px-4 rounded-xl bg-[#D9A855] hover:bg-[#E8BE74] text-[#120E0B] font-['Syne'] font-extrabold text-xs uppercase tracking-wider transition-all"
                  >
                    Back to Puzzles
                  </button>
                </motion.div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#D9A855] border border-[#2B2016] text-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                  </button>

                  <button
                    onClick={() => initPuzzle(activePuzzle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] border border-[#2B2016] text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              )}

              {showHint && !isSolved && (
                <div className="p-2.5 rounded-xl bg-[#1E1710] border border-[#D9A855]/30 text-xs text-[#FFE79A] italic">
                  <strong>Tactical Hint:</strong> {activePuzzle.hint}
                </div>
              )}
            </div>
          ) : (
            /* Puzzle Library Browser */
            <div className="space-y-3 overflow-y-auto pr-1">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-[#D9A855] text-[#120E0B]'
                      : 'bg-[#1C1611] text-[#A89C8F] hover:text-[#F4EAD7] border border-[#2B2016]'
                  }`}
                >
                  All Categories
                </button>
                {PUZZLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-[#D9A855] text-[#120E0B]'
                        : 'bg-[#1C1611] text-[#A89C8F] hover:text-[#F4EAD7] border border-[#2B2016]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Puzzle Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPuzzles.map((puz) => {
                  const isDone = solvedIds.includes(puz.id);

                  return (
                    <div
                      key={puz.id}
                      onClick={() => initPuzzle(puz)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 relative overflow-hidden group ${
                        isDone
                          ? 'bg-[#171B14] border-[#384A28] hover:border-[#52C41A]/60'
                          : 'bg-[#18130E] border-[#2E2015] hover:border-[#D9A855]/60 hover:bg-[#201812]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#D9A855] font-bold">
                          {puz.categoryLabel}
                        </span>
                        {isDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#52C41A]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Solved
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#A89C8F]">
                            {'★'.repeat(puz.stars)}
                          </span>
                        )}
                      </div>

                      <h4 className="font-['Syne'] font-bold text-sm text-[#F4EAD7] group-hover:text-[#FFE79A] transition-colors">
                        {puz.title}
                      </h4>

                      <p className="text-xs text-[#A89C8F] line-clamp-2">
                        {puz.prompt}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#8C7D6E]">
                        <span>{puz.location}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D9A855] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
