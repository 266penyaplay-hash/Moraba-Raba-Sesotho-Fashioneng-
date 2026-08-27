export type PlayerId = 'obsidian' | 'ivory';

export type GamePhase = 'placing' | 'moving' | 'shooting';

export type GameMode = 'pass-and-play' | 'ai' | 'online';

export interface BoardPoint {
  id: string; // e.g. "a1", "d1", "g1"
  ring: number; // 0 (outer), 1 (middle), 2 (inner), 3 (center)
  index: number;
  x: number; // 0-100 percentage for svg/canvas
  y: number; // 0-100 percentage
  adjacent: string[]; // adjacent point ids
  piece: PlayerId | null;
}

export interface MillDefinition {
  id: string;
  points: [string, string, string];
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  inHand: number; // starts at 12
  onBoard: number;
  captured: number;
  score: number;
  materialLabel: string;
}

export interface GameHistoryEntry {
  from?: string;
  to: string;
  player: PlayerId;
  type: 'place' | 'move' | 'shoot';
  millFormed?: boolean;
  doubleMill?: boolean;
  grandMeridian?: boolean;
  capturesEarned?: number;
  mills?: [string, string, string][];
}

export type RulesetType = 'sotho25' | 'standard';

export interface ForcedOpeningState {
  active: boolean;
  trappedPlayerId: PlayerId;
  openingPlayerId: PlayerId;
  forcedOpeningMoveCount: number;
  openingStartedAt: number;
  isStillTrapped: boolean;
}

export type DifficultyStageId = 'matenase' | 'bothata' | 'litshepe' | 'sefako' | 'morena';

export interface OpponentDialogues {
  start: string[];
  onPlayerFirstMill: string[];
  onAiMill: string[];
  onPlayerCapture: string[];
  onAiCapture: string[];
  onTrappedOpening: string[];
  onAiWin: string[];
  onPlayerWin: string[];
}

export type StrategyTipDifficulty = 'LITSEPE' | 'SEFAKO' | 'MORENA_LETSIE' | 'MATENASE' | 'BOTHATA' | 'ALL';

export interface StrategyTip {
  id: string;
  difficulty: StrategyTipDifficulty;
  text: string;
  contextTags: string[]; // e.g. ["opening", "defence", "mills", "history", "endgame", "pastoral"]
}

export type AltitudeZoneId = 'maseru' | 'semonkong' | 'mokhotlong' | 'thaba-bosiu';

export type WeatherState = 'heat-haze' | 'mountain-rain' | 'mist' | 'alpine-snow' | 'dusk-firelight' | 'golden-dawn';

export interface AmbienceZone {
  id: AltitudeZoneId;
  name: string;
  altitude: number; // in meters (e.g., 1600, 2200, 2700, 1804)
  tierLabel: string; // "Baseline", "Mid-Tier", "High-Tier", "Final Summit"
  subtitle: string;
  description: string;
  historicalSignificance?: string;
  unlockCondition: string;
  unlockRequirement: {
    requiredStage?: DifficultyStageId;
    minStreakThreshold?: number; // Streak acceleration (max 20-30% reduction)
  };
  weather: WeatherState[];
  previewGradient: string;
  accentColor: string;
  audio: {
    bed: string;   // licensed ambient bed layer
    mid: string;   // environmental signature layer (cattle bells, herd whistles, fire)
    night: string; // variant mix
  };
}

export type StreakTier = 'NONE' | 'HOT' | 'BLAZING' | 'LEGENDARY';

export interface WinStreakState {
  currentStreak: number;
  bestStreak: number;
  lastMatchResult: 'WIN' | 'LOSS' | 'DRAW' | null;
  streakTier: StreakTier;
  lastUpdatedAt: string;
}

export interface UnlockReward {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
}

export interface AiProfile {
  id: DifficultyStageId;
  displayName: string;
  timeBudgetMs: number;
  maxDepth: number;
  quiescenceDepth: number;
  tacticalExtensionLimit: number;
  transpositionTableSize: number;
  openingBookEnabled: boolean;
  endgameSolverEnabled: boolean;
  doubleThreatAwareness: number; // 0.0 to 1.0
  defensiveAwareness: number; // 0.0 to 1.0
  positionalAwareness: number; // 0.0 to 1.0
  candidateMoveWindow: number; // Max top candidates considered when applying blunder noise
  imperfectionRate: number; // 0.0 for Morena/Sefako, up to 0.40 for Matenase
  maximumAllowedCentipawnLoss: number;
  personality: string;
  turnTimeLimitSeconds: number; // e.g. 45s for Matenase, down to 15s for Morena
}

