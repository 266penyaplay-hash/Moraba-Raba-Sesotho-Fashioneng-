import React from 'react';
import { DifficultyStageId, CattleSetId, PlayerProgression } from '../types';
import { DIFFICULTY_STAGES } from '../constants/stages';
import { LesothoAtmosphere } from './LesothoBackdrop';
import { BottleCapToken } from './BottleCapToken';
import {
  Swords,
  Users,
  Flame,
  Target,
  Trophy,
  Award,
  Cloud,
  ChevronRight,
  Sparkles,
  Shield,
  Compass,
  Radio,
  UserPlus,
} from 'lucide-react';

interface CampaignPreMatchViewProps {
  currentStageId: DifficultyStageId;
  onSelectStage: (stageId: DifficultyStageId) => void;
  onBeginMatch: () => void;
  onOpenDaily: () => void;
  onOpenPuzzles: () => void;
  onOpenMastery: () => void;
  onOpenAchievements: () => void;
  onOpenCloudSync: () => void;
  onOpenLeaderboard: () => void;
  onOpenCareer?: () => void;
  onOpenOnlineMatch?: () => void;
  onOpenAuth?: () => void;
  isCloudSynced: boolean;
  dailyStreak: number;
  progression: PlayerProgression;
  onSelectCattleSet: (setId: CattleSetId) => void;
  atmosphere: LesothoAtmosphere;
  onChangeAtmosphere: (atm: LesothoAtmosphere) => void;
  gameMode: 'ai' | 'pass-and-play' | 'online';
  onChangeGameMode: (mode: 'ai' | 'pass-and-play' | 'online') => void;
  userDisplayName?: string;
  userClanTitle?: string;
}

const CATTLE_SETS: { id: CattleSetId; name: string; description: string }[] = [
  { id: 'heritage', name: 'Basotho Heritage', description: 'Curved bull horns & traditional diamond kraal notch' },
  { id: 'classic', name: 'Classic Tin Caps', description: 'Vintage stamped metal bottle caps' },
  { id: 'maloti', name: 'Maloti Mountains', description: 'Mountain kingdom peaks with highland horn span' },
  { id: 'mountain-kingdom', name: 'Mountain Kingdom', description: 'Mokorotlo crown silhouette & royal horns' },
  { id: 'royal-obsidian', name: 'Royal Obsidian', description: 'Inlaid gold kraal crest & sovereign bull horns' },
  { id: 'tsoenene', name: 'Tsoenene Stone', description: 'Ancestral rock petroglyph cattle engraving' },
  { id: 'champion', name: 'Tournament Champion', description: 'Golden laurel wreath & championship horns' },
];

const SCENE_OPTIONS: { id: LesothoAtmosphere; name: string; subtitle: string }[] = [
  { id: 'golden-dawn', name: 'Golden Dawn', subtitle: 'Maloti Foothills' },
  { id: 'khubetsoana-red', name: 'Sunset Terracotta', subtitle: 'Khubetsoana Red Clay' },
  { id: 'highland-mist', name: 'Highland Mist', subtitle: 'Semonkong Gorge' },
  { id: 'mokhotlong-storm', name: 'Alpine Storm', subtitle: 'Roof of Africa' },
  { id: 'tsoenene', name: 'Midnight Starlight', subtitle: 'Sacred Stone' },
];

const DIFFICULTY_ORDER: DifficultyStageId[] = ['matenase', 'bothata', 'litshepe', 'sefako', 'morena'];

