import { DifficultyStage, DifficultyStageId, PlayerProgression, AiProfile, AltitudeZoneId } from '../types';
import { loadWinStreakState } from '../utils/streak';

export const AI_PROFILES: Record<DifficultyStageId, AiProfile> = {
  matenase: {
    id: 'matenase',
    displayName: 'Matenase',
    timeBudgetMs: 80,
    maxDepth: 1,
    quiescenceDepth: 0,
    tacticalExtensionLimit: 0,
    transpositionTableSize: 1000,
    openingBookEnabled: false,
    endgameSolverEnabled: false,
    doubleThreatAwareness: 0.0,
    defensiveAwareness: 0.05,
    positionalAwareness: 0.05,
    candidateMoveWindow: 14,
    imperfectionRate: 0.80,
    maximumAllowedCentipawnLoss: 1500,
    personality: 'Gentle novice shepherd who places cattle casually, leaves open lines for you to form mills, and celebrates your victories.',
    turnTimeLimitSeconds: 60,
  },
  bothata: {
    id: 'bothata',
    displayName: 'Thaba Boys',
    timeBudgetMs: 200,
    maxDepth: 1,
    quiescenceDepth: 1,
    tacticalExtensionLimit: 0,
    transpositionTableSize: 5000,
    openingBookEnabled: false,
    endgameSolverEnabled: false,
    doubleThreatAwareness: 0.45,
    defensiveAwareness: 0.50,
    positionalAwareness: 0.45,
    candidateMoveWindow: 4,
    imperfectionRate: 0.35,
    maximumAllowedCentipawnLoss: 280,
    personality: 'Enthusiastic village tacticians who enjoy attacking but leave accessible tactical openings.',
    turnTimeLimitSeconds: 50,
  },
  litshepe: {
    id: 'litshepe',
    displayName: 'Leribe',
    timeBudgetMs: 450,
    maxDepth: 2,
    quiescenceDepth: 1,
    tacticalExtensionLimit: 1,
    transpositionTableSize: 15000,
    openingBookEnabled: true,
    endgameSolverEnabled: false,
    doubleThreatAwareness: 0.70,
    defensiveAwareness: 0.75,
    positionalAwareness: 0.70,
    candidateMoveWindow: 3,
    imperfectionRate: 0.18,
    maximumAllowedCentipawnLoss: 120,
    personality: 'Disciplined highland tactician with a balanced offense and fair openings.',
    turnTimeLimitSeconds: 40,
  },
  sefako: {
    id: 'sefako',
    displayName: 'Sefako',
    timeBudgetMs: 800,
    maxDepth: 3,
    quiescenceDepth: 2,
    tacticalExtensionLimit: 2,
    transpositionTableSize: 35000,
    openingBookEnabled: true,
    endgameSolverEnabled: true,
    doubleThreatAwareness: 0.88,
    defensiveAwareness: 0.90,
    positionalAwareness: 0.85,
    candidateMoveWindow: 2,
    imperfectionRate: 0.08,
    maximumAllowedCentipawnLoss: 50,
    personality: 'Formidable alpine master who tests deep strategy, but can be outmaneuvered with creative traps.',
    turnTimeLimitSeconds: 35,
  },
  morena: {
    id: 'morena',
    displayName: 'Morena Letsie',
    timeBudgetMs: 1400,
    maxDepth: 4,
    quiescenceDepth: 3,
    tacticalExtensionLimit: 3,
    transpositionTableSize: 60000,
    openingBookEnabled: true,
    endgameSolverEnabled: true,
    doubleThreatAwareness: 0.98,
    defensiveAwareness: 0.98,
    positionalAwareness: 0.96,
    candidateMoveWindow: 1,
    imperfectionRate: 0.0,
    maximumAllowedCentipawnLoss: 0,
    personality: 'The Sovereign Master: Near-optimal Morabaraba intelligence without cheating or handicaps.',
    turnTimeLimitSeconds: 30,
  },
};

