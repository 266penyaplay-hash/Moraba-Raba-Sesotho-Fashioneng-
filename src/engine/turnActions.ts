import { GameState, MillDefinition, PlayerId } from '../types';
import {
  checkGrandMeridianLine,
  detectNewlyFormedMills,
  determinePhase,
  getCapturablePoints,
  resolveTurnTransitionAfterMove,
  validateMove,
} from './morabaraba';

function withMillShootingState(
  state: GameState,
  player: PlayerId,
  destPointId: string,
  formedMills: MillDefinition[],
  historyEntry: GameState['history'][number]
): GameState {
  const millLines = formedMills.map((m) => m.points);
  const isDoubleMill = formedMills.length >= 2;
  const meridian = isDoubleMill
    ? checkGrandMeridianLine(destPointId, player, state.points, formedMills)
    : { isGrandMeridian: false, axis: null, points: [] as string[], title: '' };
  const meridianPoints = meridian.points || [];
  const isGrand = isDoubleMill && meridian.isGrandMeridian;

  return {
    ...state,
    turn: player,
    phase: 'shooting',
    selectedPointId: null,
    validTargets: [],
    flashMill: formedMills[0].points,
    activeMillLines: millLines,
    isDoubleMill,
    isGrandMeridian: isGrand,
    grandMeridianAxis: meridian.axis,
    grandMeridianPoints: meridianPoints,
    capturesRemaining: isDoubleMill ? 2 : 1,
    totalCapturesInSequence: isDoubleMill ? 2 : 1,
    doubleMillAnimation: isDoubleMill
      ? {
          active: true,
          player,
          centerPointId: destPointId,
          mills: millLines,
          stage: 'drawing',
          isGrandMeridian: isGrand,
          meridianAxis: meridian.axis,
          meridianPoints,
        }
      : null,
    statusMessage: isGrand
      ? `${meridian.title || 'GRAND HORIZON DOUBLE MILL'} · CAPTURE 1 OF 2`
      : isDoubleMill
        ? 'SMOOTH DOUBLE MILL · CAPTURE 1 OF 2'
        : 'Mill formed. Choose one opposing token.',
    history: [...state.history, { ...historyEntry, millFormed: true, doubleMill: isDoubleMill, grandMeridian: isGrand }],
  };
}

export function shootingTargetsFor(state: GameState): string[] {
  if (state.phase !== 'shooting') return [];
  const opponent: PlayerId = state.turn === 'obsidian' ? 'ivory' : 'obsidian';
  return getCapturablePoints(opponent, state.points);
}

export function applyPlaceToGameState(state: GameState, pointId: string): GameState {
  if (state.winner || state.phase !== 'placing') return state;

  const player = state.turn;
  const point = state.points[pointId];
  if (!point || point.piece !== null) return state;
  if (state[player].inHand <= 0) return state;

  const pointsBefore = state.points;
  const newPoints = { ...state.points, [pointId]: { ...point, piece: player } };
  const curPlayerState = {
    ...state[player],
    inHand: state[player].inHand - 1,
    onBoard: state[player].onBoard + 1,
  };

  const formedMills = detectNewlyFormedMills(player, pointsBefore, newPoints, pointId);
  const next: GameState = {
    ...state,
    points: newPoints,
    [player]: curPlayerState,
    moveCount: state.moveCount + 1,
    selectedPointId: null,
    validTargets: [],
    flashMill: null,
    activeMillLines: [],
    isDoubleMill: false,
    isGrandMeridian: false,
    grandMeridianAxis: null,
    grandMeridianPoints: [],
    capturesRemaining: 0,
    doubleMillAnimation: null,
  };

  if (formedMills.length > 0) {
    return withMillShootingState(next, player, pointId, formedMills, {
      to: pointId,
      player,
      type: 'place',
    });
  }

  return resolveTurnTransitionAfterMove(
    {
      ...next,
      phase: determinePhase(curPlayerState),
      history: [...state.history, { to: pointId, player, type: 'place' }],
    },
    player
  );
}

export function applyMoveToGameState(state: GameState, fromId: string, toId: string): GameState {
  if (state.winner || state.phase !== 'moving') return state;

  const player = state.turn;
  const validation = validateMove(fromId, toId, player, state.turn, state.points);
  if (!validation.valid) return state;

  const pointsBefore = state.points;
  const newPoints = {
    ...state.points,
    [fromId]: { ...state.points[fromId], piece: null },
    [toId]: { ...state.points[toId], piece: player },
  };

  const formedMills = detectNewlyFormedMills(player, pointsBefore, newPoints, toId);
  const next: GameState = {
    ...state,
    points: newPoints,
    moveCount: state.moveCount + 1,
    selectedPointId: null,
    validTargets: [],
    flashMill: null,
    activeMillLines: [],
    isDoubleMill: false,
    isGrandMeridian: false,
    grandMeridianAxis: null,
    grandMeridianPoints: [],
    capturesRemaining: 0,
    doubleMillAnimation: null,
  };

  if (formedMills.length > 0) {
    return withMillShootingState(next, player, toId, formedMills, {
      from: fromId,
      to: toId,
      player,
      type: 'move',
    });
  }

  return resolveTurnTransitionAfterMove(
    {
      ...next,
      history: [...state.history, { from: fromId, to: toId, player, type: 'move' }],
    },
    player
  );
}
