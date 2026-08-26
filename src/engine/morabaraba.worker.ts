import { GameState, DifficultyStageId, BoardPoint, PlayerId, GamePhase, AiProfile, AtomicMove } from '../types';
import { DIFFICULTY_STAGES, AI_PROFILES } from '../constants/stages';
import {
  ALL_MILLS,
  checkMillsForPoint,
  isPieceInMill,
  getCapturablePoints,
  getLegalMovesForPoint,
  determinePhase,
  checkPlayerHasLegalMoves,
  resolveTurnTransitionAfterMove,
} from './morabaraba';
import { evaluateBoardMaster, searchBestAtomicMove, AiDecision } from './aiEngine';

export interface WorkerSearchRequest {
  id: string;
  state: GameState;
  profile: AiProfile;
  stageId: DifficultyStageId;
  aiPlayer: PlayerId;
  seed?: number;
}

export interface WorkerSearchResponse {
  id: string;
  decision: AiDecision | null;
  bestAtomicMove?: AtomicMove | null;
  evalScore: number;
  depthReached: number;
  nodesSearched: number;
  timeMs: number;
}

self.onmessage = (event: MessageEvent<WorkerSearchRequest>) => {
  const req = event.data;
  if (!req || !req.state) return;

  const startTime = performance.now();
  const result = searchBestAtomicMove(
    req.state,
    req.profile || AI_PROFILES[req.stageId] || AI_PROFILES.matenase,
    req.aiPlayer,
    req.seed
  );
  const timeMs = performance.now() - startTime;

  const response: WorkerSearchResponse = {
    id: req.id,
    decision: result.decision,
    bestAtomicMove: result.bestMove,
    evalScore: result.score,
    depthReached: result.depth,
    nodesSearched: result.nodes,
    timeMs,
  };

  self.postMessage(response);
};
