import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DifficultyStage, DifficultyStageId, PlayerId, PlayerProgression, GameState } from '../types';
import { DIFFICULTY_STAGES } from '../constants/stages';
import { computeMatchPerformanceStats } from '../utils/performanceStats';
import {
  Crown,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Flame,
  CheckCircle,
  Unlock,
  FastForward,
  Pause,
  Zap,
  Target,
  Shield,
  Activity,
  Lightbulb,
  Compass,
  ChevronRight,
  Crosshair,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryCelebrationModalProps {
  isOpen: boolean;
  winner: PlayerId | null;
  stage: DifficultyStage;
  isAiMatch: boolean;
  gameState?: GameState;
  progression?: PlayerProgression;
  onNextStage: (nextStageId: DifficultyStageId) => void;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const VictoryCelebrationModal: React.FC<VictoryCelebrationModalProps> = ({
  isOpen,
  winner,
  stage,
  isAiMatch,
  gameState,
  progression,
  onNextStage,
  onPlayAgain,
  onClose,
}) => {
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState<number>(6);
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'summary'>('analytics');

  const playerWon = winner === 'obsidian';
  const isMorenaBeaten = playerWon && stage.id === 'morena';
  const isSefakoBeaten = playerWon && stage.id === 'sefako';

  // Compute strategic match analytics
  const stats = useMemo(() => {
    if (!gameState) return null;
    return computeMatchPerformanceStats(gameState, stage);
  }, [gameState, stage]);

  const nextStageId: DifficultyStageId | null =
    stage.stageNumber < 5
      ? (Object.values(DIFFICULTY_STAGES).find((s) => s.stageNumber === stage.stageNumber + 1)
          ?.id as DifficultyStageId)
      : null;

  const nextStage = nextStageId ? DIFFICULTY_STAGES[nextStageId] : null;

  // Auto-advance countdown timer when user wins an AI match with a next stage
  useEffect(() => {
    if (!isOpen || !playerWon || !isAiMatch || !nextStageId || isAutoPaused) {
      return;
    }

    setAutoAdvanceSeconds(6);
    const interval = setInterval(() => {
      setAutoAdvanceSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sound.playFanfare();
          onNextStage(nextStageId);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, playerWon, isAiMatch, nextStageId, isAutoPaused, onNextStage, onClose]);

  if (!isOpen || !winner) return null;

  const dialogue = playerWon
    ? stage.dialogues.onPlayerWin[0]
    : stage.dialogues.onAiWin[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          className="relative w-full max-w-[520px] bg-[#120E0B] border border-[#3D2E1F] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.98)] text-[#E9E0CE] space-y-4 text-center my-auto overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Ambient Lighting Flare */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-35"
            style={{
              backgroundColor: playerWon
                ? isMorenaBeaten
                  ? '#FFD700'
                  : stage.themeColor
                : '#FF5A62',
            }}
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#2C2116] shrink-0">
            <div className="flex items-center gap-2.5 text-left">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md shrink-0"
                style={{
                  backgroundColor: '#1E1710',
                  borderColor: playerWon ? '#D9A855' : '#FF5A62',
                }}
              >
                {playerWon ? (
                  isMorenaBeaten ? (
                    <Crown className="w-5 h-5 text-[#FFD700] animate-bounce" />
                  ) : (
                    <Trophy className="w-5 h-5 text-[#D9A855]" />
                  )
                ) : (
                  <RotateCcw className="w-5 h-5 text-[#FF5A62]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: stage.themeColor + '20',
                      color: stage.themeColor,
                      borderColor: stage.themeColor + '50',
                    }}
                  >
                    {stage.tierLabel}
                  </span>
                  {stats && (
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-[#2A1E12] text-[#FFE79A] border border-[#D9A855]/40 flex items-center gap-1">
                      <span>GRADE</span>
                      <strong className="text-[#FFD700]">{stats.grade}</strong>
                    </span>
                  )}
                </div>
                <h2 className="font-['Syne'] font-extrabold text-lg sm:text-xl text-[#F4EAD7] tracking-tight uppercase leading-tight mt-0.5">
                  {playerWon
                    ? isMorenaBeaten
                      ? 'MORENA LETSIE HAS FALLEN!'
                      : 'VICTORY ON THE ROCK!'
                    : 'KRAAL OVERCOME'}
                </h2>
              </div>
            </div>

            {/* Quick Toggle Tabs */}
            <div className="flex items-center bg-[#1E1711] p-1 rounded-xl border border-[#332316] text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'analytics'
                    ? 'bg-[#D9A855] text-[#120E0A] shadow-xs'
                    : 'text-[#A89C8F] hover:text-[#F4EAD7]'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>Stats</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === 'summary'
                    ? 'bg-[#D9A855] text-[#120E0A] shadow-xs'
                    : 'text-[#A89C8F] hover:text-[#F4EAD7]'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>Story</span>
              </button>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div className="overflow-y-auto space-y-3.5 pr-1 text-left custom-scrollbar">
            
            {/* ========================================================================= */}
            {/* TAB 1: STRATEGIC PERFORMANCE ANALYTICS & COACHING INSIGHTS */}
            {/* ========================================================================= */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-3">
                {/* Core 2-Column Metrics: Moves-per-Mill & Capture Ratio */}
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* METRIC 1: MOVES PER MILL */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1E1710] to-[#16100B] border border-[#483321] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#A99C90] uppercase flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#D9A855]" /> Moves / Mill
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#2D1F13] text-[#FFE79A] border border-[#523B25]">
                        {stats.tempoTier === 'LETHAL'
                          ? '⚡ Lethal'
                          : stats.tempoTier === 'HIGH_EFFICIENCY'
                          ? '⚔️ High'
                          : stats.tempoTier === 'BALANCED'
                          ? '🛡️ Balanced'
                          : stats.tempoTier === 'ATTRITION'
                          ? '⏳ Siege'
                          : '—'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-[#FFFDF8]">
                        {stats.playerMovesPerMill !== null ? stats.playerMovesPerMill : '—'}
                      </span>
                      <span className="text-[10px] text-[#A89C8F] font-mono">
                        {stats.playerMovesPerMill !== null ? 'moves/mill' : '0 mills'}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#CDBEAA] leading-snug">
                      {stats.playerMills > 0
                        ? `${stats.playerMills} mills ignited across ${stats.playerMoves} moves.`
                        : 'No completed mills during match.'}
                    </p>

                    {/* Comparative indicator with opponent */}
                    {stats.opponentMovesPerMill !== null && (
                      <div className="mt-2 pt-2 border-t border-[#2F2115] flex items-center justify-between text-[9px] text-[#A89C8F]">
                        <span>vs {stage.opponentName}:</span>
                        <span className="font-mono font-bold text-[#E5D7C2]">
                          {stats.opponentMovesPerMill} m/m
                        </span>
                      </div>
                    )}
                  </div>

                  {/* METRIC 2: CAPTURE RATIO */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1E1710] to-[#16100B] border border-[#483321] relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#A99C90] uppercase flex items-center gap-1">
                        <Target className="w-3 h-3 text-[#36E58B]" /> Capture Ratio
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#132A1D] text-[#69F0AE] border border-[#1B4D31]">
                        {stats.playerCaptures}/12 Cows
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-[#36E58B]">
                        {stats.playerCaptureRatio}%
                      </span>
                      <span className="text-[10px] text-[#A89C8F] font-mono">decimated</span>
                    </div>

                    <p className="text-[10px] text-[#CDBEAA] leading-snug">
                      Kraal raid efficiency of opposing herd.
                    </p>

                    {/* Retention indicator */}
                    <div className="mt-2 pt-2 border-t border-[#2F2115] flex items-center justify-between text-[9px] text-[#A89C8F]">
                      <span>Herd Retained:</span>
                      <span className="font-mono font-bold text-[#36E58B]">
                        {stats.playerKraalRetention}% ({Math.max(0, 12 - stats.opponentCaptures)}/12)
                      </span>
                    </div>
                  </div>

                </div>

                {/* Performance Breakdown Table & Head-to-Head Bar */}
                <div className="p-3 rounded-2xl bg-[#17120D] border border-[#2F2115] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-['Syne'] font-bold text-[#E5D7C2]">
                    <span className="flex items-center gap-1 text-[#D9A855]">
                      <Crosshair className="w-3.5 h-3.5" /> Head-to-Head Match Metrics
                    </span>
                    <span className="text-[10px] font-mono text-[#A89C8F]">
                      Total Turns: {stats.totalTurns}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                    <div className="p-2 rounded-xl bg-[#1F1812] border border-[#3A2A1A]">
                      <span className="text-[#A99C90] uppercase block text-[9px] font-bold">Total Mills</span>
                      <div className="font-['Syne'] font-extrabold text-sm text-[#F4EAD7] mt-0.5 flex items-center justify-center gap-1">
                        <span className="text-[#FFE79A]">{stats.playerMills}</span>
                        <span className="text-[#6E5B4B]">vs</span>
                        <span className="text-[#A89C8F]">{stats.opponentMills}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#1F1812] border border-[#3A2A1A]">
                      <span className="text-[#A99C90] uppercase block text-[9px] font-bold">Captures</span>
                      <div className="font-['Syne'] font-extrabold text-sm text-[#36E58B] mt-0.5 flex items-center justify-center gap-1">
                        <span>{stats.playerCaptures}</span>
                        <span className="text-[#6E5B4B]">vs</span>
                        <span className="text-[#FF7A85]">{stats.opponentCaptures}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#1F1812] border border-[#3A2A1A]">
                      <span className="text-[#A99C90] uppercase block text-[9px] font-bold">Tempo Lead</span>
                      <div className="font-['Syne'] font-extrabold text-sm text-[#D9A855] mt-0.5">
                        {stats.playerMovesPerMill !== null && stats.opponentMovesPerMill !== null
                          ? stats.playerMovesPerMill <= stats.opponentMovesPerMill
                            ? `+${(stats.opponentMovesPerMill - stats.playerMovesPerMill).toFixed(1)} m/m`
                            : `-${(stats.playerMovesPerMill - stats.opponentMovesPerMill).toFixed(1)} m/m`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GRANDMASTER TACTICAL COACHING CARD */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#21170E] via-[#2A1D11] to-[#21170E] border border-[#D9A855]/40 space-y-2 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs font-['Syne'] font-bold text-[#FFE79A]">
                    <Lightbulb className="w-4 h-4 text-[#FFD700]" />
                    <span>Grandmaster Strategic Coaching</span>
                  </div>

                  <p className="text-xs text-[#E9DFCF] font-['Space_Grotesk'] leading-relaxed">
                    {stats.tacticalSummary}
                  </p>

                  <div className="pt-2 border-t border-[#3E2B19] flex items-start gap-1.5 text-[11px] text-[#D1AF7A]">
                    <span className="font-bold text-[#FFD700] shrink-0">Actionable Advice:</span>
                    <span className="leading-snug">{stats.tacticalAdvice}</span>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: STORY, DIALOGUES & CAMPAIGN NARRATIVE */}
            {/* ========================================================================= */}
            {(activeTab === 'summary' || !stats) && (
              <div className="space-y-3">
                {/* Result Description */}
                <p className="text-xs text-[#A89C8F] leading-relaxed">
                  {playerWon
                    ? isMorenaBeaten
                      ? 'You have accomplished what few alive can claim. You defeated the master at Tsoenene.'
                      : `You defeated ${stage.opponentName} on the continuous carved slate of ${stage.mapName}!`
                    : `${stage.opponentName} held the kraal firm. Regroup, refine your placement tempo, and challenge again.`}
                </p>

                {/* Opponent Parting Dialogue */}
                {isAiMatch && (
                  <div className="p-3.5 rounded-xl bg-[#18120B] border border-[#2D2115] text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D9A855]">
                      <span>{stage.opponentName} ({stage.aiTitle}):</span>
                    </div>
                    <p className="text-xs italic text-[#DDD2BF] font-['Space_Grotesk'] leading-relaxed">
                      "{dialogue}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Auto-Advance Notification Banner (Active during campaign progression) */}
            {playerWon && isAiMatch && nextStage && (
              <div className="p-3 rounded-xl bg-[#1A140E] border border-[#D9A855]/40 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FastForward className="w-3.5 h-3.5 text-[#D9A855] animate-pulse" />
                    <span className="font-['Syne'] font-bold text-xs text-[#FFE79A] uppercase">
                      Advancing to Stage {nextStage.stageNumber}: {nextStage.opponentName}
                    </span>
                  </div>
                  {!isAutoPaused ? (
                    <span className="text-[11px] font-mono font-bold text-[#D9A855]">
                      {autoAdvanceSeconds}s
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#8C9090] uppercase">Paused</span>
                  )}
                </div>

                {/* Progress bar */}
                {!isAutoPaused && (
                  <div className="w-full h-1.5 bg-[#0E0C0A] rounded-full overflow-hidden border border-[#2E2318]">
                    <div
                      className="h-full bg-gradient-to-r from-[#A98545] to-[#FFD700] transition-all duration-1000"
                      style={{ width: `${(autoAdvanceSeconds / 6) * 100}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#A89C8F]">
                  <span>Map: {nextStage.mapName} ({nextStage.difficultyLabel})</span>
                  <button
                    type="button"
                    onClick={() => setIsAutoPaused(!isAutoPaused)}
                    className="text-xs text-[#D1AF7A] hover:text-[#FFE79A] underline flex items-center gap-1"
                  >
                    <Pause className="w-3 h-3" />
                    <span>{isAutoPaused ? 'Resume Auto-Advance' : 'Pause'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sefako Defeated -> Unlocked Morena Tier 5 Notification */}
            {isSefakoBeaten && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#241A0E] via-[#332210] to-[#241A0E] border border-[#F5C242]/60 space-y-1.5 text-left shadow-[0_0_15px_rgba(245,194,66,0.2)]">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-[#F5C242]" />
                  <span className="font-['Syne'] font-bold text-xs text-[#FFE79A] uppercase">
                    Final Boss Unlocked: Morena Letsie at Tsoenene!
                  </span>
                </div>
                <p className="text-xs text-[#E0D2BE] leading-relaxed">
                  You have proven yourself across Lesotho. You now have the right to sit at the board of <strong>Morena Letsie</strong>.
                </p>
              </div>
            )}

            {/* Morena Letsie Defeated -> Ultimate Achievement Badge */}
            {isMorenaBeaten && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#241A0E] via-[#332210] to-[#241A0E] border-2 border-[#FFD700]/60 space-y-2 text-left shadow-[0_0_20px_rgba(255,215,0,0.25)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFD700] animate-spin" />
                  <span className="font-['Syne'] font-bold text-xs text-[#FFE79A] uppercase">
                    Legendary Grandmaster Crown Achieved
                  </span>
                </div>

                <ul className="space-y-1 text-xs text-[#E9E0CE]">
                  <li className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
                    <span>
                      <strong>Achievement Unlocked:</strong> "I beat Morena Letsie"
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-[#FF7A29] shrink-0" />
                    <span>
                      <strong>Tsoenene Basalt Arena:</strong> Firestone Basalt Board equipped.
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#68B39B] shrink-0" />
                    <span>
                      <strong>Royal Gold Cattle:</strong> Prestige Gold-Inlaid Tokens equipped.
                    </span>
                  </li>
                </ul>
              </div>
            )}

          </div>

          {/* Modal Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#2C2116] shrink-0">
            <button
              onClick={() => {
                sound.playSelect();
                onPlayAgain();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#251D14] hover:bg-[#382B1E] text-[#E9E0CE] text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all border border-[#3E2E1D]"
            >
              <RotateCcw className="w-4 h-4 text-[#D9A855]" />
              <span>{playerWon ? 'Replay Stage' : 'Try Again'}</span>
            </button>

            {playerWon && nextStageId ? (
              <button
                onClick={() => {
                  sound.playFanfare();
                  onNextStage(nextStageId);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D9A855] to-[#F5C242] hover:brightness-110 text-[#0A0704] text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(217,168,85,0.45)]"
              >
                <span>Advance to Stage {DIFFICULTY_STAGES[nextStageId].stageNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#D9A855] hover:bg-[#FFE79A] text-[#0A0704] text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(217,168,85,0.4)]"
              >
                <span>Continue</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
