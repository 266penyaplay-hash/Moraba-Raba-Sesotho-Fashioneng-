import { DifficultyStageId, PlayerId } from '../types';

export interface BasothoRankTier {
  id: string;
  name: string;
  translation: string;
  minRating: number;
  maxRating: number;
  badgeColor: string;
  bgGradient: string;
  icon: string;
  description: string;
}

export const BASOTHO_RANKS: BasothoRankTier[] = [
  {
    id: 'modisa',
    name: 'Modisa',
    translation: 'Herdsman Apprentice',
    minRating: 0,
    maxRating: 1099,
    badgeColor: '#A89C8F',
    bgGradient: 'from-[#2A2018] to-[#17130F]',
    icon: 'Compass',
    description: 'Learning the stones, the kraal boundaries, and the ancient pastoral rhythms of Lesotho.',
  },
  {
    id: 'morakeng',
    name: 'Morakeng',
    translation: 'Kraal Watcher',
    minRating: 1100,
    maxRating: 1399,
    badgeColor: '#D9A855',
    bgGradient: 'from-[#382614] to-[#1C140C]',
    icon: 'Shield',
    description: 'Guards the cattle against naive attacks. Recognizes immediate lines and defends the corners.',
  },
  {
    id: 'mohlabani',
    name: 'Mohlabani',
    translation: 'Highland Warrior',
    minRating: 1400,
    maxRating: 1699,
    badgeColor: '#E06D38',
    bgGradient: 'from-[#3D1E10] to-[#1F1008]',
    icon: 'Target',
    description: 'Battles aggressively on the red ridges. Attacks with coordinated double threats and diagonal forks.',
  },
  {
    id: 'mofolisi',
    name: 'Mofolisi',
    translation: 'Master Tactician',
    minRating: 1700,
    maxRating: 1999,
    badgeColor: '#5EA38A',
    bgGradient: 'from-[#1B332B] to-[#0E1C17]',
    icon: 'Zap',
    description: 'Commands the center ring d4 with icy mountain foresight. Understands mill cycles and positional locks.',
  },
  {
    id: 'litolobonya',
    name: 'Litolobonya',
    translation: 'Grand Strategist',
    minRating: 2000,
    maxRating: 2299,
    badgeColor: '#8C6CFA',
    bgGradient: 'from-[#2B1B4A] to-[#140D24]',
    icon: 'Award',
    description: 'A feared grandmaster who calculates deep sacrificial sequences and weathers the fiercest alpine storms.',
  },
  {
    id: 'morena_oa_morabaraba',
    name: 'Morena oa Morabaraba',
    translation: 'Sovereign of the Rock',
    minRating: 2300,
    maxRating: 9999,
    badgeColor: '#FFD700',
    bgGradient: 'from-[#42310C] to-[#1F1705]',
    icon: 'Crown',
    description: 'The pinnacle of Basotho board intelligence. 12 cows, no advantage, flawless mathematical mastery.',
  },
];

export interface AiRivalryRecord {
  wins: number;
  losses: number;
  draws: number;
  lastPlayed?: string;
}

export interface PlayerMasteryData {
  rating: number;
  peakRating: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalMillsFormed: number;
  totalMillsPrevented: number;
  totalCattleCaptured: number;
  totalComebacks: number;
  longestWinStreak: number;
  totalMovesInVictories: number;
  victoryCountWithMoves: number;
  aiRivalries: Record<DifficultyStageId, AiRivalryRecord>;
  seasonRecord: {
    seasonName: string;
    wins: number;
    losses: number;
  };
}

export const MASTERY_STORAGE_KEY = 'morabaraba_player_mastery_v1';

export function getRankTier(rating: number): BasothoRankTier {
  return (
    BASOTHO_RANKS.find((r) => rating >= r.minRating && rating <= r.maxRating) ||
    BASOTHO_RANKS[0]
  );
}

