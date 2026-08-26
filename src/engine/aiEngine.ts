import {
  GameState,
  DifficultyStageId,
  BoardPoint,
  PlayerId,
  GamePhase,
  AiProfile,
  AtomicMove,
  EvaluationFeatures,
  ForcedOpeningState,
} from '../types';
import { DIFFICULTY_STAGES, AI_PROFILES } from '../constants/stages';
import {
  ALL_MILLS,
  checkMillsForPoint,
  detectNewlyFormedMills,
  getAllCompletedMills,
  isPieceInMill,
  getCapturablePoints,
  getLegalMovesForPoint,
  determinePhase,
  checkPlayerHasLegalMoves,
  resolveTurnTransitionAfterMove,
} from './morabaraba';

export interface AiDecision {
  type: 'select' | 'place' | 'move' | 'shoot';
  pointId: string;
  sourceId?: string;
  reason?: string;
  evalScore?: number;
  plannedCapturePointId?: string;
}

export interface SearchResult {
  decision: AiDecision | null;
  bestMove: AtomicMove | null;
  score: number;
  depth: number;
  nodes: number;
}

// -------------------------------------------------------------
// ZOBRIST HASHING FOR SOTHO 25 (25 Points x 3 States + Metadata)
// -------------------------------------------------------------
class ZobristKeys {
  private static instance: ZobristKeys;
  public pointKeys: Record<string, [number, number]>; // [obsidian, ivory]
  public turnKey: number;
  public phaseKeys: Record<GamePhase, number>;
  public forcedOpeningKey: number;

  private constructor(seed: number = 0x85ebca6b) {
    let s = seed;
    const nextRandom = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s;
    };

    this.pointKeys = {};
    const pointIds = [
      'a1', 'd1', 'g1', 'g4', 'g7', 'd7', 'a7', 'a4',
      'b2', 'd2', 'f2', 'f4', 'f6', 'd6', 'b6', 'b4',
      'c3', 'd3', 'e3', 'e4', 'e5', 'd5', 'c5', 'c4',
      'd4',
    ];

    for (const id of pointIds) {
      this.pointKeys[id] = [nextRandom(), nextRandom()];
    }

    this.turnKey = nextRandom();
    this.phaseKeys = {
      placing: nextRandom(),
      moving: nextRandom(),
      shooting: nextRandom(),
    };
    this.forcedOpeningKey = nextRandom();
  }

  public static get(seed?: number): ZobristKeys {
    if (!ZobristKeys.instance || seed !== undefined) {
      ZobristKeys.instance = new ZobristKeys(seed);
    }
    return ZobristKeys.instance;
  }
}

export function computeZobristHash(
  board: Record<string, BoardPoint>,
  turn: PlayerId,
  phase: GamePhase,
  forcedOpening: boolean,
  p1Hand: number,
  p2Hand: number,
  seed?: number
): number {
  const z = ZobristKeys.get(seed);
  let hash = 0;

  for (const [id, pt] of Object.entries(board)) {
    if (pt.piece === 'obsidian') {
      hash ^= z.pointKeys[id]?.[0] || 0;
    } else if (pt.piece === 'ivory') {
      hash ^= z.pointKeys[id]?.[1] || 0;
    }
  }

  if (turn === 'ivory') hash ^= z.turnKey;
  hash ^= z.phaseKeys[phase] || 0;
  if (forcedOpening) hash ^= z.forcedOpeningKey;
  hash = (hash ^ (p1Hand << 4) ^ (p2Hand << 9)) >>> 0;

  return hash;
}

// -------------------------------------------------------------
// TRANSPOSITION TABLE
// -------------------------------------------------------------
export enum TTFlag {
  EXACT = 0,
  LOWERBOUND = 1,
  UPPERBOUND = 2,
}

export interface TTEntry {
  hash: number;
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove?: AtomicMove;
}

export class TranspositionTable {
  private table: Map<number, TTEntry>;
  private maxSize: number;

  constructor(maxSize: number = 50000) {
    this.table = new Map();
    this.maxSize = maxSize;
  }

  public resize(newSize: number) {
    this.maxSize = newSize;
    if (this.table.size > newSize) {
      this.clear();
    }
  }

  public get(hash: number): TTEntry | undefined {
    return this.table.get(hash);
  }

  public store(hash: number, depth: number, score: number, flag: TTFlag, bestMove?: AtomicMove) {
    if (this.table.size >= this.maxSize) {
      // Evict oldest entries
      const keys = this.table.keys();
      for (let i = 0; i < 500; i++) {
        const k = keys.next().value;
        if (k !== undefined) this.table.delete(k);
      }
    }
    this.table.set(hash, { hash, depth, score, flag, bestMove });
  }

  public clear() {
    this.table.clear();
  }

  public size(): number {
    return this.table.size;
  }
}

// Global transposition table
const globalTT = new TranspositionTable(100000);

// Killer moves (2 per ply)
const killerMoves: (AtomicMove | null)[][] = Array.from({ length: 32 }, () => [null, null]);

// History table [fromIndex][toIndex]
const historyTable: Record<string, number> = {};

function getMoveHistoryKey(move: AtomicMove): string {
  return `${move.from || 'hand'}_${move.to}_${move.capturePointId || 'none'}`;
}

function updateHistory(move: AtomicMove, depth: number) {
  const key = getMoveHistoryKey(move);
  historyTable[key] = (historyTable[key] || 0) + depth * depth;
}

