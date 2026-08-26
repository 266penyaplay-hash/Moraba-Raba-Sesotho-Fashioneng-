import { GamePhase, PlayerId } from '../types';

export type PuzzleCategory =
  | 'find-mill'
  | 'stop-mill'
  | 'double-threat'
  | 'escape'
  | 'sacrifice'
  | 'endgame'
  | 'forced-win'
  | 'master-puzzle';

export interface PuzzleDefinition {
  id: string;
  title: string;
  category: PuzzleCategory;
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  stars: number;
  location: string;
  prompt: string;
  tacticalConcept: string;
  hint: string;
  explanation: string;
  phase: GamePhase;
  turn: PlayerId;
  obsidianHand: number;
  ivoryHand: number;
  initialBoard: Record<string, PlayerId | null>;
  solution: {
    from?: string; // If movement phase
    to: string; // Placement or target point
    capturePointId?: string; // Point to shoot
  };
}

export const PUZZLE_CATEGORIES: { id: PuzzleCategory; label: string; description: string; icon: string }[] = [
  {
    id: 'find-mill',
    label: 'Find the Mill',
    description: 'Spot decisive alignment patterns and claim your cattle.',
    icon: 'Zap',
  },
  {
    id: 'stop-mill',
    label: 'Stop the Mill',
    description: 'Intercept dangerous enemy 2-in-a-row threats before they strike.',
    icon: 'Shield',
  },
  {
    id: 'double-threat',
    label: 'Double Threat',
    description: 'Create unblockable forks targeting multiple mill lines at once.',
    icon: 'Target',
  },
  {
    id: 'escape',
    label: 'Escape',
    description: 'Slip out of suffocating enemy encirclements and open legal paths.',
    icon: 'Compass',
  },
  {
    id: 'sacrifice',
    label: 'Sacrifice',
    description: 'Give up a cow to unlock an unstoppable 2-turn mill cycle.',
    icon: 'Flame',
  },
  {
    id: 'endgame',
    label: 'Endgame Flying',
    description: 'Master the 3-cattle jumping phase with surgical precision.',
    icon: 'Award',
  },
  {
    id: 'forced-win',
    label: 'Forced Win',
    description: 'Convert positional strangleholds into unavoidable victory.',
    icon: 'Trophy',
  },
  {
    id: 'master-puzzle',
    label: 'Master Puzzle',
    description: 'Profound multi-ply tactical problems from Morena Letsie’s archives.',
    icon: 'Crown',
  },
];

