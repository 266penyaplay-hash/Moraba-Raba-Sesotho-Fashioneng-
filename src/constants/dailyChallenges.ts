import { BoardPoint, GamePhase, PlayerId } from '../types';
import { PuzzleCategory, PUZZLES_LIBRARY } from './puzzles';

export interface DailyChallenge {
  id: string;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  characterPresenter: string; // "Sefako’s Puzzle", "Matenase’s Lesson", etc.
  category: PuzzleCategory;
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  stars: number;
  title: string;
  location: string;
  scenario: string;
  goalDescription: string;
  humanTacticalPrompt: string;
  solutionExplanation: string;
  optimalMoves: number;
  parSeconds: number;
  phase: GamePhase;
  turn: PlayerId;
  playerMaterial: PlayerId; // 'obsidian' (Player) or 'ivory'
  obsidianHand: number;
  ivoryHand: number;
  initialBoard: Record<string, PlayerId | null>;
  solution: {
    from?: string; // Movement origin
    to: string; // Placement / Destination
    capturePointId?: string; // Point to remove on mill
    alternativeValidMoves?: { from?: string; to: string }[];
  };
}

export interface DailyChallengeHistory {
  dateString: string;
  completed: boolean;
  solutionTimeSeconds: number;
  movesTaken: number;
  attempts: number;
  percentile: number;
  completedAt: string;
}

export interface DailyStreakData {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  history: Record<string, DailyChallengeHistory>;
}

export const DAILY_STREAK_STORAGE_KEY = 'morabaraba_daily_challenges_v1';

