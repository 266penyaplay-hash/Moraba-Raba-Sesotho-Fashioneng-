import {
  DifficultyStageId,
  PlayerId,
  PlayerCareerProfile,
  PlayerCareerRecord,
  CareerModeStats,
  DetailedMatchRecord,
  HeadToHeadRecord,
  PrestigeHonor,
  MatchPerformanceStats,
  CattleSetId,
} from '../types';
import {
  loadPlayerMastery,
  savePlayerMastery,
  getRankTier,
  PlayerMasteryData,
} from './masteryStats';
import { DIFFICULTY_STAGES } from '../constants/stages';

export const CAREER_PROFILE_KEY = 'morabaraba_career_profile_v1';
export const MATCH_HISTORY_KEY = 'morabaraba_match_history_v1';
export const HEAD_TO_HEAD_KEY = 'morabaraba_head_to_head_v1';

export const LESOTHO_DISTRICTS = [
  'Maseru',
  'Berea',
  'Leribe',
  'Butha-Buthe',
  'Mokhotlong',
  'Thaba-Tseka',
  'Qacha\'s Nek',
  'Quthing',
  'Mohale\'s Hoek',
  'Mafeteng',
];

export const COUNTRIES = [
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'INT', name: 'International / Global', flag: '🌍' },
];

export const INITIAL_PRESTIGE_HONORS: PrestigeHonor[] = [
  {
    id: 'defeated_morena',
    title: 'Sovereign of the Rock',
    subtitle: 'Defeated Morena Letsie',
    description: 'Vanquished the supreme master of Morabaraba at the sacred summit of Tsoenene.',
    category: 'boss',
    icon: 'Crown',
    badgeColor: '#FFD700',
    unlocked: false,
    rarity: 'MYTHIC',
  },
  {
    id: 'defeated_sefako',
    title: 'Mountain Tested',
    subtitle: 'Defeated Sefako',
    description: 'Weathered the aggressive storm tactics of Sefako on the alpine heights of Mokhotlong.',
    category: 'boss',
    icon: 'Target',
    badgeColor: '#8C6CFA',
    unlocked: false,
    rarity: 'LEGENDARY',
  },
  {
    id: 'streak_10',
    title: 'Unbroken Kraal',
    subtitle: '10-Game Win Streak',
    description: 'Maintained an unbroken string of 10 consecutive competitive victories.',
    category: 'streak',
    icon: 'Flame',
    badgeColor: '#FF7A29',
    unlocked: false,
    rarity: 'LEGENDARY',
  },
  {
    id: 'streak_5',
    title: 'Highland Fire',
    subtitle: '5-Game Win Streak',
    description: 'Secured 5 consecutive victories across the kingdom battlegrounds.',
    category: 'streak',
    icon: 'Zap',
    badgeColor: '#E06D38',
    unlocked: false,
    rarity: 'RARE',
  },
  {
    id: 'wins_100',
    title: 'Centurion Herdsman',
    subtitle: '100 Career Victories',
    description: 'Led your cattle to 100 tactical triumphs in Morabaraba history.',
    category: 'mastery',
    icon: 'Trophy',
    badgeColor: '#D9A855',
    unlocked: false,
    rarity: 'EPIC',
  },
  {
    id: 'matches_50',
    title: 'Seasoned Tactician',
    subtitle: '50 Career Matches',
    description: 'Participated in 50 full matches of competitive Morabaraba.',
    category: 'mastery',
    icon: 'Shield',
    badgeColor: '#5EA38A',
    unlocked: false,
    rarity: 'RARE',
  },
  {
    id: 'perfect_kraal',
    title: 'Shield of Moshoeshoe',
    subtitle: 'Flawless Kraal (12/12 Kept)',
    description: 'Won a complete match without losing a single cow to enemy shooting.',
    category: 'tactics',
    icon: 'Award',
    badgeColor: '#FFE79A',
    unlocked: false,
    rarity: 'EPIC',
  },
  {
    id: 'lethal_tempo',
    title: 'Lightning of Thaba-Bosiu',
    subtitle: 'S+ Grade Lethal Tempo',
    description: 'Achieved an S+ tactical grade with a strike rate under 4.0 moves per mill.',
    category: 'tactics',
    icon: 'Sparkles',
    badgeColor: '#7957FF',
    unlocked: false,
    rarity: 'RARE',
  },
  {
    id: 'comeback_king',
    title: 'Mountain Rebirth',
    subtitle: 'Great Comeback Victory',
    description: 'Rallied to victory after trailing behind by 2 or more captured cattle.',
    category: 'tactics',
    icon: 'RotateCcw',
    badgeColor: '#38BDF8',
    unlocked: false,
    rarity: 'RARE',
  },
  {
    id: 'grand_meridian',
    title: 'Master of the Grand Horizon',
    subtitle: 'Lekhala la Metsi · Grand Double Mill',
    description: 'Executed an unbroken linear Grand Horizon Double Mill bisecting the kraal in a single decisive sweep.',
    category: 'legend',
    icon: 'Zap',
    badgeColor: '#FFD700',
    unlocked: false,
    rarity: 'MYTHIC',
  },
  {
    id: 'rating_2000',
    title: 'Litolobonya Sovereign',
    subtitle: '2000+ Elo Rating',
    description: 'Ascended into the elite echelon of Grand Strategists.',
    category: 'legend',
    icon: 'Compass',
    badgeColor: '#FF4D4F',
    unlocked: false,
    rarity: 'MYTHIC',
  },
];

