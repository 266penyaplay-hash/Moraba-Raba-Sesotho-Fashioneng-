export interface Achievement {
  id: string;
  title: string;
  category: 'campaign' | 'mastery' | 'puzzles' | 'tactical';
  description: string;
  iconName: 'Award' | 'Crown' | 'Shield' | 'Flame' | 'Target' | 'Sparkles' | 'Zap' | 'Trophy' | 'Mountain';
  isUnlocked: boolean;
  unlockedAt?: string;
  isPrestige?: boolean;
  progress?: number; // 0-100
  progressText?: string;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    category: 'tactical',
    description: 'Capture your first enemy cow in any match.',
    iconName: 'Target',
    isUnlocked: false,
  },
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    category: 'tactical',
    description: 'Create three mills in a single match.',
    iconName: 'Zap',
    isUnlocked: false,
  },
  {
    id: 'the_comeback',
    title: 'The Comeback',
    category: 'mastery',
    description: 'Win a match after falling behind by 2 or more cattle.',
    iconName: 'Flame',
    isUnlocked: false,
  },
  {
    id: 'mountain_tested',
    title: 'Mountain Tested',
    category: 'campaign',
    description: 'Defeat Sefako in the hailstorms of Mokhotlong.',
    iconName: 'Mountain',
    isUnlocked: false,
  },
  {
    id: 'the_kings_table',
    title: "The King's Table",
    category: 'campaign',
    description: 'Unlock Morena Letsie at the ancient summit of Tsoenene.',
    iconName: 'Shield',
    isUnlocked: false,
  },
  {
    id: 'i_beat_morena_letsie',
    title: 'I Beat Morena Letsie',
    category: 'campaign',
    description: 'Defeat Morena Letsie at Tsoenene without assistance. The highest honor in Morabaraba history.',
    iconName: 'Crown',
    isUnlocked: false,
    isPrestige: true,
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    category: 'puzzles',
    description: 'Maintain a 7-day daily challenge streak.',
    iconName: 'Sparkles',
    isUnlocked: false,
  },
  {
    id: 'puzzle_master',
    title: 'Puzzle Master',
    category: 'puzzles',
    description: 'Solve 10 tactical puzzles in the tactical archives.',
    iconName: 'Trophy',
    isUnlocked: false,
  },
  {
    id: 'kraal_preserver',
    title: 'Kraal Preserver',
    category: 'mastery',
    description: 'Win a match retaining 10 or more cattle in your herd.',
    iconName: 'Award',
    isUnlocked: false,
  },
  {
    id: 'center_commander',
    title: 'Center Commander',
    category: 'tactical',
    description: 'Seize and hold the vital d4 Sotho nexus for victory.',
    iconName: 'Target',
    isUnlocked: false,
  },
];

export const ACHIEVEMENTS_STORAGE_KEY = 'morabaraba_achievements_v1';

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (raw) {
      const saved: Record<string, { isUnlocked: boolean; unlockedAt?: string }> = JSON.parse(raw);
      return INITIAL_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        isUnlocked: saved[ach.id]?.isUnlocked || false,
        unlockedAt: saved[ach.id]?.unlockedAt,
      }));
    }
  } catch {
    // Ignore error
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    const map: Record<string, { isUnlocked: boolean; unlockedAt?: string }> = {};
    achievements.forEach((a) => {
      if (a.isUnlocked) {
        map[a.id] = { isUnlocked: true, unlockedAt: a.unlockedAt };
      }
    });
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore error
  }
}

export function unlockAchievement(achievementId: string): Achievement[] {
  const current = loadAchievements();
  const updated = current.map((a) => {
    if (a.id === achievementId && !a.isUnlocked) {
      return {
        ...a,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }
    return a;
  });
  saveAchievements(updated);
  return updated;
}
