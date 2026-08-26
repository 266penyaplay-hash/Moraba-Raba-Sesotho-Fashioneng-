import React, { useState } from 'react';
import {
  PlayerCareerProfile,
  CareerGameMode,
  DetailedMatchRecord,
  HeadToHeadRecord,
  PrestigeHonor,
  CattleSetId,
  DifficultyStageId,
} from '../types';
import {
  Trophy,
  Shield,
  Flame,
  Zap,
  Target,
  Crown,
  Award,
  Clock,
  Swords,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BarChart3,
  Globe,
  Flag,
  Share2,
  X,
  History,
  Users2,
  Edit3,
  Save,
  Lock,
} from 'lucide-react';
import {
  calculateLevelFromXp,
  savePlayerCareerProfile,
  LESOTHO_DISTRICTS,
  COUNTRIES,
} from '../utils/careerStats';
import { getRankTier } from '../utils/masteryStats';
import { DIFFICULTY_STAGES } from '../constants/stages';

interface CareerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerCareerProfile;
  matchHistory: DetailedMatchRecord[];
  headToHeadRecords: HeadToHeadRecord[];
  onUpdateProfile: (updated: PlayerCareerProfile) => void;
  onOpenAuthModal?: () => void;
  onSelectStageForRematch?: (stageId: DifficultyStageId) => void;
}

type TabType = 'overview' | 'matches' | 'rivalries' | 'honors' | 'identity';

const CLAN_OPTIONS = [
  { id: 'Bakoena', name: 'Bakoena (Crocodile)', totem: '🐊', motto: 'Sovereign Clan of Moshoeshoe I' },
  { id: 'Bataung', name: 'Bataung (Lion)', totem: '🦁', motto: 'Fierce Protectors of the Highlands' },
  { id: 'Basia', name: 'Basia (Wildcat)', totem: '🐆', motto: 'Swift & Lethal Mountain Tacticians' },
  { id: 'Bafokeng', name: 'Bafokeng (Hare)', totem: '🐇', motto: 'Ancient Keepers of Wisdom' },
  { id: 'Batlokoa', name: 'Batlokoa (Wild Beast)', totem: '🐺', motto: 'Unyielding Warriors of Manthatisi' },
  { id: 'Makgolokwe', name: 'Makgolokwe (Falcon)', totem: '🦅', motto: 'Keen Eyed Strategic Masters' },
  { id: 'Matebele', name: 'Matebele (Spear)', totem: '⚡', motto: 'Resolute Vanguard of the South' },
];

const AVATAR_ICONS = [
  { id: 'mokorotlo', label: 'Mokorotlo Crown', icon: '👑' },
  { id: 'bull_horns', label: 'Curved Horns', icon: '🐂' },
  { id: 'maloti_shield', label: 'Highland Shield', icon: '🛡️' },
  { id: 'mountain_peak', label: 'Thaba-Bosiu', icon: '⛰️' },
  { id: 'lightning', label: 'Lethal Strike', icon: '⚡' },
  { id: 'solar_crest', label: 'Golden Dawn', icon: '☀️' },
  { id: 'ancient_stone', label: 'Tsoenene Relic', icon: '🗿' },
  { id: 'royal_star', label: 'Grand Master', icon: '⭐' },
];