export interface EvaluationFeatures {
  materialDifference: number;
  millsDifference: number;
  openMillsDifference: number;
  doubleThreatDifference: number;
  unavoidableThreatDifference: number;
  mobilityDifference: number;
  blockedCattleDifference: number;
  centreControlDifference: number;
  connectedCattleDifference: number;
  capturableCattleDifference: number;
  vulnerableMillDifference: number;
  runningMillPotentialDifference: number;
  forcedOpeningPressure: number;
  tempo: number;
  repetitionRisk: number;
}

export interface AtomicMove {
  type: 'place' | 'move';
  from?: string;
  to: string;
  capturePointId?: string;
  secondCapturePointId?: string;
  score?: number;
  isDoubleThreat?: boolean;
  isMill?: boolean;
  isDoubleMill?: boolean;
  isOpeningMove?: boolean;
}

export interface DifficultyStage {
  id: DifficultyStageId;
  stageNumber: number; // 1 to 5
  tierLabel: string; // "Tier 1 — Beginner", "Tier 2 — Bothata", etc.
  name: string; // "Matenase", "Bothata", "Litšepe", "Sefako", "Morena"
  opponentName: string; // "Matenase", "Thaba Boys", "Leribe", "Sefako", "Morena Letsie"
  difficultyLabel: string; // "★☆☆☆☆", "★★☆☆☆", etc.
  difficultyStars: number; // 1 to 5
  mapName: string; // "Mokena", "Khubetsoana", "Leribe", "Mokhotlong", "Tsoenene"
  mapSubtitle: string;
  mapDescription: string;
  aiPlaystyle: string;
  characterBio: string;
  themeColor: string;
  stoneAccent: string;
  atmosphere: 'golden-dawn' | 'khubetsoana-red' | 'highland-mist' | 'mokhotlong-storm' | 'tsoenene';
  boardStyle: 'mokena-sandstone' | 'khubetsoana-red' | 'leribe-slate' | 'mokhotlong-alpine' | 'tsoenene-darkstone';
  aiTitle: string;
  aiQuote: string;
  dialogues: OpponentDialogues;
  depth: number;
  blunderRate: number; // 0.0 to 1.0
  millBlockChance: number; // 0.0 to 1.0
  centerPriority: number; // weight for controlling d4 / inner ring
  isCinematicBoss?: boolean;
  requiresStageUnlock?: DifficultyStageId; // Stage that must be cleared to challenge this
  reward?: UnlockReward;
  profile?: AiProfile;
}

export type CattleSetId =
  | 'classic'
  | 'heritage'
  | 'maloti'
  | 'mountain-kingdom'
  | 'royal-obsidian'
  | 'tsoenene'
  | 'champion';

export interface PlayerProgression {
  completedStages: DifficultyStageId[];
  royalCattleUnlocked: boolean;
  firestoneBoardUnlocked: boolean;
  bohloaleCrownUnlocked: boolean;
  beatMorenaAchievementUnlocked: boolean;
  selectedTokenSkin: 'standard' | 'royal-gold';
  selectedCattleSet: CattleSetId;
  selectedBoardSkin: 'adaptive' | 'firestone' | 'sandstone';
  unlockedZones: AltitudeZoneId[];
  selectedZoneId: AltitudeZoneId;
  winStreak: WinStreakState;
}

export interface DoubleMillAnimationState {
  active: boolean;
  player: PlayerId;
  centerPointId: string;
  mills: [string, string, string][];
  stage: 'drawing' | 'pulsing' | 'capturing';
  isGrandMeridian?: boolean;
  meridianAxis?: 'horizontal' | 'vertical' | 'diagonal' | null;
  meridianPoints?: string[];
}

export interface GameState {
  points: Record<string, BoardPoint>;
  turn: PlayerId;
  phase: GamePhase;
  ruleset: RulesetType;
  forcedOpening: ForcedOpeningState | null;
  pendingMillCount: number;
  capturesRemaining?: number;
  totalCapturesInSequence?: number;
  isDoubleMill?: boolean;
  doubleMillAnimation?: DoubleMillAnimationState | null;
  isGrandMeridian?: boolean;
  grandMeridianAxis?: 'horizontal' | 'vertical' | 'diagonal' | null;
  grandMeridianPoints?: string[];
  obsidian: PlayerState;
  ivory: PlayerState;
  selectedPointId: string | null;
  validTargets: string[];
  activeMillLines: [string, string, string][];
  flashMill: [string, string, string] | null;
  winner: PlayerId | null;
  statusMessage: string;
  history: GameHistoryEntry[];
  moveCount: number;
  isAiOpponent: boolean;
  difficultyStage: DifficultyStageId;
  playerHasFormedFirstMill?: boolean;
  lastDialogue?: { speaker: string; text: string; translation?: string; timestamp: number } | null;
}

