import { StreakTier, WinStreakState } from '../types';

const STREAK_STORAGE_KEY = 'morabaraba_player_win_streak_v1';

export function getInitialWinStreakState(): WinStreakState {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastMatchResult: null,
    streakTier: 'NONE',
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function calculateStreakTier(streak: number): StreakTier {
  if (streak >= 7) return 'LEGENDARY';
  if (streak >= 4) return 'BLAZING';
  if (streak >= 2) return 'HOT';
  return 'NONE';
}

export function loadWinStreakState(): WinStreakState {
  if (typeof window === 'undefined') return getInitialWinStreakState();
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return getInitialWinStreakState();
    const parsed = JSON.parse(raw);
    return {
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      lastMatchResult: parsed.lastMatchResult || null,
      streakTier: calculateStreakTier(parsed.currentStreak || 0),
      lastUpdatedAt: parsed.lastUpdatedAt || new Date().toISOString(),
    };
  } catch {
    return getInitialWinStreakState();
  }
}

export function saveWinStreakState(state: WinStreakState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Fail-safe silent catch
  }
}

export function recordMatchResult(
  currentState: WinStreakState,
  result: 'WIN' | 'LOSS' | 'DRAW'
): { nextState: WinStreakState; didIncrease: boolean; didBreak: boolean } {
  let nextStreak = currentState.currentStreak;
  let didIncrease = false;
  let didBreak = false;

  if (result === 'WIN') {
    nextStreak += 1;
    didIncrease = true;
  } else if (result === 'LOSS') {
    if (nextStreak > 0) {
      didBreak = true;
    }
    nextStreak = 0;
  } else {
    // DRAW does not break streak, but does not increment it
  }

  const nextBest = Math.max(currentState.bestStreak, nextStreak);
  const nextTier = calculateStreakTier(nextStreak);

  const nextState: WinStreakState = {
    currentStreak: nextStreak,
    bestStreak: nextBest,
    lastMatchResult: result,
    streakTier: nextTier,
    lastUpdatedAt: new Date().toISOString(),
  };

  saveWinStreakState(nextState);

  return { nextState, didIncrease, didBreak };
}