export function loadPlayerMastery(): PlayerMasteryData {
  const defaultData: PlayerMasteryData = {
    rating: 1200,
    peakRating: 1200,
    totalMatches: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    totalMillsFormed: 0,
    totalMillsPrevented: 0,
    totalCattleCaptured: 0,
    totalComebacks: 0,
    longestWinStreak: 0,
    totalMovesInVictories: 0,
    victoryCountWithMoves: 0,
    aiRivalries: {
      matenase: { wins: 0, losses: 0, draws: 0 },
      bothata: { wins: 0, losses: 0, draws: 0 },
      litshepe: { wins: 0, losses: 0, draws: 0 },
      sefako: { wins: 0, losses: 0, draws: 0 },
      morena: { wins: 0, losses: 0, draws: 0 },
    },
    seasonRecord: {
      seasonName: 'Season 1: Highlands Awakening',
      wins: 0,
      losses: 0,
    },
  };

  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultData,
        ...parsed,
        aiRivalries: {
          ...defaultData.aiRivalries,
          ...(parsed.aiRivalries || {}),
        },
        seasonRecord: {
          ...defaultData.seasonRecord,
          ...(parsed.seasonRecord || {}),
        },
      };
    }
  } catch {
    // Ignore error
  }
  return defaultData;
}

export function savePlayerMastery(data: PlayerMasteryData) {
  try {
    localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore error
  }
}

export function recordMatchToMastery(
  stageId: DifficultyStageId,
  isPlayerWon: boolean,
  isDraw: boolean,
  millsFormed: number,
  millsPrevented: number,
  captures: number,
  movesCount: number,
  wasComeback: boolean
): PlayerMasteryData {
  const current = loadPlayerMastery();
  const opponentRatings: Record<DifficultyStageId, number> = {
    matenase: 900,
    bothata: 1250,
    litshepe: 1650,
    sefako: 2050,
    morena: 2450,
  };

  const oppRating = opponentRatings[stageId] || 1200;
  const expectedScore = 1 / (1 + Math.pow(10, (oppRating - current.rating) / 400));
  const actualScore = isDraw ? 0.5 : isPlayerWon ? 1 : 0;
  const kFactor = 32;
  const ratingDelta = Math.round(kFactor * (actualScore - expectedScore));
  const newRating = Math.max(600, current.rating + ratingDelta);

  const rivalry = current.aiRivalries[stageId] || { wins: 0, losses: 0, draws: 0 };
  if (isDraw) {
    rivalry.draws += 1;
  } else if (isPlayerWon) {
    rivalry.wins += 1;
  } else {
    rivalry.losses += 1;
  }
  rivalry.lastPlayed = new Date().toISOString();

  const updated: PlayerMasteryData = {
    ...current,
    rating: newRating,
    peakRating: Math.max(current.peakRating, newRating),
    totalMatches: current.totalMatches + 1,
    totalWins: current.totalWins + (isPlayerWon ? 1 : 0),
    totalLosses: current.totalLosses + (!isPlayerWon && !isDraw ? 1 : 0),
    totalDraws: current.totalDraws + (isDraw ? 1 : 0),
    totalMillsFormed: current.totalMillsFormed + millsFormed,
    totalMillsPrevented: current.totalMillsPrevented + millsPrevented,
    totalCattleCaptured: current.totalCattleCaptured + captures,
    totalComebacks: current.totalComebacks + (wasComeback ? 1 : 0),
    totalMovesInVictories: isPlayerWon ? current.totalMovesInVictories + movesCount : current.totalMovesInVictories,
    victoryCountWithMoves: isPlayerWon ? current.victoryCountWithMoves + 1 : current.victoryCountWithMoves,
    aiRivalries: {
      ...current.aiRivalries,
      [stageId]: rivalry,
    },
    seasonRecord: {
      ...current.seasonRecord,
      wins: current.seasonRecord.wins + (isPlayerWon ? 1 : 0),
      losses: current.seasonRecord.losses + (!isPlayerWon && !isDraw ? 1 : 0),
    },
  };

  savePlayerMastery(updated);
  return updated;
}
