import React from 'react';
import { PlayerState, PlayerId } from '../types';
import { SFToken } from './SFTokens';

interface ScoreboardProps {
  gold: PlayerState;
  violet: PlayerState;
  turn: PlayerId;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ gold, violet, turn }) => {
  return (
    <div className="w-full relative select-none">
      {/* Outer container with angular lightning diagonal notch in the middle */}
      <div className="relative flex items-stretch h-[64px] rounded-lg overflow-hidden border border-[#512718]/80 bg-[#0B0C10] shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
        
        {/* LEA (Gold Player) Side */}
        <div
          className={`relative flex-1 flex items-center justify-between px-3 sm:px-4 transition-all duration-300 ${
            turn === 'gold'
              ? 'bg-gradient-to-r from-[#D5A351]/25 via-[#C88943]/20 to-[#32170F]/90 border-b-2 border-[#D5A351]'
              : 'bg-[#32170F]/60 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SFToken player="gold" size={38} className="shrink-0" />
            <div className="flex flex-col">
              <span className="font-['Syne'] font-extrabold text-[15px] tracking-wide text-[#FFFDF8] uppercase leading-tight">
                {gold.name}
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#D5A351] tracking-wider uppercase">
                {gold.inHand > 0 ? `${gold.inHand} IN HAND` : `${gold.onBoard} ON BOARD`}
              </span>
            </div>
          </div>
          
          {/* Turn indicator glow for gold */}
          {turn === 'gold' && (
            <div className="hidden sm:flex items-center gap-1 text-[9px] font-['Space_Grotesk'] font-bold text-[#D5A351] bg-[#090807]/80 px-2 py-0.5 rounded-xs border border-[#C88943]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D5A351] animate-ping" />
              TURN
            </div>
          )}
        </div>

        {/* Center Angled Score Display with Lightning Notch */}
        <div className="relative z-10 w-[78px] flex items-center justify-center bg-[#090807] border-x border-[#512718]">
          {/* Angular cut geometry lines */}
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#D5A351] via-[#C88943] to-transparent opacity-60" />
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-[#7957FF] via-[#5522AA] to-transparent opacity-60" />

          <div className="font-['Space_Grotesk'] font-bold text-[19px] tracking-widest text-[#FFFDF8] flex items-center gap-1.5">
            <span className="text-[#D5A351]">{gold.score}</span>
            <span className="text-[#A99C90] text-sm">:</span>
            <span className="text-[#A88BFF]">{violet.score}</span>
          </div>
        </div>

        {/* THAABE (Violet Player) Side */}
        <div
          className={`relative flex-1 flex items-center justify-between px-3 sm:px-4 transition-all duration-300 ${
            turn === 'violet'
              ? 'bg-gradient-to-l from-[#7957FF]/30 via-[#3B1879]/40 to-[#0B0C10] border-b-2 border-[#7957FF]'
              : 'bg-[#0B0C10]/90 opacity-80'
          }`}
        >
          {/* Turn indicator glow for violet */}
          {turn === 'violet' && (
            <div className="hidden sm:flex items-center gap-1 text-[9px] font-['Space_Grotesk'] font-bold text-[#A88BFF] bg-[#090807]/80 px-2 py-0.5 rounded-xs border border-[#7957FF]/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7957FF] animate-ping" />
              TURN
            </div>
          )}

          <div className="flex items-center gap-2.5 justify-end ml-auto">
            <div className="flex flex-col text-right">
              <span className="font-['Syne'] font-extrabold text-[15px] tracking-wide text-[#A88BFF] uppercase leading-tight">
                {violet.name}
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#7957FF] tracking-wider uppercase">
                {violet.inHand > 0 ? `${violet.inHand} IN HAND` : `${violet.onBoard} ON BOARD`}
              </span>
            </div>
            <SFToken player="violet" size={38} className="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
