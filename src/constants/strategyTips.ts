import { DifficultyStageId, StrategyTip, StrategyTipDifficulty } from '../types';

export const STRATEGY_TIPS_POOL: StrategyTip[] = [
  // General / Opening Strategy
  {
    id: 'tip-opening-center',
    difficulty: 'ALL',
    text: 'Control the centre (d4) early in placement to dominate cross-ring mobility and limit forced openings.',
    contextTags: ['opening', 'centre', 'strategy'],
  },
  {
    id: 'tip-mill-timing',
    difficulty: 'ALL',
    text: 'A mill is strongest when it creates a second threat immediately after the capture.',
    contextTags: ['mills', 'tempo', 'strategy'],
  },
  {
    id: 'tip-running-mill',
    difficulty: 'ALL',
    text: 'A running mill alternates open and closed states, securing a capture every two turns.',
    contextTags: ['mills', 'tactics', 'endgame'],
  },
  {
    id: 'tip-diagonal-dominance',
    difficulty: 'ALL',
    text: 'Corners that anchor two diagonal lines offer superior defensive pivot points during movement.',
    contextTags: ['defence', 'geometry', 'strategy'],
  },
  {
    id: 'tip-forced-opening-rule',
    difficulty: 'ALL',
    text: 'Under Sotho 25 rules, trapping all opponent cattle forces the trapper to open a pathway.',
    contextTags: ['rules', 'defence', 'sotho25'],
  },
  {
    id: 'tip-endgame-containment',
    difficulty: 'ALL',
    text: 'In the endgame, cows can only move to adjacent nodes; coordinate piece pairs to restrict opponent paths.',
    contextTags: ['endgame', 'mobility', 'tactics'],
  },
  {
    id: 'tip-double-threat-pressure',
    difficulty: 'ALL',
    text: 'Set up fork positions where two separate mills can be closed on your next turn.',
    contextTags: ['tactics', 'attack', 'mills'],
  },

  // Litšepe Specific (Stage 3 - Highland Tactician)
  {
    id: 'tip-litsepe-defence',
    difficulty: 'LITSEPE',
    text: 'Litšepe punishes early blunders; establish solid three-node formations before attacking.',
    contextTags: ['defence', 'tactics', 'litsepe'],
  },
  {
    id: 'tip-litsepe-mobility',
    difficulty: 'LITSEPE',
    text: 'Highland players use inner-ring transitions to out-maneuver rigid outer ring defences.',
    contextTags: ['mobility', 'rings', 'litsepe'],
  },

  // Sefako Specific (Stage 4 - Alpine Grandmaster)
  {
    id: 'tip-sefako-traps',
    difficulty: 'SEFAKO',
    text: 'Sefako calculates seesaw mill cycles three moves ahead; contest the midpoint nodes (d2, d6, b4, f4).',
    contextTags: ['endgame', 'tactics', 'sefako'],
  },
  {
    id: 'tip-sefako-captures',
    difficulty: 'SEFAKO',
    text: 'Against Sefako, prioritize capturing opponent pivot tokens rather than isolated edge cattle.',
    contextTags: ['captures', 'tactics', 'sefako'],
  },

  // Morena Letsie Specific (Stage 5 - Sovereign Master)
  {
    id: 'tip-morena-patience',
    difficulty: 'MORENA_LETSIE',
    text: 'Morena Letsie never rushes; hold your nerve and never leave two connected nodes unguarded.',
    contextTags: ['mastery', 'patience', 'morena'],
  },
  {
    id: 'tip-morena-endgame',
    difficulty: 'MORENA_LETSIE',
    text: 'Victory at Tsoenene requires sealing adjacent escape lines before Morena sets up a cyclical mill.',
    contextTags: ['endgame', 'tactics', 'morena'],
  },

  // Basotho Cultural & Historical Wisdom
  {
    id: 'tip-cultural-cattle-wealth',
    difficulty: 'ALL',
    text: 'In Basotho tradition, cattle represent wealth and strategy—patience often wins more than force.',
    contextTags: ['history', 'culture', 'pastoral'],
  },
  {
    id: 'tip-cultural-pastoral-roots',
    difficulty: 'ALL',
    text: 'Morabaraba reflects pastoral life, where movement and protection of cattle shape survival.',
    contextTags: ['history', 'culture', 'pastoral'],
  },
  {
    id: 'tip-cultural-thaba-bosiu',
    difficulty: 'ALL',
    text: 'King Moshoeshoe I defended Thaba-Bosiu through superior positioning and high-ground vantage.',
    contextTags: ['history', 'thaba-bosiu', 'culture'],
  },
  {
    id: 'tip-cultural-herdboys',
    difficulty: 'ALL',
    text: 'Basotho herd boys historically played Morabaraba carved directly into sandstone mountain slabs.',
    contextTags: ['history', 'tradition', 'culture'],
  },
  {
    id: 'tip-cultural-maloti-wisdom',
    difficulty: 'ALL',
    text: 'High in the Maloti mountains, calm foresight outlasts even the fiercest winter storm.',
    contextTags: ['culture', 'maloti', 'wisdom'],
  },
  {
    id: 'tip-cultural-blanket-courage',
    difficulty: 'ALL',
    text: 'Basotho heritage weaves courage and tactical composure into every mountain contest.',
    contextTags: ['culture', 'heritage', 'wisdom'],
  },
];

// Context-aware stage to difficulty mapping
export function mapStageToTipDifficulty(stageId: DifficultyStageId): StrategyTipDifficulty {
  switch (stageId) {
    case 'litshepe':
      return 'LITSEPE';
    case 'sefako':
      return 'SEFAKO';
    case 'morena':
      return 'MORENA_LETSIE';
    case 'bothata':
      return 'BOTHATA';
    case 'matenase':
    default:
      return 'MATENASE';
  }
}

let lastServedTipId: string | null = null;

export function getRandomStrategyTip(stageId: DifficultyStageId): StrategyTip {
  const tipDifficulty = mapStageToTipDifficulty(stageId);
  
  // Filter eligible tips: matching difficulty or 'ALL'
  const eligible = STRATEGY_TIPS_POOL.filter(
    (tip) => tip.difficulty === tipDifficulty || tip.difficulty === 'ALL'
  );

  // Exclude last served tip to avoid consecutive repetition
  const candidates = eligible.filter((tip) => tip.id !== lastServedTipId);
  const pool = candidates.length > 0 ? candidates : eligible;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  lastServedTipId = chosen.id;
  return chosen;
}