// -------------------------------------------------------------
// STRATEGIC POSITIONAL WEIGHTS FOR SOTHO 25 BOARD
// -------------------------------------------------------------
export const SOTHO_POSITIONAL_WEIGHTS: Record<string, number> = {
  // Sotho Center Hub (d4): Orthogonal nexus, joins 2 mills, vital transition pivot
  d4: 55,

  // Inner Ring Orthogonal Connectors (c4, d3, e4, d5): Directly gate the center
  c4: 32,
  d3: 32,
  e4: 32,
  d5: 32,

  // Middle Ring Cross Connectors & Diagonals
  b4: 24,
  d2: 24,
  f4: 24,
  d6: 24,
  b2: 20,
  f2: 20,
  f6: 20,
  b6: 20,

  // Inner Ring Corners
  c3: 16,
  e3: 16,
  e5: 16,
  c5: 16,

  // Outer Ring Cross Connectors
  a4: 18,
  d1: 18,
  g4: 18,
  d7: 18,

  // Outer Corners
  a1: 14,
  g1: 14,
  g7: 14,
  a7: 14,
};

// -------------------------------------------------------------
// TACTICAL DETECTORS & HEURISTICS
// -------------------------------------------------------------

export function countPiecesInMill(
  points: [string, string, string],
  player: PlayerId,
  board: Record<string, BoardPoint>
): { count: number; emptyPoint: string | null; opponentCount: number } {
  let count = 0;
  let opponentCount = 0;
  let emptyPoint: string | null = null;
  const opponent: PlayerId = player === 'obsidian' ? 'ivory' : 'obsidian';

  for (const ptId of points) {
    const p = board[ptId];
    if (!p) continue;
    if (p.piece === player) {
      count++;
    } else if (p.piece === opponent) {
      opponentCount++;
    } else {
      emptyPoint = ptId;
    }
  }

  return { count, emptyPoint, opponentCount };
}

export function findWinningPlacements(
  player: PlayerId,
  board: Record<string, BoardPoint>
): string[] {
  const winningPoints: string[] = [];
  for (const mill of ALL_MILLS) {
    const { count, emptyPoint, opponentCount } = countPiecesInMill(mill.points, player, board);
    if (count === 2 && opponentCount === 0 && emptyPoint && !winningPoints.includes(emptyPoint)) {
      winningPoints.push(emptyPoint);
    }
  }
  return winningPoints;
}

export function countTwoInARows(
  player: PlayerId,
  board: Record<string, BoardPoint>
): { threats: number; openPoints: string[] } {
  let threats = 0;
  const openPoints: string[] = [];

  for (const mill of ALL_MILLS) {
    const { count, emptyPoint, opponentCount } = countPiecesInMill(mill.points, player, board);
    if (count === 2 && opponentCount === 0 && emptyPoint) {
      threats++;
      if (!openPoints.includes(emptyPoint)) {
        openPoints.push(emptyPoint);
      }
    }
  }

  return { threats, openPoints };
}

export function detectForks(
  player: PlayerId,
  board: Record<string, BoardPoint>
): { forkPoints: string[]; forkCount: number } {
  const pointThreatCount: Record<string, number> = {};

  for (const mill of ALL_MILLS) {
    const { count, emptyPoint, opponentCount } = countPiecesInMill(mill.points, player, board);
    if (count === 2 && opponentCount === 0 && emptyPoint) {
      pointThreatCount[emptyPoint] = (pointThreatCount[emptyPoint] || 0) + 1;
    }
  }

  const forkPoints = Object.keys(pointThreatCount).filter((pt) => pointThreatCount[pt] >= 2);
  return { forkPoints, forkCount: forkPoints.length };
}

export function detectMillCycling(
  player: PlayerId,
  board: Record<string, BoardPoint>,
  phase: GamePhase
): number {
  if (phase === 'placing') return 0;

  const playerPoints = (Object.values(board) as BoardPoint[]).filter((p) => p.piece === player);
  let cyclingScore = 0;

  for (const pt of playerPoints) {
    const legalTargets = getLegalMovesForPoint(pt.id, board, phase);
    for (const toId of legalTargets) {
      // Simulate move
      const simBoard = cloneBoard(board);
      simBoard[pt.id] = { ...simBoard[pt.id], piece: null };
      simBoard[toId] = { ...simBoard[toId], piece: player };

      const millsFormed = checkMillsForPoint(toId, player, simBoard);
      if (millsFormed.length > 0) {
        // Can it step back or form another mill from toId on next turn?
        const returnMoves = getLegalMovesForPoint(toId, simBoard, phase);
        for (const retId of returnMoves) {
          const simBoard2 = cloneBoard(simBoard);
          simBoard2[toId] = { ...simBoard2[toId], piece: null };
          simBoard2[retId] = { ...simBoard2[retId], piece: player };
          const returnMills = checkMillsForPoint(retId, player, simBoard2);
          if (returnMills.length > 0 || retId === pt.id) {
            cyclingScore += 1;
          }
        }
      }
    }
  }

  return cyclingScore;
}

export function rankCapturesByStrategicValue(
  capturableIds: string[],
  oppPlayer: PlayerId,
  board: Record<string, BoardPoint>,
  phase: GamePhase
): string[] {
  if (capturableIds.length <= 1) return capturableIds;

  const myPlayer: PlayerId = oppPlayer === 'obsidian' ? 'ivory' : 'obsidian';

  return [...capturableIds].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // 1. Destroying opponent 2-in-a-row threats
    for (const mill of ALL_MILLS) {
      if (mill.points.includes(a)) {
        const { count, opponentCount } = countPiecesInMill(mill.points, oppPlayer, board);
        if (count === 2 && opponentCount === 0) scoreA += 450;
      }
      if (mill.points.includes(b)) {
        const { count, opponentCount } = countPiecesInMill(mill.points, oppPlayer, board);
        if (count === 2 && opponentCount === 0) scoreB += 450;
      }
    }

    // 2. Center hub (d4) priority
    if (a === 'd4') scoreA += 180;
    if (b === 'd4') scoreB += 180;

    // 3. Positional strategic weights
    scoreA += SOTHO_POSITIONAL_WEIGHTS[a] || 10;
    scoreB += SOTHO_POSITIONAL_WEIGHTS[b] || 10;

    // 4. Opponent mobility destruction
    const movesA = getLegalMovesForPoint(a, board, phase).length;
    const movesB = getLegalMovesForPoint(b, board, phase).length;
    scoreA += movesA * 15;
    scoreB += movesB * 15;

    // 5. Check if capturing 'a' or 'b' unblocks our own pieces
    for (const myPt of (Object.values(board) as BoardPoint[]).filter((p) => p.piece === myPlayer)) {
      if (myPt.adjacent.includes(a)) scoreA += 25;
      if (myPt.adjacent.includes(b)) scoreB += 25;
    }

    return scoreB - scoreA;
  });
}

