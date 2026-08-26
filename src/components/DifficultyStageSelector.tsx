import React from 'react';
import { DifficultyStageId, DifficultyStage, PlayerProgression } from '../types';
import { DIFFICULTY_STAGES, STAGES_LIST } from '../constants/stages';
import { Shield, Sparkles, MapPin, Lock, Play, Zap, Crown, Award } from 'lucide-react';

interface DifficultyStageSelectorProps {
  currentStageId: DifficultyStageId;
  progression?: PlayerProgression;
  onSelectStage: (stageId: DifficultyStageId) => void;
  onStartMatch?: (stageId: DifficultyStageId) => void;
  compact?: boolean;
}

export const DifficultyStageSelector: React.FC<DifficultyStageSelectorProps> = ({
  currentStageId,
  progression,
  onSelectStage,
  onStartMatch,
  compact = false,
}) => {
  const completedStages = progression?.completedStages || [];
  const currentStage = DIFFICULTY_STAGES[currentStageId] || DIFFICULTY_STAGES.matenase;

  const isStageLocked = (stage: DifficultyStage) => {
    if (!stage.requiresStageUnlock) return false;
    return !completedStages.includes(stage.requiresStageUnlock);
  };

  const isCurrentStageLocked = isStageLocked(currentStage);

  if (compact) {
    return (
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {STAGES_LIST.map((stage) => {
          const isSelected = stage.id === currentStageId;
          const locked = isStageLocked(stage);
          return (
            <button
              key={`stage-chip-${stage.id}`}
              onClick={() => {
                if (!locked) onSelectStage(stage.id);
              }}
              title={locked ? `Locked · Defeat ${DIFFICULTY_STAGES[stage.requiresStageUnlock!].opponentName} first` : undefined}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                locked
                  ? 'bg-[#120F0D]/60 border-[#221A14] text-[#63574A] cursor-not-allowed opacity-60'
                  : isSelected
                  ? 'bg-[#2A1E14] border-[#D9A855] text-[#FFE7B3] shadow-[0_2px_8px_rgba(217,168,85,0.25)]'
                  : 'bg-[#15110E]/90 border-[#2D2319] text-[#9E9284] hover:text-[#E9E0CE] hover:border-[#4A3A29]'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor: locked ? '#1C1510' : isSelected ? stage.themeColor : '#251D16',
                  color: locked ? '#63574A' : isSelected ? '#0E0C0A' : '#9E9284',
                }}
              >
                {locked ? <Lock className="w-2.5 h-2.5" /> : stage.stageNumber}
              </span>
              <span className="font-['Syne'] tracking-wide">{stage.name}</span>
              <span className="text-[10px] opacity-75 font-mono">{stage.difficultyLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 select-none">
      {/* Horizontal 5-Tier Morabaraba Intelligence Stepper */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STAGES_LIST.map((stage) => {
          const isSelected = stage.id === currentStageId;
          const locked = isStageLocked(stage);
          return (
            <button
              key={`stage-tab-${stage.id}`}
              onClick={() => onSelectStage(stage.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                locked
                  ? 'bg-[#100D0B] border-[#221912] text-[#635546] opacity-70'
                  : isSelected
                  ? 'bg-gradient-to-b from-[#2A1F15] to-[#17120C] border-[#D9A855] shadow-[0_4px_16px_rgba(0,0,0,0.8)] scale-[1.02]'
                  : 'bg-[#14100D]/80 border-[#2B2117] text-[#8C8072] hover:border-[#4E3D2B] hover:text-[#D5C7B7]'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1 transition-transform"
                style={{
                  backgroundColor: locked ? '#1E1712' : isSelected ? stage.themeColor : '#231B14',
                  color: locked ? '#806D5C' : isSelected ? '#0E0C0A' : '#7D7063',
                  boxShadow: isSelected && !locked ? `0 0 10px ${stage.themeColor}88` : 'none',
                }}
              >
                {locked ? <Lock className="w-3 h-3 text-[#A8907A]" /> : stage.stageNumber}
              </div>
              <span className={`text-[11px] font-['Syne'] font-extrabold tracking-wider leading-tight truncate w-full ${
                isSelected && !locked ? 'text-[#FFFDF8]' : locked ? 'text-[#7D6E5F]' : 'text-[#8C8072]'
              }`}>
                {stage.opponentName}
              </span>
              <span className="text-[9px] text-[#A99C90] truncate w-full mt-0.5 font-mono">
                {stage.difficultyLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.9)] transition-all ${
          currentStage.id === 'morena'
            ? 'bg-[#0A0706] border-[#F5C242]/40'
            : 'bg-[#16110D]'
        }`}
        style={{
          borderColor: currentStage.id === 'morena' ? '#F5C24266' : currentStage.themeColor + '66',
        }}
      >
        {/* Subtle Map Ambient Glow */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 85% 20%, ${currentStage.themeColor}, transparent 65%)`,
          }}
        />

        <div className="relative z-10 space-y-3.5">
          {/* Header Row: Tier Label + Stars + Location */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: currentStage.themeColor + '25',
                  color: currentStage.themeColor,
                  border: `1px solid ${currentStage.themeColor}66`,
                }}
              >
                {currentStage.tierLabel}
              </span>

              <div className="flex items-center gap-1 text-[#D1AF7A] text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#D9A855]" />
                <span>Map: {currentStage.mapName}</span>
              </div>
            </div>

            {/* AI Intelligence Stars */}
            <div className="flex items-center gap-1 text-xs font-mono font-bold" style={{ color: currentStage.themeColor }}>
              <span>{currentStage.difficultyLabel}</span>
              <span className="text-[10px] text-[#A89C8F] font-sans">({currentStage.difficultyStars}/5 IQ)</span>
            </div>
          </div>

          {/* Title / Opponent Banner */}
          {currentStage.id === 'morena' ? (
            <div className="border-l-2 border-[#F5C242] pl-3 py-1 space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#F5C242]" />
                <h2 className="font-['Syne'] font-extrabold text-xl text-[#FFFDF8] tracking-widest uppercase">
                  MORENA LETSIE
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5C242]/20 text-[#F5C242] border border-[#F5C242]/40">
                  ULTIMATE BENCHMARK
                </span>
              </div>
              <p className="text-xs font-mono text-[#D9A855] tracking-wider uppercase">
                TSOENENE · 12 Cows. No advantage. No mercy.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Syne'] font-extrabold text-lg sm:text-xl text-[#FFFDF8] uppercase tracking-wide">
                  {currentStage.opponentName}
                </h2>
              </div>
              <p className="text-xs text-[#D5A351] font-medium mt-0.5">
                {currentStage.mapSubtitle}
              </p>
            </div>
          )}

          {/* How They Play (AI Intelligence Description) */}
          <div className="rounded-xl bg-[#0E0C0A]/90 border border-[#2B2016] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#E9DFCE]">
              <span className="flex items-center gap-1.5 text-[#D9A855]">
                <Zap className="w-3.5 h-3.5" />
                How They Play:
              </span>
              <span className="text-[10px] text-[#A89C8F] font-normal">
                {currentStage.aiTitle}
              </span>
            </div>
            <p className="text-xs text-[#C9BEB0] leading-relaxed font-['Space_Grotesk']">
              {currentStage.aiPlaystyle}
            </p>
          </div>

          {/* Locked Notice OR Action Button */}
          {isCurrentStageLocked ? (
            <div className="p-3 rounded-xl bg-[#221710] border border-[#523B25] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#E0A855] shrink-0" />
              <div className="text-xs text-[#E8D9C5] space-y-0.5">
                <p className="font-bold text-[#F4EAD7]">Stage Locked</p>
                <p className="text-[11px] text-[#BCAFA0]">
                  Defeat <strong className="text-[#F5C242]">{DIFFICULTY_STAGES[currentStage.requiresStageUnlock!].opponentName}</strong> at {DIFFICULTY_STAGES[currentStage.requiresStageUnlock!].mapName} to challenge {currentStage.opponentName}.
                </p>
              </div>
            </div>
          ) : (
            onStartMatch && (
              <button
                onClick={() => onStartMatch(currentStage.id)}
                className="w-full py-2.5 px-4 rounded-xl font-['Syne'] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{
                  backgroundColor: currentStage.themeColor,
                  color: '#0E0C0A',
                }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Challenge {currentStage.opponentName} at {currentStage.mapName}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
