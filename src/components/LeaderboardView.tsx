import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Target,
  Shield,
  Search,
  RotateCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Filter,
  User as UserIcon,
  Award,
  Globe,
  TrendingUp,
  Share2,
  Play,
  Swords,
  Calendar,
  Grid,
  MapPin,
  Bookmark,
  Users,
  Settings,
  Bell,
  Coins,
  Edit3,
  Check,
  CircleDot,
  LayoutDashboard,
  Layers,
  Clock,
  Compass,
  Lock,
} from 'lucide-react';
import {
  LeaderboardEntry,
  subscribeToLeaderboard,
  fetchGlobalLeaderboard,
  syncAllLocalToCloud,
} from '../services/firebase';
import { loadPlayerMastery, getRankTier, BASOTHO_RANKS } from '../utils/masteryStats';
import { loadDailyStreakData } from '../constants/dailyChallenges';
import { loadSolvedPuzzles } from '../constants/puzzles';
import { loadAchievements } from '../constants/achievements';
import { SFBrandMonogram, BasothoCattleEmblem } from './BottleCapToken';
import { SFPatternBackground } from './SFPatterns';
import { User } from 'firebase/auth';
import {
  PlayerCareerProfile,
  DetailedMatchRecord,
  HeadToHeadRecord,
  CattleSetId,
  DifficultyStageId,
} from '../types';

interface LeaderboardViewProps {
  currentUser: User | null;
  careerProfile?: PlayerCareerProfile;
  matchHistory?: DetailedMatchRecord[];
  headToHeadRecords?: HeadToHeadRecord[];
  isCloudSynced: boolean;
  isSyncing: boolean;
  onBackToGame: () => void;
  onOpenCloudModal: () => void;
  onStartMatch: (mode: 'pass-and-play' | 'ai', stageId?: DifficultyStageId) => void;
  onOpenDaily?: () => void;
  onOpenPuzzles?: () => void;
  onOpenAchievements?: () => void;
  onOpenCareer?: () => void;
  onOpenJourney?: () => void;
  onOpenOnlineMatch?: () => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onSelectCattleSet?: (setId: CattleSetId) => void;
  dailyStreak?: number;
}

// Benchmark AI Campaign Opponents Ladder (Clearly separated from Real Human Player Rankings)
const CAMPAIGN_AI_LADDER: LeaderboardEntry[] = [
  {
    userId: 'bot-morena-letsie',
    displayName: 'Morena Letsie',
    rating: 2085,
    rankTierName: 'Morena oa Maloti',
    rankTierTranslation: 'Tsoenene Sovereign',
    totalWins: 342,
    dailyStreak: 45,
    puzzlesSolved: 12,
    honorsCount: 16,
    region: 'TSOENENE',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    userId: 'bot-sefako',
    displayName: 'Sefako',
    rating: 1876,
    rankTierName: 'Litolobonya',
    rankTierTranslation: 'Alpine Grandmaster',
    totalWins: 298,
    dailyStreak: 32,
    puzzlesSolved: 12,
    honorsCount: 14,
    region: 'MOKHOTLONG',
    updatedAt: '2026-08-24T22:30:00.000Z',
  },
  {
    userId: 'bot-litshepe',
    displayName: 'Litšepe',
    rating: 1645,
    rankTierName: 'Mofolisi',
    rankTierTranslation: 'Highland Tactician',
    totalWins: 254,
    dailyStreak: 21,
    puzzlesSolved: 10,
    honorsCount: 11,
    region: 'LERIBE',
    updatedAt: '2026-08-24T18:15:00.000Z',
  },
  {
    userId: 'bot-thaba-boys',
    displayName: 'Thaba Boys',
    rating: 1487,
    rankTierName: 'Mohlabani',
    rankTierTranslation: 'Village Champions',
    totalWins: 216,
    dailyStreak: 15,
    puzzlesSolved: 8,
    honorsCount: 8,
    region: 'KHUBETSOANA',
    updatedAt: '2026-08-23T14:10:00.000Z',
  },
  {
    userId: 'bot-matenase',
    displayName: 'Matenase',
    rating: 1321,
    rankTierName: 'Morakeng',
    rankTierTranslation: 'Kraal Guardian',
    totalWins: 189,
    dailyStreak: 9,
    puzzlesSolved: 5,
    honorsCount: 6,
    region: 'MOKENA',
    updatedAt: '2026-08-22T09:40:00.000Z',
  },
];

// Baseline Real Player Community Roster (Representing authentic player accounts)
const BASELINE_REAL_PLAYERS: LeaderboardEntry[] = [
  {
    userId: 'player-moshoeshoe92',
    displayName: 'Moshoeshoe92',
    rating: 1890,
    rankTierName: 'Litolobonya',
    rankTierTranslation: 'Master Strategist',
    totalWins: 284,
    dailyStreak: 28,
    puzzlesSolved: 12,
    honorsCount: 15,
    region: 'MASERU',
    updatedAt: '2026-08-25T11:20:00.000Z',
  },
  {
    userId: 'player-maloti-tactics',
    displayName: 'MalotiTactician',
    rating: 1740,
    rankTierName: 'Mofolisi',
    rankTierTranslation: 'Highland Commander',
    totalWins: 210,
    dailyStreak: 19,
    puzzlesSolved: 11,
    honorsCount: 12,
    region: 'SEMONKONG',
    updatedAt: '2026-08-24T08:14:00.000Z',
  },
  {
    userId: 'player-senqu-falcon',
    displayName: 'SenquFalcon',
    rating: 1590,
    rankTierName: 'Mohlabani',
    rankTierTranslation: 'River Tactician',
    totalWins: 178,
    dailyStreak: 14,
    puzzlesSolved: 9,
    honorsCount: 9,
    region: 'QACHAS NEK',
    updatedAt: '2026-08-23T19:45:00.000Z',
  },
  {
    userId: 'player-thaba-bosiu-king',
    displayName: 'ThabaBosiu_Ace',
    rating: 1460,
    rankTierName: 'Morakeng',
    rankTierTranslation: 'Mountain Fortress',
    totalWins: 142,
    dailyStreak: 11,
    puzzlesSolved: 7,
    honorsCount: 7,
    region: 'THABA-BOSIU',
    updatedAt: '2026-08-23T12:00:00.000Z',
  },
  {
    userId: 'player-butha-buthe-herder',
    displayName: 'ButhaButhe99',
    rating: 1380,
    rankTierName: 'Morakeng',
    rankTierTranslation: 'North Highland Guard',
    totalWins: 125,
    dailyStreak: 8,
    puzzlesSolved: 6,
    honorsCount: 5,
    region: 'BUTHA-BUTHE',
    updatedAt: '2026-08-22T16:30:00.000Z',
  },
];

