import { BoardPoint, ForcedOpeningState, GamePhase, GameState, MillDefinition, PlayerId, RulesetType } from '../types';

export const INITIAL_POINTS: Record<string, BoardPoint> = {
  // Outer Square (Ring 0)
  a1: { id: 'a1', ring: 0, index: 0, x: 12, y: 12, adjacent: ['d1', 'a4', 'b2'], piece: null },
  d1: { id: 'd1', ring: 0, index: 1, x: 50, y: 12, adjacent: ['a1', 'g1', 'd2'], piece: null },
  g1: { id: 'g1', ring: 0, index: 2, x: 88, y: 12, adjacent: ['d1', 'g4', 'f2'], piece: null },
  g4: { id: 'g4', ring: 0, index: 3, x: 88, y: 50, adjacent: ['g1', 'g7', 'f4'], piece: null },
  g7: { id: 'g7', ring: 0, index: 4, x: 88, y: 88, adjacent: ['g4', 'd7', 'f6'], piece: null },
  d7: { id: 'd7', ring: 0, index: 5, x: 50, y: 88, adjacent: ['g7', 'a7', 'd6'], piece: null },
  a7: { id: 'a7', ring: 0, index: 6, x: 12, y: 88, adjacent: ['d7', 'a4', 'b6'], piece: null },
  a4: { id: 'a4', ring: 0, index: 7, x: 12, y: 50, adjacent: ['a7', 'a1', 'b4'], piece: null },

  // Middle Square (Ring 1)
  b2: { id: 'b2', ring: 1, index: 0, x: 26, y: 26, adjacent: ['d2', 'b4', 'a1'], piece: null },
  d2: { id: 'd2', ring: 1, index: 1, x: 50, y: 26, adjacent: ['b2', 'f2', 'd1', 'd3'], piece: null },
  f2: { id: 'f2', ring: 1, index: 2, x: 74, y: 26, adjacent: ['d2', 'f4', 'g1'], piece: null },
  f4: { id: 'f4', ring: 1, index: 3, x: 74, y: 50, adjacent: ['f2', 'f6', 'g4', 'e4'], piece: null },
  f6: { id: 'f6', ring: 1, index: 4, x: 74, y: 74, adjacent: ['f4', 'd6', 'g7'], piece: null },
  d6: { id: 'd6', ring: 1, index: 5, x: 50, y: 74, adjacent: ['f6', 'b6', 'd7', 'd5'], piece: null },
  b6: { id: 'b6', ring: 1, index: 6, x: 26, y: 74, adjacent: ['d6', 'b4', 'a7'], piece: null },
  b4: { id: 'b4', ring: 1, index: 7, x: 26, y: 50, adjacent: ['b6', 'b2', 'a4', 'c4'], piece: null },

  // Inner Square (Ring 2)
  c3: { id: 'c3', ring: 2, index: 0, x: 38, y: 38, adjacent: ['d3', 'c4'], piece: null },
  d3: { id: 'd3', ring: 2, index: 1, x: 50, y: 38, adjacent: ['c3', 'e3', 'd2', 'd4'], piece: null },
  e3: { id: 'e3', ring: 2, index: 2, x: 62, y: 38, adjacent: ['d3', 'e4'], piece: null },
  e4: { id: 'e4', ring: 2, index: 3, x: 62, y: 50, adjacent: ['e3', 'e5', 'f4', 'd4'], piece: null },
  e5: { id: 'e5', ring: 2, index: 4, x: 62, y: 62, adjacent: ['e4', 'd5'], piece: null },
  d5: { id: 'd5', ring: 2, index: 5, x: 50, y: 62, adjacent: ['e5', 'c5', 'd6', 'd4'], piece: null },
  c5: { id: 'c5', ring: 2, index: 6, x: 38, y: 62, adjacent: ['d5', 'c4'], piece: null },
  c4: { id: 'c4', ring: 2, index: 7, x: 38, y: 50, adjacent: ['c5', 'c3', 'b4', 'd4'], piece: null },

  // Center Spot (Middle Intersection / SOTHO 25 Board)
  d4: {
    id: 'd4',
    ring: 3,
    index: 0,
    x: 50,
    y: 50,
    adjacent: ['d3', 'e4', 'd5', 'c4'],
    piece: null,
  },
};

