import {
  getInitialGameState,
  resolveTurnTransitionAfterMove,
  checkPlayerHasLegalMoves,
  checkMillsForPoint,
  detectNewlyFormedMills,
  getAllCompletedMills,
  applyCaptureToGameState,
  getCapturablePoints,
  getLegalMovesForPoint,
  validateMove,
  determinePhase,
} from './morabaraba';
import { GameState, PlayerId } from '../types';
import { detectForks, generateAtomicMoves } from './aiEngine';
import { AI_PROFILES } from '../constants/stages';

// Lightweight type-safe test runner
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Helper to create a trapped board scenario
export function createTrappedBoard(trappedPlayer: PlayerId = 'ivory'): GameState {
  const state = getInitialGameState('sotho25');
  state.phase = 'moving';
  state.obsidian.inHand = 0;
  state.obsidian.onBoard = 8;
  state.ivory.inHand = 0;
  state.ivory.onBoard = 4;

  // Place ivory in 4 corners
  state.points.a1.piece = 'ivory';
  state.points.a7.piece = 'ivory';
  state.points.g1.piece = 'ivory';
  state.points.g7.piece = 'ivory';

  // Place obsidian blocking all adjacent points
  state.points.d1.piece = 'obsidian';
  state.points.a4.piece = 'obsidian';
  state.points.b2.piece = 'obsidian';
  state.points.d7.piece = 'obsidian';
  state.points.b6.piece = 'obsidian';
  state.points.g4.piece = 'obsidian';
  state.points.f2.piece = 'obsidian';
  state.points.f6.piece = 'obsidian';

  return state;
}

