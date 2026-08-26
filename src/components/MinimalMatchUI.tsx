import React from 'react';
import { PlayerId, PlayerState, GamePhase, ForcedOpeningState, CattleSetId } from '../types';
import { BottleCapToken } from './BottleCapToken';
import { Clock, AlertTriangle, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MinimalMatchHeader: React.FC<{
  player: PlayerState;
  isTurn: boolean;
  isTrapped?: boolean;
  isOpener?: boolean;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
  timeRemaining?: number;
  totalTurnTime?: number;
  isClockEnabled?: boolean;
  cattleSet?: CattleSetId;
  aiDialogue?: string | null;
}> = ({
  player,
  isTurn,
  isTrapped,
  isOpener,
  onOpenMenu,
  showMenuButton,
  timeRemaining,
  isClockEnabled = true,
  cattleSet = 'heritage',
  aiDialogue,
}) => {
  const isPlayer = player.id === 'obsidian';
  const isUrgent = isTurn && timeRemaining !== undefined && timeRemaining <= 5;

  return (
    <div className="relative w-full">
      {/* Floating Temporary AI Personality Speech Bubble (Doesn't shift layout) */}
      <AnimatePresence>
        {aiDialogue && !isPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute left-10 -top-8 z-50 max-w-[280px] bg-[#1E1712]/95 border border-[#8C6838]/80 text-[#F5EBD9] px-3 py-1.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.9)] text-[11px] font-['Space_Grotesk'] leading-tight backdrop-blur-md pointer-events-none"
          >
            <div className="flex items-center gap-1.5 text-[#D5A351] font-bold text-[10px] uppercase tracking-wider mb-0.5">
              <MessageSquare className="w-2.5 h-2.5" />
              <span>{player.name}</span>
            </div>
            <p className="italic text-[#E8DAC2]">“{aiDialogue}”</p>
            {/* Bubble arrow */}
            <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-[#1E1712] border-r border-b border-[#8C6838]/80 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`w-full rounded-xl px-3 py-2 select-none transition-all duration-300 border flex items-center justify-between gap-2.5 ${
          isTurn
            ? 'bg-[#1C1610]/95 border-[#A88349]/70 shadow-[0_4px_16px_rgba(168,131,73,0.12)]'
            : 'bg-[#100D0A]/85 border-[#281F17]/70 opacity-80'
        }`}
      >
        {/* Left: Compact Avatar & Name/Cattle Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <BottleCapToken player={player.id} size={32} cattleSet={cattleSet} />
            {isTurn && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#52C41A] border-2 border-[#100D0A] animate-pulse" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-['Syne'] font-bold text-[12px] tracking-wide uppercase truncate ${
                  isTurn ? 'text-[#F5EBD9]' : 'text-[#A89886]'
                }`}
              >
                {player.name}
              </span>

              {isOpener && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-['Space_Grotesk'] font-bold bg-[#A88349]/20 border border-[#A88349]/50 text-[#F5EBD9] uppercase">
                  Opening Obligation
                </span>
              )}

              {isTrapped && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-['Space_Grotesk'] font-bold bg-[#E02424]/20 border border-[#E02424]/50 text-[#FFA8A8] uppercase">
                  Trapped
                </span>
              )}
            </div>

            {/* Clean Cattle Count Indicator */}
            <div className="flex items-center gap-1 text-[11px] font-['Space_Grotesk'] font-medium text-[#C4B298]">
              <span className="text-[12px]">🐄</span>
              <span>
                {player.inHand > 0
                  ? `${player.inHand} TO PLACE`
                  : `${player.onBoard} REMAINING`}
              </span>
              {player.captured > 0 && (
                <span className="text-[#8C7A68] text-[10px] ml-1">
                  ({player.captured} captured)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Turn Clock Countdown & Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {isClockEnabled && isTurn && timeRemaining !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border font-mono text-[11px] font-bold transition-all ${
                isUrgent
                  ? 'bg-[#3D140A] border-[#FF4D4F] text-[#FF4D4F] animate-pulse shadow-[0_0_8px_rgba(255,77,79,0.4)]'
                  : 'bg-[#18120D] border-[#38281B] text-[#D5A351]'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}s</span>
            </div>
          )}

          {showMenuButton && onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#18120D] border border-[#38281B] text-[#D5A351] hover:text-[#F5EBD9] hover:border-[#A88349] transition-all"
              aria-label="Open Game Menu"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="1" y1="3.5" x2="13" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ForcedOpeningBanner: React.FC<{ forcedOpening: ForcedOpeningState }> = ({ forcedOpening }) => {
  const trappedName = forcedOpening.trappedPlayerId === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02';
  const openerName = forcedOpening.openingPlayerId === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02';

  return (
    <div className="w-full my-1 p-2 rounded-xl bg-[#24150E]/95 border border-[#8C6838]/50 shadow-[0_4px_16px_rgba(0,0,0,0.85)] text-[#E9E0CE] select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#D5A351] shrink-0" />
          <div>
            <div className="font-['Syne'] font-bold text-[11px] tracking-wider text-[#F5EBD9] uppercase">
              SOTHO RULE: FORCED OPENING
            </div>
            <div className="font-['Space_Grotesk'] text-[10px] text-[#C4B298]">
              {trappedName} IS TRAPPED · {openerName} MUST OPEN
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#100D0A] border border-[#3D281A] text-[10px] font-['Space_Grotesk'] font-bold text-[#D5A351]">
          <span>TRY #{forcedOpening.forcedOpeningMoveCount + 1}</span>
        </div>
      </div>
    </div>
  );
};

export const ContextualInstruction: React.FC<{
  instruction: string;
  phase: GamePhase;
  isForcedOpening?: boolean;
  isUrgentClock?: boolean;
}> = ({ instruction, phase, isForcedOpening, isUrgentClock }) => {
  return (
    <div className="w-full flex items-center justify-center py-0.5">
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border shadow-[0_4px_12px_rgba(0,0,0,0.85)] text-[12px] font-['Space_Grotesk'] tracking-wide transition-all ${
          isUrgentClock
            ? 'bg-[#3A1408]/95 border-[#FF4500]/60 text-[#FFE2D9] animate-pulse'
            : isForcedOpening
            ? 'bg-[#2A170F]/90 border-[#8C6838]/50 text-[#F5EBD9]'
            : 'bg-[#16120E]/90 border-[#30241A] text-[#E8DAC2]'
        }`}
      >
        {isUrgentClock ? (
          <AlertTriangle className="w-3.5 h-3.5 text-[#FF6347]" />
        ) : (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              phase === 'shooting'
                ? 'bg-[#E02424] animate-ping'
                : isForcedOpening
                ? 'bg-[#D5A351] animate-pulse'
                : 'bg-[#8C6838]'
            }`}
          />
        )}
        <span className="font-medium">{instruction}</span>
      </div>
    </div>
  );
};