// All 18 authentic Mills for Sotho 25 Morabaraba
export const ALL_MILLS: MillDefinition[] = [
  // Outer Horizontals & Verticals
  { id: 'm1', points: ['a1', 'd1', 'g1'] },
  { id: 'm2', points: ['g1', 'g4', 'g7'] },
  { id: 'm3', points: ['g7', 'd7', 'a7'] },
  { id: 'm4', points: ['a7', 'a4', 'a1'] },

  // Middle Horizontals & Verticals
  { id: 'm5', points: ['b2', 'd2', 'f2'] },
  { id: 'm6', points: ['f2', 'f4', 'f6'] },
  { id: 'm7', points: ['f6', 'd6', 'b6'] },
  { id: 'm8', points: ['b6', 'b4', 'b2'] },

  // Inner Horizontals & Verticals
  { id: 'm9', points: ['c3', 'd3', 'e3'] },
  { id: 'm10', points: ['e3', 'e4', 'e5'] },
  { id: 'm11', points: ['e5', 'd5', 'c5'] },
  { id: 'm12', points: ['c5', 'c4', 'c3'] },

  // Orthogonal Cross Lines (Midpoints connecting rings)
  { id: 'm13', points: ['d1', 'd2', 'd3'] },
  { id: 'm14', points: ['g4', 'f4', 'e4'] },
  { id: 'm15', points: ['d7', 'd6', 'd5'] },
  { id: 'm16', points: ['a4', 'b4', 'c4'] },

  // Center Cross Mills (Passing through the 25th center spot d4)
  { id: 'm17', points: ['c4', 'd4', 'e4'] },
  { id: 'm18', points: ['d3', 'd4', 'd5'] },
];

export const CONNECTION_SEGMENTS: [string, string][] = [
  // Outer Ring
  ['a1', 'd1'], ['d1', 'g1'], ['g1', 'g4'], ['g4', 'g7'],
  ['g7', 'd7'], ['d7', 'a7'], ['a7', 'a4'], ['a4', 'a1'],

  // Middle Ring
  ['b2', 'd2'], ['d2', 'f2'], ['f2', 'f4'], ['f4', 'f6'],
  ['f6', 'd6'], ['d6', 'b6'], ['b6', 'b4'], ['b4', 'b2'],

  // Inner Ring
  ['c3', 'd3'], ['d3', 'e3'], ['e3', 'e4'], ['e4', 'e5'],
  ['e5', 'd5'], ['d5', 'c5'], ['c5', 'c4'], ['c4', 'c3'],

  // Orthogonal Connectors
  ['d1', 'd2'], ['d2', 'd3'],
  ['g4', 'f4'], ['f4', 'e4'],
  ['d7', 'd6'], ['d6', 'd5'],
  ['a4', 'b4'], ['b4', 'c4'],

  // Outer-to-Middle Corner Diagonals
  ['a1', 'b2'],
  ['g1', 'f2'],
  ['g7', 'f6'],
  ['a7', 'b6'],

  // Center Orthogonal Cross Connections (To middle spot d4)
  ['c4', 'd4'], ['d4', 'e4'],
  ['d3', 'd4'], ['d4', 'd5'],
];

export function getInitialGameState(ruleset: RulesetType = 'sotho25'): GameState {
  const points: Record<string, BoardPoint> = {};
  for (const [key, pt] of Object.entries(INITIAL_POINTS)) {
    points[key] = { ...pt, piece: null };
  }

  return {
    points,
    turn: 'obsidian',
    phase: 'placing',
    ruleset,
    forcedOpening: null,
    pendingMillCount: 0,
    capturesRemaining: 0,
    isDoubleMill: false,
    obsidian: {
      id: 'obsidian',
      name: 'PLAYER 01',
      inHand: 12,
      onBoard: 0,
      captured: 0,
      score: 0,
      materialLabel: 'Polished Black Obsidian',
    },
    ivory: {
      id: 'ivory',
      name: 'Matenase',
      inHand: 12,
      onBoard: 0,
      captured: 0,
      score: 0,
      materialLabel: 'Maseru Foothills · Easy',
    },
    selectedPointId: null,
    validTargets: Object.keys(points),
    activeMillLines: [],
    flashMill: null,
    winner: null,
    statusMessage: 'Place one cattle token.',
    history: [],
    moveCount: 0,
    isAiOpponent: true,
    difficultyStage: 'matenase',
  };
}