const DEFAULT_MODE_STATS: CareerModeStats = {
  matches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  millsFormed: 0,
  millsPrevented: 0,
  cattleCaptured: 0,
  grandMeridianCount: 0,
  rating: 1200,
};

export function createDefaultCareerRecord(): PlayerCareerRecord {
  return {
    overall: { ...DEFAULT_MODE_STATS },
    ranked: { ...DEFAULT_MODE_STATS },
    casual: { ...DEFAULT_MODE_STATS },
    campaign: { ...DEFAULT_MODE_STATS },
    ai: { ...DEFAULT_MODE_STATS },
    tournament: { ...DEFAULT_MODE_STATS },
    friendly: { ...DEFAULT_MODE_STATS },
  };
}

export function createDefaultCareerProfile(userId = 'guest_user'): PlayerCareerProfile {
  return {
    userId,
    displayName: 'Basotho Tactician',
    username: 'herdsman_' + Math.floor(1000 + Math.random() * 9000),
    country: 'Lesotho 🇱🇸',
    region: 'Maseru',
    avatarIcon: 'mokorotlo',
    clanTitle: 'Bakoena',
    joinedDate: new Date().toISOString(),
    rating: 1200,
    peakRating: 1200,
    careerXp: 0,
    careerLevel: 1,
    equippedCattleSet: 'heritage',
    equippedBoard: 'sandstone',
    isGuest: true,
    recordsByMode: createDefaultCareerRecord(),
    recentForm: [],
    majorOpponentsDefeated: [],
    prestigeHonors: INITIAL_PRESTIGE_HONORS,
  };
}

// XP & Level calculations (Level 1: 0-499, Level 2: 500-1199, etc.)
export function calculateLevelFromXp(xp: number): { level: number; currentLevelXp: number; xpForNextLevel: number; progressPercent: number } {
  let level = 1;
  let threshold = 500;
  let remainingXp = xp;

  while (remainingXp >= threshold) {
    remainingXp -= threshold;
    level += 1;
    threshold = Math.round(threshold * 1.25);
  }

  const progressPercent = Math.min(100, Math.round((remainingXp / threshold) * 100));

  return {
    level,
    currentLevelXp: remainingXp,
    xpForNextLevel: threshold,
    progressPercent,
  };
}

export function calculateMatchXp(
  isWin: boolean,
  isDraw: boolean,
  movesCount: number,
  millsFormed: number,
  captures: number,
  wasComeback: boolean,
  grade: string
): number {
  let xp = 50; // base participation

  if (isWin) {
    xp += 150;
  } else if (isDraw) {
    xp += 80;
  } else {
    xp += 30;
  }

  xp += millsFormed * 20;
  xp += captures * 10;
  xp += Math.min(50, Math.floor(movesCount / 2));

  if (wasComeback) xp += 60;

  if (grade === 'S+') xp += 100;
  else if (grade === 'S') xp += 70;
  else if (grade === 'A') xp += 40;

  return xp;
}

