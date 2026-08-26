import { GameState, MatchPerformanceStats, PlayerId, DifficultyStage } from '../types';

/**
 * Computes deep post-match performance metrics and strategic analytics
 * including Moves-per-Mill, Capture Ratio, Kraal Retention, and tactical coaching feedback.
 */
export function computeMatchPerformanceStats(
  gameState: GameState,
  stage?: DifficultyStage
): MatchPerformanceStats {
  const history = gameState.history || [];
  const playerWon = gameState.winner === 'obsidian';

  // Count explicit moves (placing and moving turns)
  let playerMoves = history.filter(
    (h) => h.player === 'obsidian' && (h.type === 'place' || h.type === 'move')
  ).length;

  let opponentMoves = history.filter(
    (h) => h.player === 'ivory' && (h.type === 'place' || h.type === 'move')
  ).length;

  // Fallback estimates if history was reset
  if (playerMoves === 0 && gameState.moveCount > 0) {
    playerMoves = Math.max(1, Math.ceil(gameState.moveCount / 2));
    opponentMoves = Math.max(0, Math.floor(gameState.moveCount / 2));
  }

  // Count mills formed
  let playerMills = history.filter(
    (h) => h.player === 'obsidian' && h.millFormed === true
  ).length;

  let opponentMills = history.filter(
    (h) => h.player === 'ivory' && h.millFormed === true
  ).length;

  // Fallback if millFormed flags were skipped: infer from captures
  const playerCaptures = gameState.ivory.captured ?? 0;
  const opponentCaptures = gameState.obsidian.captured ?? 0;

  if (playerMills === 0 && playerCaptures > 0) {
    playerMills = playerCaptures;
  }
  if (opponentMills === 0 && opponentCaptures > 0) {
    opponentMills = opponentCaptures;
  }

  // Calculate Moves per Mill (average moves needed to ignite a 3-in-a-row mill)
  const playerMovesPerMill =
    playerMills > 0 ? Number((playerMoves / playerMills).toFixed(1)) : null;

  const opponentMovesPerMill =
    opponentMills > 0 ? Number((opponentMoves / opponentMills).toFixed(1)) : null;

  // Calculate Capture Ratio: Percentage of opponent's starting herd (12 cows) cleared
  const playerCaptureRatio = Number(((playerCaptures / 12) * 100).toFixed(1));
  const opponentCaptureRatio = Number(((opponentCaptures / 12) * 100).toFixed(1));

  // Calculate Kraal Retention: Percentage of player's herd still standing
  const playerKraalRetention = Number(
    ((Math.max(0, 12 - opponentCaptures) / 12) * 100).toFixed(1)
  );
  const opponentKraalRetention = Number(
    ((Math.max(0, 12 - playerCaptures) / 12) * 100).toFixed(1)
  );

  // Determine Tempo Tier & Badge
  let tempoTier: MatchPerformanceStats['tempoTier'] = 'NO_MILLS';
  let tempoBadge = 'No Mills Formed';

  if (playerMovesPerMill !== null) {
    if (playerMovesPerMill <= 4.5) {
      tempoTier = 'LETHAL';
      tempoBadge = '⚡ Lethal Strike (<4.5 m/m)';
    } else if (playerMovesPerMill <= 6.5) {
      tempoTier = 'HIGH_EFFICIENCY';
      tempoBadge = '⚔️ High Efficiency (4.5–6.5 m/m)';
    } else if (playerMovesPerMill <= 9.5) {
      tempoTier = 'BALANCED';
      tempoBadge = '🛡️ Balanced Tempo (6.6–9.5 m/m)';
    } else {
      tempoTier = 'ATTRITION';
      tempoBadge = '⏳ Positional Siege (>9.5 m/m)';
    }
  }

  // Compute Overall Strategic Grade (S+, S, A, B, C, D)
  let grade: MatchPerformanceStats['grade'] = 'B';
  if (playerWon) {
    if (playerMovesPerMill !== null && playerMovesPerMill <= 4.0 && playerKraalRetention >= 75) {
      grade = 'S+';
    } else if (playerMovesPerMill !== null && playerMovesPerMill <= 5.5 && playerKraalRetention >= 60) {
      grade = 'S';
    } else if (playerMovesPerMill !== null && playerMovesPerMill <= 7.5) {
      grade = 'A';
    } else {
      grade = 'B';
    }
  } else {
    if (playerCaptureRatio >= 66 || (playerMovesPerMill !== null && playerMovesPerMill <= 6.0)) {
      grade = 'B';
    } else if (playerCaptureRatio >= 33) {
      grade = 'C';
    } else {
      grade = 'D';
    }
  }

  // Generate Qualitative Tactical Summary & Actionable Coaching Advice
  let tacticalSummary = '';
  let tacticalAdvice = '';
  const keyInsights: string[] = [];

  const opponentName = stage?.opponentName || 'Opponent';

  if (playerWon) {
    if (tempoTier === 'LETHAL') {
      tacticalSummary = `Lethal offensive velocity against ${opponentName}. You ignited mills every ${playerMovesPerMill} turns, dismantling their kraal before they could establish a defensive foothold.`;
      tacticalAdvice = `Outstanding rhythm. Keep leveraging diagonal intersections to create double-threat (mafube) forks in early placing.`;
    } else if (tempoTier === 'HIGH_EFFICIENCY') {
      tacticalSummary = `Clean, authoritative victory. Your mill tempo (${playerMovesPerMill} moves/mill) maintained relentless pressure across the outer and middle rings.`;
      tacticalAdvice = `To push for S+ grade, practice setting up 'ho jela pele le morao' (running mills) during mid-game to execute back-to-back captures on consecutive turns.`;
    } else if (tempoTier === 'BALANCED') {
      tacticalSummary = `Patient positional triumph. You absorbed initial pressure and converted ${playerMills} mills with steady tactical discipline.`;
      tacticalAdvice = `Speed up your conversion rate by securing key junction nodes (d2, d6, b4, f4) during the placing phase rather than waiting for opponent mistakes.`;
    } else {
      tacticalSummary = `Hard-fought war of attrition. You out-grinded ${opponentName} through endurance and spatial containment over ${playerMoves} moves.`;
      tacticalAdvice = `Try to spot mill opportunities earlier during placing. Prioritize 2-in-a-row pairs with open endpoints to force opponent defensive blocks.`;
    }
  } else {
    if (playerMills === 0) {
      tacticalSummary = `${opponentName} locked down the board before you could establish your first mill.`;
      tacticalAdvice = `In the opening placing phase, never place cows in isolated corners. Connect them along the diagonals to create simultaneous threat axes.`;
    } else {
      tacticalSummary = `You fought valiantly with ${playerMills} mills and a ${playerCaptureRatio}% capture ratio, but ${opponentName}'s counter-tempo prevailed.`;
      tacticalAdvice = `Notice where your defense fractured. Guard the central crossing (d4) and prevent the opponent from establishing running mills.`;
    }
  }

  // Key Highlights
  if (playerMovesPerMill !== null) {
    keyInsights.push(`Strike Rate: 1 mill every ${playerMovesPerMill} moves (${playerMills} total mills ignited)`);
  } else {
    keyInsights.push(`0 mills formed during this match`);
  }

  keyInsights.push(`Raid Efficiency: ${playerCaptures}/12 opposing cows captured (${playerCaptureRatio}%)`);
  keyInsights.push(`Kraal Defense: ${Math.max(0, 12 - opponentCaptures)}/12 cows survived (${playerKraalRetention}% retention)`);

  if (opponentMovesPerMill !== null && playerMovesPerMill !== null) {
    const tempoDiff = opponentMovesPerMill - playerMovesPerMill;
    if (tempoDiff > 0.5) {
      keyInsights.push(`Tempo Advantage: You formed mills ${tempoDiff.toFixed(1)} moves faster than ${opponentName}`);
    } else if (tempoDiff < -0.5) {
      keyInsights.push(`Tempo Deficit: ${opponentName} formed mills ${Math.abs(tempoDiff).toFixed(1)} moves faster`);
    }
  }

  return {
    totalTurns: gameState.moveCount,
    playerMoves,
    opponentMoves,
    playerMills,
    opponentMills,
    playerCaptures,
    opponentCaptures,
    playerMovesPerMill,
    opponentMovesPerMill,
    playerCaptureRatio,
    opponentCaptureRatio,
    playerKraalRetention,
    opponentKraalRetention,
    tempoTier,
    tempoBadge,
    grade,
    tacticalSummary,
    tacticalAdvice,
    keyInsights,
  };
}