export const CareerProfileModal: React.FC<CareerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  matchHistory,
  headToHeadRecords,
  onUpdateProfile,
  onOpenAuthModal,
  onSelectStageForRematch,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedMode, setSelectedMode] = useState<CareerGameMode>('overall');
  const [honorCategoryFilter, setHonorCategoryFilter] = useState<string>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Identity editing state
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(profile.displayName);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editClan, setEditClan] = useState(profile.clanTitle || 'Bakoena');
  const [editCountry, setEditCountry] = useState(profile.country || 'Lesotho 🇱🇸');
  const [editRegion, setEditRegion] = useState(profile.region || 'Maseru');
  const [editAvatar, setEditAvatar] = useState(profile.avatarIcon || 'mokorotlo');

  if (!isOpen) return null;

  const currentLevelInfo = calculateLevelFromXp(profile.careerXp);
  const currentRankTier = getRankTier(profile.rating);

  // Selected mode stats
  const activeModeStats = profile.recordsByMode[selectedMode] || profile.recordsByMode.overall;

  const handleSaveIdentity = () => {
    const updated: PlayerCareerProfile = {
      ...profile,
      displayName: editDisplayName.trim() || 'Basotho Tactician',
      username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || profile.username,
      clanTitle: editClan,
      country: editCountry,
      region: editRegion,
      avatarIcon: editAvatar,
    };
    onUpdateProfile(updated);
    savePlayerCareerProfile(updated);
    setIsEditingIdentity(false);
  };

  const filteredHonors = profile.prestigeHonors.filter((h) => {
    if (honorCategoryFilter === 'all') return true;
    if (honorCategoryFilter === 'unlocked') return h.unlocked;
    return h.category === honorCategoryFilter;
  });

  const unlockedHonorsCount = profile.prestigeHonors.filter((h) => h.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#120E0A] border border-[#D9A855]/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#E9E0CE]">
        {/* ========================================================================= */}
        {/* MODAL HEADER: Basotho Sovereign Identity & Crest */}
        {/* ========================================================================= */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#2A180E] via-[#1A120B] to-[#2A180E] border-b border-[#4A3828]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#140E0A]/80 border border-[#3A2C1E] text-[#A89886] hover:text-[#FFE79A] hover:border-[#D9A855] transition-all"
            aria-label="Close Career Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3.5">
              {/* Avatar Crest */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D2514] to-[#120D08] border-2 border-[#D9A855] flex items-center justify-center text-2xl shadow-lg shrink-0">
                {AVATAR_ICONS.find((a) => a.id === profile.avatarIcon)?.icon || '👑'}
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#120E0A] border border-[#D9A855] text-[10px] font-mono font-bold text-[#FFE79A]">
                  Lv.{currentLevelInfo.level}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-['Syne'] font-extrabold text-lg sm:text-xl text-[#F5EBD9] uppercase tracking-wide">
                    {profile.displayName}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#D9A855]/15 border border-[#D9A855]/40 text-[#FFE79A] font-bold">
                    {profile.clanTitle}
                  </span>
                  {profile.isGuest && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-mono">
                      Guest Passport
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-[#A89886] font-['Space_Grotesk']">
                  <span className="text-[#D5A351] font-mono font-bold">@{profile.username}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#A89886]" />
                    {profile.region}, {profile.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Elo Rating & Basotho Rank Badge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-[#3A2C1E]/60 pt-2 sm:pt-0">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
                <span className="font-['Syne'] font-extrabold text-lg text-[#FFE79A]">
                  {profile.rating} <span className="text-[11px] text-[#A89886] font-mono font-normal">ELO</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-['Space_Grotesk'] font-bold text-[#D5A351] block uppercase tracking-wider">
                  {currentRankTier.name}
                </span>
                <span className="text-[10px] text-[#8C7D6B] italic block">
                  {currentRankTier.translation}
                </span>
              </div>
            </div>
          </div>

          {/* Experience Progress Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#3A2C1E]/40">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A89886] mb-1">
              <span>Career XP: <strong className="text-[#FFE79A]">{profile.careerXp} XP</strong></span>
              <span>Level {currentLevelInfo.level} ({currentLevelInfo.progressPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0D0A07] border border-[#3A2C1E] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8C6838] via-[#D5A351] to-[#FFE79A] transition-all duration-500 rounded-full"
                style={{ width: `${currentLevelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION TABS */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#17110C] border-b border-[#3A2C1E] overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-[#3A2616] text-[#FFE79A] border border-[#D5A351]'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Career Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'matches'
                ? 'bg-[#3A2616] text-[#FFE79A] border border-[#D5A351]'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Match Ledger ({matchHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rivalries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'rivalries'
                ? 'bg-[#3A2616] text-[#FFE79A] border border-[#D5A351]'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Head-to-Head</span>
          </button>

          <button
            onClick={() => setActiveTab('honors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'honors'
                ? 'bg-[#3A2616] text-[#FFE79A] border border-[#D5A351]'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Honors ({unlockedHonorsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('identity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'identity'
                ? 'bg-[#3A2616] text-[#FFE79A] border border-[#D5A351]'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Passport</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB BODY CONTENTS */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {/* --------------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW & MODE-BY-MODE RECORDS */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Game Mode Breakdown Selector */}
              <div className="flex items-center justify-between bg-[#17120D] p-1.5 rounded-xl border border-[#2E2217]">
                {(
                  [
                    ['overall', 'Overall'],
                    ['ranked', 'Ranked'],
                    ['campaign', 'Campaign'],
                    ['ai', 'AI Arena'],
                    ['casual', 'Casual (2P)'],
                  ] as [CareerGameMode, string][]
                ).map(([modeKey, label]) => (
                  <button
                    key={modeKey}
                    onClick={() => setSelectedMode(modeKey)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-['Space_Grotesk'] font-bold transition-all truncate ${
                      selectedMode === modeKey
                        ? 'bg-[#3A2616] text-[#FFE79A] border border-[#8C6838]/60 shadow-sm'
                        : 'text-[#A89886] hover:text-[#F5EBD9]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Core Stat Grid for Selected Mode */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#17120D] border border-[#3A2C1E] flex flex-col justify-between">
                  <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] uppercase">
                    Matches
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-['Syne'] font-extrabold text-2xl text-[#F5EBD9]">
                      {activeModeStats.matches}
                    </span>
                    <span className="text-[11px] text-[#A89886]">played</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#17120D] border border-[#3A2C1E] flex flex-col justify-between">
                  <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] uppercase">
                    Victories
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-['Syne'] font-extrabold text-2xl text-[#52C41A]">
                      {activeModeStats.wins}
                    </span>
                    <span className="text-[10px] text-[#A89886]">
                      ({activeModeStats.losses}L / {activeModeStats.draws}D)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#17120D] border border-[#3A2C1E] flex flex-col justify-between">
                  <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] uppercase">
                    Win Rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-['Syne'] font-extrabold text-2xl text-[#D5A351]">
                      {activeModeStats.winRate}%
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#17120D] border border-[#3A2C1E] flex flex-col justify-between">
                  <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FF7A45]" />
                    Streak
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-['Syne'] font-extrabold text-2xl text-[#FF7A45]">
                      {activeModeStats.currentStreak}
                    </span>
                    <span className="text-[10px] text-[#A89886]">
                      (Best: {activeModeStats.bestStreak})
                    </span>
                  </div>
                </div>
              </div>

              {/* Tactical Mill & Cattle Performance */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1C1610] to-[#120E0A] border border-[#3A2C1E] space-y-3">
                <h3 className="font-['Syne'] font-bold text-xs uppercase tracking-wider text-[#D5A351] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Tactical Kraal Impact
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#0D0A08] border border-[#2B1F16]">
                    <span className="text-[10px] text-[#A89886] font-mono block">Mills Formed</span>
                    <span className="font-['Syne'] font-extrabold text-lg text-[#FFE79A]">
                      {activeModeStats.millsFormed}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D0A08] border border-[#2B1F16]">
                    <span className="text-[10px] text-[#A89886] font-mono block">Cattle Captured</span>
                    <span className="font-['Syne'] font-extrabold text-lg text-[#FF4D4F]">
                      {activeModeStats.cattleCaptured}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0D0A08] border border-[#2B1F16]">
                    <span className="text-[10px] text-[#A89886] font-mono block">Peak Elo</span>
                    <span className="font-['Syne'] font-extrabold text-lg text-[#52C41A]">
                      {profile.peakRating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Form Display */}
              <div className="p-4 rounded-2xl bg-[#17120D] border border-[#3A2C1E] flex items-center justify-between">
                <div>
                  <h4 className="font-['Syne'] font-bold text-xs uppercase tracking-wide text-[#F5EBD9]">
                    Recent Form
                  </h4>
                  <p className="text-[11px] text-[#A89886]">
                    Latest competitive match outcomes
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {profile.recentForm.length === 0 ? (
                    <span className="text-xs text-[#8C7D6B] italic font-mono">No matches yet</span>
                  ) : (
                    profile.recentForm.map((f, i) => (
                      <span
                        key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs border ${
                          f === 'W'
                            ? 'bg-[#52C41A]/20 text-[#52C41A] border-[#52C41A]/50'
                            : f === 'L'
                            ? 'bg-[#FF4D4F]/20 text-[#FF4D4F] border-[#FF4D4F]/50'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/50'
                        }`}
                      >
                        {f}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Guest Account Callout if applicable */}
              {profile.isGuest && onOpenAuthModal && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border border-amber-500/40 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-['Syne'] font-bold text-xs uppercase text-white tracking-wide">
                      Permanent Career Passport
                    </h4>
                    <p className="text-xs text-amber-200/80 mt-0.5">
                      You have earned {profile.careerXp} XP and {activeModeStats.wins} victories. Create an account to permanently seal your Morabaraba record.
                    </p>
                  </div>
                  <button
                    onClick={onOpenAuthModal}
                    className="px-3.5 py-2 rounded-xl bg-[#D9A855] hover:bg-[#FFE79A] text-[#140E0A] font-['Space_Grotesk'] font-bold text-xs uppercase shrink-0 transition-colors shadow-md"
                  >
                    Claim Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 2: DETAILED MATCH LEDGER & FINAL BOARD REVIEW */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'matches' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-['Space_Grotesk'] text-[#A89886]">
                  Showing {matchHistory.length} recorded matches
                </span>
              </div>

              {matchHistory.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#17120D] border border-[#3A2C1E] text-center space-y-2">
                  <History className="w-8 h-8 text-[#D5A351] mx-auto opacity-40" />
                  <p className="font-['Syne'] text-sm font-bold text-[#F5EBD9]">No Recorded Matches Yet</p>
                  <p className="text-xs text-[#A89886]">
                    Every single campaign battle, AI duel, and online match will be permanently inscribed here.
                  </p>
                </div>
              ) : (
                matchHistory.map((m) => {
                  const isExpanded = expandedMatchId === m.matchId;
                  const isWin = m.result === 'VICTORY';
                  const isDraw = m.result === 'DRAW';

                  return (
                    <div
                      key={m.matchId}
                      className="p-3.5 rounded-2xl bg-[#17120D] border border-[#3A2C1E] hover:border-[#8C6838] transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase border ${
                              isWin
                                ? 'bg-[#52C41A]/20 text-[#52C41A] border-[#52C41A]/40'
                                : isDraw
                                ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                                : 'bg-[#FF4D4F]/20 text-[#FF4D4F] border-[#FF4D4F]/40'
                            }`}
                          >
                            {m.result}
                          </span>
                          <div>
                            <h4 className="font-['Syne'] font-bold text-xs text-[#F5EBD9] uppercase tracking-wide">
                              vs {m.opponentName}
                            </h4>
                            <span className="text-[10px] text-[#A89886] font-mono">
                              {m.gameMode.toUpperCase()} {m.stageId ? `• ${m.stageId}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {m.ratingDelta !== 0 && (
                            <span
                              className={`text-xs font-mono font-bold block ${
                                m.ratingDelta > 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'
                              }`}
                            >
                              {m.ratingDelta > 0 ? `+${m.ratingDelta}` : m.ratingDelta} ELO
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-[#D5A351]">
                            +{m.xpEarned} XP
                          </span>
                        </div>
                      </div>

                      {/* Stat summary pills */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono bg-[#0D0A08] p-2 rounded-xl border border-[#2B1F16]">
                        <div>
                          <span className="text-[#A89886] block text-[9px]">MOVES</span>
                          <span className="text-[#F5EBD9] font-bold">{m.moveCount}</span>
                        </div>
                        <div>
                          <span className="text-[#A89886] block text-[9px]">MILLS</span>
                          <span className="text-[#FFE79A] font-bold">{m.playerMills}</span>
                        </div>
                        <div>
                          <span className="text-[#A89886] block text-[9px]">CAPTURES</span>
                          <span className="text-[#FF7A45] font-bold">{m.playerCaptures}/12</span>
                        </div>
                        <div>
                          <span className="text-[#A89886] block text-[9px]">GRADE</span>
                          <span className="text-[#52C41A] font-bold">{m.tacticalGrade || 'A'}</span>
                        </div>
                      </div>

                      {/* Expandable Board Snapshot & Details Toggle */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-[#A89886]">
                        <span>{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => setExpandedMatchId(isExpanded ? null : m.matchId)}
                          className="text-[#D5A351] hover:text-[#FFE79A] font-bold font-['Space_Grotesk'] text-[10px] flex items-center gap-1 uppercase"
                        >
                          {isExpanded ? 'Hide Board' : 'Inspect Final Board'}
                          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {/* Expandable Final Board Snapshot */}
                      {isExpanded && m.finalBoardSnapshot && (
                        <div className="pt-2 border-t border-[#3A2C1E] animate-fadeIn space-y-2">
                          <div className="text-[10px] font-mono text-[#D5A351] flex items-center justify-between">
                            <span>Final 24-Point Board Topology</span>
                            <span>Tempo: {m.tempoBadge}</span>
                          </div>
                          <div className="p-3 bg-[#0D0A08] rounded-xl border border-[#2B1F16] flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto">
                            {Object.entries(m.finalBoardSnapshot).map(([ptId, rawPt]) => {
                              const pt = rawPt as { piece?: string | null } | undefined;
                              const piece = pt?.piece;
                              return (
                                <div
                                  key={ptId}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                    piece === 'obsidian'
                                      ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                                      : piece === 'ivory'
                                      ? 'bg-neutral-800 border-neutral-600 text-neutral-200'
                                      : 'bg-black/40 border-neutral-900 text-neutral-600'
                                  }`}
                                >
                                  {ptId}: {piece ? (piece === 'obsidian' ? 'Obs' : 'Ivory') : '•'}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 3: HEAD-TO-HEAD RIVALRIES */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'rivalries' && (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-xs text-[#A89886] font-['Space_Grotesk']">
                Historical records and rivalries against kingdom AI bosses and human challengers.
              </p>

              <div className="space-y-2.5">
                {headToHeadRecords.map((rival) => {
                  const stage = DIFFICULTY_STAGES[rival.opponentId as DifficultyStageId];

                  return (
                    <div
                      key={rival.opponentId}
                      className="p-3.5 rounded-2xl bg-[#17120D] border border-[#3A2C1E] hover:border-[#8C6838] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2B1F16] border border-[#D5A351]/40 flex items-center justify-center text-xl shrink-0">
                          {rival.avatar.includes('🐮') ? '🐮' : '👑'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-['Syne'] font-bold text-xs text-[#F5EBD9] uppercase tracking-wide">
                              {rival.opponentName}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#2B1F16] text-[#D5A351] rounded border border-[#3A2C1E]">
                              {rival.rating} ELO
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A89886] font-['Space_Grotesk']">
                            {rival.clanTitle || 'Highland Tactician'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="text-center sm:text-right">
                          <div className="font-mono text-xs font-bold text-[#F5EBD9]">
                            <span className="text-[#52C41A]">{rival.wins}W</span> -{' '}
                            <span className="text-[#FF4D4F]">{rival.losses}L</span> -{' '}
                            <span className="text-slate-400">{rival.draws}D</span>
                          </div>
                          <span className="text-[10px] text-[#D5A351] font-mono">
                            {rival.totalMatches > 0 ? `${rival.winRate}% Win Rate` : 'No Duels Yet'}
                          </span>
                        </div>

                        {stage && onSelectStageForRematch && (
                          <button
                            onClick={() => {
                              onSelectStageForRematch(stage.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#3A2616] hover:bg-[#D5A351] hover:text-[#120E0A] text-[#FFE79A] border border-[#8C6838]/60 font-['Space_Grotesk'] font-bold text-xs uppercase transition-all"
                          >
                            Duel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 4: PRESTIGE HONORS & BADGES */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'honors' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-['Space_Grotesk']">
                {['all', 'unlocked', 'boss', 'streak', 'mastery', 'tactics'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setHonorCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                      honorCategoryFilter === cat
                        ? 'bg-[#D9A855] text-[#120E0A] border border-[#FFE79A]'
                        : 'bg-[#17120D] text-[#A89886] border border-[#3A2C1E] hover:text-[#F5EBD9]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredHonors.map((honor) => {
                  const isUnlocked = honor.unlocked;

                  return (
                    <div
                      key={honor.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isUnlocked
                          ? 'bg-[#1C1610] border-[#D9A855]/60 shadow-[0_4px_16px_rgba(217,168,85,0.15)]'
                          : 'bg-[#120E0A] border-[#2B1F16] opacity-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                          isUnlocked
                            ? 'bg-[#2A180E] border-[#D9A855] text-[#FFD700]'
                            : 'bg-[#0D0A08] border-[#221810] text-[#665747]'
                        }`}
                      >
                        {isUnlocked ? (
                          <Award className="w-5 h-5" style={{ color: honor.badgeColor }} />
                        ) : (
                          <Lock className="w-4 h-4 text-[#665747]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-['Syne'] font-bold text-xs uppercase tracking-wide truncate ${
                              isUnlocked ? 'text-[#F5EBD9]' : 'text-[#8C7D6B]'
                            }`}
                          >
                            {honor.title}
                          </h4>
                          <span
                            className="text-[9px] font-mono uppercase px-1 rounded border"
                            style={{
                              color: isUnlocked ? honor.badgeColor : '#665747',
                              borderColor: isUnlocked ? `${honor.badgeColor}40` : '#33271C',
                            }}
                          >
                            {honor.rarity}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#D5A351] font-medium mt-0.5">
                          {honor.subtitle}
                        </p>
                        <p className="text-[10px] text-[#A89886] mt-0.5 line-clamp-2 leading-relaxed">
                          {honor.description}
                        </p>

                        {isUnlocked && honor.unlockedAt && (
                          <span className="text-[9px] font-mono text-[#52C41A] block mt-1.5">
                            Unlocked {new Date(honor.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* TAB 5: IDENTITY & PASSPORT SETTINGS */}
          {/* --------------------------------------------------------------------- */}
          {activeTab === 'identity' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#17120D] border border-[#3A2C1E] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Syne'] font-bold text-xs uppercase text-[#D5A351] tracking-wider">
                    Basotho Tactician Passport
                  </h3>
                  <button
                    onClick={() => {
                      if (isEditingIdentity) handleSaveIdentity();
                      else setIsEditingIdentity(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#3A2616] border border-[#8C6838]/60 text-xs font-bold text-[#FFE79A] flex items-center gap-1 hover:border-[#D9A855] transition-all"
                  >
                    {isEditingIdentity ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Passport</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-[#A89886] uppercase block mb-1">
                      Display Title / Chief Callsign
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingIdentity}
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full bg-[#0D0A08] border border-[#3A2C1E] text-[#F5EBD9] rounded-xl px-3 py-2 disabled:opacity-75 focus:outline-hidden focus:border-[#D5A351]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#A89886] uppercase block mb-1">
                      Callsign / Handle
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingIdentity}
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-[#0D0A08] border border-[#3A2C1E] text-[#F5EBD9] rounded-xl px-3 py-2 disabled:opacity-75 focus:outline-hidden focus:border-[#D5A351]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#A89886] uppercase block mb-1">
                      Seboko Clan (Totem)
                    </label>
                    <select
                      disabled={!isEditingIdentity}
                      value={editClan}
                      onChange={(e) => setEditClan(e.target.value)}
                      className="w-full bg-[#0D0A08] border border-[#3A2C1E] text-[#F5EBD9] rounded-xl px-3 py-2 disabled:opacity-75 focus:outline-hidden focus:border-[#D5A351]"
                    >
                      {CLAN_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.totem} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#A89886] uppercase block mb-1">
                      Region / District
                    </label>
                    <select
                      disabled={!isEditingIdentity}
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="w-full bg-[#0D0A08] border border-[#3A2C1E] text-[#F5EBD9] rounded-xl px-3 py-2 disabled:opacity-75 focus:outline-hidden focus:border-[#D5A351]"
                    >
                      {LESOTHO_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d} District
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Avatar Icon Selector */}
                {isEditingIdentity && (
                  <div className="pt-2 border-t border-[#3A2C1E]">
                    <label className="text-[10px] font-mono text-[#A89886] uppercase block mb-1.5">
                      Select Crest Avatar
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATAR_ICONS.map((av) => (
                        <button
                          key={av.id}
                          onClick={() => setEditAvatar(av.id)}
                          className={`p-2 rounded-xl text-xl border flex flex-col items-center justify-center transition-all ${
                            editAvatar === av.id
                              ? 'bg-[#3A2616] border-[#D5A351] shadow-sm'
                              : 'bg-[#0D0A08] border-[#221810] hover:border-[#8C6838]'
                          }`}
                          title={av.label}
                        >
                          {av.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
