import React from 'react';
import { SFBadge, SFFullWordmark, SFMonogram } from './SFLogos';
import { SFPatternBackground, SFAngularCorner } from './SFPatterns';
import {
  Play,
  Trophy,
  Users,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Crown,
  Cloud,
  LogIn,
  CheckCircle2,
  Radio,
  UserPlus,
  Share2,
} from 'lucide-react';
import { SF_COLORS } from '../constants/designTokens';
import { TACTICIAN_AVATARS } from '../services/firebase';

interface LobbyScreenProps {
  onStartMatch: (mode: 'pass-and-play' | 'ai') => void;
  onOpenOnlineMatch?: () => void;
  onViewPrizes: () => void;
  onViewPatterns: () => void;
  onViewLeaderboard?: () => void;
  onOpenCloudSync?: () => void;
  onOpenAuthModal?: () => void;
  isCloudSynced?: boolean;
  currentUserDisplayName?: string;
  userClanTitle?: string;
  userAvatarIcon?: string;
  isAnonymous?: boolean;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onStartMatch,
  onOpenOnlineMatch,
  onViewPrizes,
  onViewPatterns,
  onViewLeaderboard,
  onOpenCloudSync,
  onOpenAuthModal,
  isCloudSynced = false,
  currentUserDisplayName,
  userClanTitle,
  userAvatarIcon = 'mokorotlo',
  isAnonymous = true,
}) => {
  const avatarObj =
    TACTICIAN_AVATARS.find((a) => a.id === userAvatarIcon) || TACTICIAN_AVATARS[0];

  return (
    <div className="w-full space-y-4 select-none pb-4">
      {/* Cloud Sync & User Profile Status Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#14100D] border border-[#3A2B1D] text-xs">
        <div
          onClick={onOpenAuthModal}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm">
            {avatarObj.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#E9DFCE] font-bold text-xs">
                {currentUserDisplayName || 'Basotho Guest Tactician'}
              </span>
              {userClanTitle && (
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                  {userClanTitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {isAnonymous ? (
                <span className="text-[10px] text-[#A89884]">Guest Mode · Tap to create account</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-[#52D48E] font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Account Synced
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 text-[11px] font-bold text-[#FFE79A] hover:text-[#FFF] bg-[#241A12] hover:bg-[#342418] px-2.5 py-1.5 rounded-lg border border-[#4E3722] transition-colors"
            >
              {isAnonymous ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-[#D9A855]" />
                  <span>Sign In / Sign Up</span>
                </>
              ) : (
                <>
                  <span>My Profile</span>
                </>
              )}
            </button>
          )}

          {onOpenCloudSync && (
            <button
              onClick={onOpenCloudSync}
              title="Cloud Database Status"
              className="p-1.5 rounded-lg bg-[#241A12] hover:bg-[#342418] border border-[#4E3722] text-[#52D48E] transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Hero Brand Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#32170F] via-[#1A0C08] to-[#090807] border border-[#512718] p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
        <SFPatternBackground strength="hero" color="#C88943" />
        <SFAngularCorner position="top-right" size={24} color="#D5A351" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <SFBadge label="EVENT ID 2026" variant="gold" />
            <SFBadge label="ONLINE MULTIPLAYER" variant="neutral" />
          </div>

          <SFFullWordmark subtitle="FUTURE HERITAGE STRATEGY" className="my-2" />

          <p className="font-['Space_Grotesk'] text-xs sm:text-sm text-[#F6E9D2]/90 max-w-sm mt-1 leading-relaxed">
            Basotho streetwear culture meets master competitive strategy. 12 cows, traditional mills, live invites.
          </p>

          {/* Quick Online Action Button */}
          {onOpenOnlineMatch && (
            <button
              id="lobby-invite-friend-hero-btn"
              onClick={onOpenOnlineMatch}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Users className="w-4 h-4" />
              <span>Invite Friend & Play Online</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Matchmaking Modes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* ONLINE MULTIPLAYER CARD */}
        {onOpenOnlineMatch && (
          <button
            id="lobby-online-mode-card"
            onClick={onOpenOnlineMatch}
            className="relative text-left p-4 rounded-xl bg-gradient-to-r from-[#241306] to-[#120A03] border border-amber-500/50 hover:border-amber-400 transition-all group overflow-hidden shadow-md sm:col-span-3 lg:col-span-1"
          >
            <SFPatternBackground strength="accent" color="#D9A855" />
            <SFAngularCorner position="top-right" size={16} color="#D9A855" />

            <div className="relative z-10 flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-[#090807] border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <Radio className="w-5 h-5 animate-pulse text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Syne'] font-extrabold text-sm sm:text-base text-[#FFFDF8] uppercase tracking-wide">
                    Live Online Match
                  </h3>
                  <span className="text-[9px] font-['Space_Grotesk'] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                    P2P INVITES
                  </span>
                </div>
                <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-1 leading-snug">
                  Generate invite codes, copy join links, or enter a friend's code.
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Pass & Play / 2-Player Local */}
        <button
          onClick={() => onStartMatch('pass-and-play')}
          className="relative text-left p-4 rounded-xl bg-gradient-to-r from-[#32170F] to-[#1F0E09] border border-[#512718] hover:border-[#D5A351] transition-all group overflow-hidden shadow-md sm:col-span-1"
        >
          <SFPatternBackground strength="accent" color="#C88943" />
          <SFAngularCorner position="top-right" size={16} color="#C88943" />

          <div className="relative z-10 flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#090807] border border-[#512718] flex items-center justify-center text-[#D5A351] group-hover:scale-105 transition-transform shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-['Syne'] font-extrabold text-sm sm:text-base text-[#FFFDF8] uppercase tracking-wide">
                  Pass & Play
                </h3>
                <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#D5A351] bg-[#090807] px-2 py-0.5 rounded-xs border border-[#512718]">
                  LOCAL
                </span>
              </div>
              <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-1 leading-snug">
                One device: LEA vs THAABE.
              </p>
            </div>
          </div>
        </button>

        {/* Solo vs Khabane AI */}
        <button
          onClick={() => onStartMatch('ai')}
          className="relative text-left p-4 rounded-xl bg-gradient-to-r from-[#170B28] to-[#0D071A] border border-[#7957FF]/40 hover:border-[#7957FF] transition-all group overflow-hidden shadow-md sm:col-span-2 lg:col-span-1"
        >
          <SFPatternBackground strength="accent" color="#7957FF" />
          <SFAngularCorner position="top-right" size={16} color="#7957FF" />

          <div className="relative z-10 flex items-start gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#090807] border border-[#7957FF]/50 flex items-center justify-center text-[#A88BFF] group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-['Syne'] font-extrabold text-sm sm:text-base text-[#FFFDF8] uppercase tracking-wide">
                  Vs Khabane AI
                </h3>
                <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#A88BFF] bg-[#090807] px-2 py-0.5 rounded-xs border border-[#7957FF]/40">
                  SOLO BOT
                </span>
              </div>
              <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-1 leading-snug">
                Challenge the Sesotho neural bot.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Global Leaderboard Quick Card */}
      {onViewLeaderboard && (
        <div
          onClick={onViewLeaderboard}
          className="relative cursor-pointer p-4 rounded-xl bg-gradient-to-r from-[#24170E] to-[#140F0B] border border-[#D9A855]/60 hover:border-[#D9A855] transition-all overflow-hidden flex items-center justify-between shadow-md group"
        >
          <SFPatternBackground strength="accent" color="#D9A855" />
          <SFAngularCorner position="top-right" size={16} color="#FFD700" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D9A855]/20 border border-[#D9A855] flex items-center justify-center text-[#FFD700] group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Syne'] font-bold text-sm text-[#FFFDF8] uppercase">
                  Global Basotho Leaderboard
                </span>
                <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#52D48E] bg-[#090807] px-1.5 py-0.5 rounded-xs border border-[#52D48E]/40">
                  FIRESTORE LIVE
                </span>
              </div>
              <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-0.5">
                See top competitive ELO ratings, daily streaks & master ranks worldwide.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#D9A855] relative z-10 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}

      {/* 3. Season 2026 Streetwear Pass Banner */}
      <div
        onClick={onViewPrizes}
        className="relative cursor-pointer p-4 rounded-xl bg-[#32170F]/80 border border-[#512718] hover:border-[#D5A351]/80 transition-all overflow-hidden flex items-center justify-between shadow-md"
      >
        <SFPatternBackground strength="ghost" color="#C88943" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D5A351]/10 border border-[#D5A351]/40 flex items-center justify-center text-[#D5A351]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Syne'] font-bold text-sm text-[#FFFDF8] uppercase">
                SF '26 Streetwear Drop #01
              </span>
              <span className="text-[9px] font-['Space_Grotesk'] font-bold text-[#36E58B] bg-[#090807] px-1.5 py-0.5 rounded-xs border border-[#36E58B]/30">
                ACTIVE
              </span>
            </div>
            <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-0.5">
              Unlock the Enamel Pin Set & Maseru Varsity Jacket.
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#D5A351] relative z-10" />
      </div>

      {/* 4. Pattern System & Brand Tokens Quick Link */}
      <button
        onClick={onViewPatterns}
        className="w-full text-center py-2.5 rounded-lg border border-[#512718] bg-[#090807] hover:bg-[#32170F]/50 text-xs font-['Space_Grotesk'] font-bold tracking-wider text-[#D5A351] uppercase transition-colors"
      >
        Inspect Sesotho Fashioneng Design Tokens & Pattern Strengths →
      </button>
    </div>
  );
};