export function loadPlayerCareerProfile(): PlayerCareerProfile {
  try {
    const raw = localStorage.getItem(CAREER_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mastery = loadPlayerMastery();

      // Ensure all fields and mode records exist
      const defaultProfile = createDefaultCareerProfile();
      const recordsByMode = {
        ...defaultProfile.recordsByMode,
        ...(parsed.recordsByMode || {}),
      };

      // Synchronize overall stats with mastery if overall is empty
      if (recordsByMode.overall.matches === 0 && mastery.totalMatches > 0) {
        const wr = Math.round((mastery.totalWins / mastery.totalMatches) * 100);
        recordsByMode.overall = {
          matches: mastery.totalMatches,
          wins: mastery.totalWins,
          losses: mastery.totalLosses,
          draws: mastery.totalDraws,
          winRate: wr,
          currentStreak: mastery.longestWinStreak > 0 ? 1 : 0,
          bestStreak: mastery.longestWinStreak,
          millsFormed: mastery.totalMillsFormed,
          millsPrevented: mastery.totalMillsPrevented,
          cattleCaptured: mastery.totalCattleCaptured,
          rating: mastery.rating,
        };
        recordsByMode.campaign = { ...recordsByMode.overall };
      }

      // Merge honors with initial honors definitions to guarantee any new badges are included
      const existingHonorsMap = new Map((parsed.prestigeHonors || []).map((h: PrestigeHonor) => [h.id, h]));
      const mergedHonors = INITIAL_PRESTIGE_HONORS.map((base) => {
        const found = existingHonorsMap.get(base.id) as PrestigeHonor | undefined;
        if (found) {
          return { ...base, unlocked: found.unlocked, unlockedAt: found.unlockedAt };
        }
        return base;
      });

      return {
        ...defaultProfile,
        ...parsed,
        rating: Math.max(parsed.rating || 1200, mastery.rating || 1200),
        peakRating: Math.max(parsed.peakRating || 1200, mastery.peakRating || 1200),
        recordsByMode,
        prestigeHonors: mergedHonors,
      };
    }
  } catch (e) {
    console.error('Failed to load career profile:', e);
  }

  // Fallback bootstrap from mastery
  const defaultProfile = createDefaultCareerProfile();
  const mastery = loadPlayerMastery();
  if (mastery.totalMatches > 0) {
    const wr = Math.round((mastery.totalWins / mastery.totalMatches) * 100);
    defaultProfile.rating = mastery.rating;
    defaultProfile.peakRating = mastery.peakRating;
    defaultProfile.recordsByMode.overall = {
      matches: mastery.totalMatches,
      wins: mastery.totalWins,
      losses: mastery.totalLosses,
      draws: mastery.totalDraws,
      winRate: wr,
      currentStreak: 1,
      bestStreak: mastery.longestWinStreak,
      millsFormed: mastery.totalMillsFormed,
      millsPrevented: mastery.totalMillsPrevented,
      cattleCaptured: mastery.totalCattleCaptured,
      rating: mastery.rating,
    };
    defaultProfile.recordsByMode.campaign = { ...defaultProfile.recordsByMode.overall };
  }
  return defaultProfile;
}

export function savePlayerCareerProfile(profile: PlayerCareerProfile) {
  try {
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save career profile:', e);
  }
}

export function loadMatchHistory(): DetailedMatchRecord[] {
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load match history:', e);
  }
  return [];
}

export function saveMatchHistory(history: DetailedMatchRecord[]) {
  try {
    // Keep up to 100 most recent detailed matches locally
    const trimmed = history.slice(0, 100);
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save match history:', e);
  }
}

