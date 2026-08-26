import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DailyChallenge,
  DailyStreakData,
  getDailyChallengeForDate,
  getSimilarPracticeChallenge,
  getTodayDateString,
  loadDailyStreakData,
  recordDailyCompletion,
} from '../constants/dailyChallenges';
import { BoardPoint, PlayerId } from '../types';
import { INITIAL_POINTS, ALL_MILLS, CONNECTION_SEGMENTS, checkMillsForPoint } from '../engine/morabaraba';
import { CattleToken } from './CattleTokens';
import {
  X,
  Clock,
  Flame,
  Trophy,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Share2,
  BookOpen,
  Compass,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { PuzzleDefinition } from '../constants/puzzles';
import { auth, saveCloudDailyStreak } from '../services/firebase';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDailyStreakUpdate?: (streak: number) => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onDailyStreakUpdate,
}) => {
  const todayStr = getTodayDateString();
  const [activeChallenge, setActiveChallenge] = useState<DailyChallenge>(() => getDailyChallengeForDate(todayStr));
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  const [streakData, setStreakData] = useState<DailyStreakData>(() => loadDailyStreakData());
  const [boardPieces, setBoardPieces] = useState<Record<string, PlayerId | null>>({});
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(1);
  const [movesTaken, setMovesTaken] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolutionExplanation, setShowSolutionExplanation] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [winningMillPoints, setWinningMillPoints] = useState<string[]>([]);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [countdownString, setCountdownString] = useState<string>('00:00:00');

  // Calculate live countdown to midnight local time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownString('00:00:00');
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownString(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize board state from current challenge
  const initBoard = (challengeToLoad: DailyChallenge = activeChallenge) => {
    const fresh: Record<string, PlayerId | null> = {};
    Object.keys(INITIAL_POINTS).forEach((id) => {
      fresh[id] = challengeToLoad.initialBoard[id] || null;
    });
    setBoardPieces(fresh);
    setSelectedPointId(null);
    setMovesTaken(0);
    setIsSolved(false);
    setErrorMessage(null);
    setShowHint(false);
    setShowSolutionExplanation(false);
    setWinningMillPoints([]);
  };

  useEffect(() => {
    if (!isOpen) return;
    const challenge = getDailyChallengeForDate(todayStr);
    setActiveChallenge(challenge);
    setIsPracticeMode(false);
    initBoard(challenge);

    const isAlreadyDone = !!streakData.history[todayStr]?.completed;
    if (!isAlreadyDone) {
      setTimeElapsed(0);
      setIsTimerRunning(true);
    } else {
      setIsSolved(true);
      setIsTimerRunning(false);
      setTimeElapsed(streakData.history[todayStr].solutionTimeSeconds);
      // Re-apply winning solution to board if already completed
      const updated = { ...challenge.initialBoard };
      if (challenge.solution.from) updated[challenge.solution.from] = null;
      updated[challenge.solution.to] = challenge.playerMaterial;
      if (challenge.solution.capturePointId) updated[challenge.solution.capturePointId] = null;
      setBoardPieces(updated);
    }
  }, [isOpen, todayStr]);

  // Precise timer loop (100ms precision)
  useEffect(() => {
    if (!isTimerRunning) return;
    const startTime = Date.now() - timeElapsed * 1000;
    const interval = setInterval(() => {
      setTimeElapsed((Date.now() - startTime) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const isCompletedToday = isSolved || (!isPracticeMode && !!streakData.history[todayStr]?.completed);
  const todayHistory = streakData.history[todayStr];
  const finalTimeSeconds = todayHistory?.solutionTimeSeconds || timeElapsed;
  const percentile = todayHistory?.percentile || (finalTimeSeconds <= activeChallenge.parSeconds ? 92 : 84);

  // Handle board point clicks
  const handlePointClick = (pointId: string) => {
    if (isSolved) return;
    setErrorMessage(null);

    const piece = boardPieces[pointId];
    const playerMat = activeChallenge.playerMaterial;
    const oppMat: PlayerId = playerMat === 'obsidian' ? 'ivory' : 'obsidian';

    if (activeChallenge.phase === 'placing') {
      // Direct placement move
      if (piece !== null) {
        setErrorMessage('Node already occupied.');
        sound.playBlunder();
        return;
      }

      setMovesTaken((m) => m + 1);

      // Check if placement matches the winning solution
      const isTargetNode = pointId === activeChallenge.solution.to;
      const isAltTarget = activeChallenge.solution.alternativeValidMoves?.some((m) => m.to === pointId);

      if (isTargetNode || isAltTarget) {
        // Place cow
        const updated = { ...boardPieces, [pointId]: playerMat };
        
        // Check mills formed
        const pointsMap: Record<string, BoardPoint> = {};
        Object.keys(INITIAL_POINTS).forEach((k) => {
          pointsMap[k] = { ...INITIAL_POINTS[k], piece: updated[k] ?? null };
        });
        const mills = checkMillsForPoint(pointId, playerMat, pointsMap);

        if (mills.length > 0) {
          setWinningMillPoints(mills.flatMap((m) => m.points));
        }

        // Apply capture if required
        if (activeChallenge.solution.capturePointId) {
          updated[activeChallenge.solution.capturePointId] = null;
        }

        setBoardPieces(updated);
        sound.playPlace();
        handleSolveSuccess();
      } else {
        // Incorrect placement
        setAttempts((a) => a + 1);
        setErrorMessage('Not the optimal move. Look for the decisive line.');
        sound.playBlunder();
      }
    } else {
      // Movement Phase: select -> move
      if (!selectedPointId) {
        if (piece !== playerMat) {
          setErrorMessage(`Select your ${playerMat === 'obsidian' ? 'Obsidian' : 'Ivory'} cow to move.`);
          sound.playBlunder();
          return;
        }
        setSelectedPointId(pointId);
        sound.playSelect();
      } else {
        if (pointId === selectedPointId) {
          // Deselect
          setSelectedPointId(null);
          return;
        }

        if (piece !== null) {
          setErrorMessage('Target node must be empty.');
          sound.playBlunder();
          return;
        }

        setMovesTaken((m) => m + 1);

        const isExactSolution =
          selectedPointId === activeChallenge.solution.from &&
          pointId === activeChallenge.solution.to;

        const isAltSolution = activeChallenge.solution.alternativeValidMoves?.some(
          (m) => m.from === selectedPointId && m.to === pointId
        );

        if (isExactSolution || isAltSolution) {
          const updated = { ...boardPieces };
          updated[selectedPointId] = null;
          updated[pointId] = playerMat;

          const pointsMap: Record<string, BoardPoint> = {};
          Object.keys(INITIAL_POINTS).forEach((k) => {
            pointsMap[k] = { ...INITIAL_POINTS[k], piece: updated[k] ?? null };
          });
          const mills = checkMillsForPoint(pointId, playerMat, pointsMap);

          if (mills.length > 0) {
            setWinningMillPoints(mills.flatMap((m) => m.points));
          }

          if (activeChallenge.solution.capturePointId) {
            updated[activeChallenge.solution.capturePointId] = null;
          }

          setBoardPieces(updated);
          setSelectedPointId(null);
          sound.playMove();
          handleSolveSuccess();
        } else {
          setAttempts((a) => a + 1);
          setErrorMessage('Move does not achieve the strategic objective. Try again.');
          setSelectedPointId(null);
          sound.playBlunder();
        }
      }
    }
  };

  const handleSolveSuccess = () => {
    setIsSolved(true);
    setIsTimerRunning(false);
    
    // Tactile haptic & sound sequence
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([20, 40, 20]);
    }
    sound.playMill();
    setTimeout(() => {
      sound.playFanfare();
    }, 280);

    if (!isPracticeMode) {
      const updatedStreak = recordDailyCompletion(
        todayStr,
        parseFloat(timeElapsed.toFixed(1)),
        movesTaken + 1,
        attempts
      );
      setStreakData(updatedStreak);
      if (onDailyStreakUpdate) {
        onDailyStreakUpdate(updatedStreak.currentStreak);
      }

      // Auto-sync daily streak completion to Firebase Firestore
      try {
        if (auth.currentUser) {
          saveCloudDailyStreak(auth.currentUser.uid, updatedStreak);
        }
      } catch (err) {
        console.warn('Daily streak cloud sync error:', err);
      }
    }
  };

  // Replay & highlight solution
  const handleSeeSolution = () => {
    setShowSolutionExplanation(true);
    const updated = { ...activeChallenge.initialBoard };
    if (activeChallenge.solution.from) {
      updated[activeChallenge.solution.from] = null;
    }
    updated[activeChallenge.solution.to] = activeChallenge.playerMaterial;
    if (activeChallenge.solution.capturePointId) {
      updated[activeChallenge.solution.capturePointId] = null;
    }
    setBoardPieces(updated);
    
    // Highlight winning destination node
    setWinningMillPoints([activeChallenge.solution.to]);
    sound.playSelect();
  };

  // Share result generator (spoiler-free)
  const handleShareResult = async () => {
    const timeFormatted = `${finalTimeSeconds.toFixed(1)}s`;
    const shareText = `MORABARABA\nDaily Challenge ✓\n\n🔥 ${streakData.currentStreak} Day Streak\n⏱ ${timeFormatted}\n🎯 ${attempts} ${attempts === 1 ? 'Attempt' : 'Attempts'}\n🏆 Top ${100 - percentile}%\n\nPlay at: https://ai.studio/build`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);
      } else if (navigator.share) {
        await navigator.share({
          title: 'Morabaraba Daily Challenge',
          text: shareText,
        });
      }
    } catch {
      // Fallback
    }
  };

  // Practice Similar Position handler
  const handlePracticeSimilar = () => {
    const practicePuz = getSimilarPracticeChallenge(activeChallenge.category, activeChallenge.id);
    const adaptedChallenge: DailyChallenge = {
      id: practicePuz.id,
      dateString: todayStr,
      dayNumber: activeChallenge.dayNumber,
      characterPresenter: `${practicePuz.categoryLabel} Practice`,
      category: practicePuz.category,
      categoryLabel: practicePuz.categoryLabel,
      difficulty: practicePuz.difficulty,
      stars: practicePuz.stars,
      title: practicePuz.title,
      location: practicePuz.location,
      scenario: practicePuz.prompt,
      goalDescription: practicePuz.prompt,
      humanTacticalPrompt: practicePuz.prompt,
      solutionExplanation: practicePuz.explanation,
      optimalMoves: 1,
      parSeconds: 15,
      phase: practicePuz.phase,
      turn: practicePuz.turn,
      playerMaterial: 'obsidian',
      obsidianHand: practicePuz.obsidianHand,
      ivoryHand: practicePuz.ivoryHand,
      initialBoard: practicePuz.initialBoard,
      solution: practicePuz.solution,
    };

    setActiveChallenge(adaptedChallenge);
    setIsPracticeMode(true);
    initBoard(adaptedChallenge);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setAttempts(1);
  };

  const isPlayerObsidian = activeChallenge.playerMaterial === 'obsidian';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-[540px] bg-[#120E0A] border border-[#3A2A1A] rounded-3xl p-4 sm:p-5 shadow-[0_30px_70px_rgba(0,0,0,0.98)] text-[#EFE7D8] space-y-3.5 my-auto overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b border-[#2C2014] pb-2.5">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#D9A855]/15 text-[#D9A855] border border-[#D9A855]/30 text-[9px] font-bold font-mono uppercase tracking-wider">
                  {isPracticeMode ? 'PRACTICE ARENA' : 'DAILY PUZZLE'} · {activeChallenge.dateString}
                </span>

                <span className="px-2 py-0.5 rounded-md bg-[#1F1710] text-[#B8AA9A] border border-[#2D2115] text-[9px] font-semibold uppercase tracking-wider">
                  {activeChallenge.categoryLabel}
                </span>

                {!isPracticeMode && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF7A29]/15 border border-[#FF7A29]/35 text-[#FF7A29] text-[9px] font-bold">
                    <Flame className="w-2.5 h-2.5" />
                    <span>{streakData.currentStreak} Day Streak</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-2 pt-0.5">
                <h2 className="font-['Syne'] font-extrabold text-lg sm:text-xl text-[#F7EFE0] tracking-tight uppercase truncate">
                  {activeChallenge.characterPresenter}
                </h2>
                <span className="text-[10px] text-[#A99C8F] shrink-0 font-medium">
                  {activeChallenge.location}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#1A140F] hover:bg-[#281E15] text-[#A99C8F] hover:text-[#F7EFE0] transition-colors border border-[#2C2014] shrink-0"
              aria-label="Close Daily Challenge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* STATE A: PLAYING VIEW (Objective & Running Clock) */}
          {/* ========================================================================= */}
          {!isCompletedToday && (
            <div className="space-y-1.5">
              <div className="p-3 rounded-2xl bg-[#1A140F] border border-[#2F2115] shadow-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A855] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#D9A855]" />
                    Objective
                  </span>

                  {/* Active Running Timer */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#120E0A] border border-[#2C2014] text-[11px] font-mono font-bold text-[#D9A855]">
                    <Clock className="w-3 h-3 text-[#D9A855]" />
                    <span>{timeElapsed.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Human Tactical Instruction (Never Truncated, Vertically Flexible) */}
                <p className="text-xs sm:text-sm font-medium text-[#F4EAD7] leading-relaxed break-words">
                  “{activeChallenge.humanTacticalPrompt}”
                </p>
              </div>

              {/* Turn & Material Cue */}
              <div className="flex items-center justify-between text-[10px] text-[#A99C8F] px-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPlayerObsidian ? 'bg-[#1C1713] border border-[#A98545]' : 'bg-[#EFE7D8] border border-[#8C6D48]'}`} />
                  Your Piece: <strong className="text-[#EFE7D8]">{isPlayerObsidian ? 'Obsidian Cattle' : 'Ivory Cattle'}</strong>
                </span>

                <span>
                  Phase: <strong className="text-[#D9A855] uppercase">{activeChallenge.phase}</strong>
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE TACTICAL BOARD (Hero Element) */}
          {/* ========================================================================= */}
          <div className="relative w-full max-w-[330px] sm:max-w-[350px] mx-auto aspect-square rounded-2xl overflow-hidden bg-[#16120D] border-2 border-[#43311E] p-2.5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.85)]">
            {/* Basalt Stone Texture Gradient */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 50% 50%, rgba(217,168,85,0.06) 0%, transparent 70%),
                  repeating-linear-gradient(45deg, rgba(217,168,85,0.02) 0px, rgba(217,168,85,0.02) 2px, transparent 2px, transparent 6px)
                `,
              }}
            />

            <svg viewBox="0 0 100 100" className="w-full h-full relative z-0">
              <defs>
                {/* Mill illumination glow */}
                <filter id="millGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#D9A855" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Connecting Lines */}
              {CONNECTION_SEGMENTS.map(([id1, id2], idx) => {
                const p1 = INITIAL_POINTS[id1];
                const p2 = INITIAL_POINTS[id2];
                if (!p1 || !p2) return null;

                const isMillLine =
                  winningMillPoints.includes(id1) && winningMillPoints.includes(id2);

                return (
                  <line
                    key={`line-${id1}-${id2}-${idx}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isMillLine ? '#FFE79A' : '#5E4327'}
                    strokeWidth={isMillLine ? '2.2' : '1.2'}
                    strokeOpacity={isMillLine ? '1' : '0.75'}
                    strokeLinecap="round"
                    filter={isMillLine ? 'url(#millGlow)' : undefined}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Board Nodes / Empty Rings (NO BROWN/GOLD CENTER DOTS!) */}
              {(Object.entries(INITIAL_POINTS) as [string, BoardPoint][]).map(([id, pt]) => {
                const piece = boardPieces[id];
                const isSelected = selectedPointId === id;
                const isWinningTarget = winningMillPoints.includes(id);

                return (
                  <g
                    key={`node-socket-${id}`}
                    onClick={() => handlePointClick(id)}
                    className="cursor-pointer"
                  >
                    {/* Outer Stone Socket Inset */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.4"
                      fill="#120E0A"
                      stroke={
                        isWinningTarget
                          ? '#FFE79A'
                          : isSelected
                          ? '#D9A855'
                          : '#4E3721'
                      }
                      strokeWidth={isSelected || isWinningTarget ? '1.8' : '1.1'}
                      className="transition-all duration-200"
                    />

                    {/* Empty Node: Pure elegant empty ring (NO inner dot) */}
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

            {/* Real Sculpted Cattle Tokens (Player vs Opponent) */}
            {(Object.entries(INITIAL_POINTS) as [string, BoardPoint][]).map(([id, pt]) => {
              const piece = boardPieces[id];
              if (!piece) return null;
              const isSelected = selectedPointId === id;

              return (
                <div
                  key={`daily-piece-${id}`}
                  style={{
                    position: 'absolute',
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handlePointClick(id)}
                  className="cursor-pointer pointer-events-auto z-10"
                >
                  <CattleToken
                    player={piece}
                    size={32}
                    isSelected={isSelected}
                    viewAngle="top"
                  />
                </div>
              );
            })}
          </div>

          {/* Feedback & Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#38140E] border border-[#FF5A62]/40 text-[#FFA8A8] text-xs justify-center animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STATE B: COMPLETED / PRESTIGIOUS RESULTS VIEW */}
          {/* ========================================================================= */}
          {isCompletedToday ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#241A10] via-[#1A130C] to-[#120E0A] border border-[#D9A855]/60 text-center space-y-3 shadow-lg"
            >
              {/* Prestigious Result Banner */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 text-[#D9A855]">
                  <CheckCircle2 className="w-5 h-5 text-[#52C41A]" />
                  <h3 className="font-['Syne'] font-black text-base sm:text-lg text-[#F7EFE0] tracking-wider uppercase">
                    PERFECT MOVE
                  </h3>
                </div>
                <p className="text-[11px] text-[#A99C8F]">
                  Tactical sequence verified by the Morabaraba master engine.
                </p>
              </div>

              {/* 4-Metric Performance Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2 rounded-xl bg-[#140F0B] border border-[#342416]">
                  <span className="text-[9px] text-[#A99C8F] uppercase font-bold block">
                    TIME
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#D9A855] font-mono">
                    {finalTimeSeconds.toFixed(1)}s
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#140F0B] border border-[#342416]">
                  <span className="text-[9px] text-[#A99C8F] uppercase font-bold block">
                    ATTEMPTS
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#F7EFE0] font-mono">
                    {todayHistory?.attempts || attempts}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#140F0B] border border-[#342416]">
                  <span className="text-[9px] text-[#A99C8F] uppercase font-bold block">
                    TODAY
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#52C41A]">
                    Top {100 - percentile}%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#140F0B] border border-[#342416]">
                  <span className="text-[9px] text-[#A99C8F] uppercase font-bold block">
                    STREAK
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#FF7A29]">
                    🔥 {streakData.currentStreak}d
                  </span>
                </div>
              </div>

              {/* Solution Tactical Explanation (Learning System) */}
              <div className="p-2.5 rounded-xl bg-[#17110B] border border-[#2D2014] text-left space-y-1">
                <span className="text-[9px] font-bold text-[#D9A855] uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Tactical Breakdown
                </span>
                <p className="text-[11px] text-[#D5C7B6] leading-relaxed italic">
                  “{activeChallenge.solutionExplanation}”
                </p>
              </div>

              {/* Next Challenge Live Countdown */}
              <div className="text-[10px] text-[#A99C8F] flex items-center justify-center gap-1 font-mono">
                <span>Tomorrow’s challenge unlocks in:</span>
                <strong className="text-[#FFE79A]">{countdownString}</strong>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Primary Button: DONE */}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[#D9A855] hover:bg-[#E8BE74] text-[#120E0A] font-['Syne'] font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(217,168,85,0.25)]"
                >
                  DONE
                </button>

                {/* Secondary Action Row: SEE SOLUTION | SHARE RESULT | PRACTICE */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={handleSeeSolution}
                    className="py-1.5 px-2 rounded-xl bg-[#1C150E] hover:bg-[#281D14] text-[#EFE7D8] border border-[#3A291A] text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#D9A855]" />
                    <span>Solution</span>
                  </button>

                  <button
                    onClick={handleShareResult}
                    className="py-1.5 px-2 rounded-xl bg-[#1C150E] hover:bg-[#281D14] text-[#EFE7D8] border border-[#3A291A] text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 relative"
                  >
                    {copiedNotification ? (
                      <>
                        <Check className="w-3 h-3 text-[#52C41A]" />
                        <span className="text-[#52C41A]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3 text-[#D9A855]" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePracticeSimilar}
                    className="py-1.5 px-2 rounded-xl bg-[#1C150E] hover:bg-[#281D14] text-[#EFE7D8] border border-[#3A291A] text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <Compass className="w-3 h-3 text-[#D9A855]" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* STATE A: PLAYING BOTTOM CONTROLS */
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A140F] hover:bg-[#261C14] text-[#A99C8F] hover:text-[#D9A855] border border-[#2D2014] text-xs font-semibold transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#D9A855]" />
                  <span>{showHint ? 'Hide Hint' : 'Tactical Hint'}</span>
                </button>

                <button
                  onClick={() => initBoard()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A140F] hover:bg-[#261C14] text-[#A99C8F] hover:text-[#F7EFE0] border border-[#2D2014] text-xs font-semibold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Position</span>
                </button>
              </div>

              {/* Expandable Tactical Hint */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 rounded-xl bg-[#1D1610] border border-[#D9A855]/30 text-xs text-[#FFE79A] italic"
                >
                  <strong>Coach's Hint:</strong> {activeChallenge.scenario}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