// Fallback recent matches when match history is fresh
const SAMPLE_RECENT_MATCHES: DetailedMatchRecord[] = [
  {
    matchId: 'rec-1',
    userId: 'user',
    opponentId: 'sefako',
    opponentName: 'Sefako',
    opponentType: 'ai',
    opponentRating: 1876,
    opponentClan: 'Mokhotlong',
    gameMode: 'ai',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    startTime: new Date().toISOString(),
    durationSeconds: 761, // 12m 41s
    result: 'VICTORY',
    winner: 'obsidian',
    winnerName: 'Player',
    isDraw: false,
    moveCount: 42,
    playerCaptures: 10,
    opponentCaptures: 7,
    playerMills: 5,
    opponentMills: 3,
    ratingBefore: 1288,
    ratingAfter: 1305,
    ratingDelta: 17,
    xpEarned: 180,
    tacticalGrade: 'S',
    tempoBadge: 'Swift Herder',
    wasComeback: false,
  },
  {
    matchId: 'rec-2',
    userId: 'user',
    opponentId: 'bothata',
    opponentName: 'Thaba Boys',
    opponentType: 'ai',
    opponentRating: 1487,
    opponentClan: 'Khubetsoana',
    gameMode: 'ai',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    startTime: new Date().toISOString(),
    durationSeconds: 502, // 8m 22s
    result: 'VICTORY',
    winner: 'obsidian',
    winnerName: 'Player',
    isDraw: false,
    moveCount: 34,
    playerCaptures: 10,
    opponentCaptures: 5,
    playerMills: 4,
    opponentMills: 2,
    ratingBefore: 1276,
    ratingAfter: 1288,
    ratingDelta: 12,
    xpEarned: 140,
    tacticalGrade: 'A',
    tempoBadge: 'Flank Trapper',
    wasComeback: false,
  },
  {
    matchId: 'rec-3',
    userId: 'user',
    opponentId: 'litshepe',
    opponentName: 'Litšepe',
    opponentType: 'ai',
    opponentRating: 1645,
    opponentClan: 'Leribe',
    gameMode: 'ai',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    startTime: new Date().toISOString(),
    durationSeconds: 843, // 14m 03s
    result: 'DEFEAT',
    winner: 'ivory',
    winnerName: 'Litšepe',
    isDraw: false,
    moveCount: 56,
    playerCaptures: 7,
    opponentCaptures: 10,
    playerMills: 3,
    opponentMills: 5,
    ratingBefore: 1284,
    ratingAfter: 1276,
    ratingDelta: -8,
    xpEarned: 60,
    tacticalGrade: 'B',
    tempoBadge: 'Endgame Grind',
    wasComeback: false,
  },
  {
    matchId: 'rec-4',
    userId: 'user',
    opponentId: 'matenase',
    opponentName: 'Matenase',
    opponentType: 'ai',
    opponentRating: 1321,
    opponentClan: 'Mokena',
    gameMode: 'ai',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    startTime: new Date().toISOString(),
    durationSeconds: 476, // 7m 56s
    result: 'VICTORY',
    winner: 'obsidian',
    winnerName: 'Player',
    isDraw: false,
    moveCount: 28,
    playerCaptures: 10,
    opponentCaptures: 4,
    playerMills: 4,
    opponentMills: 1,
    ratingBefore: 1274,
    ratingAfter: 1284,
    ratingDelta: 10,
    xpEarned: 120,
    tacticalGrade: 'A+',
    tempoBadge: 'Quick Opening',
    wasComeback: false,
  },
  {
    matchId: 'rec-5',
    userId: 'user',
    opponentId: 'player-moshoeshoe92',
    opponentName: 'Player: Moshoeshoe92',
    opponentType: 'human',
    opponentRating: 1890,
    opponentClan: 'Ranked Match',
    gameMode: 'ranked',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    startTime: new Date().toISOString(),
    durationSeconds: 1278, // 21m 18s
    result: 'DEFEAT',
    winner: 'ivory',
    winnerName: 'Moshoeshoe92',
    isDraw: false,
    moveCount: 68,
    playerCaptures: 8,
    opponentCaptures: 10,
    playerMills: 4,
    opponentMills: 6,
    ratingBefore: 1288,
    ratingAfter: 1274,
    ratingDelta: -14,
    xpEarned: 90,
    tacticalGrade: 'A',
    tempoBadge: 'Grandmaster Duel',
    wasComeback: false,
  },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  careerProfile,
  matchHistory = [],
  isCloudSynced,
  isSyncing,
  onBackToGame,
  onOpenCloudModal,
  onStartMatch,
  onOpenDaily,
  onOpenPuzzles,
  onOpenAchievements,
  onOpenCareer,
  onOpenJourney,
  onOpenOnlineMatch,
  onOpenAuth,
  onOpenSettings,
  onSelectCattleSet,
}) => {
  // Navigation active tab
  const [activeNav, setActiveNav] = useState<'dashboard' | 'rankings' | 'history'>('dashboard');
  // Leaderboard toggle: Real Player Community vs AI Campaign Ladder
  const [leaderboardTab, setLeaderboardTab] = useState<'players' | 'campaign'>('players');
  // State for live cloud entries
  const [cloudEntries, setCloudEntries] = useState<LeaderboardEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<LeaderboardEntry | null>(null);
  const [viewFullRankingsModal, setViewFullRankingsModal] = useState<boolean>(false);

  // Local user metrics
  const localMastery = useMemo(() => loadPlayerMastery(), []);
  const localStreak = useMemo(() => loadDailyStreakData(), []);
  const localPuzzles = useMemo(() => loadSolvedPuzzles(), []);
  const localAchievements = useMemo(() => loadAchievements(), []);

  // Compute profile numbers
  const playerRating = careerProfile?.rating || localMastery.rating || 1305;
  const playerXp = careerProfile?.careerXp || 8750;
  const playerLevel = careerProfile?.careerLevel || 18;
  const playerClan = careerProfile?.clanTitle || 'LITŠEPE';
  const playerDisplayName =
    currentUser?.displayName || careerProfile?.displayName || 'LesothoKing';
  const playerRegion = careerProfile?.region || 'Litšepe';

  // Sporting record numbers
  const wins = careerProfile?.recordsByMode.overall.wins || 116;
  const losses = careerProfile?.recordsByMode.overall.losses || 59;
  const draws = careerProfile?.recordsByMode.overall.draws || 9;
  const totalMatches = wins + losses + draws;
  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 63;
  const currentStreak = localStreak.currentStreak || 4;
  const bestStreak = localStreak.bestStreak || 11;

  // Real Matches List (derive from matchHistory or sample)
  const displayMatches = useMemo(() => {
    if (matchHistory && matchHistory.length > 0) {
      return matchHistory.slice(0, 5);
    }
    return SAMPLE_RECENT_MATCHES;
  }, [matchHistory]);

  // Subscribe to live Firestore leaderboard updates
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((entries) => {
      setCloudEntries(entries);
    });
    return () => unsubscribe();
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchGlobalLeaderboard(50);
      setCloudEntries(data);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Real Players List (Combines Firestore live entries with baseline player community)
  const realPlayersList = useMemo(() => {
    const map = new Map<string, LeaderboardEntry>();

    // Baseline human accounts
    BASELINE_REAL_PLAYERS.forEach((p) => map.set(p.userId, p));

    // Cloud firestore entries (filter out bot- if any)
    cloudEntries.forEach((entry) => {
      if (!entry.userId.startsWith('bot-')) {
        map.set(entry.userId, entry);
      }
    });

    // Add current user if not in list
    const currentUid = currentUser?.uid || 'user-current';
    map.set(currentUid, {
      userId: currentUid,
      displayName: `${playerDisplayName} (You)`,
      rating: playerRating,
      rankTierName: getRankTier(playerRating).name,
      rankTierTranslation: getRankTier(playerRating).translation,
      totalWins: wins,
      dailyStreak: currentStreak,
      puzzlesSolved: localPuzzles.length,
      honorsCount: localAchievements.filter((a) => a.isUnlocked).length,
      region: playerClan,
      updatedAt: new Date().toISOString(),
    });

    return Array.from(map.values()).sort((a, b) => b.rating - a.rating);
  }, [
    cloudEntries,
    currentUser,
    playerDisplayName,
    playerRating,
    wins,
    currentStreak,
    localPuzzles,
    localAchievements,
    playerClan,
  ]);

  // Active Leaderboard Data based on Tab
  const activeLeaderboardData = useMemo(() => {
    if (leaderboardTab === 'campaign') {
      return CAMPAIGN_AI_LADDER;
    }
    return realPlayersList;
  }, [leaderboardTab, realPlayersList]);

  // Current User Position
  const userRankIndex = useMemo(() => {
    const currentUid = currentUser?.uid || 'user-current';
    const idx = realPlayersList.findIndex(
      (p) => p.userId === currentUid || p.displayName.includes('(You)')
    );
    return idx >= 0 ? idx + 1 : 23;
  }, [realPlayersList, currentUser]);

  // Format Duration string
  const formatMatchDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="w-full text-[#E9DFCE] font-['Space_Grotesk'] pb-12 select-none animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. TOP STATUS / GREETING BAR */}
      {/* ========================================================================= */}
      <div className="w-full flex items-center justify-between pb-4 pt-1 border-b border-[#2C2016]/80 mb-5">
        {/* Left: Greeting */}
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-base sm:text-lg">🔥</span>
          <h1 className="font-['Syne'] font-extrabold text-sm sm:text-base tracking-wider uppercase text-[#FFFDF8]">
            PULA, {playerDisplayName.toUpperCase()}
          </h1>
        </div>

        {/* Right: Currency & Status Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cattle Currency */}
          <div
            onClick={onOpenCareer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18120C] border border-[#3A2B1D] text-xs font-semibold text-[#D9A855] hover:border-[#D9A855]/60 cursor-pointer transition-all shadow-sm"
            title="Cattle Herd Value"
          >
            <Coins className="w-3.5 h-3.5 text-[#D9A855]" />
            <span className="font-mono font-bold">12,450</span>
          </div>

          {/* XP Pill */}
          <div
            onClick={onOpenCareer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121A15] border border-[#21382A] text-xs font-semibold text-[#52D48E] hover:border-[#52D48E]/60 cursor-pointer transition-all shadow-sm"
            title="Career XP"
          >
            <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-[#52D48E]/20 text-[#52D48E]">
              XP
            </span>
            <span className="font-mono font-bold">{playerXp.toLocaleString()}</span>
          </div>

          {/* Notifications */}
          <button
            onClick={onOpenAchievements}
            className="relative p-1.5 rounded-lg bg-[#18120C] border border-[#3A2B1D] text-[#A89884] hover:text-[#FFFDF8] hover:border-[#D9A855]/60 transition-colors"
            title="Honors & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E05338] text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings || onOpenAuth}
            className="p-1.5 rounded-lg bg-[#18120C] border border-[#3A2B1D] text-[#A89884] hover:text-[#FFFDF8] hover:border-[#D9A855]/60 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN THREE-ZONE DESKTOP GRID / 1-COLUMN MOBILE LAYOUT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ===================================================================== */}
        {/* ZONE 1: LEFT NAVIGATION SIDEBAR (2.5 cols on desktop) */}
        {/* ===================================================================== */}
        <aside className="lg:col-span-3 xl:col-span-2 hidden lg:flex flex-col gap-5 sticky top-4">
          {/* Logo & Brand Card */}
          <div className="p-3.5 rounded-xl bg-[#140F0B] border border-[#2B1F16] flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-full bg-[#20150E] border border-[#D9A855]/60 flex items-center justify-center shrink-0 shadow-inner">
              <SFBrandMonogram size={24} fillColor="#D9A855" />
            </div>
            <div>
              <h2 className="font-['Syne'] font-extrabold text-sm tracking-wider text-[#FFFDF8] uppercase leading-none">
                MORABARABA
              </h2>
              <p className="text-[9px] tracking-[0.16em] text-[#A89884] uppercase font-semibold mt-1">
                ANCIENT GAME · ROYAL LEGACY
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-2 rounded-xl bg-[#140F0B] border border-[#2B1F16] space-y-4 shadow-md">
            {/* Group: PLAY */}
            <div className="space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-bold text-[#7A6A58] uppercase tracking-wider">
                PLAY
              </div>
              <button
                onClick={() => setActiveNav('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeNav === 'dashboard'
                    ? 'bg-[#2A1D13] text-[#FFE79A] border-l-2 border-[#D9A855]'
                    : 'text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#D9A855]" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={onBackToGame}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
              >
                <Play className="w-4 h-4 text-[#A89884]" />
                <span>Play Game</span>
              </button>

              {onOpenDaily && (
                <button
                  onClick={onOpenDaily}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
                >
                  <Target className="w-4 h-4 text-[#A89884]" />
                  <span>Daily Challenge</span>
                </button>
              )}

              {onOpenPuzzles && (
                <button
                  onClick={onOpenPuzzles}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
                >
                  <Layers className="w-4 h-4 text-[#A89884]" />
                  <span>Puzzles</span>
                </button>
              )}

              {onOpenJourney && (
                <button
                  onClick={onOpenJourney}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
                >
                  <Compass className="w-4 h-4 text-[#A89884]" />
                  <span>Campaign</span>
                </button>
              )}
            </div>

            {/* Group: COMPETE */}
            <div className="space-y-0.5 pt-2 border-t border-[#261B12]">
              <div className="px-3 py-1 text-[10px] font-bold text-[#7A6A58] uppercase tracking-wider">
                COMPETE
              </div>
              <button
                onClick={() => {
                  setActiveNav('rankings');
                  setLeaderboardTab('players');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeNav === 'rankings'
                    ? 'bg-[#2A1D13] text-[#FFE79A] border-l-2 border-[#D9A855]'
                    : 'text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8]'
                }`}
              >
                <Trophy className="w-4 h-4 text-[#D9A855]" />
                <span>Rankings</span>
              </button>

              <button
                onClick={onOpenCareer}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
              >
                <Clock className="w-4 h-4 text-[#A89884]" />
                <span>Match History</span>
              </button>

              {onOpenOnlineMatch && (
                <button
                  onClick={onOpenOnlineMatch}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
                >
                  <Users className="w-4 h-4 text-[#A89884]" />
                  <span>Friends</span>
                </button>
              )}
            </div>

            {/* Group: COLLECTION */}
            <div className="space-y-0.5 pt-2 border-t border-[#261B12]">
              <div className="px-3 py-1 text-[10px] font-bold text-[#7A6A58] uppercase tracking-wider">
                COLLECTION
              </div>
              <button
                onClick={onOpenCareer}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
              >
                <CircleDot className="w-4 h-4 text-[#A89884]" />
                <span>Cattle Collection</span>
              </button>

              <button
                onClick={onOpenCareer}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
              >
                <Grid className="w-4 h-4 text-[#A89884]" />
                <span>Board Collection</span>
              </button>

              {onOpenAchievements && (
                <button
                  onClick={onOpenAchievements}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
                >
                  <Award className="w-4 h-4 text-[#A89884]" />
                  <span>Honors</span>
                </button>
              )}
            </div>

            {/* Group: ACCOUNT */}
            <div className="space-y-0.5 pt-2 border-t border-[#261B12]">
              <button
                onClick={onOpenSettings || onOpenAuth}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#B8A896] hover:bg-[#1A140F] hover:text-[#FFFDF8] transition-all"
              >
                <Settings className="w-4 h-4 text-[#A89884]" />
                <span>Settings</span>
              </button>
            </div>
          </nav>

          {/* Bottom Mini User Card */}
          <div
            onClick={onOpenCareer || onOpenAuth}
            className="p-3 rounded-xl bg-[#140F0B] border border-[#2B1F16] flex items-center justify-between cursor-pointer hover:border-[#D9A855]/60 transition-all shadow-md group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#20150E] border border-[#8C6838] flex items-center justify-center font-['Syne'] font-extrabold text-[#D9A855] text-sm shrink-0">
                {playerDisplayName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-['Syne'] font-bold text-xs text-[#FFFDF8] truncate group-hover:text-[#FFE79A] transition-colors">
                  {playerDisplayName}
                </div>
                <div className="text-[10px] text-[#A89884] uppercase tracking-wider truncate">
                  {playerClan}
                </div>
                <div className="text-[10px] text-[#D9A855] font-mono font-bold">
                  Rating: {playerRating.toLocaleString()}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6A58] group-hover:text-[#D9A855] transition-colors shrink-0" />
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* ZONE 2: CENTER COMPETITIVE INFORMATION (dominant 6.5 cols on desktop) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-5">
          {/* ----------------------------------------------------------------- */}
          {/* DOMINANT CARD: MAIN LEADERBOARD TABLE */}
          {/* ----------------------------------------------------------------- */}
          <div className="rounded-2xl bg-[#140F0C] border border-[#2E2218] p-5 shadow-xl space-y-4">
            {/* Header with Title & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#261B12]">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#D9A855]" />
                  <h2 className="font-['Syne'] font-extrabold text-base sm:text-lg text-[#FFFDF8] uppercase tracking-wider">
                    LEADERBOARD
                  </h2>
                </div>
                <p className="text-xs text-[#A89884] mt-0.5">
                  Live rankings across the Kingdom of Lesotho and beyond.
                </p>
              </div>

              {/* Ladder Tab Switcher: REAL PLAYERS vs CAMPAIGN AI */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D0907] border border-[#261B12] self-start sm:self-auto">
                <button
                  onClick={() => setLeaderboardTab('players')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    leaderboardTab === 'players'
                      ? 'bg-[#2A1D13] text-[#FFE79A] border border-[#D9A855]/60 shadow-sm'
                      : 'text-[#8C7A68] hover:text-[#E9DFCE]'
                  }`}
                >
                  Player Rankings
                </button>
                <button
                  onClick={() => setLeaderboardTab('campaign')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    leaderboardTab === 'campaign'
                      ? 'bg-[#2A1D13] text-[#FFE79A] border border-[#D9A855]/60 shadow-sm'
                      : 'text-[#8C7A68] hover:text-[#E9DFCE]'
                  }`}
                >
                  Campaign AI
                </button>
              </div>
            </div>

            {/* Table Column Headers */}
            <div className="grid grid-cols-12 text-[10px] font-bold text-[#8C7A68] uppercase tracking-wider px-3 pb-1">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-5 sm:col-span-5 pl-2">PLAYER</div>
              <div className="col-span-2 hidden sm:block text-left">REGION</div>
              <div className="col-span-3 sm:col-span-2 text-right">RATING</div>
              <div className="col-span-3 sm:col-span-2 text-right">WINS</div>
            </div>

            {/* Top 5 Rows */}
            <div className="space-y-1.5">
              {activeLeaderboardData.slice(0, 5).map((entry, index) => {
                const rankNum = index + 1;
                const isTop1 = rankNum === 1;
                const isTop2 = rankNum === 2;
                const isTop3 = rankNum === 3;

                return (
                  <div
                    key={entry.userId}
                    onClick={() => setSelectedPlayerModal(entry)}
                    className={`grid grid-cols-12 items-center p-3 rounded-xl border transition-all cursor-pointer ${
                      isTop1
                        ? 'bg-[#1C140C] border-[#5A3F1F]/70 hover:border-[#D9A855]'
                        : 'bg-[#100C09] border-[#221810] hover:border-[#3E2B1E] hover:bg-[#16100B]'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="col-span-1 flex items-center justify-center font-['Syne'] font-extrabold text-xs">
                      {isTop1 ? (
                        <span className="text-[#FFD700] flex items-center gap-0.5">
                          <Crown className="w-3.5 h-3.5" />
                        </span>
                      ) : isTop2 ? (
                        <span className="w-5 h-5 rounded-full bg-[#3A3835] text-[#E0E0E0] flex items-center justify-center text-[10px]">
                          2
                        </span>
                      ) : isTop3 ? (
                        <span className="w-5 h-5 rounded-full bg-[#3D2B1E] text-[#CD7F32] flex items-center justify-center text-[10px]">
                          3
                        </span>
                      ) : (
                        <span className="text-[#8C7A68] text-xs font-mono">{rankNum}</span>
                      )}
                    </div>

                    {/* Player Info with Avatar */}
                    <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 pl-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#20150E] border border-[#8C6838]/60 flex items-center justify-center font-bold text-[11px] text-[#D9A855] shrink-0">
                        {entry.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-['Syne'] font-bold text-xs sm:text-sm text-[#FFFDF8] truncate">
                          {entry.displayName}
                        </div>
                        <div className="text-[10px] text-[#8C7A68] sm:hidden truncate">
                          {entry.region || 'Lesotho'}
                        </div>
                      </div>
                    </div>

                    {/* Region */}
                    <div className="col-span-2 hidden sm:block text-xs text-[#A89884] font-medium tracking-wide uppercase truncate">
                      {entry.region || 'LESOTHO'}
                    </div>

                    {/* Rating */}
                    <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-xs sm:text-sm text-[#FFE79A]">
                      {entry.rating.toLocaleString()}
                    </div>

                    {/* Wins */}
                    <div className="col-span-3 sm:col-span-2 text-right text-xs font-bold text-[#E9DFCE]">
                      {entry.totalWins}{' '}
                      <span className="text-[10px] text-[#8C7A68] font-normal">Wins</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clearly Separated YOUR POSITION Row */}
            <div className="pt-2">
              <div className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                <span>YOUR STANDING</span>
                <span className="text-[#D9A855]">LIVE RECORD</span>
              </div>
              <div className="grid grid-cols-12 items-center p-3 rounded-xl bg-[#23170E] border border-[#8C6239]/80 shadow-md">
                <div className="col-span-1 text-center font-mono font-bold text-xs text-[#FFE79A]">
                  {userRankIndex}
                </div>
                <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 pl-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#341F12] border border-[#D9A855] flex items-center justify-center font-bold text-[11px] text-[#FFE79A] shrink-0">
                    {playerDisplayName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-['Syne'] font-bold text-xs sm:text-sm text-[#FFE79A] truncate flex items-center gap-1.5">
                      <span>{playerDisplayName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D9A855] text-[#120E0A] font-bold">
                        YOU
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A89884] sm:hidden truncate">
                      {playerRegion}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 hidden sm:block text-xs text-[#D9A855] font-semibold tracking-wide uppercase truncate">
                  {playerClan}
                </div>
                <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-xs sm:text-sm text-[#FFD700]">
                  {playerRating.toLocaleString()}
                </div>
                <div className="col-span-3 sm:col-span-2 text-right text-xs font-bold text-[#E9DFCE]">
                  {wins} <span className="text-[10px] text-[#A89884] font-normal">Wins</span>
                </div>
              </div>
            </div>

            {/* View Full Rankings Button */}
            <button
              onClick={() => setViewFullRankingsModal(true)}
              className="w-full py-2.5 rounded-xl bg-[#18120C] hover:bg-[#221810] border border-[#2E2218] hover:border-[#D9A855]/60 text-xs font-bold text-[#D9A855] flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>VIEW FULL RANKINGS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* TWO BALANCED SUB-CARDS: YOUR STANDING & RECENT MATCHES */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sub-Card 1: YOUR STANDING */}
            <div className="rounded-2xl bg-[#140F0C] border border-[#2E2218] p-4 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#8C7A68] uppercase tracking-wider">
                    YOUR STANDING
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9A855]/15 text-[#FFE79A] border border-[#D9A855]/30">
                    Top 1%
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-[10px] text-[#A89884] font-medium uppercase">
                    Global Ranking
                  </div>
                  <div className="font-['Syne'] font-extrabold text-2xl text-[#FFFDF8]">
                    #{userRankIndex}
                  </div>
                </div>

                {/* Minimalist SVG Sparkline Rating Chart */}
                <div className="py-3">
                  <svg viewBox="0 0 200 60" className="w-full h-14 overflow-visible">
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D9A855" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#D9A855" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Area fill */}
                    <polygon
                      points="10,48 35,42 65,46 95,36 125,32 155,22 185,14 185,55 10,55"
                      fill="url(#sparklineGrad)"
                    />
                    {/* Smooth line */}
                    <polyline
                      points="10,48 35,42 65,46 95,36 125,32 155,22 185,14"
                      fill="none"
                      stroke="#D9A855"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Points */}
                    <circle cx="10" cy="48" r="2.5" fill="#D9A855" />
                    <circle cx="35" cy="42" r="2.5" fill="#D9A855" />
                    <circle cx="65" cy="46" r="2.5" fill="#D9A855" />
                    <circle cx="95" cy="36" r="2.5" fill="#D9A855" />
                    <circle cx="125" cy="32" r="2.5" fill="#D9A855" />
                    <circle cx="155" cy="22" r="2.5" fill="#D9A855" />
                    <circle cx="185" cy="14" r="3.5" fill="#FFE79A" stroke="#140F0C" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* Standing Delta */}
              <div className="flex items-center gap-1.5 text-xs text-[#52D48E] font-semibold pt-1 border-t border-[#221810]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>▲ 12 positions since last week</span>
              </div>
            </div>

            {/* Sub-Card 2: RECENT MATCHES */}
            <div className="rounded-2xl bg-[#140F0C] border border-[#2E2218] p-4 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-[#221810]">
                <h3 className="text-xs font-bold text-[#8C7A68] uppercase tracking-wider">
                  RECENT MATCHES
                </h3>
                <button
                  onClick={onOpenCareer}
                  className="text-[10px] font-bold text-[#D9A855] hover:text-[#FFE79A] transition-colors"
                >
                  View All
                </button>
              </div>

              {/* Match List */}
              <div className="space-y-2 py-2">
                {displayMatches.slice(0, 4).map((match) => {
                  const isWin = match.result === 'VICTORY';
                  const isLoss = match.result === 'DEFEAT';

                  return (
                    <div
                      key={match.matchId}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[#FFFDF8] truncate">
                          VS {match.opponentName}
                        </div>
                        <div className="text-[10px] text-[#8C7A68] truncate">
                          {formatMatchDuration(match.durationSeconds)} ·{' '}
                          {match.opponentClan || 'Arena'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Result Badge */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            isWin
                              ? 'bg-[#166534]/30 text-[#4ADE80] border border-[#22C55E]/30'
                              : isLoss
                              ? 'bg-[#7F1D1D]/30 text-[#F87171] border border-[#EF4444]/30'
                              : 'bg-[#451A03]/30 text-[#FDE68A] border border-[#D9A855]/30'
                          }`}
                        >
                          {match.result === 'VICTORY' ? 'WIN' : match.result === 'DEFEAT' ? 'LOSS' : 'DRAW'}
                        </span>

                        {/* Rating Delta */}
                        <span
                          className={`font-mono text-xs font-bold ${
                            match.ratingDelta >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'
                          }`}
                        >
                          {match.ratingDelta >= 0 ? `+${match.ratingDelta}` : match.ratingDelta}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="pt-2 border-t border-[#221810] text-[10px] text-[#8C7A68] text-right">
                Real authentic career history
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ZONE 3: RIGHT PLAYER IDENTITY & PRIMARY ACTIONS (3.5 cols on desktop) */}
        {/* ===================================================================== */}
        <div className="lg:col-span-3 xl:col-span-4 space-y-4">
          {/* ----------------------------------------------------------------- */}
          {/* PRESTIGIOUS PLAYER PROFILE CARD */}
          {/* ----------------------------------------------------------------- */}
          <div className="relative rounded-2xl bg-[#140F0B] border border-[#2E2218] overflow-hidden shadow-xl">
            {/* Atmospheric Lesotho Mountain Landscape Background Header */}
            <div className="relative h-28 w-full bg-gradient-to-b from-[#2B1B10] via-[#1A1009] to-[#140F0B] overflow-hidden">
              {/* Subtle mountain silhouettes & golden hour gradient */}
              <svg
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full opacity-35"
              >
                <defs>
                  <linearGradient id="lesothoSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9A855" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#8C4E20" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#140F0B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="400" height="120" fill="url(#lesothoSky)" />
                {/* Distant Mountain Peaks (Thaba-Bosiu & Maloti) */}
                <path
                  d="M0 120 L30 80 L70 95 L120 65 L170 85 L220 50 L270 75 L320 60 L370 90 L400 70 L400 120 Z"
                  fill="#1C120A"
                />
                {/* Mid-ground Ridgeline */}
                <path
                  d="M0 120 L50 90 L110 105 L160 85 L230 100 L300 80 L360 100 L400 95 L400 120 Z"
                  fill="#140D07"
                />
              </svg>
            </div>

            {/* Profile Content Body */}
            <div className="relative px-5 pb-5 -mt-12 space-y-4">
              {/* Avatar with Circular Ring & Edit Icon */}
              <div className="flex items-end justify-between">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#20150E] border-2 border-[#D9A855] p-1 shadow-xl">
                    <div className="w-full h-full rounded-full bg-[#2E1E12] flex items-center justify-center font-['Syne'] font-extrabold text-2xl text-[#FFE79A]">
                      {playerDisplayName.charAt(0)}
                    </div>
                  </div>
                  {onOpenAuth && (
                    <button
                      onClick={onOpenAuth}
                      className="absolute bottom-0 right-0 p-1 rounded-full bg-[#D9A855] text-[#120E0A] hover:bg-[#FFE79A] transition-colors shadow-md"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8C7A68] uppercase tracking-wider block">
                    YOUR PROFILE
                  </span>
                  <span className="text-xs font-semibold text-[#D9A855] flex items-center justify-end gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{playerRegion}, Lesotho</span>
                  </span>
                </div>
              </div>

              {/* Player Identity Name & Clan */}
              <div>
                <h3 className="font-['Syne'] font-extrabold text-xl text-[#FFFDF8] uppercase tracking-wide">
                  {playerDisplayName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#FFD700] text-xs">★</span>
                  <span className="text-xs font-bold text-[#D9A855] uppercase tracking-wider">
                    {playerClan}
                  </span>
                </div>
              </div>

              {/* Three Stat Headers: RATING | CAREER XP | LEVEL */}
              <div className="grid grid-cols-3 gap-2 bg-[#0E0B08] p-3 rounded-xl border border-[#221810] text-center">
                <div>
                  <span className="text-[9px] text-[#8C7A68] uppercase font-bold block">
                    RATING
                  </span>
                  <span className="font-mono font-extrabold text-sm sm:text-base text-[#FFE79A]">
                    {playerRating.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8C7A68] uppercase font-bold block">
                    CAREER XP
                  </span>
                  <span className="font-mono font-extrabold text-sm sm:text-base text-[#52D48E]">
                    {playerXp.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8C7A68] uppercase font-bold block">
                    LEVEL
                  </span>
                  <span className="font-mono font-extrabold text-sm sm:text-base text-[#FFFDF8]">
                    {playerLevel}
                  </span>
                </div>
              </div>

              {/* Clean 4-Stat Record Row: WINS | LOSSES | DRAWS | WIN RATE */}
              <div className="grid grid-cols-4 gap-1.5 py-2 border-y border-[#221810] text-center">
                <div>
                  <span className="font-['Syne'] font-extrabold text-lg text-[#4ADE80] block">
                    {wins}
                  </span>
                  <span className="text-[9px] font-bold text-[#8C7A68] uppercase">WINS</span>
                </div>
                <div>
                  <span className="font-['Syne'] font-extrabold text-lg text-[#F87171] block">
                    {losses}
                  </span>
                  <span className="text-[9px] font-bold text-[#8C7A68] uppercase">LOSSES</span>
                </div>
                <div>
                  <span className="font-['Syne'] font-extrabold text-lg text-[#FDE68A] block">
                    {draws}
                  </span>
                  <span className="text-[9px] font-bold text-[#8C7A68] uppercase">DRAWS</span>
                </div>
                <div>
                  <span className="font-['Syne'] font-extrabold text-lg text-[#FFD700] block">
                    {winRate}%
                  </span>
                  <span className="text-[9px] font-bold text-[#8C7A68] uppercase">WIN RATE</span>
                </div>
              </div>

              {/* Streaks & Career Matches Row */}
              <div className="flex items-center justify-between text-xs text-[#A89884] px-1">
                <span>
                  Current Streak: <strong className="text-[#FFE79A]">🔥 {currentStreak}</strong>
                </span>
                <span>
                  Best Streak: <strong className="text-[#FFFDF8]">{bestStreak}</strong>
                </span>
                <span>
                  Matches: <strong className="text-[#FFFDF8]">{totalMatches}</strong>
                </span>
              </div>

              {/* Equipped Cattle Set Preview with Actual Bottle Caps */}
              <div
                onClick={onOpenCareer}
                className="p-3 rounded-xl bg-[#0E0B08] border border-[#221810] hover:border-[#D9A855]/60 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFE79A]">
                    <span className="text-[#FFD700]">★</span>
                    <span>Obsidian Cattle Set</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7A6A58] group-hover:text-[#FFE79A] transition-colors" />
                </div>

                {/* 5 Tactile Bottle-Cap Tokens */}
                <div className="flex items-center justify-between px-2 pt-1">
                  {[1, 2, 3, 4, 5].map((capIndex) => (
                    <div
                      key={capIndex}
                      className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2A1D13] to-[#120E0A] border border-[#8C6838] flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform"
                    >
                      <BasothoCattleEmblem
                        isPlayer={capIndex % 2 !== 0}
                        setId="heritage"
                        size={16}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* PRIMARY ACTION CTAs */}
          {/* ----------------------------------------------------------------- */}
          <div className="space-y-2.5">
            {/* Primary Action 1: PLAY GAME (Strongest CTA on the page) */}
            <button
              onClick={onBackToGame}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D9A855] via-[#E8BE6F] to-[#C49340] hover:brightness-110 active:scale-[0.99] text-[#120E0A] font-['Syne'] font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(217,168,85,0.25)] transition-all"
            >
              <Play className="w-5 h-5 fill-[#120E0A]" />
              <span>PLAY GAME</span>
            </button>

            {/* Secondary Action 2: DAILY CHALLENGE */}
            {onOpenDaily && (
              <button
                onClick={onOpenDaily}
                className="w-full py-3 rounded-xl bg-[#140F0B] hover:bg-[#1E1610] border border-[#2E2218] hover:border-[#D9A855]/60 text-xs sm:text-sm font-bold text-[#E9DFCE] hover:text-[#FFFDF8] tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Target className="w-4 h-4 text-[#D9A855]" />
                <span>DAILY CHALLENGE</span>
              </button>
            )}

            {/* Secondary Action 3: PUZZLES */}
            {onOpenPuzzles && (
              <button
                onClick={onOpenPuzzles}
                className="w-full py-3 rounded-xl bg-[#140F0B] hover:bg-[#1E1610] border border-[#2E2218] hover:border-[#D9A855]/60 text-xs sm:text-sm font-bold text-[#E9DFCE] hover:text-[#FFFDF8] tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Layers className="w-4 h-4 text-[#D9A855]" />
                <span>PUZZLES</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL RANKINGS EXPANDED MODAL */}
      {/* ========================================================================= */}
      {viewFullRankingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[#140F0B] border border-[#3A2B1D] p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#261B12]">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-['Syne'] font-extrabold text-base text-[#FFFDF8] uppercase">
                  Global Basotho Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setViewFullRankingsModal(false)}
                className="px-3 py-1 rounded-lg bg-[#20150E] border border-[#3A2B1D] text-xs font-bold text-[#A89884] hover:text-[#FFFDF8]"
              >
                ✕ Close
              </button>
            </div>

            {/* List with Scroll */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {activeLeaderboardData.map((entry, index) => {
                const rankNum = index + 1;
                const isSelf = currentUser && entry.userId === currentUser.uid;

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 items-center p-3 rounded-xl border ${
                      isSelf
                        ? 'bg-[#23170E] border-[#D9A855]'
                        : 'bg-[#0E0B08] border-[#221810]'
                    }`}
                  >
                    <div className="col-span-1 text-center font-mono font-bold text-xs text-[#8C7A68]">
                      #{rankNum}
                    </div>
                    <div className="col-span-6 flex items-center gap-2 min-w-0 pl-2">
                      <div className="w-7 h-7 rounded-full bg-[#20150E] border border-[#8C6838]/60 flex items-center justify-center text-xs font-bold text-[#D9A855]">
                        {entry.displayName.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-[#FFFDF8] truncate">
                        {entry.displayName}
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-xs text-[#FFE79A]">
                      {entry.rating}
                    </div>
                    <div className="col-span-3 text-right text-xs text-[#A89884]">
                      {entry.totalWins} Wins
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PLAYER DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#140F0B] border-2 border-[#D9A855] p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D9A855]/20 text-[#FFE79A]">
                  TACTICIAN DOSSIER
                </span>
                <h3 className="font-['Syne'] font-extrabold text-lg text-[#FFFDF8] mt-1">
                  {selectedPlayerModal.displayName}
                </h3>
                <p className="text-xs text-[#D9A855]">
                  {selectedPlayerModal.rankTierName} · {selectedPlayerModal.region || 'Lesotho'}
                </p>
              </div>
              <div className="text-right font-mono font-extrabold text-base text-[#FFD700]">
                {selectedPlayerModal.rating} <span className="text-[10px]">ELO</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#0E0B08] p-3 rounded-xl border border-[#221810] text-center">
              <div>
                <span className="text-[10px] text-[#8C7A68] block font-bold">WINS</span>
                <span className="text-sm font-bold text-[#4ADE80]">
                  {selectedPlayerModal.totalWins}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C7A68] block font-bold">STREAK</span>
                <span className="text-sm font-bold text-[#FFE79A]">
                  🔥 {selectedPlayerModal.dailyStreak}d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C7A68] block font-bold">PUZZLES</span>
                <span className="text-sm font-bold text-[#52D48E]">
                  🎯 {selectedPlayerModal.puzzlesSolved}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedPlayerModal(null);
                  onStartMatch('ai');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D9A855] hover:bg-[#FFE79A] text-[#120E0A] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Challenge in Arena</span>
              </button>
              <button
                onClick={() => setSelectedPlayerModal(null)}
                className="px-4 py-2.5 rounded-xl bg-[#20150E] border border-[#3A2B1D] text-xs font-bold text-[#E9DFCE] hover:text-[#FFFDF8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
