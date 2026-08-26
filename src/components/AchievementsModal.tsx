import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Achievement, loadAchievements } from '../constants/achievements';
import {
  X,
  Award,
  Crown,
  Shield,
  Flame,
  Target,
  Sparkles,
  Zap,
  Trophy,
  Mountain,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const achievements = loadAchievements();
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const renderIcon = (iconName: string, isUnlocked: boolean, isPrestige?: boolean) => {
    const className = `w-6 h-6 ${
      isUnlocked
        ? isPrestige
          ? 'text-[#FFD700] animate-bounce'
          : 'text-[#D9A855]'
        : 'text-[#5E4E3F]'
    }`;

    switch (iconName) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Mountain':
        return <Mountain className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="relative w-full max-w-[620px] bg-[#120E0B] border border-[#3D2C1B] rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.98)] text-[#E9E0CE] space-y-4 my-auto overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#2B2016] pb-3 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D9A855]/15 text-[#D9A855] border border-[#D9A855]/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                  LIKHAU TSA MORABARABA · HONORS & ACHIEVEMENTS
                </span>
                <span className="text-[10px] font-bold text-[#A89C8F]">
                  {unlockedCount}/{achievements.length} Unlocked
                </span>
              </div>
              <h2 className="font-['Syne'] font-extrabold text-xl sm:text-2xl text-[#F4EAD7] tracking-tight uppercase">
                Hall of Honors
              </h2>
              <p className="text-xs text-[#A89C8F]">
                Meaningful achievements celebrating tactical courage, comebacks, and kingdom triumphs.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] transition-colors border border-[#2B2016]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Achievement Cards */}
          <div className="space-y-2.5 overflow-y-auto pr-1">
            {achievements.map((ach) => {
              const isPrestige = ach.isPrestige;

              return (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3.5 ${
                    ach.isUnlocked
                      ? isPrestige
                        ? 'bg-gradient-to-r from-[#382B0D] via-[#241A06] to-[#120E04] border-[#FFD700]/70 shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                        : 'bg-[#1C150F] border-[#4A3722]'
                      : 'bg-[#140F0B] border-[#22180F] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                        ach.isUnlocked
                          ? isPrestige
                            ? 'bg-[#2A1F08] border-[#FFD700]'
                            : 'bg-[#241B12] border-[#D9A855]/60'
                          : 'bg-[#100D09] border-[#2B2016]'
                      }`}
                    >
                      {renderIcon(ach.iconName, ach.isUnlocked, isPrestige)}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-['Syne'] font-bold text-sm tracking-tight truncate ${
                            ach.isUnlocked
                              ? isPrestige
                                ? 'text-[#FFE79A]'
                                : 'text-[#F4EAD7]'
                              : 'text-[#A89C8F]'
                          }`}
                        >
                          {ach.title}
                        </h4>
                        {isPrestige && (
                          <span className="px-1.5 py-0.2 rounded bg-[#FFD700]/20 text-[#FFD700] text-[9px] font-bold uppercase border border-[#FFD700]/40">
                            Prestige
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A89C8F] line-clamp-2">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {ach.isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#52C41A]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#6E5D4E]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
