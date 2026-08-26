import { AltitudeZoneId, AmbienceZone, DifficultyStageId, WinStreakState } from '../types';

export const ALTITUDE_ZONES: Record<AltitudeZoneId, AmbienceZone> = {
  maseru: {
    id: 'maseru',
    name: 'Maseru Lowlands',
    altitude: 1600,
    tierLabel: 'Zone 1 · Lowland Plains',
    subtitle: 'Maseru Foothills & Mohokare Basin',
    description: 'Dry grassland with gentle heat haze, dusty sandstone tracks, and distant town bells.',
    historicalSignificance: 'The gateway to the kingdom where novice herd boys learn stone opening discipline.',
    unlockCondition: 'Default environment (Always unlocked).',
    unlockRequirement: {},
    weather: ['heat-haze', 'golden-dawn'],
    previewGradient: 'from-[#2A1E11] via-[#382614] to-[#1E160D]',
    accentColor: '#D9A855',
    audio: {
      bed: 'licensed_lowland_warmth_bed_v1',
      mid: 'field_maseru_cattle_bells_and_wind',
      night: 'field_maseru_dusk_crickets',
    },
  },
  semonkong: {
    id: 'semonkong',
    name: 'Semonkong',
    altitude: 2200,
    tierLabel: 'Zone 2 · Mid-Tier Highlands',
    subtitle: 'Place of Smoke & Maletsunyane Gorge',
    description: 'Lush mountain plateau draped in rolling rain, valley mist, and distant waterfall echoes.',
    historicalSignificance: 'Home of the legendary 192m waterfall where water carves deep basalt canyons.',
    unlockCondition: 'Unlocked by clearing Bothata (Stage 2) or achieving a 2-Win Streak.',
    unlockRequirement: {
      requiredStage: 'bothata',
      minStreakThreshold: 2,
    },
    weather: ['mountain-rain', 'mist'],
    previewGradient: 'from-[#1A2624] via-[#233835] to-[#101D1A]',
    accentColor: '#68B39B',
    audio: {
      bed: 'licensed_highland_rain_hiss_bed_v1',
      mid: 'field_semonkong_gorge_breeze_and_water',
      night: 'field_semonkong_valley_calls',
    },
  },
  mokhotlong: {
    id: 'mokhotlong',
    name: 'Mokhotlong',
    altitude: 2700,
    tierLabel: 'Zone 3 · High Alpine Roof',
    subtitle: 'Roof of Africa & Thabana-Ntlenyana Approach',
    description: 'High-altitude sub-alpine peaks with swirling snow flurries, gale-force winds, and crisp crystalline light.',
    historicalSignificance: 'The harshest climatic region in southern Africa, forging relentless defensive tacticians.',
    unlockCondition: 'Unlocked by clearing Litšepe (Stage 3) or achieving a 4-Win Streak.',
    unlockRequirement: {
      requiredStage: 'litshepe',
      minStreakThreshold: 4,
    },
    weather: ['alpine-snow', 'mist'],
    previewGradient: 'from-[#17202B] via-[#203042] to-[#0E151E]',
    accentColor: '#79B7D9',
    audio: {
      bed: 'licensed_alpine_howling_wind_bed_v1',
      mid: 'field_mokhotlong_herd_boy_whistle_and_frost',
      night: 'field_mokhotlong_subzero_crackle',
    },
  },
  'thaba-bosiu': {
    id: 'thaba-bosiu',
    name: 'Thaba-Bosiu',
    altitude: 1804,
    tierLabel: 'Zone 4 · Sovereign Summit (Final Unlock)',
    subtitle: 'Mountain of the Night · Citadel of King Moshoeshoe I',
    description: 'The impregnable sacred sandstone plateau lit by winter firelight, quiet night air, and ancient Basotho majesty.',
    historicalSignificance: 'The birth citadel of the Basotho nation. Never captured by force of arms; preserved through wisdom.',
    unlockCondition: 'Final Narrative Summit. Unlocked by conquering Morena Letsie (Stage 5) or completing the Mountain Campaign.',
    unlockRequirement: {
      requiredStage: 'morena',
    },
    weather: ['dusk-firelight', 'golden-dawn'],
    previewGradient: 'from-[#331C0C] via-[#48250F] to-[#1C0E05]',
    accentColor: '#FFD700',
    audio: {
      bed: 'licensed_dusk_plateau_still_air_bed_v1',
      mid: 'field_thaba_bosiu_fire_crackle_and_night_dogs',
      night: 'field_thaba_bosiu_sacred_chant_ambient',
    },
  },
};

export const ZONES_LIST = Object.values(ALTITUDE_ZONES);

// Check if a zone is unlocked based on stages completed and win streak
export function isZoneUnlocked(
  zoneId: AltitudeZoneId,
  completedStages: DifficultyStageId[],
  winStreak: WinStreakState
): boolean {
  const zone = ALTITUDE_ZONES[zoneId];
  if (!zone) return false;

  const safeCompleted = completedStages || [];

  // Maseru is always unlocked
  if (zoneId === 'maseru') return true;

  // Thaba-Bosiu is the mandatory final narrative unlock: Requires beating Morena (Stage 5) or clearing all stages
  if (zoneId === 'thaba-bosiu') {
    return safeCompleted.includes('morena') || safeCompleted.length >= 4;
  }

  // Check stage requirement
  if (zone.unlockRequirement.requiredStage && safeCompleted.includes(zone.unlockRequirement.requiredStage)) {
    return true;
  }

  // Check win streak acceleration (max 20-30% reduction in requirements)
  if (
    zone.unlockRequirement.minStreakThreshold !== undefined &&
    (winStreak?.currentStreak ?? 0) >= zone.unlockRequirement.minStreakThreshold
  ) {
    return true;
  }

  return false;
}