export function getMidGameState(): GameState {
  const state = getInitialGameState();
  // Realistic tactical mid-game configuration
  state.points.a1.piece = 'obsidian';
  state.points.d1.piece = 'obsidian';
  state.points.b2.piece = 'obsidian';
  state.points.d4.piece = 'obsidian'; // Center control
  state.points.c4.piece = 'obsidian';
  state.points.d6.piece = 'obsidian';
  state.points.g7.piece = 'obsidian';

  state.points.g1.piece = 'ivory';
  state.points.f2.piece = 'ivory';
  state.points.e3.piece = 'ivory';
  state.points.e4.piece = 'ivory';
  state.points.d7.piece = 'ivory';
  state.points.a4.piece = 'ivory';

  state.obsidian.inHand = 5;
  state.obsidian.onBoard = 7;
  state.obsidian.captured = 1;

  state.ivory.inHand = 6;
  state.ivory.onBoard = 6;
  state.ivory.captured = 0;

  state.turn = 'obsidian';
  state.phase = 'placing';
  state.statusMessage = 'Place one cattle token.';
  state.validTargets = (Object.values(state.points) as BoardPoint[]).filter((p) => p.piece === null).map((p) => p.id);
  state.moveCount = 13;

  return state;
}

export function getMillFormationState(): GameState {
  const state = getInitialGameState();
  // Mill formed on the center cross line: c4 - d4 - e4
  state.points.c4.piece = 'obsidian';
  state.points.d4.piece = 'obsidian';
  state.points.e4.piece = 'obsidian';
  state.points.a1.piece = 'obsidian';
  state.points.d6.piece = 'obsidian';

  state.points.g1.piece = 'ivory';
  state.points.f4.piece = 'ivory';
  state.points.d7.piece = 'ivory';
  state.points.a7.piece = 'ivory';

  state.obsidian.inHand = 7;
  state.obsidian.onBoard = 5;
  state.obsidian.captured = 0;

  state.ivory.inHand = 8;
  state.ivory.onBoard = 4;
  state.ivory.captured = 0;

  state.turn = 'obsidian';
  state.phase = 'shooting';
  state.flashMill = ['c4', 'd4', 'e4'];
  state.statusMessage = 'Mill formed. Choose one opposing token.';
  state.moveCount = 9;

  return state;
}

/**
 * Deliverable Example State: Trapped Player in Forced Opening State
 */
export function getTrappedForcedOpeningState(): GameState {
  const state = getInitialGameState();
  // Player 02 is completely walled off with no legal moves, but has 4 pieces
  state.points.a1.piece = 'ivory';
  state.points.a7.piece = 'ivory';
  state.points.g1.piece = 'ivory';
  state.points.g7.piece = 'ivory';

  // Player 01 walls all adjacent points
  state.points.d1.piece = 'obsidian';
  state.points.a4.piece = 'obsidian';
  state.points.b2.piece = 'obsidian';
  state.points.d7.piece = 'obsidian';
  state.points.b6.piece = 'obsidian';
  state.points.g4.piece = 'obsidian';
  state.points.f2.piece = 'obsidian';
  state.points.f6.piece = 'obsidian';

  state.obsidian.inHand = 0;
  state.obsidian.onBoard = 8;
  state.ivory.inHand = 0;
  state.ivory.onBoard = 4;

  state.turn = 'obsidian';
  state.phase = 'moving';
  state.forcedOpening = {
    active: true,
    trappedPlayerId: 'ivory',
    openingPlayerId: 'obsidian',
    forcedOpeningMoveCount: 0,
    openingStartedAt: Date.now(),
    isStillTrapped: true,
  };
  state.statusMessage = 'PLAYER 02 IS TRAPPED — PLAYER 01 MUST OPEN THE BOARD';
  return state;
}

export function getAllCompletedMills(player: PlayerId, points: Record<string, BoardPoint>): MillDefinition[] {
  return ALL_MILLS.filter((mill) => mill.points.every((ptId) => points[ptId]?.piece === player));
}

export function detectNewlyFormedMills(
  player: PlayerId,
  pointsBefore: Record<string, BoardPoint>,
  pointsAfter: Record<string, BoardPoint>,
  destPointId?: string
): MillDefinition[] {
  const beforeMills = getAllCompletedMills(player, pointsBefore);
  const afterMills = getAllCompletedMills(player, pointsAfter);
  const beforeIds = new Set(beforeMills.map((m) => m.id));

  const seenIds = new Set<string>();
  const newlyFormed: MillDefinition[] = [];

  for (const mill of afterMills) {
    if (destPointId && !mill.points.includes(destPointId)) {
      continue;
    }
    if (!beforeIds.has(mill.id) && !seenIds.has(mill.id)) {
      seenIds.add(mill.id);
      newlyFormed.push(mill);
    }
  }

  return newlyFormed;
}