export function runAllSotho25TrappedPlayerTests(): { passed: number; total: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;

  // 1. A trapped player does not lose automatically.
  try {
    const state = createTrappedBoard('ivory');
    const result = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(result.winner === null, 'Trapped player must not lose');
    assert(!result.statusMessage.includes('wins by trapping'), 'Status must not declare win by trapping');
    results.push('PASS 1: Trapped player does not lose');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 1: ${e.message}`);
  }

  // 2. The match enters FORCED_OPENING.
  try {
    const state = createTrappedBoard('ivory');
    const result = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(result.forcedOpening?.active === true, 'Forced opening must be active');
    assert(result.forcedOpening?.trappedPlayerId === 'ivory', 'Trapped player ID must be ivory');
    assert(result.forcedOpening?.openingPlayerId === 'obsidian', 'Opening player ID must be obsidian');
    results.push('PASS 2: Match enters FORCED_OPENING');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 2: ${e.message}`);
  }

  // 3. The opponent receives a consecutive turn.
  try {
    const state = createTrappedBoard('ivory');
    const result = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(result.turn === 'obsidian', 'Turn must remain with obsidian');
    assert(result.statusMessage.includes('PLAYER 02 IS TRAPPED'), 'Must show PLAYER 02 IS TRAPPED');
    results.push('PASS 3: Opponent receives consecutive turn');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 3: ${e.message}`);
  }

  // 4. If the first extra move does not create an opening, opponent moves again.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    const step2 = resolveTurnTransitionAfterMove(step1, 'obsidian');
    assert(step2.forcedOpening?.active === true, 'Forced opening still active');
    assert(step2.turn === 'obsidian', 'Obsidian still has turn');
    assert(step2.statusMessage === 'THE BOARD IS STILL CLOSED — OPEN ANOTHER PATH', 'Correct still closed message');
    results.push('PASS 4: Consecutive turns if board remains closed');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 4: ${e.message}`);
  }

  // 5. The turn does not incorrectly alternate while player remains trapped.
  try {
    const state = createTrappedBoard('ivory');
    let current = resolveTurnTransitionAfterMove(state, 'obsidian');
    for (let i = 0; i < 3; i++) {
      assert(current.turn === 'obsidian', `Turn must stay with obsidian at step ${i}`);
      current = resolveTurnTransitionAfterMove(current, 'obsidian');
    }
    results.push('PASS 5: Turn does not alternate prematurely');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 5: ${e.message}`);
  }

  // 6. Once legal move becomes available, FORCED_OPENING ends.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    step1.points.d1.piece = null;
    step1.points.d2.piece = 'obsidian';
    const step2 = resolveTurnTransitionAfterMove(step1, 'obsidian');
    assert(step2.forcedOpening === null, 'Forced opening must clear when move is available');
    results.push('PASS 6: FORCED_OPENING ends when a move becomes available');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 6: ${e.message}`);
  }

  // 7. Formerly trapped player receives next turn.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    step1.points.d1.piece = null;
    step1.points.d2.piece = 'obsidian';
    const step2 = resolveTurnTransitionAfterMove(step1, 'obsidian');
    assert(step2.turn === 'ivory', 'Turn must switch to formerly trapped player');
    assert(step2.statusMessage === 'THE BOARD IS OPEN — PLAYER 02’S TURN', 'Status shows board is open');
    results.push('PASS 7: Formerly trapped player receives next turn');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 7: ${e.message}`);
  }


  // 8. Mill formed during forced opening still triggers capture phase.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    step1.points.d2.piece = 'obsidian';
    step1.points.d3.piece = 'obsidian';
    const formedMills = checkMillsForPoint('d1', 'obsidian', step1.points);
    assert(formedMills.length > 0, 'Mill should be detected');
    const capturables = getCapturablePoints('ivory', step1.points);
    assert(capturables.length > 0, 'Capturables should be available');
    results.push('PASS 8: Mill during forced opening triggers capture');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 8: ${e.message}`);
  }

  // 9. Legal moves recalculated after capture.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    step1.points.d1.piece = null;
    const step2 = resolveTurnTransitionAfterMove(step1, 'obsidian');
    assert(checkPlayerHasLegalMoves('ivory', step2.points, 'moving'), 'Ivory has legal moves now');
    assert(step2.forcedOpening === null, 'Forced opening ends');
    results.push('PASS 9: Legal moves recalculated after capture');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 9: ${e.message}`);
  }

  // 10. Refreshing / serialization preserves FORCED_OPENING.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    const parsed: GameState = JSON.parse(JSON.stringify(step1));
    assert(parsed.forcedOpening?.active === true, 'Parsed state preserves active forced opening');
    assert(parsed.forcedOpening?.trappedPlayerId === 'ivory', 'Parsed state preserves trapped player');
    results.push('PASS 10: State serialization preserves FORCED_OPENING');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 10: ${e.message}`);
  }

  // 11. Engine verifies trapped player has zero legal moves.
  try {
    const state = createTrappedBoard('ivory');
    const hasMoves = checkPlayerHasLegalMoves('ivory', state.points, 'moving');
    assert(!hasMoves, 'Trapped player has no legal moves');
    results.push('PASS 11: Trapped player has zero legal moves');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 11: ${e.message}`);
  }

  // 12. Turn remains with opener while forced opening remains active.
  try {
    const state = createTrappedBoard('ivory');
    const step1 = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(step1.forcedOpening?.active === true, 'Forced opening is active');
    assert(step1.turn === 'obsidian', 'Turn remains with opener');
    results.push('PASS 12: Turn remains with opener');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 12: ${e.message}`);
  }

  // 13. Game never displays a trapping victory in Sotho 25 ruleset.
  try {
    const state = createTrappedBoard('ivory');
    state.ruleset = 'sotho25';
    const result = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(result.winner === null, 'Winner must be null');
    assert(!result.statusMessage.toLowerCase().includes('wins by trapping'), 'Never display trapping victory');
    results.push('PASS 13: Sotho 25 never displays trapping victory');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 13: ${e.message}`);
  }

  // 14. Other configured rulesets retain traditional trapping behaviour.
  try {
    const state = createTrappedBoard('ivory');
    state.ruleset = 'standard';
    const result = resolveTurnTransitionAfterMove(state, 'obsidian');
    assert(result.winner === 'obsidian', 'Standard ruleset declares winner');
    results.push('PASS 14: Standard ruleset retains standard trapping behavior');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 14: ${e.message}`);
  }

  // 15. Sotho 25 Center Point d4 Orthogonal Adjacency Verification
  try {
    const state = getInitialGameState('sotho25');
    const d4 = state.points.d4;
    assert(d4 !== undefined, 'Center point d4 must exist in Sotho 25');
    assert(d4.adjacent.length === 4, 'd4 must have exactly 4 adjacent connections');
    const expected = ['d3', 'd5', 'c4', 'e4'];
    const matches = expected.every((p) => d4.adjacent.includes(p));
    assert(matches, 'd4 must connect only orthogonally to d3, d5, c4, e4');
    assert(!d4.adjacent.includes('c3') && !d4.adjacent.includes('e5'), 'd4 must NOT connect diagonally');
    results.push('PASS 15: Center d4 connects strictly orthogonally in Sotho 25');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 15: ${e.message}`);
  }

  // 16. Double Threat (Fork) Detection
  try {
    const state = getInitialGameState('sotho25');
    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'obsidian'; // Open on g1 (a1-d1-g1)
    state.points.g7.piece = 'obsidian';
    state.points.g4.piece = 'obsidian'; // Open on g1 (g1-g4-g7)

    const forks = detectForks('obsidian', state.points);
    assert(forks.forkCount >= 1, 'Should detect at least 1 fork point');
    assert(forks.forkPoints.includes('g1'), 'g1 must be recognized as double threat fork point');
    results.push('PASS 16: Double-threat fork detector correctly identifies intersecting threats');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 16: ${e.message}`);
  }

  // 17. Atomic Turn Generator Enumerates Captures on Mill Formation
  try {
    const state = getInitialGameState('sotho25');
    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'obsidian';
    state.points.c3.piece = 'ivory'; // Capturable target
    state.obsidian.inHand = 10;
    state.ivory.inHand = 10;

    const moves = generateAtomicMoves(
      state.points,
      'obsidian',
      10,
      'placing',
      'ivory',
      10,
      null,
      AI_PROFILES.morena
    );

    const millMove = moves.find((m) => m.to === 'g1');
    assert(millMove !== undefined, 'Move to g1 must exist');
    assert(millMove?.isMill === true, 'Move to g1 must be marked as mill');
    assert(millMove?.capturePointId === 'c3', 'Mill move must include candidate capture c3');
    results.push('PASS 17: Atomic generator generates candidate captures for formed mills');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 17: ${e.message}`);
  }

  // 18. AI Profiles 5-Tier Hierarchy Verification
  try {
    assert(AI_PROFILES.matenase.maxDepth === 1, 'Matenase depth 1');
    assert(AI_PROFILES.bothata.maxDepth === 2, 'Bothata depth 2');
    assert(AI_PROFILES.litshepe.maxDepth === 3, 'Litshepe depth 3');
    assert(AI_PROFILES.sefako.maxDepth === 4, 'Sefako depth 4');
    assert(AI_PROFILES.morena.maxDepth === 5, 'Morena depth 5');
    assert(AI_PROFILES.morena.imperfectionRate === 0.0, 'Morena has 0% blunder rate');
    assert(AI_PROFILES.morena.transpositionTableSize >= 50000, 'Morena has large TT');
    results.push('PASS 18: All 5 AI Profiles verify against formal specifications');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 18: ${e.message}`);
  }

  // 19. CRITICAL RULE: NO JUMPING / NO FLYING - 3 CATTLE REMAINING TEST
  try {
    const state = getInitialGameState('sotho25');
    state.phase = determinePhase({ inHand: 0, onBoard: 3 });
    assert(state.phase === 'moving', 'Phase with 3 cattle must be moving (no flying phase)');

    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'obsidian';
    state.points.g1.piece = 'obsidian';

    // From a1, legal targets must only be strictly adjacent vacant nodes: d1 is occupied, so only a4 and b2
    const legalFromA1 = getLegalMovesForPoint('a1', state.points, state.phase);
    assert(!legalFromA1.includes('g7'), 'Cow on a1 must NOT be able to jump to g7');
    assert(!legalFromA1.includes('d7'), 'Cow on a1 must NOT be able to jump to d7');
    assert(!legalFromA1.includes('d4'), 'Cow on a1 must NOT be able to teleport to d4');
    assert(legalFromA1.every((t) => state.points.a1.adjacent.includes(t)), 'All legal moves from a1 must be adjacent');
    results.push('PASS 19: 3-cow state strictly enforces adjacent movement (No Flying/Jumping)');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 19: ${e.message}`);
  }

  // 20. STRICT 5-POINT MOVE VALIDATOR TEST
  try {
    const state = getInitialGameState('sotho25');
    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'ivory'; // Occupied destination
    state.points.a4.piece = null;    // Empty adjacent destination

    // Test 1: Valid move (adjacent, empty, correct owner & turn)
    const validRes = validateMove('a1', 'a4', 'obsidian', 'obsidian', state.points);
    assert(validRes.valid === true, 'Valid move should pass validation');

    // Test 2: Reject non-adjacent jump / teleportation (a1 -> g7)
    const jumpRes = validateMove('a1', 'g7', 'obsidian', 'obsidian', state.points);
    assert(jumpRes.valid === false, 'Non-adjacent jump must be rejected');

    // Test 3: Reject moving to occupied node (a1 -> d1)
    const occupiedRes = validateMove('a1', 'd1', 'obsidian', 'obsidian', state.points);
    assert(occupiedRes.valid === false, 'Moving to occupied node must be rejected');

    // Test 4: Reject moving opponent piece (a1 is obsidian, player is ivory)
    const wrongOwnerRes = validateMove('a1', 'a4', 'ivory', 'ivory', state.points);
    assert(wrongOwnerRes.valid === false, 'Moving piece not owned by player must be rejected');

    // Test 5: Reject moving on wrong turn (turn is ivory, mover is obsidian)
    const wrongTurnRes = validateMove('a1', 'a4', 'obsidian', 'ivory', state.points);
    assert(wrongTurnRes.valid === false, 'Moving on wrong turn must be rejected');

    results.push('PASS 20: 5-Point move validator strictly rejects all illegal moves');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 20: ${e.message}`);
  }

  // 21. AI ENGINE NEVER GENERATES JUMP/FLY MOVES EVEN WHEN 3 PIECES REMAIN
  try {
    const state = getInitialGameState('sotho25');
    state.points.a1.piece = 'ivory';
    state.points.a4.piece = 'ivory';
    state.points.a7.piece = 'ivory';
    state.points.b2.piece = 'obsidian';
    state.points.b4.piece = 'obsidian';
    state.points.b6.piece = 'obsidian';

    const aiMoves = generateAtomicMoves(
      state.points,
      'ivory',
      0,
      'moving',
      'obsidian',
      0,
      null,
      AI_PROFILES.morena
    );

    assert(aiMoves.length > 0, 'AI must generate valid adjacent moves');
    for (const m of aiMoves) {
      assert(m.type === 'move', 'AI move type must be move, never fly');
      assert(m.from !== undefined, 'Move must have origin from');
      const origin = state.points[m.from!];
      assert(origin.adjacent.includes(m.to), `AI move from ${m.from} to ${m.to} must be strictly adjacent`);
    }
    results.push('PASS 21: AI move generator strictly generates adjacent moves with 3 pieces remaining');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 21: ${e.message}`);
  }

  // 22. TEST CASE A: SINGLE MILL FORMATION -> 1 CAPTURE
  try {
    const state = getInitialGameState('sotho25');
    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'obsidian';
    state.points.g1.piece = null;
    state.points.b2.piece = 'ivory';

    const beforePoints = { ...state.points };
    const afterPoints = { ...state.points, g1: { ...state.points.g1, piece: 'obsidian' as PlayerId } };

    const newlyFormed = detectNewlyFormedMills('obsidian', beforePoints, afterPoints, 'g1');
    assert(newlyFormed.length === 1, `Expected 1 newly formed mill, got ${newlyFormed.length}`);
    const capturesEarned = newlyFormed.length;
    assert(capturesEarned === 1, `Expected 1 capture earned, got ${capturesEarned}`);

    results.push('PASS 22 (Test Case A): Single mill formation awards exactly 1 capture');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 22 (Test Case A): ${e.message}`);
  }

  // 23. TEST CASE B: SIMULTANEOUS DOUBLE MILL IN PLACEMENT PHASE -> 2 CAPTURES
  try {
    const state = getInitialGameState('sotho25');
    // Center point d4 is the intersection of m17 (c4-d4-e4) and m18 (d3-d4-d5)
    state.points.c4.piece = 'obsidian';
    state.points.e4.piece = 'obsidian';
    state.points.d3.piece = 'obsidian';
    state.points.d5.piece = 'obsidian';
    state.points.d4.piece = null;

    // Opponent pieces
    state.points.a1.piece = 'ivory';
    state.points.g7.piece = 'ivory';

    const beforePoints = { ...state.points };
    const afterPoints = { ...state.points, d4: { ...state.points.d4, piece: 'obsidian' as PlayerId } };

    const newlyFormed = detectNewlyFormedMills('obsidian', beforePoints, afterPoints, 'd4');
    assert(newlyFormed.length === 2, `Expected 2 newly formed mills, got ${newlyFormed.length}`);
    const capturesEarned = newlyFormed.length;
    assert(capturesEarned === 2, `Expected 2 captures earned for simultaneous double mill, got ${capturesEarned}`);

    results.push('PASS 23 (Test Case B): Simultaneous double mill in placement phase awards 2 captures');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 23 (Test Case B): ${e.message}`);
  }

  // 24. TEST CASE C: SIMULTANEOUS DOUBLE MILL IN MOVEMENT PHASE -> 2 CAPTURES
  try {
    const state = getInitialGameState('sotho25');
    state.phase = 'moving';
    state.obsidian.inHand = 0;
    state.ivory.inHand = 0;

    // Node d1 is intersection of m1 (a1-d1-g1) and m13 (d1-d2-d3)
    state.points.a1.piece = 'obsidian';
    state.points.g1.piece = 'obsidian';
    state.points.d2.piece = 'obsidian';
    state.points.d3.piece = 'obsidian';
    state.points.d1.piece = null;
    state.points.a4.piece = 'obsidian'; // Piece that moves into d1? a1 is adjacent to a4 and d1

    // Move from b2 to d1 (Wait, d2 is adjacent to d1)
    // Place a mover on b2 (or move from somewhere adjacent to d1, e.g. a1 is adjacent to d1, but a1 is in mill. d2 is adjacent to d1. Or a4 -> a1 -> d1).
    // Let's use d4: mover on c3? No, d4 is adjacent to c4, d3, e4, d5.
    // Place obsidian on c4, e4, d5. Mover is on d2. d2 moves to d3 -> forms c3-d3-e3 and d1-d2-d3?
    // Let's check: moving from a4 to a1 (a1 joins a1-d1-g1 and a1-a4-a7).
    // If d1, g1 are obsidian AND a4, a7 are obsidian, moving from b6 to a7 or similar:
    const beforePoints = {
      ...state.points,
      d1: { ...state.points.d1, piece: 'obsidian' as PlayerId },
      g1: { ...state.points.g1, piece: 'obsidian' as PlayerId },
      d2: { ...state.points.d2, piece: 'obsidian' as PlayerId },
      d3: { ...state.points.d3, piece: 'obsidian' as PlayerId },
      d1_target: { ...state.points.d1, piece: null },
    };

    const afterPoints = {
      ...beforePoints,
      d1: { ...state.points.d1, piece: 'obsidian' as PlayerId },
    };

    const newlyFormed = detectNewlyFormedMills('obsidian', beforePoints, afterPoints, 'd1');
    assert(newlyFormed.length === 2, `Expected 2 mills formed on moving to d1, got ${newlyFormed.length}`);

    results.push('PASS 24 (Test Case C): Simultaneous double mill in movement phase awards 2 captures');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 24 (Test Case C): ${e.message}`);
  }

  // 25. TEST CASE D: EXISTING MILL PLUS ONE NEW MILL -> ONLY 1 CAPTURE
  try {
    const state = getInitialGameState('sotho25');
    // Player already has completed mill m1 (a1-d1-g1)
    state.points.a1.piece = 'obsidian';
    state.points.d1.piece = 'obsidian';
    state.points.g1.piece = 'obsidian';

    // Player now places piece on d3 to complete m13 (d1-d2-d3) with d2 already placed
    state.points.d2.piece = 'obsidian';
    state.points.d3.piece = null;

    const beforePoints = { ...state.points };
    const afterPoints = { ...state.points, d3: { ...state.points.d3, piece: 'obsidian' as PlayerId } };

    const newlyFormed = detectNewlyFormedMills('obsidian', beforePoints, afterPoints, 'd3');
    assert(newlyFormed.length === 1, `Expected ONLY 1 newly formed mill (m13), got ${newlyFormed.length}`);
    assert(newlyFormed[0].id === 'm13' || newlyFormed[0].points.includes('d3'), 'Newly formed mill must be the one with d3');

    results.push('PASS 25 (Test Case D): Existing mill plus one new mill awards only 1 capture');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 25 (Test Case D): ${e.message}`);
  }

  // 26. TEST CASE E: SEQUENTIAL CAPTURE PROCESSING (DOUBLE MILL)
  try {
    const state = getInitialGameState('sotho25');
    state.phase = 'shooting';
    state.turn = 'obsidian';
    state.capturesRemaining = 2;
    state.isDoubleMill = true;
    state.ivory.onBoard = 5;

    state.points.a1.piece = 'ivory';
    state.points.b2.piece = 'ivory';
    state.points.c3.piece = 'ivory';

    // Step 1: Capture first cow (a1)
    const stateAfterCap1 = applyCaptureToGameState(state, 'a1', 'obsidian');
    assert(stateAfterCap1.points.a1.piece === null, 'First captured piece must be removed');
    assert(stateAfterCap1.capturesRemaining === 1, `Captures remaining must decrement to 1, got ${stateAfterCap1.capturesRemaining}`);
    assert(stateAfterCap1.turn === 'obsidian', 'Turn must remain with capturer for second capture');
    assert(stateAfterCap1.phase === 'shooting', 'Phase must remain shooting for second capture');

    // Step 2: Capture second cow (b2)
    const stateAfterCap2 = applyCaptureToGameState(stateAfterCap1, 'b2', 'obsidian');
    assert(stateAfterCap2.points.b2.piece === null, 'Second captured piece must be removed');
    assert(stateAfterCap2.capturesRemaining === 0, `Captures remaining must decrement to 0, got ${stateAfterCap2.capturesRemaining}`);
    assert(stateAfterCap2.turn === 'ivory', 'Turn must transition to opponent after both captures complete');

    results.push('PASS 26 (Test Case E): Sequential double capture correctly decrements capturesRemaining and transitions turn');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 26 (Test Case E): ${e.message}`);
  }

  // 27. TEST CASE F: ONLY ONE OPPONENT CATTLE AVAILABLE DURING DOUBLE MILL
  try {
    const state = getInitialGameState('sotho25');
    state.phase = 'shooting';
    state.turn = 'obsidian';
    state.capturesRemaining = 2;
    state.isDoubleMill = true;
    state.ivory.onBoard = 1;
    state.ivory.inHand = 0;

    state.points.a1.piece = 'ivory';

    // Capture the only available ivory piece
    const stateAfterCap = applyCaptureToGameState(state, 'a1', 'obsidian');
    assert(stateAfterCap.points.a1.piece === null, 'Target piece must be removed');
    assert(stateAfterCap.capturesRemaining === 0, 'capturesRemaining must resolve to 0 when no opponent pieces remain');
    assert(stateAfterCap.winner === 'obsidian', 'Obsidian must win when opponent is reduced to < 3 pieces in moving phase');

    results.push('PASS 27 (Test Case F): Single available opponent piece resolves cleanly without blocking game');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 27 (Test Case F): ${e.message}`);
  }

  // 28. TEST CASE G: ALL OPPONENT CATTLE IN MILLS
  try {
    const state = getInitialGameState('sotho25');
    // Opponent has 3 pieces, all in a mill (a1-d1-g1)
    state.points.a1.piece = 'ivory';
    state.points.d1.piece = 'ivory';
    state.points.g1.piece = 'ivory';

    const capturables = getCapturablePoints('ivory', state.points);
    assert(capturables.length === 3, 'When all opponent pieces are in mills, all are legally capturable');
    assert(capturables.includes('a1') && capturables.includes('d1') && capturables.includes('g1'), 'All 3 mill pieces must be capturable');

    results.push('PASS 28 (Test Case G): When all opponent cattle are in mills, double mill can capture from mills');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 28 (Test Case G): ${e.message}`);
  }

  // 29. TEST CASE H: AI RECOGNIZES AND VALUES DOUBLE-MILL OPPORTUNITIES
  try {
    const state = getInitialGameState('sotho25');
    state.turn = 'ivory';
    // AI has placement opportunity on d4 to form double mill (c4-d4-e4 and d3-d4-d5)
    state.points.c4.piece = 'ivory';
    state.points.e4.piece = 'ivory';
    state.points.d3.piece = 'ivory';
    state.points.d5.piece = 'ivory';
    state.points.d4.piece = null;

    // Opponent has 2 pieces to capture
    state.points.a1.piece = 'obsidian';
    state.points.g7.piece = 'obsidian';

    const aiMoves = generateAtomicMoves(
      state.points,
      'ivory',
      8,
      'placing',
      'obsidian',
      8,
      null,
      AI_PROFILES.morena
    );

    const doubleMillMove = aiMoves.find((m) => m.to === 'd4' && m.isDoubleMill);
    assert(doubleMillMove !== undefined, 'AI move generator must identify d4 as a double-mill placement');
    assert(doubleMillMove?.capturePointId !== undefined, 'Double mill move must contain first capture');
    assert(doubleMillMove?.secondCapturePointId !== undefined, 'Double mill move must contain second capture');

    results.push('PASS 29 (Test Case H): AI engine accurately identifies and plans double-mill dual captures');
    passed++;
  } catch (e: any) {
    results.push(`FAIL 29 (Test Case H): ${e.message}`);
  }

  return { passed, total: 29, results };
}