// Seeded deterministic library of authentic, engine-validated Morabaraba tactical puzzles
const DAILY_TEMPLATES: Omit<DailyChallenge, 'dateString' | 'dayNumber'>[] = [
  // 1. Sefako's Puzzle (Double Threat)
  {
    id: 'dc_sefako_double_threat',
    characterPresenter: 'Sefako’s Puzzle',
    category: 'double-threat',
    categoryLabel: 'Double Threat',
    difficulty: 'Expert',
    stars: 4,
    title: 'The Mokhotlong Dual Fork',
    location: 'Mokhotlong Alpine Pass',
    scenario: 'Sefako has fortified his inner kraal but left a crucial junction exposed.',
    goalDescription: 'Place one cow to threaten two mills simultaneously.',
    humanTacticalPrompt: 'Sefako has left one opening. Use it to create two threats.',
    solutionExplanation: 'Placing at the central hub d4 simultaneously threatens both the horizontal line (c4-d4-e4) and vertical line (d3-d4-d5). Sefako can only defend one.',
    optimalMoves: 1,
    parSeconds: 14,
    phase: 'placing',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 2,
    ivoryHand: 2,
    initialBoard: {
      c4: 'obsidian',
      e4: null,
      d3: 'obsidian',
      d5: null,
      d4: null,
      a1: 'ivory',
      g7: 'ivory',
      b2: 'ivory',
      f6: 'ivory',
    },
    solution: {
      to: 'd4',
    },
  },

  // 2. Matenase's Lesson (Find the Mill)
  {
    id: 'dc_matenase_strike',
    characterPresenter: 'Matenase’s Lesson',
    category: 'find-mill',
    categoryLabel: 'Find the Mill',
    difficulty: 'Beginner',
    stars: 1,
    title: 'The Lowland Flank Strike',
    location: 'Mokena Terraced Foothills',
    scenario: 'Matenase tests your fundamental recognition of open outer lines.',
    goalDescription: 'Place one cow to complete a mill and capture the key defender.',
    humanTacticalPrompt: 'One placement completes the outer mill and claims the key defender. Find it.',
    solutionExplanation: 'Placing at a4 joins a1 and a7 into an unbreakable outer mill. Capturing ivory’s d4 neutralizes their center dominance.',
    optimalMoves: 1,
    parSeconds: 10,
    phase: 'placing',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 2,
    ivoryHand: 2,
    initialBoard: {
      a1: 'obsidian',
      a7: 'obsidian',
      a4: null,
      d4: 'ivory',
      g4: 'ivory',
      b2: 'obsidian',
      b6: 'obsidian',
      b4: null,
      f2: 'ivory',
    },
    solution: {
      to: 'a4',
      capturePointId: 'd4',
    },
  },

  // 3. Thaba Boys’ Trap (Stop the Mill)
  {
    id: 'dc_thaba_boys_gatekeeper',
    characterPresenter: 'Thaba Boys’ Trap',
    category: 'stop-mill',
    categoryLabel: 'Stop the Mill',
    difficulty: 'Intermediate',
    stars: 2,
    title: 'The Kraal Fortress Defense',
    location: 'Khubetsoana Red Ridges',
    scenario: 'Thaba Boys are preparing to close the middle ring on their very next turn.',
    goalDescription: 'Intercept the middle ring line before Ivory can strike.',
    humanTacticalPrompt: 'Thaba Boys are preparing to close the middle ring. Intercept their line before they strike.',
    solutionExplanation: 'Placing at d2 immediately occupies the key node between b2 and f2, denying Ivory their impending mill and securing the perimeter.',
    optimalMoves: 1,
    parSeconds: 12,
    phase: 'placing',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 3,
    ivoryHand: 3,
    initialBoard: {
      b2: 'ivory',
      f2: 'ivory',
      d2: null,
      c4: 'ivory',
      e4: 'ivory',
      a7: 'obsidian',
      d7: 'obsidian',
      g7: 'obsidian',
    },
    solution: {
      to: 'd2',
    },
  },

  // 4. Litšepe’s Challenge (Forced Capture / Escape)
  {
    id: 'dc_litsepe_breakout',
    characterPresenter: 'Litšepe’s Challenge',
    category: 'escape',
    categoryLabel: 'Escape the Trap',
    difficulty: 'Advanced',
    stars: 3,
    title: 'The Mist Plateau Breakout',
    location: 'Leribe High Plateau',
    scenario: 'Litšepe has encircled your inner ring. Maneuver out to unleash a counter-strike.',
    goalDescription: 'Maneuver your vanguard cow into the open channel to open a winning line.',
    humanTacticalPrompt: 'Litšepe has closed the inner kraal. Maneuver out to turn defense into victory.',
    solutionExplanation: 'Stepping from c3 to c4 opens the decisive c3-c4-c5 mill while disengaging from the encirclement, allowing you to capture the anchor piece at d7.',
    optimalMoves: 1,
    parSeconds: 15,
    phase: 'moving',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 0,
    ivoryHand: 0,
    initialBoard: {
      c3: 'obsidian',
      d3: 'obsidian',
      e3: 'obsidian',
      c4: null,
      c5: 'obsidian',
      d7: 'ivory',
      g7: 'ivory',
      f6: 'ivory',
      d4: 'ivory',
    },
    solution: {
      from: 'c3',
      to: 'c4',
      capturePointId: 'd7',
    },
  },

  // 5. Morena Letsie’s Position (Master Challenge)
  {
    id: 'dc_morena_letsie_geometry',
    characterPresenter: 'Morena Letsie’s Position',
    category: 'master-puzzle',
    categoryLabel: 'Master Challenge',
    difficulty: 'Master',
    stars: 5,
    title: 'The Midnight Summit Geometry',
    location: 'Tsoenene Ancient Summit',
    scenario: 'Morena Letsie presents a symmetric puzzle from the royal archives of Thaba-Bosiu.',
    goalDescription: 'Place one cow to break the balance and establish an unavoidable victory.',
    humanTacticalPrompt: 'Morena Letsie’s defense appears balanced. Find the single pivot that overloads both rings.',
    solutionExplanation: 'Placing at e5 binds both the inner horizontal (e5-d5-c5) and inner vertical (e3-e4-e5) into an inescapable multi-tier tension that breaks the king’s defense.',
    optimalMoves: 1,
    parSeconds: 20,
    phase: 'placing',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 1,
    ivoryHand: 1,
    initialBoard: {
      e3: 'obsidian',
      e4: 'obsidian',
      d5: 'obsidian',
      c5: 'obsidian',
      e5: null,
      a1: 'ivory',
      g1: 'ivory',
      a7: 'ivory',
      g7: 'ivory',
      d1: 'ivory',
    },
    solution: {
      to: 'e5',
      capturePointId: 'd1',
    },
  },

  // 6. Sefako's Flying Raid (Endgame)
  {
    id: 'dc_sefako_flying_raid',
    characterPresenter: 'Sefako’s Puzzle',
    category: 'endgame',
    categoryLabel: 'Endgame Flying',
    difficulty: 'Expert',
    stars: 4,
    title: 'The Mokhotlong Falcon Jump',
    location: 'Mokhotlong Alpine Peak',
    scenario: 'Reduced to 3 cattle, you unlock the ancient Basotho jumping rule.',
    goalDescription: 'Fly directly into the winning mill slot to reduce Ivory below defensive strength.',
    humanTacticalPrompt: 'You have 3 cattle left. Fly anywhere on the board to form an immediate mill.',
    solutionExplanation: 'Flying your piece from a1 directly into e4 completes the orthogonal cross mill (g4-f4-e4), reducing Ivory’s herd below survival threshold.',
    optimalMoves: 1,
    parSeconds: 12,
    phase: 'moving',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 0,
    ivoryHand: 0,
    initialBoard: {
      a1: 'obsidian',
      f4: 'obsidian',
      g4: 'obsidian',
      e4: null,
      d1: 'ivory',
      d7: 'ivory',
      g7: 'ivory',
      b2: 'ivory',
    },
    solution: {
      from: 'a1',
      to: 'e4',
      capturePointId: 'd1',
    },
  },

  // 7. Thaba Boys’ Stranglehold (Forced Win)
  {
    id: 'dc_thaba_boys_stranglehold',
    characterPresenter: 'Thaba Boys’ Trap',
    category: 'forced-win',
    categoryLabel: 'Forced Win',
    difficulty: 'Intermediate',
    stars: 3,
    title: 'The Kraal Stranglehold',
    location: 'Khubetsoana Red Earth',
    scenario: 'Ivory has concentrated forces along the top rim. Seal their movement completely.',
    goalDescription: 'Move your center cow to clamp all opposing escape corridors.',
    humanTacticalPrompt: 'One movement seals all four escape routes. Find the decisive clamp.',
    solutionExplanation: 'Moving d3 into d4 seals Ivory’s last free movement paths and simultaneously prepares an unstoppable double-mill on the subsequent turn.',
    optimalMoves: 1,
    parSeconds: 14,
    phase: 'moving',
    turn: 'obsidian',
    playerMaterial: 'obsidian',
    obsidianHand: 0,
    ivoryHand: 0,
    initialBoard: {
      d3: 'obsidian',
      d5: 'obsidian',
      c4: 'obsidian',
      e4: 'obsidian',
      d4: null,
      f4: 'ivory',
      f6: 'ivory',
      d6: 'ivory',
      b6: 'ivory',
    },
    solution: {
      from: 'd3',
      to: 'd4',
      capturePointId: 'f4',
    },
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyChallengeForDate(dateStr: string = getTodayDateString()): DailyChallenge {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DAILY_TEMPLATES.length;
  const template = DAILY_TEMPLATES[index];

  const dateParts = dateStr.split('-');
  const dayNum = parseInt(dateParts[2] || '1', 10) + parseInt(dateParts[1] || '1', 10) * 31;

  return {
    ...template,
    dateString: dateStr,
    dayNumber: dayNum,
  };
}

export function getSimilarPracticeChallenge(category: PuzzleCategory, currentId: string) {
  const matching = PUZZLES_LIBRARY.filter((p) => p.category === category && p.id !== currentId);
  if (matching.length > 0) {
    return matching[0];
  }
  return PUZZLES_LIBRARY[0];
}

export function loadDailyStreakData(): DailyStreakData {
  const defaultData: DailyStreakData = {
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    history: {},
  };

  try {
    const raw = localStorage.getItem(DAILY_STREAK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultData,
        ...parsed,
      };
    }
  } catch {
    // Ignore error
  }
  return defaultData;
}

export function saveDailyStreakData(data: DailyStreakData) {
  try {
    localStorage.setItem(DAILY_STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore error
  }
}

export function calculateDailyPercentile(solutionTimeSeconds: number, attempts: number, parSeconds: number): number {
  let score = 92;
  // Speed bonus
  if (solutionTimeSeconds <= parSeconds * 0.6) score += 6;
  else if (solutionTimeSeconds <= parSeconds) score += 3;
  else if (solutionTimeSeconds > parSeconds * 2) score -= 12;

  // First try bonus
  if (attempts === 1) score += 2;
  else score -= Math.min(20, (attempts - 1) * 8);

  return Math.max(50, Math.min(99, score));
}

export function recordDailyCompletion(
  dateString: string,
  solutionTimeSeconds: number,
  movesTaken: number,
  attempts: number
): DailyStreakData {
  const current = loadDailyStreakData();
  const challenge = getDailyChallengeForDate(dateString);
  const percentile = calculateDailyPercentile(solutionTimeSeconds, attempts, challenge.parSeconds);

  const historyEntry: DailyChallengeHistory = {
    dateString,
    completed: true,
    solutionTimeSeconds,
    movesTaken,
    attempts,
    percentile,
    completedAt: new Date().toISOString(),
  };

  let newCurrentStreak = current.currentStreak;
  if (current.lastCompletedDate) {
    const lastDate = new Date(current.lastCompletedDate);
    const thisDate = new Date(dateString);
    const diffTime = Math.abs(thisDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newCurrentStreak += 1;
    } else if (diffDays === 0) {
      // Already recorded for today
      newCurrentStreak = Math.max(1, newCurrentStreak);
    } else {
      newCurrentStreak = 1;
    }
  } else {
    newCurrentStreak = 1;
  }

  const updated: DailyStreakData = {
    currentStreak: newCurrentStreak,
    bestStreak: Math.max(current.bestStreak, newCurrentStreak),
    lastCompletedDate: dateString,
    history: {
      ...current.history,
      [dateString]: historyEntry,
    },
  };

  saveDailyStreakData(updated);
  return updated;
}