export const HORIZONTAL_MERIDIAN_POINTS = ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4'];
export const VERTICAL_MERIDIAN_POINTS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];

export interface GrandMeridianResult {
  isGrandMeridian: boolean;
  axis: 'horizontal' | 'vertical' | 'diagonal' | null;
  points: string[];
  title: string;
}

export function checkGrandMeridianLine(
  pointId: string,
  player: PlayerId,
  points: Record<string, BoardPoint>,
  formedMills: MillDefinition[] = []
): GrandMeridianResult {
  // 1. Check Horizontal Full Meridian (a4 - b4 - c4 - d4 - e4 - f4 - g4)
  const horizCount = HORIZONTAL_MERIDIAN_POINTS.filter((id) => points[id]?.piece === player).length;
  const isHorizInvolved = HORIZONTAL_MERIDIAN_POINTS.includes(pointId);
  const horizMillsFormed = formedMills.filter((m) =>
    m.points.every((ptId) => HORIZONTAL_MERIDIAN_POINTS.includes(ptId))
  );

  if (isHorizInvolved && (horizCount >= 5 || horizMillsFormed.length >= 1 || horizCount === 7)) {
    if (formedMills.length >= 1 || horizCount >= 6) {
      return {
        isGrandMeridian: true,
        axis: 'horizontal',
        points: HORIZONTAL_MERIDIAN_POINTS,
        title: 'GRAND HORIZON DOUBLE MILL',
      };
    }
  }

  // 2. Check Vertical Full Meridian (d1 - d2 - d3 - d4 - d5 - d6 - d7)
  const vertCount = VERTICAL_MERIDIAN_POINTS.filter((id) => points[id]?.piece === player).length;
  const isVertInvolved = VERTICAL_MERIDIAN_POINTS.includes(pointId);
  const vertMillsFormed = formedMills.filter((m) =>
    m.points.every((ptId) => VERTICAL_MERIDIAN_POINTS.includes(ptId))
  );

  if (isVertInvolved && (vertCount >= 5 || vertMillsFormed.length >= 1 || vertCount === 7)) {
    if (formedMills.length >= 1 || vertCount >= 6) {
      return {
        isGrandMeridian: true,
        axis: 'vertical',
        points: VERTICAL_MERIDIAN_POINTS,
        title: 'GRAND MERIDIAN DOUBLE MILL',
      };
    }
  }

  // 3. Check for any Collinear Multiple Mills formed in the same axis
  if (formedMills.length >= 2) {
    const allMillPoints = formedMills.flatMap((m) => m.points);
    const uniquePoints = Array.from(new Set(allMillPoints));
    
    // Check if all belong to horizontal or vertical axis
    const allHoriz = uniquePoints.every((id) => HORIZONTAL_MERIDIAN_POINTS.includes(id));
    if (allHoriz) {
      return {
        isGrandMeridian: true,
        axis: 'horizontal',
        points: HORIZONTAL_MERIDIAN_POINTS,
        title: 'GRAND HORIZON DOUBLE MILL',
      };
    }

    const allVert = uniquePoints.every((id) => VERTICAL_MERIDIAN_POINTS.includes(id));
    if (allVert) {
      return {
        isGrandMeridian: true,
        axis: 'vertical',
        points: VERTICAL_MERIDIAN_POINTS,
        title: 'GRAND MERIDIAN DOUBLE MILL',
      };
    }
  }

  return {
    isGrandMeridian: false,
    axis: null,
    points: [],
    title: '',
  };
}

export function checkMillsForPoint(pointId: string, player: PlayerId, points: Record<string, BoardPoint>): MillDefinition[] {
  const matchingMills = ALL_MILLS.filter((mill) => {
    if (!mill.points.includes(pointId)) return false;
    return mill.points.every((ptId) => points[ptId]?.piece === player);
  });
  return matchingMills;
}

export function isPieceInMill(pointId: string, player: PlayerId, points: Record<string, BoardPoint>): boolean {
  return ALL_MILLS.some((mill) => {
    if (!mill.points.includes(pointId)) return false;
    return mill.points.every((ptId) => points[ptId]?.piece === player);
  });
}

