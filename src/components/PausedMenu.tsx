import React from 'react';
import { GameMode, DifficultyStageId } from '../types';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Bot,
  Users,
  Sparkles,
  Sun,
  Mountain,
  MapPin,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import { SFBrandMonogram } from './BottleCapToken';
import { LesothoAtmosphere } from './LesothoBackdrop';
import { DIFFICULTY_STAGES, STAGES_LIST } from '../constants/stages';
import { User } from 'firebase/auth';

interface PausedMenuProps {
  isOpen: boolean;
  soundEnabled: boolean;
  atmosphere?: LesothoAtmosphere;
  currentStageId?: DifficultyStageId;
  currentUser?: User | null;
  isCloudSynced?: boolean;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  onOpenCloudSync?: () => void;
  onSelectStage?: (stageId: DifficultyStageId) => void;
  onSelectAtmosphere?: (atm: LesothoAtmosphere) => void;
  onClose: () => void;
  onNewGame: (mode: GameMode, stageId?: DifficultyStageId) => void;
  onToggleSound: () => void;
  onOpenDeliverables: () => void;
  onOpenJourneyMap?: () => void;
  onOpenLeaderboard?: () => void;
}

export const PausedMenu: React.FC<PausedMenuProps> = ({
  isOpen,
  soundEnabled,
  atmosphere = 'golden-dawn',
  currentStageId = 'matenase',
  currentUser,
  isCloudSynced = false,
  onSignInWithGoogle,
  onSignOut,
  onOpenCloudSync,
  onSelectStage,
  onSelectAtmosphere,
  onClose,
  onNewGame,
  onToggleSound,
  onOpenDeliverables,
  onOpenJourneyMap,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080807]/80 backdrop-blur-md transition-all duration-300 animate-fadeIn select-none">
      {/* Smoked Stone / Charcoal Slab Menu Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-[#171714]/95 border border-[#252522] shadow-[0_25px_60px_rgba(0,0,0,0.95)] p-5 text-[#E9E0CE] max-h-[90vh] overflow-y-auto">
        {/* Subtle Antique-Gold Top Edge Accent */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#A98545] to-transparent opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#252522]">
          <div className="flex items-center gap-3">
            <SFBrandMonogram size={26} fillColor="#D5A351" strokeColor="#32170F" embossed={true} />
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] tracking-[0.25em] text-[#A98545] uppercase block">
                GAME SETTINGS
              </span>
              <h2 className="font-['Syne'] font-extrabold text-lg tracking-tight text-[#F4EAD7] uppercase">
                MORABARABA
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#252522]/60 hover:bg-[#252522] text-[#8C9090] hover:text-[#F4EAD7] transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Firebase Cloud Sync Banner */}
        <div className="pt-3 pb-1">
          <button
            onClick={() => {
              if (onOpenCloudSync) {
                onOpenCloudSync();
                onClose();
              }
            }}
            className="w-full p-3 rounded-xl bg-[#110E0C] hover:bg-[#1A1410] border border-[#2D2218] hover:border-[#523A25] flex flex-col gap-2 shadow-inner transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#D9A855] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#F4EAD7] font-['Syne'] tracking-wide">
                  Firebase Cloud Storage
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C281B] text-[#78D385] border border-[#2D452B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A] animate-pulse" />
                <span>SYNCED</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A89C8F]">
              <span>
                {currentUser?.isAnonymous
                  ? '👤 Guest Player (Cloud Synced)'
                  : currentUser?.displayName
                  ? `⭐ ${currentUser.displayName}`
                  : '🟢 Firestore Connected'}
              </span>

              <span className="text-[10px] font-bold text-[#D9A855] group-hover:underline">
                Manage Cloud & Rankings →
              </span>
            </div>
          </button>
        </div>

        {/* Journey Through Lesotho Map Banner Button */}
        {onOpenJourneyMap && (
          <div className="pt-2 pb-1">
            <button
              onClick={() => {
                onOpenJourneyMap();
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-[#2A1D11] via-[#352514] to-[#2A1D11] border border-[#D9A855]/60 hover:border-[#D9A855] text-left flex items-center justify-between transition-all shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-2.5">
                <Mountain className="w-5 h-5 text-[#D9A855]" />
                <div>
                  <span className="font-['Syne'] font-extrabold text-xs text-[#FFE79A] block uppercase">
                    Journey Through Lesotho
                  </span>
                  <span className="text-[10px] text-[#C9BEB0]">
                    5 Maps, Opponents & Royal Unlocks
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#D9A855]">Map →</span>
            </button>
          </div>
        )}

        {/* 5 Stages of Difficulty Selector */}
        <div className="py-3 border-b border-[#252522] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#D1AF7A] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-[#D9A855]" />
              <span>5 Difficulty Stages & Maps</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {STAGES_LIST.map((stage) => {
              const isSelected = stage.id === currentStageId;
              return (
                <button
                  key={`menu-stage-${stage.id}`}
                  onClick={() => {
                    if (onSelectStage) onSelectStage(stage.id);
                    onNewGame('ai', stage.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#2A1E14] border-[#D9A855] text-[#FFE7B3]'
                      : 'bg-[#15120F] border-[#2B2117] text-[#A99C90] hover:border-[#4A3A29] hover:text-[#E9E0CE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: isSelected ? stage.themeColor : '#251D16',
                        color: isSelected ? '#0E0C0A' : '#A99C90',
                      }}
                    >
                      {stage.stageNumber}
                    </span>
                    <div className="truncate">
                      <div className="font-['Syne'] text-xs font-bold truncate text-[#F4EAD7]">
                        {stage.opponentName}{' '}
                        <span className="text-[10px] font-['Space_Grotesk'] font-normal text-[#D5A351]">
                          ({stage.difficultyLabel})
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C8072] flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#D9A855]" />
                        <span>Map: {stage.mapName}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-[#D5A351] shrink-0 ml-2">
                    {isSelected ? 'ACTIVE' : 'PLAY'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Navigation Options */}
        <div className="py-3 space-y-2">
          {/* Resume */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#252522]/60 hover:bg-[#252522] border border-[#3E3426] text-[#F4EAD7] transition-all"
          >
            <span className="font-['Space_Grotesk'] text-sm font-semibold tracking-wide">Resume Match</span>
            <span className="text-xs text-[#A98545]">→</span>
          </button>

          {/* New Pass & Play */}
          <button
            onClick={() => {
              onNewGame('pass-and-play');
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#171714] hover:bg-[#252522]/80 border border-[#252522] text-[#E9E0CE] hover:text-[#F4EAD7] transition-all"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#A98545]" />
              <span className="font-['Space_Grotesk'] text-sm font-medium">New 2P Pass & Play</span>
            </div>
            <RotateCcw className="w-3.5 h-3.5 text-[#8C9090]" />
          </button>

          {/* Global Leaderboard */}
          {onOpenLeaderboard && (
            <button
              onClick={() => {
                onOpenLeaderboard();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#24170E] to-[#171714] hover:bg-[#252522]/80 border border-[#D9A855]/50 text-[#FFE79A] hover:text-[#FFF] transition-all"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span className="font-['Space_Grotesk'] text-sm font-semibold">Global Leaderboard</span>
              </div>
              <span className="text-[10px] text-[#52D48E] font-bold bg-[#142318] px-2 py-0.5 rounded border border-[#27462F]">
                LIVE
              </span>
            </button>
          )}

          {/* Deliverables Suite */}
          <button
            onClick={() => {
              onOpenDeliverables();
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#171714] hover:bg-[#252522]/80 border border-[#252522] text-[#E9E0CE] hover:text-[#F4EAD7] transition-all"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-[#A98545]" />
              <span className="font-['Space_Grotesk'] text-sm font-medium">Visual Design Specs</span>
            </div>
            <span className="text-[10px] text-[#A98545] font-mono font-bold">9 SPECS</span>
          </button>
        </div>

        {/* Footer Settings */}
        <div className="pt-3 border-t border-[#252522] flex items-center justify-between">
          <button
            onClick={onToggleSound}
            className="flex items-center gap-2 text-xs text-[#8C9090] hover:text-[#F4EAD7] transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-[#A98545]" />
                <span>Maloti Soundscape On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Audio Muted</span>
              </>
            )}
          </button>

          <span className="text-[10px] text-[#8C9090]/80 tracking-widest font-mono">
            SOTHO 25
          </span>
        </div>
      </div>
    </div>
  );
};