export function selectAiCapture(
  capturableIds: string[],
  oppPlayer: PlayerId,
  board: Record<string, BoardPoint>,
  phase: GamePhase,
  profile: AiProfile
): string {
  if (capturableIds.length === 0) return '';
  if (capturableIds.length === 1) return capturableIds[0];

  const rankedCaptures = rankCapturesByStrategicValue(capturableIds, oppPlayer, board, phase);

  // If imperfect, roll chance to pick a casual non-critical capture (giving player space to counter)
  const shouldMakeCasualCapture = Math.random() < profile.imperfectionRate;
  if (shouldMakeCasualCapture) {
    // Pick among non-optimal candidate captures (prefer random or lower value)
    const casualIndex = Math.floor(Math.random() * capturableIds.length);
    return capturableIds[casualIndex];
  }

  return rankedCaptures[0];
}

// -------------------------------------------------------------
// COMPREHENSIVE PHASE-SENSITIVE EVALUATION FUNCTION
// -------------------------------------------------------------
export function evaluateBoardMaster(
  board: Record<string, BoardPoint>,
  profile: AiProfile,
  forPlayer: PlayerId,
  pPlayerHand: number,
  pOppHand: number,
  phase: GamePhase,
  forcedOpening: ForcedOpeningState | null
): number {
  const oppPlayer: PlayerId = forPlayer === 'obsidian' ? 'ivory' : 'obsidian';

  const playerPoints = (Object.values(board) as BoardPoint[]).filter((p) => p.piece === forPlayer);
  const oppPoints = (Object.values(board) as BoardPoint[]).filter((p) => p.piece === oppPlayer);

  const playerOnBoard = playerPoints.length;
  const oppOnBoard = oppPoints.length;

  // 1. Terminal / Decisive Game Over Checks (Movement / Flying phase)
  if (phase !== 'placing') {
    if (oppOnBoard < 3 && pOppHand === 0) return 99999; // Absolute Win
    if (playerOnBoard < 3 && pPlayerHand === 0) return -99999; // Absolute Loss
  }

  // 2. Material Difference
  const playerTotalPieces = playerOnBoard + pPlayerHand;
  const oppTotalPieces = oppOnBoard + pOppHand;
  const materialDifference = playerTotalPieces - oppTotalPieces;

  // 3. Mills Formed Difference
  let playerMillsCount = 0;
  let oppMillsCount = 0;
  for (const mill of ALL_MILLS) {
    const pInfo = countPiecesInMill(mill.points, forPlayer, board);
    if (pInfo.count === 3) playerMillsCount++;
    const oInfo = countPiecesInMill(mill.points, oppPlayer, board);
    if (oInfo.count === 3) oppMillsCount++;
  }
  const millsDifference = playerMillsCount - oppMillsCount;

  // 4. Open Mills / 2-in-a-row Threats Difference
  const playerTwoInRows = countTwoInARows(forPlayer, board);
  const oppTwoInRows = countTwoInARows(oppPlayer, board);
  const openMillsDifference = playerTwoInRows.threats - oppTwoInRows.threats;

  // 5. Double-Threat Forks Difference
  const playerForks = detectForks(forPlayer, board);
  const oppForks = detectForks(oppPlayer, board);
  const doubleThreatDifference = playerForks.forkCount - oppForks.forkCount;

  // 6. Mobility & Blocked Cattle Difference
  let playerMobility = 0;
  let oppMobility = 0;
  let playerBlocked = 0;
  let oppBlocked = 0;

  if (phase !== 'placing') {
    for (const pt of playerPoints) {
      const moves = getLegalMovesForPoint(pt.id, board, phase).length;
      playerMobility += moves;
      if (moves === 0) playerBlocked++;
    }
    for (const pt of oppPoints) {
      const moves = getLegalMovesForPoint(pt.id, board, phase).length;
      oppMobility += moves;
      if (moves === 0) oppBlocked++;
    }
  }

  const mobilityDifference = playerMobility - oppMobility;
  const blockedCattleDifference = oppBlocked - playerBlocked; // Blocking opponent is good

  // 7. Sotho Center Node (d4) & Inner Ring Control
  let playerCenterControl = 0;
  let oppCenterControl = 0;

  if (board.d4?.piece === forPlayer) playerCenterControl += SOTHO_POSITIONAL_WEIGHTS.d4;
  else if (board.d4?.piece === oppPlayer) oppCenterControl += SOTHO_POSITIONAL_WEIGHTS.d4;

  const innerOrthogonals = ['c4', 'd3', 'e4', 'd5'];
  for (const id of innerOrthogonals) {
    if (board[id]?.piece === forPlayer) playerCenterControl += SOTHO_POSITIONAL_WEIGHTS[id];
    else if (board[id]?.piece === oppPlayer) oppCenterControl += SOTHO_POSITIONAL_WEIGHTS[id];
  }
  const centreControlDifference = playerCenterControl - oppCenterControl;

  // 8. Connected Cattle (Adjacent friendly pieces forming strong kraal clusters)
  let playerConnected = 0;
  let oppConnected = 0;
  for (const pt of playerPoints) {
    for (const adjId of pt.adjacent) {
      if (board[adjId]?.piece === forPlayer) playerConnected++;
    }
  }
  for (const pt of oppPoints) {
    for (const adjId of pt.adjacent) {
      if (board[adjId]?.piece === oppPlayer) oppConnected++;
    }
  }
  const connectedCattleDifference = playerConnected - oppConnected;

  // 9. Running Mill Potential (Seesaws)
  const playerCycling = detectMillCycling(forPlayer, board, phase);
  const oppCycling = detectMillCycling(oppPlayer, board, phase);
  const runningMillPotentialDifference = playerCycling - oppCycling;

  // 10. Flying Potential Difference
  let flyingPotentialDifference = 0;
  if (phase !== 'placing') {
    if (playerOnBoard === 4) flyingPotentialDifference += 40; // close to flying
    if (playerOnBoard === 3) flyingPotentialDifference += 80; // active flying
    if (oppOnBoard === 4) flyingPotentialDifference -= 40;
    if (oppOnBoard === 3) flyingPotentialDifference -= 80;
  }

  // 11. Forced Opening Pressure Evaluation
  let forcedOpeningPressure = 0;
  if (forcedOpening?.active) {
    if (forcedOpening.trappedPlayerId === oppPlayer) {
      // Opponent is trapped; we have consecutive opening turns
      forcedOpeningPressure = 120;
    } else {
      // We are trapped
      forcedOpeningPressure = -120;
    }
  }

  // Phase-Sensitive Weight Coefficients
  let wMaterial = 480;
  let wMills = 320;
  let wOpenMills = 140 * profile.doubleThreatAwareness;
  let wForks = 260 * profile.doubleThreatAwareness;
  let wMobility = 22 * profile.positionalAwareness;
  let wBlocked = 35 * profile.positionalAwareness;
  let wCenter = 1.0 * profile.positionalAwareness;
  let wConnected = 12 * profile.positionalAwareness;
  let wCycling = 190 * profile.doubleThreatAwareness;

  if (phase === 'placing') {
    wMaterial = 520;
    wOpenMills = 180 * profile.doubleThreatAwareness;
    wForks = 320 * profile.doubleThreatAwareness;
    wCenter = 1.4 * profile.positionalAwareness;
    wMobility = 8 * profile.positionalAwareness;
  }

  // Aggregate Composite Score
  let score =
    materialDifference * wMaterial +
    millsDifference * wMills +
    openMillsDifference * wOpenMills +
    doubleThreatDifference * wForks +
    mobilityDifference * wMobility +
    blockedCattleDifference * wBlocked +
    centreControlDifference * wCenter +
    connectedCattleDifference * wConnected +
    runningMillPotentialDifference * wCycling +
    forcedOpeningPressure;

  return score;
}

