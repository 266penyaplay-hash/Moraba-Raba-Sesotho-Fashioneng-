import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DifficultyStage } from '../types';
import { Sparkles, Mountain, Volume2, Shield, Flame, Crown } from 'lucide-react';

interface OpponentCinematicBannerProps {
  stage: DifficultyStage;
  isAiTurn: boolean;
  dialogueText?: string | null;
  onAudioQuote?: () => void;
  isCinematicBoss?: boolean;
}

export const OpponentCinematicBanner: React.FC<OpponentCinematicBannerProps> = ({
  stage,
  isAiTurn,
  dialogueText,
  onAudioQuote,
  isCinematicBoss = false,
}) => {
  const currentSpeech = dialogueText || stage.aiQuote;

  return (
    <div
      className={`w-full rounded-2xl p-3 sm:p-3.5 transition-all duration-500 relative overflow-hidden border ${
        isCinematicBoss
          ? 'bg-gradient-to-r from-[#17120B]/95 via-[#261B0E]/90 to-[#120D08]/95 border-[#F5C242]/40 shadow-[0_8px_24px_rgba(245,194,66,0.18)]'
          : 'bg-[#14100D]/90 border-[#2E2318] shadow-[0_6px_20px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Stage Specific Accent Ambient Light */}
      <div
        className="absolute -top-12 -left-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-25"
        style={{ backgroundColor: stage.themeColor }}
      />
      {isCinematicBoss && (
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-xl pointer-events-none opacity-30 bg-[#FF6B00]" />
      )}

      <div className="relative z-10 flex items-start gap-3">
        {/* Opponent Avatar & Stage Badge */}
        <div className="relative shrink-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isAiTurn ? 'scale-105 ring-2 ring-offset-2 ring-offset-[#0E0C0A]' : 'opacity-90'
            }`}
            style={{
              backgroundColor: isCinematicBoss ? '#2E1E0F' : '#1C1611',
              borderColor: isAiTurn ? stage.themeColor : stage.themeColor + '60',
              boxShadow: isAiTurn ? `0 0 16px ${stage.themeColor}50` : 'none',
            }}
          >
            {isCinematicBoss ? (
              <Crown className="w-6 h-6 text-[#F5C242] animate-pulse" />
            ) : stage.stageNumber === 4 ? (
              <Flame className="w-6 h-6 text-[#8C6CFA]" />
            ) : stage.stageNumber === 3 ? (
              <Shield className="w-6 h-6 text-[#5EA38A]" />
            ) : (
              <Mountain className="w-6 h-6" style={{ color: stage.themeColor }} />
            )}
          </div>

          {/* Stage Number Pill */}
          <span
            className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border border-[#110D0A]"
            style={{
              backgroundColor: stage.themeColor,
              color: '#080604',
            }}
          >
            S{stage.stageNumber}
          </span>
        </div>

        {/* Name, Map, and Expressive Dialogue Bubble */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Syne'] font-extrabold text-xs sm:text-sm tracking-wide text-[#F4EAD7] uppercase">
                {stage.opponentName}
              </span>
              <span className="text-[10px] text-[#A99C90] font-medium hidden xs:inline">
                · {stage.aiTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: stage.themeColor + '18',
                  color: stage.themeColor,
                  borderColor: stage.themeColor + '40',
                }}
              >
                {stage.mapName} · {stage.difficultyLabel}
              </span>
              {isAiTurn && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#E9C37A] animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                  Thinking...
                </span>
              )}
            </div>
          </div>

          {/* Dialogue / Reaction Text Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSpeech}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-[#DDD2BF] italic font-['Space_Grotesk'] leading-relaxed bg-[#0E0B08]/60 rounded-lg p-2 border border-[#2B2016]/80 flex items-start justify-between gap-2"
            >
              <p className="line-clamp-2 select-text">{currentSpeech}</p>
              {onAudioQuote && (
                <button
                  onClick={onAudioQuote}
                  title="Listen to phrase"
                  className="shrink-0 p-1 rounded hover:bg-[#1E1710] text-[#D1AF7A] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
