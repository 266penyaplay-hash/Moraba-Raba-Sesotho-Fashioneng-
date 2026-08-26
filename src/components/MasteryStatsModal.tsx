import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BASOTHO_RANKS,
  PlayerMasteryData,
  getRankTier,
  loadPlayerMastery,
} from '../utils/masteryStats';
import { DifficultyStageId } from '../types';
import { DIFFICULTY_STAGES } from '../constants/stages';
import {
  X,
  Crown,
  Trophy,
  Target,
  Shield,
  Zap,
  Award,
  Flame,
  Activity,
  Compass,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MasteryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpponent?: (stageId: DifficultyStageId) => void;
  onOpenLeaderboard?: () => void;
}

export const MasteryStatsModal: React.FC<MasteryStatsModalProps> = ({
  isOpen,
  onClose,
  onSelectOpponent,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const mastery = loadPlayerMastery();
  const currentRank = getRankTier(mastery.rating);

  const winRate =
    mastery.totalMatches > 0
      ? Math.round((mastery.totalWins / mastery.totalMatches) * 100)
      : 0;

  const avgMovesPerWin =
    mastery.victoryCountWithMoves > 0
      ? (mastery.totalMovesInVictories / mastery.victoryCountWithMoves).toFixed(1)
      : '—';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-[640px] bg-[#120E0B] border border-[#3D2C1B] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.98)] text-[#E9E0CE] space-y-4 my-auto overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#2B2016] pb-3 shrink-0">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9A855]/15 text-[#D9A855] border border-[#D9A855]/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                BOHLOALE BA MORABARABA · PLAYER MASTERY & RATING
              </span>
              <h2 className="font-['Syne'] font-extrabold text-xl sm:text-2xl text-[#F4EAD7] tracking-tight uppercase">
                Player Profile & Mastery
              </h2>
              <p className="text-xs text-[#A89C8F]">
                Authentic Basotho competitive ranking, detailed career statistics, and head-to-head records.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] transition-colors border border-[#2B2016]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Rank Card */}
            <div
              className={`p-4 rounded-2xl bg-gradient-to-r ${currentRank.bgGradient} border border-[#523A21] shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-inner"
                  style={{
                    backgroundColor: '#1E1710',
                    borderColor: currentRank.badgeColor,
                  }}
                >
                  <Crown
                    className="w-7 h-7"
                    style={{ color: currentRank.badgeColor }}
                  />
                </div>

                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#D9A855] uppercase block">
                    CURRENT BASOTHO RANK
                  </span>
                  <h3 className="font-['Syne'] font-extrabold text-xl text-[#F4EAD7] tracking-tight">
                    {currentRank.name}
                  </h3>
                  <p className="text-xs text-[#C7B7A3]">
                    {currentRank.translation}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right bg-[#120E0A]/70 px-4 py-2 rounded-xl border border-[#3E2D1B]">
                <span className="text-[10px] text-[#A89C8F] uppercase font-bold tracking-wider block">
                  Rating (Elo)
                </span>
                <span
                  className="font-mono text-2xl font-black"
                  style={{ color: currentRank.badgeColor }}
                >
                  {mastery.rating}
                </span>
                <span className="text-[10px] text-[#8C7D6E] block">
                  Peak: {mastery.peakRating}
                </span>
                {onOpenLeaderboard && (
                  <button
                    onClick={() => {
                      onOpenLeaderboard();
                      onClose();
                    }}
                    className="mt-2 px-2.5 py-1 rounded-lg bg-[#D9A855] hover:bg-[#FFE79A] text-[#120E0A] font-bold text-[10px] uppercase transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>Global Rank</span>
                  </button>
                )}
              </div>
            </div>

            {/* Career Record Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#17120D] border border-[#2B1F15]">
                <span className="text-[10px] text-[#A89C8F] uppercase font-bold block">
                  Matches
                </span>
                <span className="text-base font-bold text-[#F4EAD7] font-mono mt-0.5 block">
                  {mastery.totalMatches}
                </span>
                <span className="text-[10px] text-[#8C7D6E]">
                  {mastery.totalWins}W · {mastery.totalLosses}L
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#17120D] border border-[#2B1F15]">
                <span className="text-[10px] text-[#A89C8F] uppercase font-bold block">
                  Win Rate
                </span>
                <span className="text-base font-bold text-[#52C41A] font-mono mt-0.5 block">
                  {winRate}%
                </span>
                <span className="text-[10px] text-[#8C7D6E]">
                  {mastery.totalComebacks} Comebacks
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#17120D] border border-[#2B1F15]">
                <span className="text-[10px] text-[#A89C8F] uppercase font-bold block">
                  Mills Formed
                </span>
                <span className="text-base font-bold text-[#D9A855] font-mono mt-0.5 block">
                  {mastery.totalMillsFormed}
                </span>
                <span className="text-[10px] text-[#8C7D6E]">
                  {mastery.totalMillsPrevented} Blocked
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#17120D] border border-[#2B1F15]">
                <span className="text-[10px] text-[#A89C8F] uppercase font-bold block">
                  Cattle Taken
                </span>
                <span className="text-base font-bold text-[#FF7A29] font-mono mt-0.5 block">
                  {mastery.totalCattleCaptured}
                </span>
                <span className="text-[10px] text-[#8C7D6E]">
                  Avg {avgMovesPerWin} moves/win
                </span>
              </div>
            </div>

            {/* Head-to-Head AI Rivalry Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-['Syne'] font-extrabold text-[#F4EAD7] uppercase tracking-wider">
                  Opponent Rivalries (Head-to-Head)
                </h4>
                <span className="text-[10px] text-[#A89C8F]">
                  {mastery.seasonRecord.seasonName}
                </span>
              </div>

              <div className="space-y-1.5">
                {(Object.entries(DIFFICULTY_STAGES) as [DifficultyStageId, typeof DIFFICULTY_STAGES['matenase']][]).map(
                  ([stageId, stage]) => {
                    const record = mastery.aiRivalries[stageId] || {
                      wins: 0,
                      losses: 0,
                      draws: 0,
                    };
                    const totalOppMatches = record.wins + record.losses + record.draws;
                    const oppWinRate =
                      totalOppMatches > 0
                        ? Math.round((record.wins / totalOppMatches) * 100)
                        : 0;

                    return (
                      <div
                        key={`rivalry-${stageId}`}
                        className="p-3 rounded-xl bg-[#17120D] border border-[#2B1F15] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: stage.themeColor }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#F4EAD7] block truncate">
                              {stage.opponentName}
                            </span>
                            <span className="text-[10px] text-[#8C7D6E] block truncate">
                              {stage.mapName} · {stage.tierLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-mono font-bold text-[#D9A855]">
                              {record.wins}W - {record.losses}L
                            </span>
                            <span className="text-[10px] text-[#8C7D6E] block">
                              {totalOppMatches > 0 ? `${oppWinRate}% Win` : 'Unplayed'}
                            </span>
                          </div>

                          {onSelectOpponent && (
                            <button
                              onClick={() => {
                                sound.playPlacement();
                                onSelectOpponent(stageId);
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#241A11] hover:bg-[#D9A855] text-[#D9A855] hover:text-[#120E0B] border border-[#3E2B1A] text-[10px] font-bold uppercase transition-all"
                            >
                              Rematch
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Basotho Rank Hierarchy Overview */}
            <div className="p-3 rounded-2xl bg-[#17120D]/60 border border-[#2B1F15] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A89C8F] font-bold block">
                KINGDOM RANK HIERARCHY
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                {BASOTHO_RANKS.map((r) => {
                  const isCurrent = r.id === currentRank.id;
                  return (
                    <div
                      key={`rank-legend-${r.id}`}
                      className={`p-2 rounded-xl border ${
                        isCurrent
                          ? 'bg-[#2A1F12] border-[#D9A855] text-[#FFE79A]'
                          : 'bg-[#120E0A] border-[#22180E] text-[#8C7D6E]'
                      }`}
                    >
                      <span className="font-bold block">{r.name}</span>
                      <span className="text-[10px] block opacity-80">{r.translation}</span>
                      <span className="text-[10px] font-mono block opacity-60">
                        {r.minRating}+ Rating
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
