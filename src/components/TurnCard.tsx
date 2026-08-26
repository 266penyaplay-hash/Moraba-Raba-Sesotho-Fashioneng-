import React from 'react';
import { GamePhase, PlayerId } from '../types';
import { SFMonogram } from './SFLogos';

interface TurnCardProps {
  turn: PlayerId;
  phase: GamePhase;
  instruction: string;
  isAiOpponent?: boolean;
}

export const TurnCard: React.FC<TurnCardProps> = ({
  turn,
  phase,
  instruction,
  isAiOpponent = false,
}) => {
  const isGold = turn === 'gold';
  const phaseLabel = phase.toUpperCase();

  return (
    <div className="w-full relative select-none">
      {/* Chocolate-black container with lightning notch and subtle border */}
      <div
        className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-300 ${
          isGold
            ? 'bg-gradient-to-r from-[#32170F] via-[#24100B] to-[#090807] border-[#512718] shadow-[0_8px_24px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-r from-[#170B28] via-[#0D071A] to-[#090807] border-[#7957FF]/40 shadow-[0_8px_24px_rgba(121,87,255,0.15)]'
        }`}
      >
        {/* Subtle decorative lightning notch pattern in the card corner */}
        <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full text-current">
            <path
              d="M60 0L30 50H50L40 100L90 40H70L80 0Z"
              fill={isGold ? '#D5A351' : '#7957FF'}
            />
          </svg>
        </div>

        {/* Angular Lightning Accent Notch on Top-Right Corner */}
        <div
          className={`absolute top-0 right-0 w-8 h-8 ${
            isGold ? 'text-[#C88943]' : 'text-[#7957FF]'
          }`}
        >
          <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
            <path d="M0 0H32V32L16 16H0V0Z" fill="currentColor" fillOpacity="0.75" />
          </svg>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Left Icon Block: Monogram framed in rounded chocolate-raised box */}
          <div
            className={`w-[68px] h-[68px] shrink-0 rounded-lg flex items-center justify-center border transition-colors ${
              isGold
                ? 'bg-[#1C0D08] border-[#512718]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                : 'bg-[#100520] border-[#7957FF]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
            }`}
          >
            <SFMonogram
              size={34}
              variant={isGold ? 'gold' : 'violet'}
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Right Text Block: Large Status, Plain-Language Instruction, Phase Badge */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2
                className={`font-['Syne'] font-black text-lg sm:text-xl tracking-tight uppercase leading-none truncate ${
                  isGold ? 'text-[#D5A351]' : 'text-[#A88BFF]'
                }`}
              >
                {isGold
                  ? 'YOUR TURN'
                  : isAiOpponent
                  ? 'KHABANE AI TURN'
                  : "THAABE'S TURN"}
              </h2>
            </div>

            <p className="font-['Space_Grotesk'] text-[13px] text-[#F6E9D2] font-medium leading-snug mt-1 line-clamp-2">
              {instruction}
            </p>

            {/* Small Phase Status Pill */}
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#090807]/90 border border-[#512718] text-[10px] font-['Space_Grotesk'] font-bold tracking-widest text-[#D5A351] uppercase">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    phase === 'shooting'
                      ? 'bg-[#FF5A62] animate-ping'
                      : isGold
                      ? 'bg-[#C88943]'
                      : 'bg-[#7957FF]'
                  }`}
                />
                <span>{phaseLabel}</span>
              </div>

              {phase === 'shooting' && (
                <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#FF5A62] uppercase tracking-wider animate-pulse">
                  MILL FORMED • CAPTURE COW
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