export interface MatchPerformanceStats {
  totalTurns: number;
  playerMoves: number;
  opponentMoves: number;
  playerMills: number;
  opponentMills: number;
  playerDoubleMills?: number;
  opponentDoubleMills?: number;
  playerGrandMeridianMills?: number;
  opponentGrandMeridianMills?: number;
  playerCaptures: number;
  opponentCaptures: number;
  playerMovesPerMill: number | null; // e.g. 4.2 moves / mill
  opponentMovesPerMill: number | null;
  playerCaptureRatio: number; // e.g. 75.0 (%) of opponent starting herd (12)
  opponentCaptureRatio: number;
  playerKraalRetention: number; // e.g. 83.3 (%) of player's herd retained
  opponentKraalRetention: number;
  tempoTier: 'LETHAL' | 'HIGH_EFFICIENCY' | 'BALANCED' | 'ATTRITION' | 'NO_MILLS';
  tempoBadge: string;
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  tacticalSummary: string;
  tacticalAdvice: string;
  keyInsights: string[];
}

export type DeliverableTab =
  | 'empty-board'
  | 'mid-game'
  | 'obsidian-token'
  | 'ivory-token'
  | 'mill-formation'
  | 'forced-opening'
  | 'paused-menu'
  | 'material-palette'
  | 'motion-sound';

export type AppView = 'game' | 'deliverables' | 'leaderboard' | 'career';

// =========================================================================
// MORABARABA CAREER SYSTEM & MATCH RECORD TYPES
// =========================================================================

export type CareerGameMode =
  | 'overall'
  | 'ranked'
  | 'casual'
  | 'campaign'
  | 'ai'
  | 'tournament'
  | 'friendly';

export interface CareerModeStats {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage (0-100)
  currentStreak: number;
  bestStreak: number;
  millsFormed: number;
  millsPrevented: number;
  cattleCaptured: number;
  grandMeridianCount?: number;
  rating: number;
}

export interface PlayerCareerRecord {
  overall: CareerModeStats;
  ranked: CareerModeStats;
  casual: CareerModeStats;
  campaign: CareerModeStats;
  ai: CareerModeStats;
  tournament: CareerModeStats;
  friendly: CareerModeStats;
}

export interface DetailedMatchRecord {
  matchId: string;
  userId: string;
  opponentId: string;
  opponentName: string;
  opponentType: 'ai' | 'human' | 'friend';
  opponentRating: number;
  opponentAvatar?: string;
  opponentClan?: string;
  gameMode: 'ranked' | 'casual' | 'campaign' | 'ai' | 'tournament' | 'friendly' | 'online' | 'pass-and-play';
  stageId?: DifficultyStageId | string;
  date: string; // ISO string
  startTime: string;
  durationSeconds: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  winner: PlayerId | 'draw';
  winnerName: string;
  loserId?: string;
  isDraw: boolean;
  moveCount: number;
  playerCaptures: number;
  opponentCaptures: number;
  playerMills: number;
  opponentMills: number;
  playerDoubleMills?: number;
  opponentDoubleMills?: number;
  playerGrandMeridianMills?: number;
  opponentGrandMeridianMills?: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  xpEarned: number;
  finalBoardSnapshot?: Record<string, { piece: PlayerId | null }>;
  tacticalGrade: string;
  tempoBadge: string;
  wasComeback: boolean;
  isHistoricBossMatch?: boolean;
}

export interface HeadToHeadRecord {
  opponentId: string;
  opponentName: string;
  opponentType: 'ai' | 'human' | 'friend';
  avatar: string;
  clanTitle?: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  winRate: number;
  recentForm: ('W' | 'L' | 'D')[];
  lastPlayedAt: string;
}

export interface PrestigeHonor {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'boss' | 'streak' | 'mastery' | 'legend' | 'tactics';
  icon: string;
  badgeColor: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
}

export interface PlayerCareerProfile {
  userId: string;
  displayName: string;
  username: string; // Callsign / Unique handle
  country: string; // e.g. "Lesotho 🇱🇸"
  region: string; // District e.g. "Maseru", "Leribe"
  avatarIcon: string;
  clanTitle: string;
  joinedDate: string;
  rating: number;
  peakRating: number;
  careerXp: number;
  careerLevel: number;
  equippedCattleSet: CattleSetId;
  equippedBoard: string;
  isGuest: boolean;
  recordsByMode: PlayerCareerRecord;
  recentForm: ('W' | 'L' | 'D')[];
  majorOpponentsDefeated: DifficultyStageId[];
  prestigeHonors: PrestigeHonor[];
}