export function getCapturablePoints(opponent: PlayerId, points: Record<string, BoardPoint>): string[] {
  const opponentPoints = (Object.values(points) as BoardPoint[]).filter((p) => p.piece === opponent);
  if (opponentPoints.length === 0) return [];

  // Rules: Cannot capture piece in mill UNLESS all pieces of opponent are in mills
  const nonMillPieces = opponentPoints.filter((p) => !isPieceInMill(p.id, opponent, points));
  if (nonMillPieces.length > 0) {
    return nonMillPieces.map((p) => p.id);
  }
  return opponentPoints.map((p) => p.id);
}

/**
 * Authoritative sequential capture processor for single and double mills.
 * Handles exact capturesRemaining countdown, board update, history logging, win checks,
 * and seamless phase/turn transitions.
 */
export function applyCaptureToGameState(
  state: GameState,
  capturePointId: string,
  capturer: PlayerId
): GameState {
  const opponent: PlayerId = capturer === 'obsidian' ? 'ivory' : 'obsidian';
  const capturables = getCapturablePoints(opponent, state.points);

  if (!capturables.includes(capturePointId)) {
    return state; // Illegal capture target, ignore
  }

  const newPoints = { ...state.points };
  newPoints[capturePointId] = { ...newPoints[capturePointId], piece: null };

  const oppPlayerState = { ...state[opponent] };
  oppPlayerState.onBoard = Math.max(0, oppPlayerState.onBoard - 1);
  oppPlayerState.captured += 1;

  const currentCapturesRemaining = state.capturesRemaining ?? 1;
  const nextCapturesRemaining = Math.max(0, currentCapturesRemaining - 1);

  const updatedHistory = [
    ...state.history,
    { to: capturePointId, player: capturer, type: 'shoot' as const },
  ];

  // 1. Check win condition: opponent reduced to < 3 pieces in moving phase
  if (oppPlayerState.inHand === 0 && oppPlayerState.onBoard < 3) {
    return {
      ...state,
      points: newPoints,
      [opponent]: oppPlayerState,
      winner: capturer,
      phase: determinePhase(state[capturer]),
      capturesRemaining: 0,
      isDoubleMill: false,
      flashMill: null,
      activeMillLines: [],
      selectedPointId: null,
      validTargets: [],
      statusMessage: `${capturer === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02'} has captured the kraal!`,
      history: updatedHistory,
    };
  }

  // 2. Check if more captures remain from a double mill
  if (nextCapturesRemaining > 0) {
    const remainingOppPieces = (Object.values(newPoints) as BoardPoint[]).filter((p) => p.piece === opponent).length;
    const nextCapturables = getCapturablePoints(opponent, newPoints);

    if (remainingOppPieces > 0 && nextCapturables.length > 0) {
      // Stay in shooting phase! Turn remains with capturer.
      return {
        ...state,
        points: newPoints,
        [opponent]: oppPlayerState,
        turn: capturer,
        phase: 'shooting',
        capturesRemaining: nextCapturesRemaining,
        statusMessage: state.isDoubleMill
          ? 'SMOOTH DOUBLE MILL · CAPTURE 2 OF 2'
          : '1 CATTLE TO CAPTURE',
        history: updatedHistory,
      };
    }
  }

  // 3. Capture entitlement completed -> End shooting phase and resolve turn transition
  const baseState: GameState = {
    ...state,
    points: newPoints,
    [opponent]: oppPlayerState,
    phase: determinePhase(state[capturer]),
    capturesRemaining: 0,
    isDoubleMill: false,
    flashMill: null,
    activeMillLines: [],
    selectedPointId: null,
    validTargets: [],
    history: updatedHistory,
  };

  return resolveTurnTransitionAfterMove(baseState, capturer);
}

export function determinePhase(playerState: { inHand: number; onBoard: number }): GamePhase {
  if (playerState.inHand > 0) return 'placing';
  return 'moving';
}

/**
 * Strict 5-point move validator ensuring no jumping, no flying, and strict turn & adjacency integrity.
 */
export interface MoveValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateMove(
  originId: string,
  destinationId: string,
  player: PlayerId,
  turn: PlayerId,
  points: Record<string, BoardPoint>
): MoveValidationResult {
  // 1. Origin contains the player's cow.
  const originPoint = points[originId];
  if (!originPoint || originPoint.piece !== player) {
    return { valid: false, reason: 'Origin does not contain the player’s cow.' };
  }

  // 2. Destination is empty.
  const destPoint = points[destinationId];
  if (!destPoint || destPoint.piece !== null) {
    return { valid: false, reason: 'Destination point is not empty.' };
  }

  // 3. Origin and destination are directly connected on the board.
  if (!originPoint.adjacent.includes(destinationId)) {
    return { valid: false, reason: 'Origin and destination are not directly connected adjacent nodes.' };
  }

  // 4. The move belongs to the player whose turn it is.
  if (player !== turn) {
    return { valid: false, reason: 'Move does not belong to the player whose turn it is.' };
  }

  // 5. Validation passed.
  return { valid: true };
}

