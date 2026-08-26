import React, { useState } from 'react';
import { PlayerId, PlayerState } from '../types';
import { SFBadge, SFFullWordmark } from './SFLogos';
import { SFPatternBackground, SFAngularCorner } from './SFPatterns';
import { SFToken } from './SFTokens';
import { RotateCcw, Share2, Check, Flame, Zap, Target } from 'lucide-react';

interface VictoryShareCardProps {
  winner: PlayerId;
  gold: PlayerState;
  violet: PlayerState;
  moveCount: number;
  onRematch: () => void;
  onBackToLobby: () => void;
}

export const VictoryShareCard: React.FC<VictoryShareCardProps> = ({
  winner,
  gold,
  violet,
  moveCount,
  onRematch,
  onBackToLobby,
}) => {
  const [copied, setCopied] = useState(false);
  const isGoldWinner = winner === 'obsidian' || (winner as string) === 'gold';
  const winnerName = isGoldWinner ? gold.name : violet.name;
  const winnerCaptures = isGoldWinner ? violet.captured : gold.captured;

  // Calculate Moves per Mill and Capture Ratio metrics
  const winnerMoves = Math.max(1, Math.ceil(moveCount / 2));
  const estimatedMills = Math.max(1, winnerCaptures);
  const movesPerMill = (winnerMoves / estimatedMills).toFixed(1);
  const captureRatio = Math.min(100, Math.round((winnerCaptures / 12) * 100));

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🏆 SESOTHO FASHIONENG 2026 • MORABARABA CHAMPION\n${winnerName} won in ${moveCount} turns with ${movesPerMill} moves/mill and a ${captureRatio}% capture ratio! #SesothoFashioneng #Morabaraba2026`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full space-y-4 select-none pb-4">
      {/* 1. Main High-Impact Event Poster Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#32170F] via-[#1A0C08] to-[#090807] border-2 border-[#D5A351] p-6 sm:p-7 shadow-[0_16px_50px_rgba(0,0,0,0.95)]">
        {/* Pattern Hero */}
        <SFPatternBackground strength="hero" color={isGoldWinner ? '#D5A351' : '#7957FF'} />
        
        {/* Angular Lightning Corner Accents */}
        <SFAngularCorner position="top-right" size={28} color="#D5A351" />
        <SFAngularCorner position="bottom-left" size={28} color="#D5A351" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Top Brand Badges */}
          <div className="flex items-center gap-2 mb-3">
            <SFBadge label="MATCH FINAL" variant="gold" />
            <SFBadge label="MASERU ARENA" variant="neutral" />
          </div>

          <SFFullWordmark subtitle="EVENT FINALS 2026" className="mb-4" />

          {/* Winner Enamel Pin Token Display */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#D5A351]/20 blur-xl animate-pulse" />
            <SFToken player={winner} size={84} className="relative z-10" />
          </div>

          {/* Bold Expressive Streetwear Campaign Typography */}
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-xs font-bold tracking-[0.3em] text-[#C88943] uppercase block">
              CHAMPION OF THE COWS
            </span>
            <h1 className="font-['Syne'] font-black text-3xl sm:text-4xl text-[#FFFDF8] uppercase tracking-tight leading-none mt-1">
              {winnerName} <span className="text-[#D5A351]">VICTORY</span>
            </h1>
          </div>

          {/* Match Performance Metrics in Dark Inset Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 p-3.5 rounded-xl bg-[#090807]/90 border border-[#512718]">
            <div className="flex flex-col text-center">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider">
                TURNS
              </span>
              <span className="font-['Syne'] font-extrabold text-lg text-[#FFFDF8]">
                {moveCount}
              </span>
            </div>

            <div className="flex flex-col text-center border-l sm:border-x border-[#512718]">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider flex items-center justify-center gap-1">
                <Zap className="w-2.5 h-2.5 text-[#D5A351]" /> MOVES / MILL
              </span>
              <span className="font-['Syne'] font-extrabold text-lg text-[#FFE79A]">
                {movesPerMill}
              </span>
            </div>

            <div className="flex flex-col text-center border-t sm:border-t-0 sm:border-r border-[#512718] pt-2 sm:pt-0">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider flex items-center justify-center gap-1">
                <Target className="w-2.5 h-2.5 text-[#36E58B]" /> CAPTURE RATIO
              </span>
              <span className="font-['Syne'] font-extrabold text-lg text-[#36E58B]">
                {captureRatio}% ({winnerCaptures}/12)
              </span>
            </div>

            <div className="flex flex-col text-center border-t sm:border-t-0 border-[#512718] pt-2 sm:pt-0">
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider">
                RANK ELO
              </span>
              <span className="font-['Syne'] font-extrabold text-lg text-[#D5A351] flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#D5A351]" />
                +45
              </span>
            </div>
          </div>

          {/* Streetwear Poster Tagline */}
          <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-4">
            Sesotho Fashioneng 2026 • Certified Heritage Strategy Master
          </p>
        </div>
      </div>

      {/* 2. Action Controls: Run It Back Rematch & Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onRematch}
          className="relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D5A351] to-[#C88943] hover:from-[#FFFDF8] hover:to-[#F6E9D2] text-[#090807] font-['Syne'] font-black text-sm tracking-wider uppercase transition-all shadow-[0_8px_20px_rgba(213,163,81,0.25)]"
        >
          <RotateCcw className="w-4 h-4 text-[#090807]" />
          RUN IT BACK
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#32170F] hover:bg-[#512718] border border-[#512718] text-[#F6E9D2] font-['Space_Grotesk'] font-bold text-sm tracking-wider uppercase transition-all shadow-md"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#36E58B]" />
              COPIED TO CLIPBOARD
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-[#D5A351]" />
              SHARE POSTER CARD
            </>
          )}
        </button>
      </div>

      {/* Back to Lobby */}
      <button
        onClick={onBackToLobby}
        className="w-full text-center py-2.5 rounded-lg border border-[#512718] bg-[#090807] text-xs font-['Space_Grotesk'] font-bold text-[#A99C90] hover:text-[#FFFDF8] uppercase tracking-wider"
      >
        ← Return to Tournament Lobby
      </button>
    </div>
  );
};