export function loadHeadToHeadRecords(): HeadToHeadRecord[] {
  try {
    const raw = localStorage.getItem(HEAD_TO_HEAD_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load head-to-head records:', e);
  }

  // Initialize with AI bosses
  return (Object.entries(DIFFICULTY_STAGES) as [DifficultyStageId, typeof DIFFICULTY_STAGES['matenase']][]).map(
    ([stageId, stage]) => ({
      opponentId: stageId,
      opponentName: stage.opponentName,
      opponentType: 'ai',
      avatar: stage.mapName,
      clanTitle: stage.tierLabel,
      rating:
        stageId === 'matenase'
          ? 900
          : stageId === 'bothata'
          ? 1250
          : stageId === 'litshepe'
          ? 1650
          : stageId === 'sefako'
          ? 2050
          : 2450,
      wins: 0,
      losses: 0,
      draws: 0,
      totalMatches: 0,
      winRate: 0,
      recentForm: [],
      lastPlayedAt: '',
    })
  );
}

export function saveHeadToHeadRecords(records: HeadToHeadRecord[]) {
  try {
    localStorage.setItem(HEAD_TO_HEAD_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save head-to-head records:', e);
  }
}

/**
 * Core function that records a newly finished match into the complete Morabaraba Career System
 */
export function recordMatchToCareer(params: {
  userId: string;
  opponentId: string;
  opponentName: string;
  opponentType: 'ai' | 'human' | 'friend';
  opponentRating?: number;
  opponentAvatar?: string;
  opponentClan?: string;
  gameMode: 'ranked' | 'casual' | 'campaign' | 'ai' | 'tournament' | 'friendly' | 'online' | 'pass-and-play';
  stageId?: DifficultyStageId | string;
  winner: PlayerId | 'draw';
  winnerName: string;
  stats: MatchPerformanceStats;
  movesCount: number;
  durationSeconds: number;
  finalBoardPoints?: Record<string, { piece: PlayerId | null }>;
  wasComeback?: boolean;
}): {
  updatedProfile: PlayerCareerProfile;
  matchRecord: DetailedMatchRecord;
  unlockedHonors: PrestigeHonor[];
} {
  const profile = loadPlayerCareerProfile();
  const matchHistory = loadMatchHistory();
  const headToHeadList = loadHeadToHeadRecords();

  const isPlayerWin = params.winner === 'obsidian';
  const isDraw = params.winner === 'draw';
  const isPlayerLoss = !isPlayerWin && !isDraw;
  const result: 'VICTORY' | 'DEFEAT' | 'DRAW' = isDraw ? 'DRAW' : isPlayerWin ? 'VICTORY' : 'DEFEAT';
  const formChar: 'W' | 'L' | 'D' = isDraw ? 'D' : isPlayerWin ? 'W' : 'L';

  const oppRating = params.opponentRating || 1200;

  // Calculate ELO Delta
  // Only ranked, campaign, and ai matches impact competitive rating
  const isCompetitiveMode =
    params.gameMode === 'ranked' ||
    params.gameMode === 'campaign' ||
    params.gameMode === 'ai' ||
    params.gameMode === 'tournament';

  let ratingDelta = 0;
  if (isCompetitiveMode) {
    const expectedScore = 1 / (1 + Math.pow(10, (oppRating - profile.rating) / 400));
    const actualScore = isDraw ? 0.5 : isPlayerWin ? 1 : 0;
    const kFactor = params.gameMode === 'tournament' ? 40 : 32;
    ratingDelta = Math.round(kFactor * (actualScore - expectedScore));
  }

  const ratingBefore = profile.rating;
  const ratingAfter = Math.max(600, ratingBefore + ratingDelta);
  const peakRating = Math.max(profile.peakRating, ratingAfter);

  // Calculate XP
  const xpEarned = calculateMatchXp(
    isPlayerWin,
    isDraw,
    params.movesCount,
    params.stats.playerMills,
    params.stats.playerCaptures,
    !!params.wasComeback,
    params.stats.grade
  );

  const newTotalXp = profile.careerXp + xpEarned;
  const { level: newLevel } = calculateLevelFromXp(newTotalXp);

  // Update Game Mode Stats Helper
  const updateStatsBlock = (target: CareerModeStats): CareerModeStats => {
    const totalM = target.matches + 1;
    const wins = target.wins + (isPlayerWin ? 1 : 0);
    const losses = target.losses + (isPlayerLoss ? 1 : 0);
    const draws = target.draws + (isDraw ? 1 : 0);
    const curStreak = isPlayerWin ? target.currentStreak + 1 : 0;
    const bestStreak = Math.max(target.bestStreak, curStreak);

    return {
      matches: totalM,
      wins,
      losses,
      draws,
      winRate: Math.round((wins / totalM) * 100),
      currentStreak: curStreak,
      bestStreak,
      millsFormed: target.millsFormed + params.stats.playerMills,
      millsPrevented: target.millsPrevented + params.stats.opponentMills,
      cattleCaptured: target.cattleCaptured + params.stats.playerCaptures,
      grandMeridianCount: (target.grandMeridianCount || 0) + (params.stats.playerGrandMeridianMills || 0),
      rating: isCompetitiveMode ? ratingAfter : target.rating,
    };
  };

  // Map to target mode key
  let modeKey: keyof PlayerCareerRecord = 'ai';
  if (params.gameMode === 'ranked' || params.gameMode === 'online') modeKey = 'ranked';
  else if (params.gameMode === 'campaign') modeKey = 'campaign';
  else if (params.gameMode === 'tournament') modeKey = 'tournament';
  else if (params.gameMode === 'friendly') modeKey = 'friendly';
  else if (params.gameMode === 'pass-and-play' || params.gameMode === 'casual') modeKey = 'casual';

  const updatedRecords: PlayerCareerRecord = {
    ...profile.recordsByMode,
    overall: updateStatsBlock(profile.recordsByMode.overall),
    [modeKey]: updateStatsBlock(profile.recordsByMode[modeKey]),
  };

  // Update Recent Form (last 5 results)
  const recentForm: ('W' | 'L' | 'D')[] = [formChar, ...(profile.recentForm || [])].slice(0, 5);

  // Update Major Opponents Defeated list
  let majorDefeated = [...(profile.majorOpponentsDefeated || [])];
  if (isPlayerWin && params.stageId && !majorDefeated.includes(params.stageId as DifficultyStageId)) {
    majorDefeated.push(params.stageId as DifficultyStageId);
  }

  // Create Detailed Match Record
  const matchId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  const matchRecord: DetailedMatchRecord = {
    matchId,
    userId: params.userId,
    opponentId: params.opponentId,
    opponentName: params.opponentName,
    opponentType: params.opponentType,
    opponentRating: oppRating,
    opponentAvatar: params.opponentAvatar,
    opponentClan: params.opponentClan,
    gameMode: params.gameMode,
    stageId: params.stageId,
    date: nowIso,
    startTime: new Date(Date.now() - params.durationSeconds * 1000).toISOString(),
    durationSeconds: params.durationSeconds,
    result,
    winner: params.winner,
    winnerName: params.winnerName,
    loserId: isDraw ? undefined : isPlayerWin ? params.opponentId : params.userId,
    isDraw,
    moveCount: params.movesCount,
    playerCaptures: params.stats.playerCaptures,
    opponentCaptures: params.stats.opponentCaptures,
    playerMills: params.stats.playerMills,
    opponentMills: params.stats.opponentMills,
    playerDoubleMills: params.stats.playerDoubleMills || 0,
    opponentDoubleMills: params.stats.opponentDoubleMills || 0,
    playerGrandMeridianMills: params.stats.playerGrandMeridianMills || 0,
    opponentGrandMeridianMills: params.stats.opponentGrandMeridianMills || 0,
    ratingBefore,
    ratingAfter,
    ratingDelta,
    xpEarned,
    finalBoardSnapshot: params.finalBoardPoints,
    tacticalGrade: params.stats.grade,
    tempoBadge: params.stats.tempoBadge,
    wasComeback: !!params.wasComeback,
    isHistoricBossMatch: params.stageId === 'sefako' || params.stageId === 'morena',
  };

  // Prepend to history
  const updatedHistory = [matchRecord, ...matchHistory];
  saveMatchHistory(updatedHistory);

  // Update Head to Head Record
  const existingRivalryIndex = headToHeadList.findIndex(
    (h) => h.opponentId === params.opponentId || h.opponentName === params.opponentName
  );

  let targetRivalry: HeadToHeadRecord;
  if (existingRivalryIndex >= 0) {
    targetRivalry = { ...headToHeadList[existingRivalryIndex] };
  } else {
    targetRivalry = {
      opponentId: params.opponentId,
      opponentName: params.opponentName,
      opponentType: params.opponentType,
      avatar: params.opponentAvatar || '🐂',
      clanTitle: params.opponentClan || 'Tactician',
      rating: oppRating,
      wins: 0,
      losses: 0,
      draws: 0,
      totalMatches: 0,
      winRate: 0,
      recentForm: [],
      lastPlayedAt: nowIso,
    };
  }

  targetRivalry.totalMatches += 1;
  if (isPlayerWin) targetRivalry.wins += 1;
  else if (isPlayerLoss) targetRivalry.losses += 1;
  else targetRivalry.draws += 1;

  targetRivalry.winRate = Math.round((targetRivalry.wins / targetRivalry.totalMatches) * 100);
  targetRivalry.recentForm = [formChar, ...(targetRivalry.recentForm || [])].slice(0, 5);
  targetRivalry.lastPlayedAt = nowIso;
  targetRivalry.rating = oppRating;

  let updatedH2H: HeadToHeadRecord[];
  if (existingRivalryIndex >= 0) {
    updatedH2H = [...headToHeadList];
    updatedH2H[existingRivalryIndex] = targetRivalry;
  } else {
    updatedH2H = [targetRivalry, ...headToHeadList];
  }
  saveHeadToHeadRecords(updatedH2H);

  // Check & Unlock Prestige Honors
  const newlyUnlockedHonors: PrestigeHonor[] = [];
  const updatedHonors = profile.prestigeHonors.map((honor) => {
    if (honor.unlocked) return honor;

    let shouldUnlock = false;

    if (honor.id === 'defeated_morena' && params.stageId === 'morena' && isPlayerWin) {
      shouldUnlock = true;
    } else if (honor.id === 'defeated_sefako' && params.stageId === 'sefako' && isPlayerWin) {
      shouldUnlock = true;
    } else if (honor.id === 'streak_10' && updatedRecords.overall.currentStreak >= 10) {
      shouldUnlock = true;
    } else if (honor.id === 'streak_5' && updatedRecords.overall.currentStreak >= 5) {
      shouldUnlock = true;
    } else if (honor.id === 'wins_100' && updatedRecords.overall.wins >= 100) {
      shouldUnlock = true;
    } else if (honor.id === 'matches_50' && updatedRecords.overall.matches >= 50) {
      shouldUnlock = true;
    } else if (honor.id === 'perfect_kraal' && isPlayerWin && params.stats.playerKraalRetention >= 100) {
      shouldUnlock = true;
    } else if (honor.id === 'lethal_tempo' && isPlayerWin && params.stats.grade === 'S+') {
      shouldUnlock = true;
    } else if (honor.id === 'comeback_king' && isPlayerWin && params.wasComeback) {
      shouldUnlock = true;
    } else if (honor.id === 'grand_meridian' && (params.stats.playerGrandMeridianMills ?? 0) > 0) {
      shouldUnlock = true;
    } else if (honor.id === 'rating_2000' && ratingAfter >= 2000) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      const unlockedHonor: PrestigeHonor = {
        ...honor,
        unlocked: true,
        unlockedAt: nowIso,
      };
      newlyUnlockedHonors.push(unlockedHonor);
      return unlockedHonor;
    }

    return honor;
  });

  const updatedProfile: PlayerCareerProfile = {
    ...profile,
    rating: ratingAfter,
    peakRating,
    careerXp: newTotalXp,
    careerLevel: newLevel,
    recordsByMode: updatedRecords,
    recentForm,
    majorOpponentsDefeated: majorDefeated,
    prestigeHonors: updatedHonors,
  };

  savePlayerCareerProfile(updatedProfile);

  return {
    updatedProfile,
    matchRecord,
    unlockedHonors: newlyUnlockedHonors,
  };
}
