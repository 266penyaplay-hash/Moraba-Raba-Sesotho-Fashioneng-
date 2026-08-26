import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STAGES_LIST, DIFFICULTY_STAGES } from '../constants/stages';
import { ALTITUDE_ZONES, ZONES_LIST, isZoneUnlocked } from '../constants/zones';
import { DifficultyStageId, PlayerProgression, AltitudeZoneId } from '../types';
import {
  X,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  Flame,
  RotateCcw,
  Mountain,
  Volume2,
  Eye,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface JourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStageId: DifficultyStageId;
  progression: PlayerProgression;
  onSelectAndStart: (stageId: DifficultyStageId) => void;
  onSelectZone?: (zoneId: AltitudeZoneId) => void;
  onToggleTokenSkin: () => void;
  onToggleBoardSkin: () => void;
  onResetProgression?: () => void;
}

export const JourneyMapModal: React.FC<JourneyMapModalProps> = ({
  isOpen,
  onClose,
  currentStageId,
  progression,
  onSelectAndStart,
  onSelectZone,
  onToggleTokenSkin,
  onToggleBoardSkin,
  onResetProgression,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'altitude-zones'>('stages');

  if (!isOpen) return null;

  const isStageLocked = (stage: typeof STAGES_LIST[0]) => {
    if (!stage.requiresStageUnlock) return false;
    return !(progression?.completedStages || []).includes(stage.requiresStageUnlock);
  };

  const streak = progression.winStreak || {
    currentStreak: 0,
    bestStreak: 0,
    streakTier: 'NONE',
  };

  const getStreakBadge = () => {
    if (streak.streakTier === 'LEGENDARY') {
      return {
        label: 'LEGENDARY STREAK',
        icon: <Crown className="w-3.5 h-3.5 text-[#FFD700]" />,
        color: '#FFD700',
        bg: 'bg-[#FFD700]/15 border-[#FFD700]/40',
      };
    }
    if (streak.streakTier === 'BLAZING') {
      return {
        label: 'BLAZING STREAK',
        icon: <Flame className="w-3.5 h-3.5 text-[#FF7A29]" />,
        color: '#FF7A29',
        bg: 'bg-[#FF7A29]/15 border-[#FF7A29]/40',
      };
    }
    if (streak.streakTier === 'HOT') {
      return {
        label: 'HOT STREAK',
        icon: <Flame className="w-3.5 h-3.5 text-[#D9A855]" />,
        color: '#D9A855',
        bg: 'bg-[#D9A855]/15 border-[#D9A855]/40',
      };
    }
    return {
      label: 'CALM KRAAL',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#A89C8F]" />,
      color: '#A89C8F',
      bg: 'bg-[#2A2016]/40 border-[#3E2E1D]',
    };
  };

  const streakBadge = getStreakBadge();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-[640px] bg-[#120E0B] border border-[#382B1D] rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-[#E9E0CE] space-y-4 my-auto"
        >
          {/* Header with Title and Close */}
          <div className="flex items-start justify-between border-b border-[#2C2016] pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#2B1D10] text-[#D9A855] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#48331E]">
                  LEETO LA LESOTHO · KINGDOM PROGRESSION
                </span>
                {/* Win Streak Pill */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${streakBadge.bg}`}
                  style={{ color: streakBadge.color }}
                >
                  {streakBadge.icon}
                  <span>
                    {streak.currentStreak} {streak.currentStreak === 1 ? 'Win' : 'Wins'} · {streakBadge.label}
                  </span>
                </div>
              </div>
              <h2 className="font-['Syne'] font-extrabold text-xl sm:text-2xl text-[#F4EAD7] tracking-tight uppercase">
                Basotho Mountain Ladder
              </h2>
              <p className="text-xs text-[#A89C8F]">
                Climb through authentic Basotho geography and challenge the masters of the rock.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1C1611] hover:bg-[#2B2119] text-[#A89C8F] hover:text-[#F4EAD7] transition-colors border border-[#2B2016]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs: Mountain Opponents vs Altitude Zones */}
          <div className="flex rounded-xl bg-[#17110C] p-1 border border-[#2B2016]">
            <button
              type="button"
              onClick={() => {
                sound.playSelect();
                setActiveTab('stages');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all ${
                activeTab === 'stages'
                  ? 'bg-[#2E2014] text-[#FFE79A] border border-[#D9A855]/40 shadow-sm'
                  : 'text-[#A89C8F] hover:text-[#E9E0CE]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#D9A855]" />
              <span>5 Mountain Opponents</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playSelect();
                setActiveTab('altitude-zones');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all ${
                activeTab === 'altitude-zones'
                  ? 'bg-[#2E2014] text-[#FFE79A] border border-[#D9A855]/40 shadow-sm'
                  : 'text-[#A89C8F] hover:text-[#E9E0CE]'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-[#68B39B]" />
              <span>Altitude Zones ({ZONES_LIST.length})</span>
            </button>
          </div>

          {/* Master Achievement & Unlocks Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1E1710] via-[#2A1D11] to-[#1E1710] border border-[#D9A855]/30 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#F5C242]" />
                <span className="font-['Syne'] font-bold text-xs text-[#F4EAD7] uppercase">
                  Cosmetic Unlocks & Altitude Pacing
                </span>
              </div>

              {streak.currentStreak >= 2 && (
                <span className="text-[10px] text-[#D9A855] font-mono font-bold">
                  +30% Zone Pacing Active
                </span>
              )}
            </div>

            {/* Unlockable Switchers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Royal Cattle Token Set */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  progression.royalCattleUnlocked
                    ? 'bg-[#18120B] border-[#D9A855]/50'
                    : 'bg-[#14100D] border-[#251B12] opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#D9A855]" />
                    <span className="text-xs font-bold text-[#F4EAD7]">
                      Royal Gold Cattle
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A89C8F] block">
                    {progression.royalCattleUnlocked ? 'Unlocked & Ready' : 'Beat Sefako to unlock'}
                  </span>
                </div>

                {progression.royalCattleUnlocked ? (
                  <button
                    onClick={onToggleTokenSkin}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      progression.selectedTokenSkin === 'royal-gold'
                        ? 'bg-[#D9A855] text-[#0A0704] shadow-[0_0_10px_rgba(217,168,85,0.4)]'
                        : 'bg-[#2A2016] text-[#A89C8F] hover:text-[#F4EAD7]'
                    }`}
                  >
                    {progression.selectedTokenSkin === 'royal-gold' ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-[#6A5A4A]" />
                )}
              </div>

              {/* Tsoenene Basalt Board Skin */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  progression.firestoneBoardUnlocked
                    ? 'bg-[#18120B] border-[#F5C242]/50'
                    : 'bg-[#14100D] border-[#251B12] opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#FF7A29]" />
                    <span className="text-xs font-bold text-[#F4EAD7]">
                      Tsoenene Dark Stone
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A89C8F] block">
                    {progression.firestoneBoardUnlocked ? 'Ancient Basalt Board' : 'Beat Morena to unlock'}
                  </span>
                </div>

                {progression.firestoneBoardUnlocked ? (
                  <button
                    onClick={onToggleBoardSkin}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      progression.selectedBoardSkin === 'firestone'
                        ? 'bg-[#FF7A29] text-[#0A0704] shadow-[0_0_10px_rgba(255,122,41,0.4)]'
                        : 'bg-[#2A2016] text-[#A89C8F] hover:text-[#F4EAD7]'
                    }`}
                  >
                    {progression.selectedBoardSkin === 'firestone' ? 'Active' : 'Equip'}
                  </button>
                ) : (
                  <Lock className="w-4 h-4 text-[#6A5A4A]" />
                )}
              </div>
            </div>
          </div>

          {/* Tab Content 1: 5 Stages Journey List */}
          {activeTab === 'stages' && (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {STAGES_LIST.map((stage) => {
                const isSelected = currentStageId === stage.id;
                const isCompleted = progression.completedStages.includes(stage.id);
                const locked = isStageLocked(stage);

                return (
                  <div
                    key={stage.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      locked
                        ? 'bg-[#0E0B09] border-[#221912] opacity-75'
                        : isSelected
                        ? 'bg-[#1D1610] border-[#D9A855] shadow-[0_0_18px_rgba(217,168,85,0.2)]'
                        : 'bg-[#14100D] border-[#2B2016] hover:border-[#423223]'
                    }`}
                  >
                    {!locked && (
                      <div
                        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
                        style={{ backgroundColor: stage.themeColor }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                            style={{
                              backgroundColor: locked ? '#1C1510' : stage.themeColor + '20',
                              color: locked ? '#7D6D5E' : stage.themeColor,
                              border: `1px solid ${locked ? '#35271C' : stage.themeColor + '50'}`,
                            }}
                          >
                            {stage.tierLabel}
                          </span>

                          <span className="font-['Syne'] font-extrabold text-sm text-[#F4EAD7]">
                            {stage.opponentName}
                          </span>
                          <span className="text-xs text-[#A89C8F]">({stage.mapName})</span>

                          <span className="text-xs font-mono font-bold" style={{ color: stage.themeColor }}>
                            {stage.difficultyLabel}
                          </span>

                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#68B39B] px-1.5 py-0.5 rounded bg-[#68B39B]/15">
                              <CheckCircle2 className="w-3 h-3" />
                              Cleared
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#DDD2BF] line-clamp-2">
                          {stage.aiPlaystyle}
                        </p>

                        <div className="pt-0.5 flex items-center gap-3 text-[10px] text-[#A89C8F]">
                          <span>Map: {stage.mapSubtitle}</span>
                          <span>· Depth: Lv.{stage.depth}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {locked ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1510] border border-[#3A2A1D] text-xs font-semibold text-[#A8907A]">
                            <Lock className="w-3.5 h-3.5 text-[#E0A855]" />
                            <span>Defeat {DIFFICULTY_STAGES[stage.requiresStageUnlock!].opponentName}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playSelect();
                              onSelectAndStart(stage.id);
                              onClose();
                            }}
                            className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                              isSelected
                                ? 'bg-[#D9A855] hover:bg-[#FFE79A] text-[#080604]'
                                : 'bg-[#2A2016] hover:bg-[#3D2E20] text-[#F4EAD7] border border-[#3E2F20]'
                            }`}
                          >
                            <span>{isSelected ? 'Active Arena' : 'Travel'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content 2: Altitude Zones & Dual-Layer Audio (Geographic Progression) */}
          {activeTab === 'altitude-zones' && (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {ZONES_LIST.map((zone) => {
                const unlocked = isZoneUnlocked(zone.id, progression.completedStages, streak);
                const isSelected = progression.selectedZoneId === zone.id;
                const isSummit = zone.id === 'thaba-bosiu';

                return (
                  <div
                    key={zone.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      !unlocked
                        ? 'bg-[#0E0C0A] border-[#221B14] opacity-80'
                        : isSelected
                        ? 'bg-[#1D1711] border-[#D9A855] shadow-[0_0_15px_rgba(217,168,85,0.25)]'
                        : 'bg-[#15100B] border-[#2A2016]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                            style={{
                              backgroundColor: zone.accentColor + '20',
                              color: zone.accentColor,
                              border: `1px solid ${zone.accentColor + '50'}`,
                            }}
                          >
                            {zone.tierLabel}
                          </span>

                          <span className="font-['Syne'] font-extrabold text-sm text-[#F4EAD7]">
                            {zone.name}
                          </span>

                          <span className="text-xs font-mono font-bold text-[#D9A855]">
                            {zone.altitude}m alt.
                          </span>

                          {isSummit && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#FFD700] px-1.5 py-0.5 rounded bg-[#FFD700]/15 border border-[#FFD700]/30">
                              <Crown className="w-3 h-3" />
                              Final Summit
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#DDD2BF] line-clamp-2">
                          {zone.description}
                        </p>

                        {/* Two-Layer Audio Specs */}
                        <div className="flex items-center gap-3 text-[10px] text-[#A89C8F] pt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-[#D9A855]" />
                            <span>Signature: Cattle bells & herd whistles</span>
                          </span>
                          <span>· Bed: Licensed environmental floor</span>
                        </div>
                      </div>

                      {/* Preview / Selection Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!unlocked ? (
                          <div className="flex flex-col items-end gap-1">
                            {/* Preview Mode Frame (Non-interactive / static per spec) */}
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#19130D] border border-[#332417] text-[11px] text-[#A8907A]">
                              <Eye className="w-3 h-3 text-[#D9A855]" />
                              <span>Store Preview</span>
                            </div>
                            <span className="text-[10px] text-[#8C7A68] max-w-[140px] text-right">
                              {zone.unlockCondition}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playSelect();
                              if (onSelectZone) onSelectZone(zone.id);
                            }}
                            className={`w-full sm:w-auto px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                              isSelected
                                ? 'bg-[#D9A855] text-[#080604]'
                                : 'bg-[#2A2016] hover:bg-[#3D2E20] text-[#F4EAD7] border border-[#3E2F20]'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Active Zone' : 'Equip Zone'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer with Reset Option */}
          {onResetProgression && progression.completedStages.length > 0 && (
            <div className="flex justify-end pt-1">
              <button
                onClick={onResetProgression}
                className="flex items-center gap-1 text-[11px] text-[#8C9090] hover:text-[#D1AF7A] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Stage Journey Progress
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