export function getLegalMovesForPoint(pointId: string, points: Record<string, BoardPoint>, _phase?: GamePhase): string[] {
  const point = points[pointId];
  if (!point || !point.piece) return [];

  // Moving phase: only strictly connected adjacent vacant points (No jumping, no flying)
  return point.adjacent.filter((adjId) => points[adjId] && points[adjId].piece === null);
}

export function checkPlayerHasLegalMoves(player: PlayerId, points: Record<string, BoardPoint>, phase: GamePhase): boolean {
  if (phase === 'placing') {
    return (Object.values(points) as BoardPoint[]).some((p) => p.piece === null);
  }
  const playerPoints = (Object.values(points) as BoardPoint[]).filter((p) => p.piece === player);
  return playerPoints.some((p) => p.adjacent.some((adjId) => points[adjId] && points[adjId].piece === null));
}

/**
 * Authoritative Sotho 25 Trapped Player Transition Evaluator
 * Evaluates whether a player is trapped and updates FORCED_OPENING state accordingly.
 */
export function resolveTurnTransitionAfterMove(
  state: GameState,
  mover: PlayerId
): GameState {
  const opponent: PlayerId = mover === 'obsidian' ? 'ivory' : 'obsidian';
  const oppPhase = determinePhase(state[opponent]);
  const oppHasLegalMoves = checkPlayerHasLegalMoves(opponent, state.points, oppPhase);

  // Check if we are currently in an active FORCED_OPENING
  if (state.forcedOpening && state.forcedOpening.active) {
    const trappedId = state.forcedOpening.trappedPlayerId;
    const trappedPhase = determinePhase(state[trappedId]);
    const trappedNowHasMoves = checkPlayerHasLegalMoves(trappedId, state.points, trappedPhase);

    if (trappedNowHasMoves) {
      // 1. Forced opening was successful! Opening is created.
      const trappedName = trappedId === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02';
      return {
        ...state,
        forcedOpening: null,
        turn: trappedId,
        phase: trappedPhase,
        selectedPointId: null,
        validTargets: [],
        statusMessage: `THE BOARD IS OPEN — ${trappedName}’S TURN`,
      };
    } else {
      // 2. Trapped player is still blocked. Mover must take another turn.
      const newMoveCount = state.forcedOpening.forcedOpeningMoveCount + 1;
      return {
        ...state,
        forcedOpening: {
          ...state.forcedOpening,
          forcedOpeningMoveCount: newMoveCount,
          isStillTrapped: true,
        },
        turn: mover,
        phase: determinePhase(state[mover]),
        selectedPointId: null,
        validTargets: [],
        statusMessage: 'THE BOARD IS STILL CLOSED — OPEN ANOTHER PATH',
      };
    }
  }

  // Not currently in FORCED_OPENING. Check if the opponent is newly trapped:
  if (!oppHasLegalMoves && oppPhase === 'moving') {
    if (state.ruleset === 'sotho25') {
      // SOTHO 25 RULE: Trapping creates an opening obligation, NOT a victory.
      const trappedName = opponent === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02';
      const openerName = mover === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02';

      return {
        ...state,
        forcedOpening: {
          active: true,
          trappedPlayerId: opponent,
          openingPlayerId: mover,
          forcedOpeningMoveCount: 0,
          openingStartedAt: Date.now(),
          isStillTrapped: true,
        },
        turn: mover, // Mover gets another turn immediately!
        phase: determinePhase(state[mover]),
        selectedPointId: null,
        validTargets: [],
        statusMessage: `${trappedName} IS TRAPPED — ${openerName} MUST OPEN THE BOARD`,
      };
    } else {
      // Standard ruleset fallback where trapping ends the match
      return {
        ...state,
        winner: mover,
        statusMessage: `${mover === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02'} wins by trapping opponent!`,
      };
    }
  }

  // Normal turn transition
  return {
    ...state,
    turn: opponent,
    phase: oppPhase,
    selectedPointId: null,
    validTargets: [],
    statusMessage: 'Choose a cattle token.',
  };
}