export const DIFFICULTY_STAGES: Record<DifficultyStageId, DifficultyStage> = {
  matenase: {
    id: 'matenase',
    stageNumber: 1,
    tierLabel: 'Tier 1 — Beginner',
    name: 'Matenase',
    opponentName: 'Matenase',
    difficultyLabel: '★☆☆☆☆',
    difficultyStars: 1,
    mapName: 'Mokena',
    mapSubtitle: 'Mokena Terraced Foothills · Golden Dawn',
    mapDescription: 'Warm golden daylight across the lowland terraces. A friendly beginner shepherd who is learning traditional kraal placements.',
    aiPlaystyle: 'Beginner-friendly novice. Plays relaxed placements, rarely blocks your developing mills, and leaves open spaces for you to practice capturing.',
    characterBio: 'A cheerful, encouraging apprentice from the lowlands who loves the game. He plays casually, helps you learn the board, and marvels at your first mills.',
    themeColor: '#D9A855',
    stoneAccent: 'rgba(227, 179, 103, 0.3)',
    atmosphere: 'golden-dawn',
    boardStyle: 'mokena-sandstone',
    aiTitle: 'Lowland Apprentice',
    aiQuote: '“Ea pele ke ea pele — let us place our cattle in peace upon the warm sandstone.”',
    depth: 1,
    blunderRate: 0.80,
    millBlockChance: 0.10,
    centerPriority: 0.05,
    profile: AI_PROFILES.matenase,
    dialogues: {
      start: [
        '“Dumela motsoalle! Let us see how you herd your 12 cattle today.”',
        '“Take your time. The sandstone of Mokena is patient with learners.”',
      ],
      onPlayerFirstMill: [
        '“Helele! Your first mill (mohope)! You aligned three cattle cleanly!”',
        '“A fine mill! Now choose one of my cattle to take to your kraal.”',
      ],
      onAiMill: [
        '“Look, I found three in a line! Watch your open flanks.”',
        '“A gentle mill for Mokena. The game is warming up!”',
      ],
      onPlayerCapture: [
        '“Ah, you took a fine cow! I must watch my spacing.”',
        '“Good eye! My defense was wide open there.”',
      ],
      onAiCapture: [
        '“I claim one cow for my kraal. Do not worry, you have many more!”',
        '“A capture! Remember to protect your corners next time.”',
      ],
      onTrappedOpening: [
        '“Look! You are trapped, so by Sotho tradition I must open a way for you!”',
      ],
      onAiWin: [
        '“A good match! You are learning fast. Shall we play another round on the rock?”',
      ],
      onPlayerWin: [
        '“Ke a leboha! You outplayed me with honor! Thaba Boys at Khubetsoana await your challenge next.”',
      ],
    },
  },
  bothata: {
    id: 'bothata',
    stageNumber: 2,
    tierLabel: 'Tier 2 — Bothata',
    name: 'Bothata',
    opponentName: 'Thaba Boys',
    difficultyLabel: '★★☆☆☆',
    difficultyStars: 2,
    mapName: 'Khubetsoana',
    mapSubtitle: 'Khubetsoana Red Earth Kraals · Late Afternoon',
    mapDescription: 'Warm ochre soil, red sandstone ridges, and late afternoon shadows. Seasoned village tacticians who punish careless mistakes.',
    aiPlaystyle: 'Intermediate. Understands attack + defence, recognizes basic traps, stops obvious double threats. Casual players start losing here.',
    characterBio: 'Competitive village kraal masters who know standard openings and counter-attacks. They will shut down naive 3-in-a-row lines and aggressively hunt isolated tokens.',
    themeColor: '#E06D38',
    stoneAccent: 'rgba(224, 109, 56, 0.3)',
    atmosphere: 'khubetsoana-red',
    boardStyle: 'khubetsoana-red',
    aiTitle: 'Red Ridge Kraal Masters',
    aiQuote: '“Bothata ha bo na lehloyo — no free cattle in Khubetsoana.”',
    depth: 1,
    blunderRate: 0.35,
    millBlockChance: 0.50,
    centerPriority: 0.45,
    profile: AI_PROFILES.bothata,
    dialogues: {
      start: [
        '“The afternoon is hot in Khubetsoana. Thaba Boys do not give away cattle.”',
        '“Let us see if your strategy holds under red dust pressure.”',
      ],
      onPlayerFirstMill: [
        '“Mm, a clean mill. But can you hold it against our counter-attack?”',
        '“Good strike. Now the real match begins.”',
      ],
      onAiMill: [
        '“Khomo e tšoeroe! Three in line. Your kraal is shrinking.”',
        '“You left that line unguarded. Khubetsoana strikes!”',
      ],
      onPlayerCapture: [
        '“You took a valuable piece. We will return the favor shortly.”',
        '“Sharp eye. But our remaining cattle have teeth.”',
      ],
      onAiCapture: [
        '“One less cow for you. Mind your diagonals!”',
        '“That piece was isolated. Into our kraal it goes.”',
      ],
      onTrappedOpening: [
        '“You have no moves left. Sotho law compels us to maneuver and open your path.”',
      ],
      onAiWin: [
        '“Victory for Thaba Boys! You fought well, but the red ridges require sharper eyes.”',
      ],
      onPlayerWin: [
        '“U matla! You broke through our lines cleanly. Leribe will test your iron now.”',
      ],
    },
  },
  litshepe: {
    id: 'litshepe',
    stageNumber: 3,
    tierLabel: 'Tier 3 — Litšepe',
    name: 'Litšepe',
    opponentName: 'Leribe',
    difficultyLabel: '★★★☆☆',
    difficultyStars: 3,
    mapName: 'Leribe',
    mapSubtitle: 'Leribe High Plateaus · Stone & Mountain Mist',
    mapDescription: 'Cold green hills, stone plateaus, and rolling mountain mist. Club-level mastery engineered with diagonal locks and tactical forks.',
    aiPlaystyle: 'Strong club-level intelligence. Plans several moves ahead, creates double threats, understands board control and sacrifices.',
    characterBio: 'An austere, disciplined highland tactician. Anticipates moves multiple turns ahead, controls the center ring d4, and constructs double-mill traps.',
    themeColor: '#5EA38A',
    stoneAccent: 'rgba(94, 163, 138, 0.3)',
    atmosphere: 'highland-mist',
    boardStyle: 'leribe-slate',
    aiTitle: 'Leribe Iron Tactician',
    aiQuote: '“Tšepe e lila tšepe — iron sharpens iron in the high mountain mist.”',
    depth: 2,
    blunderRate: 0.18,
    millBlockChance: 0.75,
    centerPriority: 0.70,
    profile: AI_PROFILES.litshepe,
    dialogues: {
      start: [
        '“The mountain mist hides nothing on this stone. Play with discipline.”',
        '“In Leribe, careless cattle do not survive the winter.”',
      ],
      onPlayerFirstMill: [
        '“A solid mill. But true mastery is what you build after the first strike.”',
        '“Measured placement. Let us see how you handle a double front.”',
      ],
      onAiMill: [
        '“The iron gate closes. Three cattle aligned with mathematical purpose.”',
        '“You fell into the plateau fork. My mill is secured.”',
      ],
      onPlayerCapture: [
        '“A calculated loss on my part. The board shape remains mine.”',
        '“Decisive. But my counter-stroke is already in motion.”',
      ],
      onAiCapture: [
        '“Your defense broke along the diagonal. A necessary capture.”',
        '“One cow removed. Your mobility shrinks by the turn.”',
      ],
      onTrappedOpening: [
        '“Authoritative Sotho 25 rule triggered. I shall maneuver to release your lock.”',
      ],
      onAiWin: [
        '“The iron defense held firm. Return when your strategic foresight is sharper.”',
      ],
      onPlayerWin: [
        '“Remarkable resilience. You possess the iron spirit of Leribe. Mokhotlong awaits.”',
      ],
    },
  },
  sefako: {
    id: 'sefako',
    stageNumber: 4,
    tierLabel: 'Tier 4 — Sefako',
    name: 'Sefako',
    opponentName: 'Sefako',
    difficultyLabel: '★★★★☆',
    difficultyStars: 4,
    mapName: 'Mokhotlong',
    mapSubtitle: 'Mokhotlong Alpine Peak · Hailstorm Pass',
    mapDescription: 'The highest, coldest mountain district in southern Africa. Howling alpine winds, dark slate rock, and relentless tactical pressure.',
    aiPlaystyle: 'Expert. Deep search, trap construction, mill cycling, positional play and endgame optimization. Strong players should struggle.',
    characterBio: 'A legendary alpine master as relentless as a high-altitude hailstorm. Calculates deep lookaheads, executes mill cycling, seizes center nodes instantly, and suffocates piece mobility.',
    themeColor: '#8C6CFA',
    stoneAccent: 'rgba(140, 108, 250, 0.35)',
    atmosphere: 'mokhotlong-storm',
    boardStyle: 'mokhotlong-alpine',
    aiTitle: 'Mokhotlong Hailstorm Grandmaster',
    aiQuote: '“Sefako ha se khethe moriti — the mountain storm strikes without hesitation.”',
    depth: 3,
    blunderRate: 0.08,
    millBlockChance: 0.90,
    centerPriority: 0.85,
    profile: AI_PROFILES.sefako,
    dialogues: {
      start: [
        '“Few reach Mokhotlong. The frost does not forgive a single slip on the slate.”',
        '“Face the mountain gale. Every cow you place will be tested.”',
      ],
      onPlayerFirstMill: [
        '“You formed a mill against Sefako? Impressive... now survive the tempest.”',
        '“A sharp strike in the cold. Do not celebrate prematurely.”',
      ],
      onAiMill: [
        '“Sefako strikes! The hailstorm claims three in unison.”',
        '“Inescapable. Your lines are frozen.”',
      ],
      onPlayerCapture: [
        '“You took a piece, but the high ground remains in my grasp.”',
        '“A fierce counter. You have true mountain grit.”',
      ],
      onAiCapture: [
        '“Another cow swept away in the blizzard. Your kraal is crumbling.”',
        '“Positional collapse. The cold is relentless.”',
      ],
      onTrappedOpening: [
        '“You are pinned against the rock face. Sotho law grants you an opening.”',
      ],
      onAiWin: [
        '“The hailstorm claims all who wander unprepared into Mokhotlong. Train harder.”',
      ],
      onPlayerWin: [
        '“Unbelievable! You conquered the storm of Mokhotlong! The sacred path to Tsoenene is now unsealed for you...”',
      ],
    },
  },
  morena: {
    id: 'morena',
    stageNumber: 5,
    tierLabel: 'Tier 5 — Morena',
    name: 'Morena',
    opponentName: 'Morena Letsie',
    difficultyLabel: '★★★★★',
    difficultyStars: 5,
    mapName: 'Tsoenene',
    mapSubtitle: 'Tsoenene Ancient Midnight Summit · Campfire of the King',
    mapDescription: 'Ancient dark stone. Cold mountain atmosphere. Almost-black surroundings. Firelight. Obsidian and ivory cattle. Plays as close to optimal Morabaraba as technically achievable.',
    aiPlaystyle: 'Near-impossible. The benchmark of Morabaraba mastery. Deep alpha-beta lookahead, mill cycling, trap construction, anti-trap calculation, zero intentional mistakes, and ruthless endgame precision.',
    characterBio: 'The Sovereign Master of Morabaraba at Tsoenene. He does not cheat, receive extra cows, or rely on artificial advantages—he dominates solely through profound tactical foresight and optimal play.',
    themeColor: '#F5C242',
    stoneAccent: 'rgba(245, 194, 66, 0.45)',
    atmosphere: 'tsoenene',
    boardStyle: 'tsoenene-darkstone',
    aiTitle: 'The Sovereign of Tsoenene',
    aiQuote: '“12 Cows. No advantage. No mercy.”',
    isCinematicBoss: true,
    requiresStageUnlock: 'sefako',
    depth: 4,
    blunderRate: 0.0,
    millBlockChance: 0.98,
    centerPriority: 0.96,
    profile: AI_PROFILES.morena,
    reward: {
      id: 'royal-set',
      title: 'Royal Basotho Cattle & Bohloale Prestige',
      badge: '“I beat Morena Letsie”',
      description: 'Crown tokens cast in King Moshoeshoe Gold & Black Basalt Inlay, plus the legendary “I beat Morena Letsie” permanent prestige achievement.',
      icon: 'Crown',
    },
    dialogues: {
      start: [
        '“MORENA LETSIE · TSOENENE · 12 Cows. No advantage. No mercy.”',
        '“You conquered Sefako to sit at this stone. Show me if your mind can withstand pure calculation.”',
      ],
      onPlayerFirstMill: [
        '“A clean alignment. But an open mill is only as strong as what lies beneath it.”',
        '“You strike well. Now face the mathematical response.”',
      ],
      onAiMill: [
        '“The kraal snaps shut. Three cattle in unbreakable harmony.”',
        '“Calculation complete. The line is sealed.”',
      ],
      onPlayerCapture: [
        '“A piece claimed. But every stone on this board serves a deeper geometry.”',
        '“A bold strike. Your foresight is sharp.”',
      ],
      onAiCapture: [
        '“A necessary capture. Your board freedom contracts.”',
        '“Your defense broke along the inner ring. Into the royal kraal it goes.”',
      ],
      onTrappedOpening: [
        '“By authoritative Sotho tradition, even in the harshest duel, no warrior is denied a legal step.”',
      ],
      onAiWin: [
        '“Khotso. Tsoenene remains unvanquished. Return when your mind has reached the absolute limits of foresight.”',
      ],
      onPlayerWin: [
        '“YOU HAVE DEFEATED MORENA LETSIE AT TSOENENE! You have achieved the highest honor in Morabaraba history! The Royal Set and the legendary Prestige Badge are forever yours!”',
      ],
    },
  },
};

