import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DifficultyStage } from '../types';
import { Crown, Shield, Zap, Target, Mountain, Compass, ArrowRight, Play, Swords } from 'lucide-react';
import { sound } from '../utils/audio';

interface PreMatchShowdownProps {
  isOpen: boolean;
  stage: DifficultyStage;
  rivalryWins?: number;
  rivalryLosses?: number;
  onStartMatch: () => void;
  onCancel: () => void;
}

export const PreMatchShowdown: React.FC<PreMatchShowdownProps> = ({
  isOpen,
  stage,
  rivalryWins = 0,
  rivalryLosses = 0,
  onStartMatch,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isMorena = stage.id === 'morena';
  const isSefako = stage.id === 'sefako';

  // Authentic opponent simulated career records across Lesotho
  const opponentRecords: Record<string, string> = {
    matenase: '42 Wins · 118 Losses (Apprentice)',
    bothata: '112 Wins · 64 Losses (Ridge Contender)',
    litshepe: '240 Wins · 42 Losses (Plateau Veteran)',
    sefako: '184 Wins · 21 Losses (Alpine Expert)',
    morena: '1,420 Wins · 4 Losses (Sovereign Master)',
  };

  const careerRecord = opponentRecords[stage.id] || '75 Wins · 30 Losses';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[500px] bg-[#100D0A] border border-[#3D2C1B] rounded-3xl p-6 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.98)] text-[#E9E0CE] space-y-5 my-auto overflow-hidden text-center"
        >
          {/* Atmospheric ambient flare */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{
              backgroundColor: isMorena ? '#FFD700' : isSefako ? '#8C6CFA' : stage.themeColor,
            }}
          />

          {/* Top Tag: Location & Difficulty Tier */}
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-[#1F1710] border border-[#42301F] text-[#D9A855]">
              {stage.mapName.toUpperCase()} · {stage.tierLabel.toUpperCase()}
            </span>
          </div>

          {/* Opponent Emblem / Avatar */}
          <div className="flex justify-center my-2">
            <div
              className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-transform transform hover:scale-105 ${
                isMorena
                  ? 'bg-gradient-to-br from-[#2B200A] via-[#1F1706] to-[#0D0A03] border-[#FFD700] ring-4 ring-[#FFD700]/20'
                  : 'bg-gradient-to-br from-[#261B12] to-[#120D08] border-[#8C6D48]'
              }`}
            >
              {isMorena ? (
                <Crown className="w-10 h-10 text-[#FFD700] animate-pulse" />
              ) : isSefako ? (
                <Mountain className="w-10 h-10 text-[#8C6CFA]" />
              ) : (
                <Swords className="w-10 h-10 text-[#D9A855]" />
              )}
            </div>
          </div>

          {/* Opponent Title & Name */}
          <div className="space-y-1">
            <h2 className="font-['Syne'] font-extrabold text-2xl sm:text-3xl text-[#F4EAD7] tracking-tight uppercase">
              {stage.opponentName}
            </h2>
            <p className="text-xs font-['Space_Grotesk'] text-[#D5A351] font-semibold tracking-wider uppercase">
              {stage.aiTitle}
            </p>
          </div>

          {/* The Confrontation Tension Quote */}
          <div className="p-3.5 rounded-2xl bg-[#17120D]/90 border border-[#2E2015] shadow-inner text-xs sm:text-sm italic font-['Space_Grotesk'] text-[#D6C7B2]">
            {isMorena ? (
              <span className="font-bold text-[#FFE79A] tracking-wide not-italic">
                “12 Cows. No advantage. No mercy.”
              </span>
            ) : (
              stage.aiQuote
            )}
          </div>

          {/* Opponent Stats & Head-to-Head Rivalry */}
          <div className="grid grid-cols-2 gap-2 text-left text-xs">
            <div className="p-2.5 rounded-xl bg-[#17120D] border border-[#2B1F15]">
              <span className="text-[10px] text-[#A89C8F] uppercase font-bold tracking-wider block">
                Kingdom Record
              </span>
              <span className="text-[11px] font-semibold text-[#E9E0CE] mt-0.5 block truncate">
                {careerRecord}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#17120D] border border-[#2B1F15]">
              <span className="text-[10px] text-[#A89C8F] uppercase font-bold tracking-wider block">
                Your Head-to-Head
              </span>
              <span className="text-[11px] font-bold text-[#D9A855] mt-0.5 block">
                {rivalryWins}W · {rivalryLosses}L
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-[#1E1712] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] text-xs font-bold uppercase tracking-wider border border-[#2E2116] transition-all"
            >
              Return
            </button>

            <button
              onClick={() => {
                sound.playPlacement();
                onStartMatch();
              }}
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D9A855] via-[#E8BE74] to-[#C79643] hover:brightness-110 text-[#120E0B] font-['Syne'] font-extrabold text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Face Opponent</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