export const PUZZLES_LIBRARY: PuzzleDefinition[] = [
  // 1. Find the Mill
  {
    id: 'puz_01_find_mill',
    title: 'The Lowland Strike',
    category: 'find-mill',
    categoryLabel: 'Find the Mill',
    difficulty: 'Beginner',
    stars: 1,
    location: 'Mokena Foothills',
    prompt: 'Obsidian to place. Spot the point that completes a 3-cow mill and capture the vulnerable Ivory defender.',
    tacticalConcept: 'Direct mill completion & highest-value capture',
    hint: 'Look along the horizontal outer ring at the top of the board.',
    explanation: 'Placing at d1 connects a1 and g1 into a full horizontal mill. Capturing ivory’s d4 removes their central control.',
    phase: 'placing',
    turn: 'obsidian',
    obsidianHand: 2,
    ivoryHand: 2,
    initialBoard: {
      a1: 'obsidian',
      g1: 'obsidian',
      d1: null,
      d4: 'ivory',
      b2: 'ivory',
      f2: 'ivory',
    },
    solution: {
      to: 'd1',
      capturePointId: 'd4',
    },
  },
  // 2. Stop the Mill
  {
    id: 'puz_02_stop_mill',
    title: 'Khubetsoana Gatekeeper',
    category: 'stop-mill',
    categoryLabel: 'Stop the Mill',
    difficulty: 'Intermediate',
    stars: 2,
    location: 'Khubetsoana Ridge',
    prompt: 'Ivory has placed cattle on b2 and f2. Block their devastating middle-ring mill.',
    tacticalConcept: 'Preemptive threat interception',
    hint: 'Identify the node that sits directly between b2 and f2.',
    explanation: 'Placing at d2 immediately occupies the key node between b2 and f2, preventing Ivory from capturing your herd next turn.',
    phase: 'placing',
    turn: 'obsidian',
    obsidianHand: 4,
    ivoryHand: 4,
    initialBoard: {
      b2: 'ivory',
      f2: 'ivory',
      d2: null,
      a7: 'obsidian',
      d7: 'obsidian',
    },
    solution: {
      to: 'd2',
    },
  },
  // 3. Double Threat
  {
    id: 'puz_03_double_threat',
    title: 'Leribe Cross Fork',
    category: 'double-threat',
    categoryLabel: 'Double Threat',
    difficulty: 'Advanced',
    stars: 3,
    location: 'Leribe Plateau',
    prompt: 'Obsidian to place. Find the nexus node that threatens two separate mills simultaneously.',
    tacticalConcept: 'Unblockable dual-axis fork',
    hint: 'The central hub d4 connects orthogonal lines in all four directions.',
    explanation: 'By playing at d4, Obsidian threatens both the horizontal line (c4-d4-e4) and vertical line (d3-d4-d5). Ivory cannot block both simultaneously!',
    phase: 'placing',
    turn: 'obsidian',
    obsidianHand: 3,
    ivoryHand: 3,
    initialBoard: {
      c4: 'obsidian',
      e4: null,
      d3: 'obsidian',
      d5: null,
      d4: null,
      a1: 'ivory',
      g7: 'ivory',
    },
    solution: {
      to: 'd4',
    },
  },
  // 4. Escape
  {
    id: 'puz_04_escape',
    title: 'Mokhotlong Alpine Breakout',
    category: 'escape',
    categoryLabel: 'Escape',
    difficulty: 'Advanced',
    stars: 4,
    location: 'Mokhotlong Peak',
    prompt: 'Obsidian moving phase. Break free from Sefako’s suffocating flank trap by maneuvering into open ground.',
    tacticalConcept: 'Mobility preservation and escaping blockade',
    hint: 'Move your trapped piece from b4 toward the open corner or inner connector.',
    explanation: 'Stepping from b4 to b2 breaks the wall and immediately opens up diagonal mobility toward f2 and d2.',
    phase: 'moving',
    turn: 'obsidian',
    obsidianHand: 0,
    ivoryHand: 0,
    initialBoard: {
      b4: 'obsidian',
      a4: 'ivory',
      c4: 'ivory',
      b6: 'ivory',
      b2: null,
      d2: null,
      d4: 'obsidian',
      d5: 'obsidian',
    },
    solution: {
      from: 'b4',
      to: 'b2',
    },
  },
  // 5. Sacrifice
  {
    id: 'puz_05_sacrifice',
    title: 'The Shepherd’s Gambit',
    category: 'sacrifice',
    categoryLabel: 'Sacrifice',
    difficulty: 'Expert',
    stars: 4,
    location: 'Thaba-Tseka Heights',
    prompt: 'Obsidian movement phase. Step out of the mill line at c3 to e3 to set up an unstoppable seesaw mill cycle.',
    tacticalConcept: 'Disassembling a mill to trigger continuous cycles',
    hint: 'Move c3 to open the running mill mechanism.',
    explanation: 'Moving c3 to c4 opens the c3-c4-c5 mill while preparing to step back into the diagonal next turn.',
    phase: 'moving',
    turn: 'obsidian',
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
    },
    solution: {
      from: 'c3',
      to: 'c4',
      capturePointId: 'd7',
    },
  },
  // 6. Endgame Flying
  {
    id: 'puz_06_endgame',
    title: 'The Flying Leopard',
    category: 'endgame',
    categoryLabel: 'Endgame Flying',
    difficulty: 'Expert',
    stars: 4,
    location: 'Quthing Canyon',
    prompt: 'Obsidian has 3 cattle remaining (Flying Phase). Fly anywhere on the board to form a decisive mill and reduce Ivory to 2 cattle.',
    tacticalConcept: 'Global teleportation attack in 3-cow phase',
    hint: 'Look for two aligned Obsidian cows that only need one more partner anywhere on the board.',
    explanation: 'Obsidian flies a piece from a1 straight into g4, completing the e4-f4-g4 mill and instantly capturing Ivory’s third cow for an absolute victory!',
    phase: 'moving',
    turn: 'obsidian',
    obsidianHand: 0,
    ivoryHand: 0,
    initialBoard: {
      a1: 'obsidian',
      e4: 'obsidian',
      f4: 'obsidian',
      g4: null,
      d1: 'ivory',
      d7: 'ivory',
      g7: 'ivory',
    },
    solution: {
      from: 'a1',
      to: 'g4',
      capturePointId: 'd1',
    },
  },
  // 7. Forced Win
  {
    id: 'puz_07_forced_win',
    title: 'The King’s Clamp',
    category: 'forced-win',
    categoryLabel: 'Forced Win',
    difficulty: 'Master',
    stars: 5,
    location: 'Thaba-Bosiu Fortress',
    prompt: 'Obsidian moving phase. Execute the definitive clamp move that leaves Ivory with zero legal responses.',
    tacticalConcept: 'Zugzwang and complete mobility strangulation',
    hint: 'Move into d4 to seal all four escape corridors.',
    explanation: 'Stepping into d4 simultaneously seals all Ivory piece movements while preparing an inescapable mill on the next turn.',
    phase: 'moving',
    turn: 'obsidian',
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
  // 8. Master Puzzle
  {
    id: 'puz_08_morena_archive',
    title: 'Morena Letsie’s Midnight Geometry',
    category: 'master-puzzle',
    categoryLabel: 'Master Puzzle',
    difficulty: 'Master',
    stars: 5,
    location: 'Tsoenene Ancient Summit',
    prompt: 'The ultimate puzzle from Tsoenene. Find the profound placing maneuver that breaks Morena’s symmetric defense.',
    tacticalConcept: 'Symmetric deconstruction and dual-ring domination',
    hint: 'Place at e5 to connect the inner diamond and inner square.',
    explanation: 'Placing at e5 simultaneously arms the diagonal line (c3-d4-e5) and the inner right vertical (e3-e4-e5), creating a mathematically unresolvable double threat against optimal play.',
    phase: 'placing',
    turn: 'obsidian',
    obsidianHand: 1,
    ivoryHand: 1,
    initialBoard: {
      c3: 'obsidian',
      d4: 'obsidian',
      e3: 'obsidian',
      e4: 'obsidian',
      e5: null,
      a1: 'ivory',
      a7: 'ivory',
      g1: 'ivory',
      g7: 'ivory',
      d7: 'ivory',
    },
    solution: {
      to: 'e5',
      capturePointId: 'd7',
    },
  },
];

export const SOLVED_PUZZLES_STORAGE_KEY = 'morabaraba_solved_puzzles_v1';

export function loadSolvedPuzzles(): string[] {
  try {
    const raw = localStorage.getItem(SOLVED_PUZZLES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return [];
}

export function saveSolvedPuzzle(puzzleId: string): string[] {
  const current = loadSolvedPuzzles();
  if (!current.includes(puzzleId)) {
    const updated = [...current, puzzleId];
    try {
      localStorage.setItem(SOLVED_PUZZLES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore error
    }
    return updated;
  }
  return current;
}