export const STAGES_LIST: DifficultyStage[] = Object.values(DIFFICULTY_STAGES).sort(
  (a, b) => a.stageNumber - b.stageNumber
);

export const PROGRESSION_STORAGE_KEY = 'morabaraba_sotho25_progression_v3';

export function loadPlayerProgression(): PlayerProgression {
  const defaultStreak = loadWinStreakState();
  try {
    const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const completed: DifficultyStageId[] = Array.isArray(parsed.completedStages) ? parsed.completedStages : [];
      
      // Calculate unlocked altitude zones based on progression and streak
      const unlockedZones: AltitudeZoneId[] = ['maseru'];
      if (completed.includes('bothata') || defaultStreak.currentStreak >= 2) {
        unlockedZones.push('semonkong');
      }
      if (completed.includes('litshepe') || defaultStreak.currentStreak >= 4) {
        unlockedZones.push('mokhotlong');
      }
      if (completed.includes('morena') || completed.length >= 4) {
        unlockedZones.push('thaba-bosiu');
      }

      return {
        completedStages: completed,
        royalCattleUnlocked: !!parsed.royalCattleUnlocked,
        firestoneBoardUnlocked: !!parsed.firestoneBoardUnlocked,
        bohloaleCrownUnlocked: !!parsed.bohloaleCrownUnlocked,
        beatMorenaAchievementUnlocked: !!parsed.beatMorenaAchievementUnlocked,
        selectedTokenSkin: parsed.selectedTokenSkin || 'standard',
        selectedCattleSet: parsed.selectedCattleSet || 'heritage',
        selectedBoardSkin: parsed.selectedBoardSkin || 'adaptive',
        unlockedZones: parsed.unlockedZones || unlockedZones,
        selectedZoneId: parsed.selectedZoneId || 'maseru',
        winStreak: defaultStreak,
      };
    }
  } catch {
    // Ignore error
  }
  return {
    completedStages: [],
    royalCattleUnlocked: false,
    firestoneBoardUnlocked: false,
    bohloaleCrownUnlocked: false,
    beatMorenaAchievementUnlocked: false,
    selectedTokenSkin: 'standard',
    selectedCattleSet: 'heritage',
    selectedBoardSkin: 'adaptive',
    unlockedZones: ['maseru'],
    selectedZoneId: 'maseru',
    winStreak: defaultStreak,
  };
}

export function savePlayerProgression(data: PlayerProgression) {
  try {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore error
  }
}