// -------------------------------------------------------------
// ATOMIC TURN GENERATOR
// -------------------------------------------------------------
export function cloneBoard(board: Record<string, BoardPoint>): Record<string, BoardPoint> {
  const copy: Record<string, BoardPoint> = {};
  for (const [k, v] of Object.entries(board)) {
    copy[k] = { ...v };
  }
  return copy;
}

export function generateAtomicMoves(
  board: Record<string, BoardPoint>,
  player: PlayerId,
  pHand: number,
  phase: GamePhase,
  oppPlayer: PlayerId,
  oppHand: number,
  forcedOpening: ForcedOpeningState | null,
  profile: AiProfile
): AtomicMove[] {
  const moves: AtomicMove[] = [];

  // A. PLACING PHASE
  if (phase === 'placing' && pHand > 0) {
    const vacantPoints = (Object.values(board) as BoardPoint[])
      .filter((p) => p.piece === null)
      .map((p) => p.id);

    for (const toId of vacantPoints) {
      // Simulate placement to check for newly formed mills
      const simBoard = cloneBoard(board);
      simBoard[toId] = { ...simBoard[toId], piece: player };

      const newlyFormed = detectNewlyFormedMills(player, board, simBoard, toId);

      if (newlyFormed.length >= 2) {
        // DOUBLE MILL: 2 Captures Earned
        const capturables = getCapturablePoints(oppPlayer, simBoard);
        if (capturables.length === 0) {
          moves.push({ type: 'place', to: toId, isMill: true, isDoubleMill: true });
        } else if (capturables.length === 1) {
          moves.push({ type: 'place', to: toId, capturePointId: capturables[0], isMill: true, isDoubleMill: true });
        } else {
          // Enumerate top candidate double-captures
          const ranked1 = rankCapturesByStrategicValue(capturables, oppPlayer, simBoard, phase);
          const topFirst = ranked1.slice(0, 3);
          for (const cap1 of topFirst) {
            const simBoard2 = cloneBoard(simBoard);
            simBoard2[cap1] = { ...simBoard2[cap1], piece: null };
            const capturables2 = getCapturablePoints(oppPlayer, simBoard2);
            if (capturables2.length > 0) {
              const ranked2 = rankCapturesByStrategicValue(capturables2, oppPlayer, simBoard2, phase);
              const cap2 = ranked2[0] || capturables2[0];
              moves.push({
                type: 'place',
                to: toId,
                capturePointId: cap1,
                secondCapturePointId: cap2,
                isMill: true,
                isDoubleMill: true,
              });
            } else {
              moves.push({
                type: 'place',
                to: toId,
                capturePointId: cap1,
                isMill: true,
                isDoubleMill: true,
              });
            }
          }
        }
      } else if (newlyFormed.length === 1) {
        // SINGLE MILL: 1 Capture Earned
        const capturables = getCapturablePoints(oppPlayer, simBoard);
        if (capturables.length === 0) {
          moves.push({ type: 'place', to: toId, isMill: true });
        } else {
          const ranked = rankCapturesByStrategicValue(capturables, oppPlayer, simBoard, phase);
          for (const capId of ranked) {
            moves.push({ type: 'place', to: toId, capturePointId: capId, isMill: true });
          }
        }
      } else {
        moves.push({ type: 'place', to: toId });
      }
    }

    return moves;
  }

  // B. MOVING PHASE (Directly connected adjacent empty nodes only - No flying/jumping)
  const playerPieces = (Object.values(board) as BoardPoint[])
    .filter((p) => p.piece === player)
    .map((p) => p.id);

  for (const fromId of playerPieces) {
    const legalTargets = getLegalMovesForPoint(fromId, board, phase);

    for (const toId of legalTargets) {
      // Validate strict adjacency
      if (!board[fromId]?.adjacent.includes(toId) || board[toId]?.piece !== null) {
        continue;
      }

      // Simulate move
      const simBoard = cloneBoard(board);
      simBoard[fromId] = { ...simBoard[fromId], piece: null };
      simBoard[toId] = { ...simBoard[toId], piece: player };

      const newlyFormed = detectNewlyFormedMills(player, board, simBoard, toId);

      if (newlyFormed.length >= 2) {
        // DOUBLE MILL: 2 Captures Earned
        const capturables = getCapturablePoints(oppPlayer, simBoard);
        if (capturables.length === 0) {
          moves.push({ type: 'move', from: fromId, to: toId, isMill: true, isDoubleMill: true });
        } else if (capturables.length === 1) {
          moves.push({
            type: 'move',
            from: fromId,
            to: toId,
            capturePointId: capturables[0],
            isMill: true,
            isDoubleMill: true,
          });
        } else {
          const ranked1 = rankCapturesByStrategicValue(capturables, oppPlayer, simBoard, phase);
          const topFirst = ranked1.slice(0, 3);
          for (const cap1 of topFirst) {
            const simBoard2 = cloneBoard(simBoard);
            simBoard2[cap1] = { ...simBoard2[cap1], piece: null };
            const capturables2 = getCapturablePoints(oppPlayer, simBoard2);
            if (capturables2.length > 0) {
              const ranked2 = rankCapturesByStrategicValue(capturables2, oppPlayer, simBoard2, phase);
              const cap2 = ranked2[0] || capturables2[0];
              moves.push({
                type: 'move',
                from: fromId,
                to: toId,
                capturePointId: cap1,
                secondCapturePointId: cap2,
                isMill: true,
                isDoubleMill: true,
              });
            } else {
              moves.push({
                type: 'move',
                from: fromId,
                to: toId,
                capturePointId: cap1,
                isMill: true,
                isDoubleMill: true,
              });
            }
          }
        }
      } else if (newlyFormed.length === 1) {
        // SINGLE MILL: 1 Capture Earned
        const capturables = getCapturablePoints(oppPlayer, simBoard);
        if (capturables.length === 0) {
          moves.push({ type: 'move', from: fromId, to: toId, isMill: true });
        } else {
          const ranked = rankCapturesByStrategicValue(capturables, oppPlayer, simBoard, phase);
          for (const capId of ranked) {
            moves.push({
              type: 'move',
              from: fromId,
              to: toId,
              capturePointId: capId,
              isMill: true,
            });
          }
        }
      } else {
        moves.push({ type: 'move', from: fromId, to: toId });
      }
    }
  }

  return moves;
}