export const CampaignPreMatchView: React.FC<CampaignPreMatchViewProps> = ({
  currentStageId,
  onSelectStage,
  onBeginMatch,
  onOpenDaily,
  onOpenPuzzles,
  onOpenMastery,
  onOpenAchievements,
  onOpenCloudSync,
  onOpenLeaderboard,
  onOpenCareer,
  onOpenOnlineMatch,
  onOpenAuth,
  isCloudSynced,
  dailyStreak,
  progression,
  onSelectCattleSet,
  atmosphere,
  onChangeAtmosphere,
  gameMode,
  onChangeGameMode,
  userDisplayName,
  userClanTitle,
}) => {
  const currentStage = DIFFICULTY_STAGES[currentStageId] || DIFFICULTY_STAGES.matenase;
  const currentCattleSet = progression.selectedCattleSet || 'heritage';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 space-y-4 select-none pb-12">
      {/* 1. TOP HUB APP BAR */}
      <div className="flex items-center justify-between border-b border-[#3A2C1E]/60 pb-3">
        <div
          onClick={onOpenCareer || onOpenAuth}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Open Career Profile & Passport"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2B1B10] border border-[#8C6838]/60 flex items-center justify-center shadow-md">
            <span className="font-['Syne'] font-extrabold text-[#D5A351] text-base">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-['Syne'] font-bold text-[14px] tracking-wider text-[#F5EBD9] uppercase">
                {userDisplayName || 'MORABARABA'}
              </h1>
              {userClanTitle && (
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-300 rounded border border-amber-500/30">
                  {userClanTitle}
                </span>
              )}
            </div>
            <p className="font-['Space_Grotesk'] text-[10px] text-[#A89886] tracking-widest uppercase flex items-center gap-1">
              <span>Career Record</span>
              <span className="text-[#D5A351]">★</span>
            </p>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-1.5">
          {onOpenCareer && (
            <button
              onClick={onOpenCareer}
              className="px-2.5 py-1 rounded-lg border border-[#D5A351]/60 bg-[#3A2616] text-[#FFE79A] text-[11px] font-['Space_Grotesk'] font-bold flex items-center gap-1 shadow-sm hover:border-[#FFE79A] transition-all"
            >
              <Trophy className="w-3 h-3 text-[#FFD700]" />
              <span>Career</span>
            </button>
          )}

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-lg border border-[#8C6838]/60 bg-[#2E1810] text-[#FFE79A] text-[11px] font-['Space_Grotesk'] font-bold flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3 text-[#D5A351]" />
              <span>Account</span>
            </button>
          )}

          <button
            onClick={onOpenCloudSync}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-['Space_Grotesk'] font-medium flex items-center gap-1.5 transition-all ${
              isCloudSynced
                ? 'bg-[#1C1712] border-[#4A3828] text-[#D5A351]'
                : 'bg-[#2E1810] border-[#8C4328] text-[#F5B898]'
            }`}
          >
            <Cloud className="w-3 h-3" />
            <span>{isCloudSynced ? 'Synced' : 'Cloud'}</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 rounded-lg bg-[#1C1712] border border-[#3A2C1E] text-[#A89886] hover:text-[#F5EBD9] transition-all"
            title="Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Online Invite Friend Callout Banner */}
      {onOpenOnlineMatch && (
        <button
          onClick={onOpenOnlineMatch}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border border-amber-500/40 hover:border-amber-400 text-left transition-all shadow-md flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              🐮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Syne'] font-extrabold text-sm text-white uppercase tracking-wide">
                  Play Online & Invite Friends
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generate 6-character match codes or join a friend's room.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* 2. CAMPAIGN QUICK HUBS (Daily, Puzzles, Mastery, Honors) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onOpenDaily}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#17120D]/90 border border-[#3A2C1E] hover:border-[#8C6838] transition-all group"
        >
          <div className="relative">
            <Flame className="w-4 h-4 text-[#FF7A45] group-hover:scale-110 transition-transform" />
            {dailyStreak > 0 && (
              <span className="absolute -top-1 -right-2 text-[8px] font-bold bg-[#FF4D4F] text-white px-1 rounded-full">
                {dailyStreak}
              </span>
            )}
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-[10px] text-[#E8DAC2] mt-1">Daily</span>
        </button>

        <button
          onClick={onOpenPuzzles}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#17120D]/90 border border-[#3A2C1E] hover:border-[#8C6838] transition-all group"
        >
          <Target className="w-4 h-4 text-[#D5A351] group-hover:scale-110 transition-transform" />
          <span className="font-['Space_Grotesk'] font-bold text-[10px] text-[#E8DAC2] mt-1">Puzzles</span>
        </button>

        <button
          onClick={onOpenMastery}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#17120D]/90 border border-[#3A2C1E] hover:border-[#8C6838] transition-all group"
        >
          <Shield className="w-4 h-4 text-[#52C41A] group-hover:scale-110 transition-transform" />
          <span className="font-['Space_Grotesk'] font-bold text-[10px] text-[#E8DAC2] mt-1">Mastery</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#17120D]/90 border border-[#3A2C1E] hover:border-[#8C6838] transition-all group"
        >
          <Award className="w-4 h-4 text-[#FADB14] group-hover:scale-110 transition-transform" />
          <span className="font-['Space_Grotesk'] font-bold text-[10px] text-[#E8DAC2] mt-1">Honors</span>
        </button>
      </div>

      {/* 3. STAGE / OPPONENT CARD (THE BRIEFING) */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#1F1710] to-[#140F0A] border border-[#4A3828] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#8C6838]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Stage Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#D5A351]" />
            <span className="font-['Space_Grotesk'] font-bold text-[11px] text-[#D5A351] tracking-widest uppercase">
              {currentStage.mapName}
            </span>
          </div>

          {/* Difficulty Tier Badge */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider bg-[#2E2014] border border-[#8C6838]/60 text-[#F5EBD9]">
            {currentStage.difficultyLabel}
          </span>
        </div>

        {/* Opponent Profile Presentation */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative shrink-0 p-1 rounded-2xl bg-[#0D0A08] border border-[#3A2C1E] shadow-inner">
            <BottleCapToken player="ivory" size={48} cattleSet={currentCattleSet} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-['Syne'] font-extrabold text-[18px] text-[#F5EBD9] tracking-wide uppercase">
                {currentStage.opponentName}
              </h2>
            </div>
            <p className="font-['Space_Grotesk'] text-[11px] text-[#D5A351] font-medium tracking-wide">
              {currentStage.subTitle}
            </p>
            <p className="font-['Space_Grotesk'] text-[11px] text-[#A89886] mt-1 line-clamp-2 leading-relaxed">
              "{currentStage.lore}"
            </p>
          </div>
        </div>

        {/* Stage Selector Pills (Map progression preview) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] tracking-wider uppercase">
              Campaign Battlegrounds
            </span>
            <span className="text-[10px] font-mono text-[#D5A351]">
              Stage {currentStage.stageNumber} of 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {DIFFICULTY_ORDER.map((sId) => {
              const stg = DIFFICULTY_STAGES[sId];
              const isSelected = currentStageId === sId;
              const isUnlocked = !stg.requiresStageUnlock || (progression?.completedStages || []).includes(stg.requiresStageUnlock);

              return (
                <button
                  key={sId}
                  onClick={() => isUnlocked && onSelectStage(sId)}
                  disabled={!isUnlocked}
                  className={`py-2 px-1 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'bg-[#3A2616] border-[#D5A351] shadow-md shadow-[#D5A351]/20'
                      : isUnlocked
                      ? 'bg-[#140F0A] border-[#3A2C1E] hover:border-[#8C6838]'
                      : 'bg-[#0D0A08] border-[#221810] opacity-40 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`text-[9px] font-['Space_Grotesk'] font-bold uppercase block truncate ${
                      isSelected ? 'text-[#FFE79A]' : isUnlocked ? 'text-[#C9BAA5]' : 'text-[#665747]'
                    }`}
                  >
                    {stg.opponentName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. CUSTOMIZATION DRAWER: CATTLE SET & SCENE */}
        <div className="grid grid-cols-2 gap-2 mb-4 pt-2 border-t border-[#3A2C1E]/60">
          <div>
            <label className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] tracking-wider uppercase block mb-1">
              Cattle Set (Piece Skin)
            </label>
            <select
              value={currentCattleSet}
              onChange={(e) => onSelectCattleSet(e.target.value as CattleSetId)}
              className="w-full bg-[#120E0A] border border-[#3A2C1E] text-[#F5EBD9] text-[11px] font-['Space_Grotesk'] rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#D5A351]"
            >
              {CATTLE_SETS.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A89886] tracking-wider uppercase block mb-1">
              Scene & Atmosphere
            </label>
            <select
              value={atmosphere}
              onChange={(e) => onChangeAtmosphere(e.target.value as LesothoAtmosphere)}
              className="w-full bg-[#120E0A] border border-[#3A2C1E] text-[#F5EBD9] text-[11px] font-['Space_Grotesk'] rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#D5A351]"
            >
              {SCENE_OPTIONS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.subtitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Game Mode Switch (AI vs Pass & Play) */}
        <div className="flex items-center justify-between bg-[#120E0A] p-1 rounded-xl border border-[#2A1F16] mb-4">
          <button
            onClick={() => onChangeGameMode?.('ai')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-['Space_Grotesk'] font-bold flex items-center justify-center gap-1.5 transition-all ${
              gameMode === 'ai'
                ? 'bg-[#3A2616] text-[#F5EBD9] border border-[#8C6838]/60'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>VS {currentStage.opponentName.toUpperCase()}</span>
          </button>
          <button
            onClick={() => onChangeGameMode?.('pass-and-play')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-['Space_Grotesk'] font-bold flex items-center justify-center gap-1.5 transition-all ${
              gameMode === 'pass-and-play'
                ? 'bg-[#3A2616] text-[#F5EBD9] border border-[#8C6838]/60'
                : 'text-[#A89886] hover:text-[#F5EBD9]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>PASS & PLAY (2P)</span>
          </button>
        </div>

        {/* 5. PRIMARY ACTION: BEGIN MATCH */}
        <button
          onClick={() => onBeginMatch?.()}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D5A351] via-[#E8CE9D] to-[#D5A351] hover:from-[#E8CE9D] hover:to-[#D5A351] text-[#1A120B] font-['Syne'] font-extrabold text-[15px] tracking-wider uppercase shadow-[0_8px_24px_rgba(213,163,81,0.35)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>BEGIN MATCH</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