// -------------------------------------------------------------
// MOVE ORDERING HEURISTICS (PVS & Alpha-Beta Acceleration)
// -------------------------------------------------------------
export function orderMoves(
  moves: AtomicMove[],
  board: Record<string, BoardPoint>,
  player: PlayerId,
  oppPlayer: PlayerId,
  phase: GamePhase,
  depth: number,
  pvMove?: AtomicMove,
  profile?: AiProfile
): AtomicMove[] {
  const killers = killerMoves[depth] || [null, null];
  const oppWinningPoints = findWinningPlacements(oppPlayer, board);
  const oppTwoInRows = countTwoInARows(oppPlayer, board).openPoints;
  const defAwareness = profile?.defensiveAwareness ?? 1.0;
  const posAwareness = profile?.positionalAwareness ?? 1.0;

  return moves.map((move) => {
    let orderScore = 0;

    // 1. PV Move from Transposition Table
    if (pvMove && move.from === pvMove.from && move.to === pvMove.to && move.capturePointId === pvMove.capturePointId) {
      orderScore += 1000000;
    }

    // 2. Immediate Double Mill vs Single Mill Formation
    if (move.isDoubleMill) {
      orderScore += 120000;
      if (move.capturePointId) {
        orderScore += (SOTHO_POSITIONAL_WEIGHTS[move.capturePointId] || 10) * 12;
      }
      if (move.secondCapturePointId) {
        orderScore += (SOTHO_POSITIONAL_WEIGHTS[move.secondCapturePointId] || 10) * 12;
      }
    } else if (move.isMill) {
      orderScore += 50000;
      if (move.capturePointId) {
        orderScore += (SOTHO_POSITIONAL_WEIGHTS[move.capturePointId] || 10) * 10;
        if (move.capturePointId === 'd4') orderScore += 5000;
      }
    }

    // 3. Defensive Block of Opponent's Immediate Mill (scaled by profile defensive awareness)
    if (oppWinningPoints.includes(move.to)) {
      orderScore += 35000 * defAwareness;
    }

    // 4. Defensive Block of Opponent 2-in-a-row (scaled by profile defensive awareness)
    if (oppTwoInRows.includes(move.to)) {
      orderScore += 15000 * defAwareness;
    }

    // 5. Killer Move Heuristic
    if (killers[0] && move.from === killers[0].from && move.to === killers[0].to) {
      orderScore += 8000;
    } else if (killers[1] && move.from === killers[1].from && move.to === killers[1].to) {
      orderScore += 6000;
    }

    // 6. Center Hub & Positional Value (scaled by profile positional awareness)
    orderScore += (SOTHO_POSITIONAL_WEIGHTS[move.to] || 10) * 8 * posAwareness;

    // 7. History Heuristic
    const histKey = getMoveHistoryKey(move);
    orderScore += (historyTable[histKey] || 0) * 0.1;

    return { ...move, score: orderScore };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

// -------------------------------------------------------------
// ATOMIC STATE APPLICATION & SIMULATION
// -------------------------------------------------------------
export interface SimState {
  board: Record<string, BoardPoint>;
  turn: PlayerId;
  phase: GamePhase;
  obsidianHand: number;
  ivoryHand: number;
  forcedOpening: ForcedOpeningState | null;
}

export function applyAtomicMove(state: SimState, move: AtomicMove, player: PlayerId): SimState {
  const nextBoard = cloneBoard(state.board);
  const oppPlayer: PlayerId = player === 'obsidian' ? 'ivory' : 'obsidian';

  let nextObsidianHand = state.obsidianHand;
  let nextIvoryHand = state.ivoryHand;

  // 1. Apply Placement or Movement
  if (move.type === 'place') {
    nextBoard[move.to] = { ...nextBoard[move.to], piece: player };
    if (player === 'obsidian') nextObsidianHand -= 1;
    else nextIvoryHand -= 1;
  } else {
    if (move.from) {
      nextBoard[move.from] = { ...nextBoard[move.from], piece: null };
    }
    nextBoard[move.to] = { ...nextBoard[move.to], piece: player };
  }

  // 2. Apply Captures (First & Optional Second for Double Mill)
  if (move.capturePointId && nextBoard[move.capturePointId]) {
    nextBoard[move.capturePointId] = { ...nextBoard[move.capturePointId], piece: null };
  }
  if (move.secondCapturePointId && nextBoard[move.secondCapturePointId]) {
    nextBoard[move.secondCapturePointId] = { ...nextBoard[move.secondCapturePointId], piece: null };
  }

  // 3. Determine Phase for Next Turn
  const pHand = player === 'obsidian' ? nextObsidianHand : nextIvoryHand;
  const oppHand = player === 'obsidian' ? nextIvoryHand : nextObsidianHand;
  const oppPieces = (Object.values(nextBoard) as BoardPoint[]).filter((p) => p.piece === oppPlayer).length;
  const nextPhase = determinePhase({ inHand: oppHand, onBoard: oppPieces });

  // 4. Check Forced Opening / Turn Transition
  let nextTurn: PlayerId = oppPlayer;
  let nextForcedOpening: ForcedOpeningState | null = null;

  if (nextPhase !== 'placing') {
    const oppHasMoves = checkPlayerHasLegalMoves(oppPlayer, nextBoard, nextPhase);
    if (!oppHasMoves && oppPieces >= 3) {
      // Opponent is trapped -> Sotho 25 FORCED OPENING triggered!
      nextTurn = player; // Opener moves again
      nextForcedOpening = {
        active: true,
        trappedPlayerId: oppPlayer,
        openingPlayerId: player,
        forcedOpeningMoveCount: (state.forcedOpening?.forcedOpeningMoveCount || 0) + 1,
        openingStartedAt: Date.now(),
        isStillTrapped: true,
      };
    }
  }

  return {
    board: nextBoard,
    turn: nextTurn,
    phase: nextPhase,
    obsidianHand: nextObsidianHand,
    ivoryHand: nextIvoryHand,
    forcedOpening: nextForcedOpening,
  };
}

// -------------------------------------------------------------
// QUIESCENCE SEARCH (Combatting Horizon Effect on Tactical Strikes)
// -------------------------------------------------------------
export function quiescenceSearch(
  state: SimState,
  alpha: number,
  beta: number,
  depth: number,
  maxQDepth: number,
  profile: AiProfile,
  aiPlayer: PlayerId
): number {
  const isAiTurn = state.turn === aiPlayer;
  const pHand = isAiTurn ? (aiPlayer === 'obsidian' ? state.obsidianHand : state.ivoryHand) : (aiPlayer === 'obsidian' ? state.ivoryHand : state.obsidianHand);
  const oppHand = isAiTurn ? (aiPlayer === 'obsidian' ? state.ivoryHand : state.obsidianHand) : (aiPlayer === 'obsidian' ? state.obsidianHand : state.ivoryHand);
  const oppPlayer: PlayerId = state.turn === 'obsidian' ? 'ivory' : 'obsidian';

  const standPat = evaluateBoardMaster(state.board, profile, aiPlayer, pHand, oppHand, state.phase, state.forcedOpening);

  if (depth >= maxQDepth) return standPat;

  if (isAiTurn) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  // Generate only tactical (mill-forming) candidate moves in quiescence
  const allMoves = generateAtomicMoves(state.board, state.turn, pHand, state.phase, oppPlayer, oppHand, state.forcedOpening, profile);
  const tacticalMoves = allMoves.filter((m) => m.isMill);

  if (tacticalMoves.length === 0) return standPat;

  const orderedMoves = orderMoves(tacticalMoves, state.board, state.turn, oppPlayer, state.phase, depth, undefined, profile);

  if (isAiTurn) {
    let maxEval = standPat;
    for (const move of orderedMoves) {
      const nextState = applyAtomicMove(state, move, state.turn);
      const score = quiescenceSearch(nextState, alpha, beta, depth + 1, maxQDepth, profile, aiPlayer);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = standPat;
    for (const move of orderedMoves) {
      const nextState = applyAtomicMove(state, move, state.turn);
      const score = quiescenceSearch(nextState, alpha, beta, depth + 1, maxQDepth, profile, aiPlayer);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// -------------------------------------------------------------
// ITERATIVE DEEPENING NEGAMAX / PRINCIPAL VARIATION SEARCH
// -------------------------------------------------------------
export interface SearchContext {
  profile: AiProfile;
  aiPlayer: PlayerId;
  startTime: number;
  timeBudgetMs: number;
  nodes: number;
  aborted: boolean;
  seed?: number;
}

export function searchPVS(
  state: SimState,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext,
  extensions: number = 0
): number {
  context.nodes++;

  // Time check every 2048 nodes
  if ((context.nodes & 2047) === 0 && performance.now() - context.startTime > context.timeBudgetMs) {
    context.aborted = true;
    return 0;
  }

  const isAiTurn = state.turn === context.aiPlayer;
  const pHand = isAiTurn ? (context.aiPlayer === 'obsidian' ? state.obsidianHand : state.ivoryHand) : (context.aiPlayer === 'obsidian' ? state.ivoryHand : state.obsidianHand);
  const oppHand = isAiTurn ? (context.aiPlayer === 'obsidian' ? state.ivoryHand : state.obsidianHand) : (context.aiPlayer === 'obsidian' ? state.obsidianHand : state.ivoryHand);
  const oppPlayer: PlayerId = state.turn === 'obsidian' ? 'ivory' : 'obsidian';

  const hash = computeZobristHash(state.board, state.turn, state.phase, !!state.forcedOpening?.active, state.obsidianHand, state.ivoryHand, context.seed);

  // Transposition Table Probe
  const ttEntry = globalTT.get(hash);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === TTFlag.EXACT) return ttEntry.score;
    if (ttEntry.flag === TTFlag.LOWERBOUND && ttEntry.score >= beta) return ttEntry.score;
    if (ttEntry.flag === TTFlag.UPPERBOUND && ttEntry.score <= alpha) return ttEntry.score;
  }

  // Tactical Search Extensions (capped by profile.tacticalExtensionLimit)
  let effectiveDepth = depth;
  if (extensions < context.profile.tacticalExtensionLimit) {
    const oppPieces = (Object.values(state.board) as BoardPoint[]).filter((p) => p.piece === oppPlayer).length;
    const hasDoubleThreat = detectForks(state.turn, state.board).forkCount > 0;
    if (hasDoubleThreat || state.forcedOpening?.active || (oppPieces <= 4 && state.phase !== 'placing')) {
      effectiveDepth += 1;
      extensions += 1;
    }
  }

  // Base Condition: Leaf Node or Quiescence Search
  if (effectiveDepth <= 0) {
    return quiescenceSearch(state, alpha, beta, 0, context.profile.quiescenceDepth, context.profile, context.aiPlayer);
  }

  // Move Generation
  const rawMoves = generateAtomicMoves(state.board, state.turn, pHand, state.phase, oppPlayer, oppHand, state.forcedOpening, context.profile);

  if (rawMoves.length === 0) {
    // No legal moves
    if (state.phase === 'placing') return 0;
    // In Sotho 25, zero moves initiates forced opening if handled, or evaluates to severe mobility penalty
    return isAiTurn ? -80000 : 80000;
  }

  const orderedMoves = orderMoves(rawMoves, state.board, state.turn, oppPlayer, state.phase, depth, ttEntry?.bestMove, context.profile);

  let bestMove: AtomicMove = orderedMoves[0];
  let bestScore = isAiTurn ? -Infinity : Infinity;
  let flag = TTFlag.UPPERBOUND;

  let firstMove = true;

  for (const move of orderedMoves) {
    const nextState = applyAtomicMove(state, move, state.turn);
    let score = 0;

    if (firstMove) {
      // Full window search for principal variation move
      score = searchPVS(nextState, effectiveDepth - 1, alpha, beta, context, extensions);
      firstMove = false;
    } else {
      // Null window search (PVS)
      if (isAiTurn) {
        score = searchPVS(nextState, effectiveDepth - 1, alpha, alpha + 1, context, extensions);
        if (score > alpha && score < beta) {
          // Re-search with full window if failed high
          score = searchPVS(nextState, effectiveDepth - 1, score, beta, context, extensions);
        }
      } else {
        score = searchPVS(nextState, effectiveDepth - 1, beta - 1, beta, context, extensions);
        if (score < beta && score > alpha) {
          score = searchPVS(nextState, effectiveDepth - 1, alpha, score, context, extensions);
        }
      }
    }

    if (context.aborted) return 0;

    if (isAiTurn) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) {
        alpha = score;
        flag = TTFlag.EXACT;
      }
      if (alpha >= beta) {
        // Beta Cutoff
        flag = TTFlag.LOWERBOUND;
        const killers = killerMoves[depth] || [null, null];
        if (killers[0]?.to !== move.to || killers[0]?.from !== move.from) {
          killerMoves[depth] = [move, killers[0]];
        }
        updateHistory(move, depth);
        break;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score < beta) {
        beta = score;
        flag = TTFlag.EXACT;
      }
      if (beta <= alpha) {
        flag = TTFlag.UPPERBOUND;
        updateHistory(move, depth);
        break;
      }
    }
  }

  // Store in Transposition Table
  globalTT.store(hash, depth, bestScore, flag, bestMove);

  return bestScore;
}

// -------------------------------------------------------------
// MASTER SEARCH DISPATCHER (Iterative Deepening & Blunder Modeling)
// -------------------------------------------------------------
export function searchBestAtomicMove(
  gameState: GameState,
  profile: AiProfile,
  aiPlayer: PlayerId,
  seed?: number
): SearchResult {
  const oppPlayer: PlayerId = aiPlayer === 'obsidian' ? 'ivory' : 'obsidian';
  const pHand = aiPlayer === 'obsidian' ? gameState.obsidian.inHand : gameState.ivory.inHand;
  const oppHand = aiPlayer === 'obsidian' ? gameState.ivory.inHand : gameState.obsidian.inHand;

  // Configure TT size for this profile
  globalTT.resize(profile.transpositionTableSize);

  // Initialize Simulation Root State
  const rootState: SimState = {
    board: cloneBoard(gameState.points),
    turn: gameState.turn,
    phase: gameState.phase,
    obsidianHand: gameState.obsidian.inHand,
    ivoryHand: gameState.ivory.inHand,
    forcedOpening: gameState.forcedOpening,
  };

  const context: SearchContext = {
    profile,
    aiPlayer,
    startTime: performance.now(),
    timeBudgetMs: profile.timeBudgetMs,
    nodes: 0,
    aborted: false,
    seed,
  };

  // Generate Root Moves
  const rootMoves = generateAtomicMoves(rootState.board, aiPlayer, pHand, rootState.phase, oppPlayer, oppHand, rootState.forcedOpening, profile);

  if (rootMoves.length === 0) {
    return { decision: null, bestMove: null, score: 0, depth: 0, nodes: 0 };
  }

  if (rootMoves.length === 1) {
    const move = rootMoves[0];
    const decision: AiDecision = {
      type: move.type === 'place' ? 'place' : (gameState.selectedPointId ? 'move' : 'select'),
      pointId: gameState.selectedPointId ? move.to : (move.type === 'place' ? move.to : (move.from || move.to)),
      sourceId: move.from,
      plannedCapturePointId: move.capturePointId,
      reason: 'Only legal option',
    };
    return { decision, bestMove: move, score: 0, depth: 1, nodes: 1 };
  }

  let finalBestMove: AtomicMove = rootMoves[0];
  let finalScore = 0;
  let depthReached = 1;

  // Root Candidate Scored Move List
  const rootCandidateScores: { move: AtomicMove; score: number }[] = [];

  // Iterative Deepening from depth 1 to profile.maxDepth
  for (let d = 1; d <= profile.maxDepth; d++) {
    let bestMoveAtDepth: AtomicMove = finalBestMove;
    let bestScoreAtDepth = -Infinity;

    const orderedRootMoves = orderMoves(rootMoves, rootState.board, aiPlayer, oppPlayer, rootState.phase, d, finalBestMove, profile);

    rootCandidateScores.length = 0;

    for (const move of orderedRootMoves) {
      const nextState = applyAtomicMove(rootState, move, aiPlayer);
      const score = searchPVS(nextState, d - 1, -Infinity, Infinity, context);

      if (context.aborted) break;

      rootCandidateScores.push({ move, score });

      if (score > bestScoreAtDepth) {
        bestScoreAtDepth = score;
        bestMoveAtDepth = move;
      }
    }

    if (context.aborted && d > 1) {
      // Use best move from last completed iteration
      break;
    }

    finalBestMove = bestMoveAtDepth;
    finalScore = bestScoreAtDepth;
    depthReached = d;

    // Early exit if decisive win proven
    if (finalScore >= 90000) break;
  }

  // -----------------------------------------------------------
  // IMPERFECTION / HUMAN-LIKE ERROR MODELING FOR TIERS 1–3
  // -----------------------------------------------------------
  if (profile.imperfectionRate > 0 && rootCandidateScores.length > 1) {
    const shouldBlunder = Math.random() < profile.imperfectionRate;
    if (shouldBlunder) {
      // Sort candidates by score descending
      rootCandidateScores.sort((a, b) => b.score - a.score);
      // Pick within the candidate window constrained by maximumAllowedCentipawnLoss
      const allowedCandidates = rootCandidateScores.slice(0, profile.candidateMoveWindow).filter(
        (c) => finalScore - c.score <= profile.maximumAllowedCentipawnLoss
      );
      if (allowedCandidates.length > 0) {
        const picked = allowedCandidates[Math.floor(Math.random() * allowedCandidates.length)];
        finalBestMove = picked.move;
        finalScore = picked.score;
      }
    }
  }

  // Convert atomic move into interactive game step
  let decision: AiDecision;

  if (finalBestMove.type === 'place') {
    decision = {
      type: 'place',
      pointId: finalBestMove.to,
      plannedCapturePointId: finalBestMove.capturePointId,
      evalScore: finalScore,
      reason: finalBestMove.isMill ? 'Constructing decisive mill' : 'Positional placement',
    };
  } else {
    // Movement
    if (!gameState.selectedPointId) {
      // Needs selection step first
      decision = {
        type: 'select',
        pointId: finalBestMove.from || finalBestMove.to,
        plannedCapturePointId: finalBestMove.capturePointId,
        evalScore: finalScore,
        reason: 'Targeting prime maneuver',
      };
    } else {
      // Already selected - Execute move
      decision = {
        type: 'move',
        pointId: finalBestMove.to,
        sourceId: finalBestMove.from,
        plannedCapturePointId: finalBestMove.capturePointId,
        evalScore: finalScore,
        reason: 'Optimal maneuver execution',
      };
    }
  }

  return {
    decision,
    bestMove: finalBestMove,
    score: finalScore,
    depth: depthReached,
    nodes: context.nodes,
  };
}

// -------------------------------------------------------------
// MAIN ENTRY POINT FOR APP & WORKER CALLS (getAiMove & getAiAtomicMove)
// -------------------------------------------------------------
export function getAiAtomicMove(
  gameState: GameState,
  stageId: DifficultyStageId
): { move: AtomicMove | null; decision: AiDecision | null } {
  const stage = DIFFICULTY_STAGES[stageId] || DIFFICULTY_STAGES.matenase;
  const profile = stage.profile || AI_PROFILES[stageId] || AI_PROFILES.matenase;
  const aiPlayer: PlayerId = gameState.turn;

  // A. CAPTURE / SHOOTING PHASE
  if (gameState.phase === 'shooting') {
    const capturables = getCapturablePoints('obsidian', gameState.points);
    if (capturables.length === 0) return { move: null, decision: null };

    const chosenId = selectAiCapture(capturables, 'obsidian', gameState.points, gameState.phase, profile);

    const decision: AiDecision = {
      type: 'shoot',
      pointId: chosenId,
      reason: 'Strategic tactical capture',
    };

    const move: AtomicMove = {
      type: 'place',
      to: chosenId,
      capturePointId: chosenId,
    };

    return { move, decision };
  }

  // B. ATOMIC SEARCH FOR PLACING, MOVING, FLYING
  const result = searchBestAtomicMove(gameState, profile, aiPlayer);
  return {
    move: result.bestMove,
    decision: result.decision,
  };
}

export function getAiMove(gameState: GameState, stageId: DifficultyStageId): AiDecision | null {
  const { decision } = getAiAtomicMove(gameState, stageId);
  return decision;
}
