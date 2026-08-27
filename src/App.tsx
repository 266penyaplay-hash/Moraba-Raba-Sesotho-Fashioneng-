import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GameState,
  BoardPoint,
  GameMode,
  PlayerId,
  AppView,
  DifficultyStageId,
  PlayerProgression,
  StrategyTip as StrategyTipType,
  AltitudeZoneId,
  CattleSetId,
} from './types';
import {
  getInitialGameState,
  checkMillsForPoint,
  checkGrandMeridianLine,
  getCapturablePoints,
  determinePhase,
  getLegalMovesForPoint,
  checkPlayerHasLegalMoves,
  resolveTurnTransitionAfterMove,
  validateMove,
} from './engine/morabaraba';
import { getAiMove, getAiAtomicMove, rankCapturesByStrategicValue, selectAiCapture } from './engine/aiEngine';
import {
  DIFFICULTY_STAGES,
  STAGES_LIST,
  loadPlayerProgression,
  savePlayerProgression,
} from './constants/stages';
import { getRandomStrategyTip } from './constants/strategyTips';
import { ALTITUDE_ZONES, isZoneUnlocked } from './constants/zones';
import { recordMatchResult } from './utils/streak';
import { computeMatchPerformanceStats } from './utils/performanceStats';
import { useFirebaseState } from './hooks/useFirebaseState';

import { SFBrandMonogram } from './components/BottleCapToken';
import { GameBoard } from './components/GameBoard';
import { MinimalMatchHeader, ContextualInstruction, ForcedOpeningBanner } from './components/MinimalMatchUI';
import { DifficultyStageSelector } from './components/DifficultyStageSelector';
import { OpponentCinematicBanner } from './components/OpponentCinematicBanner';
import { StrategyTip } from './components/StrategyTip';
import { JourneyMapModal } from './components/JourneyMapModal';
import { VictoryCelebrationModal } from './components/VictoryCelebrationModal';
import { PausedMenu } from './components/PausedMenu';
import { DeliverableShowcase } from './components/DeliverableShowcase';
import { LesothoBackdrop, LesothoAtmosphere } from './components/LesothoBackdrop';
import { WeatherEffects } from './components/WeatherEffects';
import { PreMatchShowdown } from './components/PreMatchShowdown';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { TacticalPuzzlesModal } from './components/TacticalPuzzlesModal';
import { MasteryStatsModal } from './components/MasteryStatsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { AuthModal } from './components/AuthModal';
import { OnlineMatchModal } from './components/OnlineMatchModal';
import { OnlineGameBanner } from './components/OnlineGameBanner';
import { LeaderboardView } from './components/LeaderboardView';
import { CampaignPreMatchView } from './components/CampaignPreMatchView';
import { CareerProfileModal } from './components/CareerProfileModal';
import { loadPlayerMastery, recordMatchToMastery, getRankTier } from './utils/masteryStats';
import {
  PlayerCareerProfile,
  DetailedMatchRecord,
  HeadToHeadRecord,
} from './types';
import {
  loadPlayerCareerProfile,
  savePlayerCareerProfile,
  loadMatchHistory,
  loadHeadToHeadRecords,
  recordMatchToCareer,
} from './utils/careerStats';
import { unlockAchievement, loadAchievements } from './constants/achievements';
import { loadDailyStreakData } from './constants/dailyChallenges';
import { sound } from './utils/audio';
import {
  OnlineGameRoom,
  updateOnlineRoomGameState,
  subscribeToOnlineRoom,
  leaveOnlineRoom,
  saveCloudDetailedMatch,
  saveCloudCareerProfile,
  saveCloudHeadToHead,
} from './services/firebase';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Bot,
  Users,
  Eye,
  Menu,
  Sun,
  Sparkles,
  Mountain,
  ChevronDown,
  ChevronUp,
  Map,
  Crown,
  Clock,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  Zap,
  Flame,
  Target,
  Trophy,
  Award,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  const initialStage = DIFFICULTY_STAGES.matenase;
  const [view, setView] = useState<AppView>('game');
  const [gameState, setGameState] = useState<GameState>(() => {
    const fresh = getInitialGameState();
    fresh.isAiOpponent = true;
    fresh.difficultyStage = 'matenase';
    fresh.ivory.name = initialStage.opponentName;
    fresh.ivory.materialLabel = `${initialStage.mapName} · ${initialStage.difficultyLabel}`;
    return fresh;
  });
  const [capturablePoints, setCapturablePoints] = useState<string[]>([]);
  const [pausedMenuOpen, setPausedMenuOpen] = useState<boolean>(false);
  const [journeyModalOpen, setJourneyModalOpen] = useState<boolean>(false);
  const [victoryModalOpen, setVictoryModalOpen] = useState<boolean>(false);
  const [dailyChallengeOpen, setDailyChallengeOpen] = useState<boolean>(false);
  const [tacticalPuzzlesOpen, setTacticalPuzzlesOpen] = useState<boolean>(false);
  const [masteryModalOpen, setMasteryModalOpen] = useState<boolean>(false);
  const [achievementsModalOpen, setAchievementsModalOpen] = useState<boolean>(false);
  const [cloudSyncModalOpen, setCloudSyncModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [onlineMatchModalOpen, setOnlineMatchModalOpen] = useState<boolean>(false);
  const [careerModalOpen, setCareerModalOpen] = useState<boolean>(false);
  const [careerProfile, setCareerProfile] = useState<PlayerCareerProfile>(() => loadPlayerCareerProfile());
  const [matchHistory, setMatchHistory] = useState<DetailedMatchRecord[]>(() => loadMatchHistory());
  const [headToHeadRecords, setHeadToHeadRecords] = useState<HeadToHeadRecord[]>(() => loadHeadToHeadRecords());
  const [activeOnlineRoom, setActiveOnlineRoom] = useState<OnlineGameRoom | null>(null);
  const [onlinePlayerRole, setOnlinePlayerRole] = useState<'obsidian' | 'ivory'>('obsidian');
  const [initialInviteRoomCode, setInitialInviteRoomCode] = useState<string | null>(null);
  const [preMatchShowdownOpen, setPreMatchShowdownOpen] = useState<boolean>(false);
  const [pendingStageForShowdown, setPendingStageForShowdown] = useState<DifficultyStageId>('matenase');
  const [dailyStreak, setDailyStreak] = useState<number>(() => loadDailyStreakData().currentStreak);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [atmosphere, setAtmosphere] = useState<LesothoAtmosphere>(initialStage.atmosphere);
  const [sunbeamActive, setSunbeamActive] = useState<boolean>(true);
  const [stageSelectorOpen, setStageSelectorOpen] = useState<boolean>(false);
  const [liveDialogue, setLiveDialogue] = useState<string | null>(initialStage.dialogues.start[0]);
  const [hasTriggeredFirstMill, setHasTriggeredFirstMill] = useState<boolean>(false);

  // Turn Clock and Board Shake Mechanics
  const [isClockEnabled, setIsClockEnabled] = useState<boolean>(true);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(initialStage.profile?.turnTimeLimitSeconds || 45);
  const [shakeIntensity, setShakeIntensity] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  const shakeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Strategy Tip State (Appears strictly during initial loading state of difficulty stage)
  const [currentStrategyTip, setCurrentStrategyTip] = useState<StrategyTipType | null>(() =>
    getRandomStrategyTip('matenase')
  );
  const [isStageLoading, setIsStageLoading] = useState<boolean>(true);
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);

  // Persistent Player Journey Progression & Unlocks
  const [progression, setProgression] = useState<PlayerProgression>(() => loadPlayerProgression());

  const handleSelectCattleSet = (setId: CattleSetId) => {
    const updated: PlayerProgression = { ...progression, selectedCattleSet: setId };
    setProgression(updated);
    savePlayerProgression(updated);
    if (isCloudSynced) {
      syncProgression(updated);
    }
  };

  // Firebase Firestore & Authentication State Sync Hook
  const {
    currentUser,
    userProfile,
    authLoading,
    isCloudSynced,
    isSyncing,
    lastSyncedTimestamp,
    syncError,
    syncProgression,
    syncAllToCloud,
    syncAllFromCloud,
    recordMatch,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordReset,
    updateProfile,
    signInAsGuest,
    signOut,
  } = useFirebaseState();

  // Check URL query parameters for direct room invites (?room=SF-XXXX)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInitialInviteRoomCode(roomParam.trim().toUpperCase());
        setOnlineMatchModalOpen(true);
      }
    }
  }, []);

  // Real-time synchronization when inside an active online multiplayer match
  useEffect(() => {
    if (!activeOnlineRoom?.id || !isMatchActive || gameState.isAiOpponent) return;

    const unsubscribe = subscribeToOnlineRoom(activeOnlineRoom.id, (updatedRoom) => {
      if (!updatedRoom) return;
      setActiveOnlineRoom(updatedRoom);

      setGameState((prev) => {
        const isMyTurn = updatedRoom.turn === onlinePlayerRole;
        let status = '';
        if (updatedRoom.winner) {
          status = `${updatedRoom.winner === 'obsidian' ? updatedRoom.obsidian.name : updatedRoom.ivory.name} has won the match!`;
        } else if (updatedRoom.phase === 'shooting') {
          status = isMyTurn
            ? 'Mill formed! Shoot one opposing cattle.'
            : `${updatedRoom.turn === 'obsidian' ? updatedRoom.obsidian.name : updatedRoom.ivory.name} formed a mill!`;
        } else if (updatedRoom.phase === 'placing') {
          status = isMyTurn ? 'Your turn! Place one cattle token.' : `Waiting for ${updatedRoom.turn === 'obsidian' ? updatedRoom.obsidian.name : updatedRoom.ivory.name}...`;
        } else {
          status = isMyTurn ? 'Your turn! Move one cattle token.' : `Waiting for ${updatedRoom.turn === 'obsidian' ? updatedRoom.obsidian.name : updatedRoom.ivory.name}...`;
        }

        return {
          ...prev,
          turn: updatedRoom.turn,
          phase: updatedRoom.phase,
          points: updatedRoom.boardPoints || prev.points,
          obsidian: updatedRoom.obsidian,
          ivory: updatedRoom.ivory,
          activeMillLines: updatedRoom.activeMillLines || [],
          flashMill: updatedRoom.flashMill || null,
          forcedOpening: updatedRoom.forcedOpening || null,
          winner: updatedRoom.winner,
          moveCount: updatedRoom.moveCount,
          history: updatedRoom.history || prev.history,
          statusMessage: status,
        };
      });

      if (updatedRoom.winner) {
        setVictoryModalOpen(true);
      }
    });

    return () => unsubscribe();
  }, [activeOnlineRoom?.id, isMatchActive, gameState.isAiOpponent, onlinePlayerRole]);

  // Sync state mutation to online room document
  const syncToOnlineRoom = useCallback(
    (nextState: GameState, lastMoveData?: any) => {
      if (!activeOnlineRoom?.id) return;
      updateOnlineRoomGameState(activeOnlineRoom.id, {
        turn: nextState.turn,
        phase: nextState.phase,
        boardPoints: nextState.points,
        obsidian: nextState.obsidian,
        ivory: nextState.ivory,
        pendingMillCount: nextState.pendingMillCount,
        activeMillLines: nextState.activeMillLines,
        flashMill: nextState.flashMill,
        winner: nextState.winner,
        forcedOpening: nextState.forcedOpening,
        moveCount: nextState.moveCount,
        history: nextState.history,
        lastMove: lastMoveData || null,
      });
    },
    [activeOnlineRoom?.id]
  );

  const handleStartOnlineGame = useCallback(
    (room: OnlineGameRoom, role: 'obsidian' | 'ivory') => {
      setActiveOnlineRoom(room);
      setOnlinePlayerRole(role);
      setOnlineMatchModalOpen(false);

      const stageId = room.stageId || 'matenase';
      const stage = DIFFICULTY_STAGES[stageId] || DIFFICULTY_STAGES.matenase;

      const freshState = getInitialGameState();
      freshState.isAiOpponent = false;
      freshState.difficultyStage = stageId;
      freshState.turn = room.turn || 'obsidian';
      freshState.phase = room.phase || 'placing';
      freshState.points = room.boardPoints || freshState.points;
      freshState.obsidian = room.obsidian;
      freshState.ivory = room.ivory;
      freshState.statusMessage =
        room.turn === role
          ? 'Your turn! Place one cattle token.'
          : `Waiting for ${role === 'obsidian' ? room.ivory.name : room.obsidian.name}...`;

      setGameState(freshState);
      setCapturablePoints([]);
      setAtmosphere((room.atmosphere as LesothoAtmosphere) || stage.atmosphere);
      setIsMatchActive(true);
      setView('game');
    },
    []
  );

  const activeStage = DIFFICULTY_STAGES[gameState.difficultyStage] || DIFFICULTY_STAGES.matenase;
  const stageTurnTime = activeStage.profile?.turnTimeLimitSeconds || 30;

  // Track most recent move / placement for visual origin & destination highlighting
  const lastMoveHighlight = useMemo(() => {
    if (!gameState.history || gameState.history.length === 0) return null;
    for (let i = gameState.history.length - 1; i >= 0; i--) {
      const entry = gameState.history[i];
      if (entry.type === 'move' || entry.type === 'place') {
        return {
          from: entry.from,
          to: entry.to,
          type: entry.type,
          player: entry.player,
        };
      }
    }
    return null;
  }, [gameState.history]);

  // Auto-dismiss StrategyTip after initial stage load window
  useEffect(() => {
    if (!isStageLoading) return;
    const timer = setTimeout(() => {
      setIsStageLoading(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, [isStageLoading, gameState.difficultyStage]);

  // Trigger Board Shake with automatic reset
  const triggerBoardShake = useCallback((level: 'light' | 'medium' | 'heavy') => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setShakeIntensity(level);
    shakeTimerRef.current = setTimeout(() => {
      setShakeIntensity('none');
    }, 450);
  }, []);

  // Initialize a fresh game session with difficulty stage
  const handleStartGame = useCallback(
    (mode: GameMode, stageId: DifficultyStageId = gameState.difficultyStage) => {
      const stage = DIFFICULTY_STAGES[stageId] || DIFFICULTY_STAGES.matenase;
      const freshState = getInitialGameState();
      freshState.isAiOpponent = mode === 'ai';
      freshState.difficultyStage = stageId;
      freshState.statusMessage = 'Place one cattle token.';

      if (mode === 'ai') {
        freshState.ivory.name = stage.opponentName;
        freshState.ivory.materialLabel = `${stage.mapName} · ${stage.difficultyLabel}`;
        setLiveDialogue(stage.dialogues.start[0]);
      } else {
        setLiveDialogue(null);
      }

      setGameState(freshState);
      setCapturablePoints([]);
      setAtmosphere(stage.atmosphere);
      setHasTriggeredFirstMill(false);
      setVictoryModalOpen(false);
      setTurnTimeRemaining(stage.profile?.turnTimeLimitSeconds || 30);
      setCurrentStrategyTip(getRandomStrategyTip(stageId));
      setIsStageLoading(true);
      setIsMatchActive(true);
      setView('game');
    },
    [gameState.difficultyStage]
  );

  // Switch difficulty stage
  const handleSelectStage = (stageId: DifficultyStageId) => {
    const stage = DIFFICULTY_STAGES[stageId] || DIFFICULTY_STAGES.matenase;
    setAtmosphere(stage.atmosphere);
    setGameState((prev) => {
      const next = { ...prev, difficultyStage: stageId };
      if (next.isAiOpponent) {
        next.ivory = {
          ...next.ivory,
          name: stage.opponentName,
          materialLabel: `${stage.mapName} · ${stage.difficultyLabel}`,
        };
      }
      return next;
    });
    setTurnTimeRemaining(stage.profile?.turnTimeLimitSeconds || 30);
    setLiveDialogue(stage.dialogues.start[0]);
    setCurrentStrategyTip(getRandomStrategyTip(stageId));
    setIsStageLoading(true);
  };

  // Select Altitude Zone from Geographic Ladder
  const handleSelectZone = (zoneId: AltitudeZoneId) => {
    setProgression((prev) => {
      const updated = { ...prev, selectedZoneId: zoneId };
      savePlayerProgression(updated);
      return updated;
    });
    const zone = ALTITUDE_ZONES[zoneId];
    if (zone && zone.weather.length > 0) {
      const w = zone.weather[0];
      if (w === 'heat-haze' || w === 'golden-dawn') setAtmosphere('golden-dawn');
      else if (w === 'mountain-rain') setAtmosphere('highland-mist');
      else if (w === 'alpine-snow') setAtmosphere('mokhotlong-storm');
      else if (w === 'dusk-firelight') setAtmosphere('tsoenene');
    }
  };

  // Toggle skin rewards
  const handleToggleTokenSkin = () => {
    setProgression((prev) => {
      const nextSkin = prev.selectedTokenSkin === 'royal-gold' ? 'standard' : 'royal-gold';
      const updated = { ...prev, selectedTokenSkin: nextSkin };
      savePlayerProgression(updated);
      return updated;
    });
  };

  const handleToggleBoardSkin = () => {
    setProgression((prev) => {
      const nextSkin = prev.selectedBoardSkin === 'firestone' ? 'sandstone' : 'firestone';
      const updated = { ...prev, selectedBoardSkin: nextSkin };
      savePlayerProgression(updated);
      return updated;
    });
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
  };

  // Turn Clock Timer Loop
  useEffect(() => {
    if (!isClockEnabled || gameState.winner || view !== 'game') return;

    const timer = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this turn
          triggerBoardShake('light');
          return stageTurnTime;
        }
        if (prev === 4 && gameState.turn === 'obsidian') {
          triggerBoardShake('light');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isClockEnabled, gameState.winner, gameState.turn, view, stageTurnTime, triggerBoardShake]);

  // Handle stage completion & unlocking rewards + win streak progression
  const handleMatchVictory = useCallback(
    (winner: PlayerId) => {
      triggerBoardShake('heavy');
      const isPlayerWin = winner === 'obsidian';
      const isAiWin = winner === 'ivory';
      const curStageId = gameState.difficultyStage;

      setProgression((prev) => {
        const completedSet = new Set<DifficultyStageId>(prev.completedStages);
        if (gameState.isAiOpponent && isPlayerWin) {
          completedSet.add(curStageId);
        }

        // Record Win Streak result
        const streakOutcome = isPlayerWin ? 'WIN' : isAiWin ? 'LOSS' : 'DRAW';
        const { nextState: nextStreak, didIncrease } = recordMatchResult(
          prev.winStreak || { currentStreak: 0, bestStreak: 0, streakTier: 'NONE', lastMatchResult: null, lastUpdatedAt: '' },
          streakOutcome
        );

        if (didIncrease) {
          sound.playStreakPulse(nextStreak.streakTier);
        }

        const completedList: DifficultyStageId[] = Array.from(completedSet);
        
        // Calculate unlocked altitude zones based on progression + win streak
        const unlockedZones: AltitudeZoneId[] = ['maseru'];
        if (isZoneUnlocked('semonkong', completedList, nextStreak)) {
          unlockedZones.push('semonkong');
        }
        if (isZoneUnlocked('mokhotlong', completedList, nextStreak)) {
          unlockedZones.push('mokhotlong');
        }
        if (isZoneUnlocked('thaba-bosiu', completedList, nextStreak)) {
          unlockedZones.push('thaba-bosiu');
        }

        const isBossStage = curStageId === 'morena' && isPlayerWin;
        const updated: PlayerProgression = {
          ...prev,
          completedStages: completedList,
          beatMorenaAchievementUnlocked: prev.beatMorenaAchievementUnlocked || isBossStage,
          royalCattleUnlocked: prev.royalCattleUnlocked || isBossStage || (curStageId === 'sefako' && isPlayerWin),
          firestoneBoardUnlocked: prev.firestoneBoardUnlocked || isBossStage,
          bohloaleCrownUnlocked: prev.bohloaleCrownUnlocked || isBossStage,
          selectedTokenSkin: isBossStage ? 'royal-gold' : prev.selectedTokenSkin,
          selectedBoardSkin: isBossStage ? 'firestone' : prev.selectedBoardSkin,
          unlockedZones,
          winStreak: nextStreak,
        };
        savePlayerProgression(updated);
        syncProgression(updated);
        return updated;
      });

      // Calculate deep match analytics and upload to Cloud Firestore
      const matchStats = computeMatchPerformanceStats(gameState, activeStage);
      recordMatch(winner, curStageId, gameState.isAiOpponent ? 'ai' : 'pvp', matchStats);

      // Record to Morabaraba Career System (Ledger, Modes, Rivalries, XP, Honors)
      const opponentName = gameState.isAiOpponent
        ? activeStage.opponentName
        : activeOnlineRoom
        ? onlinePlayerRole === 'obsidian'
          ? activeOnlineRoom.ivory.name
          : activeOnlineRoom.obsidian.name
        : 'Challenger';
      const opponentId = gameState.isAiOpponent
        ? curStageId
        : activeOnlineRoom
        ? onlinePlayerRole === 'obsidian'
          ? activeOnlineRoom.guestId || 'guest'
          : activeOnlineRoom.hostId
        : 'player2';
      const opponentType: 'ai' | 'human' = gameState.isAiOpponent ? 'ai' : 'human';
      const gameModeForCareer = gameState.isAiOpponent
        ? curStageId === 'morena'
          ? 'campaign'
          : 'ai'
        : activeOnlineRoom
        ? 'ranked'
        : 'casual';

      const wasComeback =
        isPlayerWin &&
        (gameState.history.filter(
          (h) => h.type === 'shoot' && h.player === 'ivory'
        ).length >=
          gameState.history.filter(
            (h) => h.type === 'shoot' && h.player === 'obsidian'
          ).length +
            2);

      const careerRecordResult = recordMatchToCareer({
        userId: currentUser?.uid || 'guest_player',
        opponentId,
        opponentName,
        opponentType,
        gameMode: gameModeForCareer,
        stageId: curStageId,
        winner,
        winnerName: isPlayerWin
          ? (currentUser?.displayName || 'Obsidian Herder')
          : isAiWin
          ? activeStage.opponentName
          : 'Draw',
        stats: matchStats,
        movesCount: gameState.moveCount,
        durationSeconds: 120,
        finalBoardPoints: gameState.points,
        wasComeback,
      });

      setCareerProfile(careerRecordResult.updatedProfile);
      setMatchHistory(loadMatchHistory());
      setHeadToHeadRecords(loadHeadToHeadRecords());

      // Push to Firestore if cloud account connected
      if (currentUser && !currentUser.isAnonymous) {
        saveCloudDetailedMatch(careerRecordResult.matchRecord);
        saveCloudCareerProfile(currentUser.uid, careerRecordResult.updatedProfile);
        saveCloudHeadToHead(currentUser.uid, loadHeadToHeadRecords());
      }

      // Record to Authentic Basotho Player Mastery & Competitive Rating System
      if (gameState.isAiOpponent) {
        const wasComeback =
          isPlayerWin &&
          (gameState.history.filter(
            (h) => h.type === 'shoot' && h.player === 'ivory'
          ).length >=
            gameState.history.filter(
              (h) => h.type === 'shoot' && h.player === 'obsidian'
            ).length +
              2);

        recordMatchToMastery(
          curStageId,
          isPlayerWin,
          winner === null,
          matchStats.playerMills,
          matchStats.opponentMills,
          matchStats.playerCaptures,
          gameState.moveCount,
          wasComeback
        );

        // Check & Unlock Behavioral Achievements
        if (matchStats.playerCaptures > 0) {
          unlockAchievement('first_blood');
        }
        if (matchStats.playerMills >= 3) {
          unlockAchievement('triple_threat');
        }
        if (wasComeback) {
          unlockAchievement('the_comeback');
        }
        if (curStageId === 'sefako' && isPlayerWin) {
          unlockAchievement('mountain_tested');
        }
        if (curStageId === 'morena') {
          unlockAchievement('the_kings_table');
        }
        if (curStageId === 'morena' && isPlayerWin) {
          unlockAchievement('i_beat_morena_letsie');
        }
        if (isPlayerWin && gameState.obsidian.onBoard >= 10) {
          unlockAchievement('kraal_preserver');
        }
      }

      if (gameState.isAiOpponent && isPlayerWin) {
        sound.playFanfare();
        setLiveDialogue(activeStage.dialogues.onPlayerWin[0]);
      } else if (gameState.isAiOpponent && isAiWin) {
        setLiveDialogue(activeStage.dialogues.onAiWin[0]);
      }

      setVictoryModalOpen(true);
    },
    [gameState.isAiOpponent, gameState.difficultyStage, activeStage, triggerBoardShake]
  );

  // Main interactive game loop handler for player moves
  const handlePointClick = (pointId: string) => {
    // If it's the AI's turn, ignore player board clicks
    if (gameState.isAiOpponent && gameState.turn === 'ivory') return;
    // If inside an online match and not our turn, ignore player board clicks
    if (activeOnlineRoom && gameState.turn !== onlinePlayerRole) return;

    const point = gameState.points[pointId];
    if (!point || gameState.winner) return;

    const currentPlayer = gameState.turn;
    const opponent: PlayerId = currentPlayer === 'obsidian' ? 'ivory' : 'obsidian';

    // Reset Turn Clock on legal action
    setTurnTimeRemaining(stageTurnTime);

    // -------------------------------------------------------------
    // PHASE 1: PLACING PHASE (Each player places 12 cattle)
    // -------------------------------------------------------------
    if (gameState.phase === 'placing') {
      if (point.piece !== null) return; // Must click vacant stone node

      sound.playPlace();
      triggerBoardShake('light');

      const newPoints = { ...gameState.points };
      newPoints[pointId] = { ...point, piece: currentPlayer };

      const curPlayerState = { ...gameState[currentPlayer] };
      curPlayerState.inHand -= 1;
      curPlayerState.onBoard += 1;

      // Check for Mill Formation
      const formedMills = checkMillsForPoint(pointId, currentPlayer, newPoints);
      if (formedMills.length > 0) {
        const isDoubleMill = formedMills.length >= 2;
        const millLines = formedMills.map((m) => m.points);
        const meridianCheck = isDoubleMill ? checkGrandMeridianLine(formedMills, pointId, currentPlayer, newPoints) : { isGrandMeridian: false, axis: null, meridianPoints: [] };
        const isGrand = isDoubleMill && meridianCheck.isGrandMeridian;

        if (isGrand) {
          sound.playGrandMeridian();
          triggerBoardShake('heavy');
          if (gameState.isAiOpponent) {
            setLiveDialogue("Spectator: 'LEKHALA LA METSI! The Mythic Grand Horizon Double Mill spans the Kraal!'");
          }
        } else if (isDoubleMill) {
          sound.playSmoothDoubleMill();
          triggerBoardShake('heavy');
          if (gameState.isAiOpponent) {
            setLiveDialogue("Spectator: 'Bohlale bo boholo! An immaculate Smooth Double Mill!'");
          }
        } else {
          sound.playMill();
          triggerBoardShake('heavy');
          if (currentPlayer === 'obsidian' && !hasTriggeredFirstMill && gameState.isAiOpponent) {
            setHasTriggeredFirstMill(true);
            setLiveDialogue(activeStage.dialogues.onPlayerFirstMill[0]);
          }
        }

        const targets = getCapturablePoints(opponent, newPoints);
        setCapturablePoints(targets);

        const shootingState: GameState = {
          ...gameState,
          points: newPoints,
          [currentPlayer]: curPlayerState,
          phase: 'shooting',
          flashMill: formedMills[0].points,
          activeMillLines: millLines,
          isDoubleMill,
          isGrandMeridian: isGrand,
          grandMeridianAxis: meridianCheck.axis,
          grandMeridianPoints: meridianCheck.meridianPoints,
          capturesRemaining: isDoubleMill ? 2 : 1,
          totalCapturesInSequence: isDoubleMill ? 2 : 1,
          doubleMillAnimation: isDoubleMill
            ? {
                active: true,
                player: currentPlayer,
                centerPointId: pointId,
                mills: millLines,
                stage: 'drawing',
                isGrandMeridian: isGrand,
                meridianAxis: meridianCheck.axis,
                meridianPoints: meridianCheck.meridianPoints,
              }
            : null,
          statusMessage: isGrand
            ? 'GRAND HORIZON DOUBLE MILL · CAPTURE 1 OF 2'
            : isDoubleMill
            ? 'SMOOTH DOUBLE MILL · CAPTURE 1 OF 2'
            : 'Mill formed. Choose one opposing token.',
          history: [
            ...gameState.history,
            {
              to: pointId,
              player: currentPlayer,
              type: 'place',
              millFormed: true,
              doubleMill: isDoubleMill,
              grandMeridian: isGrand,
            },
          ],
        };
        setGameState(shootingState);
        if (activeOnlineRoom) {
          syncToOnlineRoom(shootingState, {
            to: pointId,
            player: currentPlayer,
            type: 'place',
            millFormed: true,
            doubleMill: isDoubleMill,
          });
        }

        if (isDoubleMill) {
          setTimeout(() => {
            setGameState((prev) => {
              if (!prev.doubleMillAnimation) return prev;
              return {
                ...prev,
                doubleMillAnimation: null,
              };
            });
          }, 1600);
        }
        return;
      }

      // Check for phase transition
      const nextPhase = determinePhase(curPlayerState);
      const baseState: GameState = {
        ...gameState,
        points: newPoints,
        [currentPlayer]: curPlayerState,
        phase: nextPhase,
        flashMill: null,
        activeMillLines: [],
        isDoubleMill: false,
        capturesRemaining: 0,
        doubleMillAnimation: null,
        history: [
          ...gameState.history,
          { to: pointId, player: currentPlayer, type: 'place' },
        ],
      };

      const nextState = resolveTurnTransitionAfterMove(baseState, currentPlayer);
      setGameState(nextState);
      if (activeOnlineRoom) {
        syncToOnlineRoom(nextState, { to: pointId, player: currentPlayer, type: 'place' });
      }
      return;
    }

    // -------------------------------------------------------------
    // PHASE 2: MOVING PHASE (Directly connected adjacent empty nodes only)
    // -------------------------------------------------------------
    if (gameState.phase === 'moving') {
      // Step A: Select piece
      if (point.piece === currentPlayer) {
        sound.playSelect();
        const legalTargets = getLegalMovesForPoint(pointId, gameState.points, gameState.phase);
        setGameState((prev) => ({
          ...prev,
          selectedPointId: pointId,
          validTargets: legalTargets,
          statusMessage:
            legalTargets.length > 0
              ? 'Select adjacent destination.'
              : 'Token has no legal moves.',
        }));
        return;
      }

      // Step B: Move selected piece to destination
      if (gameState.selectedPointId && point.piece === null) {
        const fromId = gameState.selectedPointId;

        // CRITICAL 5-POINT MOVE VALIDATION:
        // 1. Origin contains the player’s cow.
        // 2. Destination is empty.
        // 3. Origin and destination are directly connected on the board.
        // 4. The move belongs to the player whose turn it is.
        // 5. Only then may the board state update.
        const validation = validateMove(fromId, pointId, currentPlayer, gameState.turn, gameState.points);
        if (!validation.valid) {
          // Reject invalid move immediately
          return;
        }

        sound.playMove();
        triggerBoardShake('light');

        const newPoints = { ...gameState.points };
        newPoints[fromId] = { ...newPoints[fromId], piece: null };
        newPoints[pointId] = { ...point, piece: currentPlayer };

        // Check for Mill
        const formedMills = checkMillsForPoint(pointId, currentPlayer, newPoints);
        if (formedMills.length > 0) {
          const isDoubleMill = formedMills.length >= 2;
          const millLines = formedMills.map((m) => m.points);
          const meridianCheck = isDoubleMill ? checkGrandMeridianLine(formedMills, pointId, currentPlayer, newPoints) : { isGrandMeridian: false, axis: null, meridianPoints: [] };
          const isGrand = isDoubleMill && meridianCheck.isGrandMeridian;

          if (isGrand) {
            sound.playGrandMeridian();
            triggerBoardShake('heavy');
            if (gameState.isAiOpponent) {
              setLiveDialogue("Spectator: 'LEKHALA LA METSI! The Mythic Grand Horizon Double Mill spans the Kraal!'");
            }
          } else if (isDoubleMill) {
            sound.playSmoothDoubleMill();
            triggerBoardShake('heavy');
            if (gameState.isAiOpponent) {
              setLiveDialogue("Spectator: 'Bohlale bo boholo! An immaculate Smooth Double Mill!'");
            }
          } else {
            sound.playMill();
            triggerBoardShake('heavy');
            if (currentPlayer === 'obsidian' && gameState.isAiOpponent && Math.random() > 0.4) {
              setLiveDialogue(activeStage.dialogues.onPlayerFirstMill[0]);
            }
          }

          const targets = getCapturablePoints(opponent, newPoints);
          setCapturablePoints(targets);

          const shootingState: GameState = {
            ...gameState,
            points: newPoints,
            selectedPointId: null,
            validTargets: [],
            phase: 'shooting',
            flashMill: formedMills[0].points,
            activeMillLines: millLines,
            isDoubleMill,
            isGrandMeridian: isGrand,
            grandMeridianAxis: meridianCheck.axis,
            grandMeridianPoints: meridianCheck.meridianPoints,
            capturesRemaining: isDoubleMill ? 2 : 1,
            totalCapturesInSequence: isDoubleMill ? 2 : 1,
            doubleMillAnimation: isDoubleMill
              ? {
                  active: true,
                  player: currentPlayer,
                  centerPointId: pointId,
                  mills: millLines,
                  stage: 'drawing',
                  isGrandMeridian: isGrand,
                  meridianAxis: meridianCheck.axis,
                  meridianPoints: meridianCheck.meridianPoints,
                }
              : null,
            statusMessage: isGrand
              ? 'GRAND HORIZON DOUBLE MILL · CAPTURE 1 OF 2'
              : isDoubleMill
              ? 'SMOOTH DOUBLE MILL · CAPTURE 1 OF 2'
              : 'Mill formed. Choose one opposing token.',
            history: [
              ...gameState.history,
              {
                from: fromId,
                to: pointId,
                player: currentPlayer,
                type: 'move',
                millFormed: true,
                doubleMill: isDoubleMill,
                grandMeridian: isGrand,
              },
            ],
          };
          setGameState(shootingState);
          if (activeOnlineRoom) {
            syncToOnlineRoom(shootingState, {
              from: fromId,
              to: pointId,
              player: currentPlayer,
              type: 'move',
              millFormed: true,
              doubleMill: isDoubleMill,
            });
          }

          if (isDoubleMill) {
            setTimeout(() => {
              setGameState((prev) => {
                if (!prev.doubleMillAnimation) return prev;
                return {
                  ...prev,
                  doubleMillAnimation: null,
                };
              });
            }, 1600);
          }
          return;
        }

        const baseState: GameState = {
          ...gameState,
          points: newPoints,
          selectedPointId: null,
          validTargets: [],
          flashMill: null,
          activeMillLines: [],
          isDoubleMill: false,
          capturesRemaining: 0,
          doubleMillAnimation: null,
          history: [
            ...gameState.history,
            { from: fromId, to: pointId, player: currentPlayer, type: 'move' },
          ],
        };

        const nextState = resolveTurnTransitionAfterMove(baseState, currentPlayer);

        if (nextState.winner) {
          handleMatchVictory(nextState.winner);
        }

        setGameState(nextState);
        if (activeOnlineRoom) {
          syncToOnlineRoom(nextState, { from: fromId, to: pointId, player: currentPlayer, type: 'move' });
        }
        return;
      }
    }

    // -------------------------------------------------------------
    // PHASE 4: SHOOTING / CAPTURE PHASE
    // -------------------------------------------------------------
    if (gameState.phase === 'shooting') {
      // If double mill animation is currently active (brief freeze), block capture until freeze finishes
      if (gameState.doubleMillAnimation?.active) return;

      if (point.piece !== opponent) return; // Must click opponent token
      
      // Calculate capturable targets dynamically to avoid stale closure
      const currentCapturables = getCapturablePoints(opponent, gameState.points);
      if (!currentCapturables.includes(pointId)) return; // Must be valid capturable target

      sound.playCapture();
      triggerBoardShake('medium');

      const newPoints = { ...gameState.points };
      newPoints[pointId] = { ...newPoints[pointId], piece: null };

      const oppPlayerState = { ...gameState[opponent] };
      oppPlayerState.onBoard -= 1;
      oppPlayerState.captured += 1;

      // Opponent Dialogue reaction to capture
      if (currentPlayer === 'obsidian' && gameState.isAiOpponent) {
        const reactions = activeStage.dialogues.onPlayerCapture;
        setLiveDialogue(reactions[Math.floor(Math.random() * reactions.length)]);
      }

      // Check win condition (opponent reduced to < 3 pieces in moving phase)
      if (oppPlayerState.inHand === 0 && oppPlayerState.onBoard < 3) {
        const winState: GameState = {
          ...gameState,
          points: newPoints,
          [opponent]: oppPlayerState,
          winner: currentPlayer,
          flashMill: null,
          activeMillLines: [],
          isDoubleMill: false,
          capturesRemaining: 0,
          doubleMillAnimation: null,
          statusMessage: `${currentPlayer === 'obsidian' ? 'PLAYER 01' : 'PLAYER 02'} has captured the kraal!`,
          history: [
            ...gameState.history,
            { to: pointId, player: currentPlayer, type: 'shoot' },
          ],
        };
        setGameState(winState);
        setCapturablePoints([]);
        if (activeOnlineRoom) {
          syncToOnlineRoom(winState, { to: pointId, player: currentPlayer, type: 'shoot' });
        }
        handleMatchVictory(currentPlayer);
        return;
      }

      // If this was a Smooth Double Mill with 2 captures and we just made capture 1:
      if (gameState.isDoubleMill && (gameState.capturesRemaining ?? 1) > 1) {
        const nextCapturables = getCapturablePoints(opponent, newPoints);
        setCapturablePoints(nextCapturables);

        const intermediateState: GameState = {
          ...gameState,
          points: newPoints,
          [opponent]: oppPlayerState,
          capturesRemaining: 1,
          totalCapturesInSequence: 2,
          statusMessage: 'SMOOTH DOUBLE MILL · CAPTURE 2 OF 2',
          history: [
            ...gameState.history,
            { to: pointId, player: currentPlayer, type: 'shoot' },
          ],
        };
        setGameState(intermediateState);
        if (activeOnlineRoom) {
          syncToOnlineRoom(intermediateState, { to: pointId, player: currentPlayer, type: 'shoot' });
        }
        return;
      }

      // Sequence complete (single mill or 2nd capture of double mill)
      const baseState: GameState = {
        ...gameState,
        points: newPoints,
        [opponent]: oppPlayerState,
        flashMill: null,
        activeMillLines: [],
        isDoubleMill: false,
        capturesRemaining: 0,
        doubleMillAnimation: null,
        history: [
          ...gameState.history,
          { to: pointId, player: currentPlayer, type: 'shoot' },
        ],
      };

      const nextState = resolveTurnTransitionAfterMove(baseState, currentPlayer);
      if (nextState.winner) {
        handleMatchVictory(nextState.winner);
      }
      setGameState(nextState);
      setCapturablePoints([]);
      if (activeOnlineRoom) {
        syncToOnlineRoom(nextState, { to: pointId, player: currentPlayer, type: 'shoot' });
      }
    }
  };

  // Dedicated atomic AI turn execution
  const executeAiTurn = useCallback(() => {
    if (gameState.winner || gameState.turn !== 'ivory' || !gameState.isAiOpponent) return;
    if (gameState.doubleMillAnimation?.active) return; // Wait for freeze animation to finish

    // Reset Turn Clock on AI action
    setTurnTimeRemaining(stageTurnTime);

    // 1. CAPTURE / SHOOTING PHASE
    if (gameState.phase === 'shooting') {
      const capturables = getCapturablePoints('obsidian', gameState.points);
      if (capturables.length === 0) {
        const baseState = {
          ...gameState,
          flashMill: null,
          activeMillLines: [],
          isDoubleMill: false,
          capturesRemaining: 0,
          doubleMillAnimation: null,
          selectedPointId: null,
          validTargets: [],
        };
        const nextState = resolveTurnTransitionAfterMove(baseState, 'ivory');
        setGameState(nextState);
        return;
      }

      const captureId = selectAiCapture(capturables, 'obsidian', gameState.points, gameState.phase, activeStage.profile);

      sound.playCapture();
      triggerBoardShake('medium');

      const newPoints = { ...gameState.points };
      newPoints[captureId] = { ...newPoints[captureId], piece: null };

      const oppPlayerState = { ...gameState.obsidian };
      oppPlayerState.onBoard -= 1;
      oppPlayerState.captured += 1;

      if (oppPlayerState.inHand === 0 && oppPlayerState.onBoard < 3) {
        const victoryState: GameState = {
          ...gameState,
          points: newPoints,
          obsidian: oppPlayerState,
          winner: 'ivory',
          flashMill: null,
          activeMillLines: [],
          isDoubleMill: false,
          capturesRemaining: 0,
          doubleMillAnimation: null,
          selectedPointId: null,
          validTargets: [],
          statusMessage: `${activeStage.opponentName} has captured the kraal!`,
          history: [
            ...gameState.history,
            { to: captureId, player: 'ivory', type: 'shoot' },
          ],
        };
        setGameState(victoryState);
        setCapturablePoints([]);
        handleMatchVictory('ivory');
        return;
      }

      // If this was a Smooth Double Mill with 2 captures and AI just made capture 1:
      if (gameState.isDoubleMill && (gameState.capturesRemaining ?? 1) > 1) {
        const intermediateState: GameState = {
          ...gameState,
          points: newPoints,
          obsidian: oppPlayerState,
          capturesRemaining: 1,
          totalCapturesInSequence: 2,
          statusMessage: 'SMOOTH DOUBLE MILL · CAPTURE 2 OF 2',
          history: [
            ...gameState.history,
            { to: captureId, player: 'ivory', type: 'shoot' },
          ],
        };
        setGameState(intermediateState);
        return;
      }

      // Sequence complete
      const baseState: GameState = {
        ...gameState,
        points: newPoints,
        obsidian: oppPlayerState,
        flashMill: null,
        activeMillLines: [],
        isDoubleMill: false,
        capturesRemaining: 0,
        doubleMillAnimation: null,
        selectedPointId: null,
        validTargets: [],
        history: [
          ...gameState.history,
          { to: captureId, player: 'ivory', type: 'shoot' },
        ],
      };

      const nextState = resolveTurnTransitionAfterMove(baseState, 'ivory');
      if (nextState.winner) {
        handleMatchVictory(nextState.winner);
      }
      setGameState(nextState);
      setCapturablePoints([]);
      return;
    }

    // 2. ATOMIC MOVE SEARCH FOR PLACING, MOVING, FLYING
    const { move } = getAiAtomicMove(gameState, gameState.difficultyStage);

    if (!move) {
      // AI has no legal moves; check for Sotho 25 trapped transition or victory
      const nextState = resolveTurnTransitionAfterMove(gameState, 'obsidian');
      setGameState(nextState);
      return;
    }

    // A. Placing Phase
    if (move.type === 'place') {
      sound.playPlace();
      triggerBoardShake('light');

      const newPoints = { ...gameState.points };
      newPoints[move.to] = { ...newPoints[move.to], piece: 'ivory' };

      const curPlayerState = { ...gameState.ivory };
      curPlayerState.inHand -= 1;
      curPlayerState.onBoard += 1;

      const formedMills = checkMillsForPoint(move.to, 'ivory', newPoints);

      if (formedMills.length > 0) {
        const isDoubleMill = formedMills.length >= 2;
        const millLines = formedMills.map((m) => m.points);
        const meridianCheck = isDoubleMill ? checkGrandMeridianLine(formedMills, move.to, 'ivory', newPoints) : { isGrandMeridian: false, axis: null, meridianPoints: [] };
        const isGrand = isDoubleMill && meridianCheck.isGrandMeridian;

        if (isGrand) {
          sound.playGrandMeridian();
          triggerBoardShake('heavy');
          setLiveDialogue(`Spectator: 'LEKHALA LA METSI! ${activeStage.opponentName} executed the Mythic Grand Horizon Double Mill!'`);
        } else if (isDoubleMill) {
          sound.playSmoothDoubleMill();
          triggerBoardShake('heavy');
          setLiveDialogue(`Spectator: 'Bohlale bo boholo! An immaculate Smooth Double Mill by ${activeStage.opponentName}!'`);
        } else {
          sound.playMill();
          triggerBoardShake('heavy');
        }

        const capturables = getCapturablePoints('obsidian', newPoints);

        const shootingState: GameState = {
          ...gameState,
          points: newPoints,
          ivory: curPlayerState,
          phase: 'shooting',
          flashMill: formedMills[0].points,
          activeMillLines: millLines,
          isDoubleMill,
          isGrandMeridian: isGrand,
          grandMeridianAxis: meridianCheck.axis,
          grandMeridianPoints: meridianCheck.meridianPoints,
          capturesRemaining: isDoubleMill ? 2 : 1,
          totalCapturesInSequence: isDoubleMill ? 2 : 1,
          doubleMillAnimation: isDoubleMill
            ? {
                active: true,
                player: 'ivory',
                centerPointId: move.to,
                mills: millLines,
                stage: 'drawing',
                isGrandMeridian: isGrand,
                meridianAxis: meridianCheck.axis,
                meridianPoints: meridianCheck.meridianPoints,
              }
            : null,
          statusMessage: isGrand
            ? 'GRAND HORIZON DOUBLE MILL · CAPTURE 1 OF 2'
            : isDoubleMill
            ? 'SMOOTH DOUBLE MILL · CAPTURE 1 OF 2'
            : `${activeStage.opponentName} formed a mill!`,
          selectedPointId: null,
          validTargets: [],
          history: [
            ...gameState.history,
            {
              to: move.to,
              player: 'ivory',
              type: 'place',
              millFormed: true,
              doubleMill: isDoubleMill,
              grandMeridian: isGrand,
            },
          ],
        };
        setGameState(shootingState);
        setCapturablePoints(capturables);

        if (isDoubleMill) {
          setTimeout(() => {
            setGameState((prev) => {
              if (!prev.doubleMillAnimation) return prev;
              return {
                ...prev,
                doubleMillAnimation: null,
              };
            });
          }, 1600);
        }
        return;
      }

      // No mill on place
      const nextPhase = determinePhase(curPlayerState);
      const baseState: GameState = {
        ...gameState,
        points: newPoints,
        ivory: curPlayerState,
        phase: nextPhase,
        flashMill: null,
        activeMillLines: [],
        isDoubleMill: false,
        capturesRemaining: 0,
        doubleMillAnimation: null,
        selectedPointId: null,
        validTargets: [],
        history: [
          ...gameState.history,
          { to: move.to, player: 'ivory', type: 'place' },
        ],
      };

      const nextState = resolveTurnTransitionAfterMove(baseState, 'ivory');
      if (nextState.winner) {
        handleMatchVictory(nextState.winner);
      }
      setGameState(nextState);
      return;
    }

    // B. Moving Phase (Strict Adjacent Movement Only - No Jumping / Flying)
    if (move.type === 'move') {
      const fromId = move.from;
      const toId = move.to;

      if (!fromId || !toId) return;

      const validation = validateMove(fromId, toId, 'ivory', gameState.turn, gameState.points);
      if (!validation.valid) {
        console.warn('AI attempted illegal move rejected:', validation.reason);
        return;
      }

      sound.playMove();
      triggerBoardShake('light');

      const newPoints = { ...gameState.points };
      newPoints[fromId] = { ...newPoints[fromId], piece: null };
      newPoints[toId] = { ...newPoints[toId], piece: 'ivory' };

      const formedMills = checkMillsForPoint(toId, 'ivory', newPoints);

      if (formedMills.length > 0) {
        const isDoubleMill = formedMills.length >= 2;
        const millLines = formedMills.map((m) => m.points);
        const meridianCheck = isDoubleMill ? checkGrandMeridianLine(formedMills, toId, 'ivory', newPoints) : { isGrandMeridian: false, axis: null, meridianPoints: [] };
        const isGrand = isDoubleMill && meridianCheck.isGrandMeridian;

        if (isGrand) {
          sound.playGrandMeridian();
          triggerBoardShake('heavy');
          setLiveDialogue(`Spectator: 'LEKHALA LA METSI! ${activeStage.opponentName} executed the Mythic Grand Horizon Double Mill!'`);
        } else if (isDoubleMill) {
          sound.playSmoothDoubleMill();
          triggerBoardShake('heavy');
          setLiveDialogue(`Spectator: 'Bohlale bo boholo! An immaculate Smooth Double Mill by ${activeStage.opponentName}!'`);
        } else {
          sound.playMill();
          triggerBoardShake('heavy');
        }

        const capturables = getCapturablePoints('obsidian', newPoints);

        const shootingState: GameState = {
          ...gameState,
          points: newPoints,
          phase: 'shooting',
          flashMill: formedMills[0].points,
          activeMillLines: millLines,
          isDoubleMill,
          isGrandMeridian: isGrand,
          grandMeridianAxis: meridianCheck.axis,
          grandMeridianPoints: meridianCheck.meridianPoints,
          capturesRemaining: isDoubleMill ? 2 : 1,
          totalCapturesInSequence: isDoubleMill ? 2 : 1,
          doubleMillAnimation: isDoubleMill
            ? {
                active: true,
                player: 'ivory',
                centerPointId: toId,
                mills: millLines,
                stage: 'drawing',
                isGrandMeridian: isGrand,
                meridianAxis: meridianCheck.axis,
                meridianPoints: meridianCheck.meridianPoints,
              }
            : null,
          statusMessage: isGrand
            ? 'GRAND HORIZON DOUBLE MILL · CAPTURE 1 OF 2'
            : isDoubleMill
            ? 'SMOOTH DOUBLE MILL · CAPTURE 1 OF 2'
            : `${activeStage.opponentName} formed a mill!`,
          selectedPointId: null,
          validTargets: [],
          history: [
            ...gameState.history,
            {
              from: fromId,
              to: toId,
              player: 'ivory',
              type: 'move',
              millFormed: true,
              doubleMill: isDoubleMill,
              grandMeridian: isGrand,
            },
          ],
        };
        setGameState(shootingState);
        setCapturablePoints(capturables);

        if (isDoubleMill) {
          setTimeout(() => {
            setGameState((prev) => {
              if (!prev.doubleMillAnimation) return prev;
              return {
                ...prev,
                doubleMillAnimation: null,
              };
            });
          }, 1600);
        }
        return;
      }

      // No mill formed on move
      const baseState: GameState = {
        ...gameState,
        points: newPoints,
        flashMill: null,
        activeMillLines: [],
        isDoubleMill: false,
        capturesRemaining: 0,
        doubleMillAnimation: null,
        selectedPointId: null,
        validTargets: [],
        history: [
          ...gameState.history,
          { from: fromId, to: toId, player: 'ivory', type: 'move' },
        ],
      };

      const nextState = resolveTurnTransitionAfterMove(baseState, 'ivory');
      if (nextState.winner) {
        handleMatchVictory(nextState.winner);
      }
      setGameState(nextState);
    }
  }, [
    gameState,
    activeStage,
    stageTurnTime,
    triggerBoardShake,
    handleMatchVictory,
  ]);

  // AI Turn Trigger Hook with Strict Execution Locking
  useEffect(() => {
    if (
      gameState.isAiOpponent &&
      gameState.turn === 'ivory' &&
      !gameState.winner &&
      !gameState.doubleMillAnimation?.active &&
      view === 'game'
    ) {
      // Proportional thinking delay based on difficulty depth
      const thinkDelay = 380 + Math.min(activeStage.stageNumber * 60, 450);

      const timer = setTimeout(() => {
        executeAiTurn();
      }, thinkDelay);

      return () => clearTimeout(timer);
    }
  }, [
    gameState.turn,
    gameState.phase,
    gameState.winner,
    gameState.isAiOpponent,
    gameState.moveCount,
    gameState.capturesRemaining,
    gameState.doubleMillAnimation?.active,
    view,
    activeStage.stageNumber,
    executeAiTurn,
  ]);

  const isRoyalSkinEquipped = progression.selectedTokenSkin === 'royal-gold';
  const effectiveBoardSkin = progression.selectedBoardSkin;

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#E9E0CE] font-['Space_Grotesk'] flex flex-col items-center justify-between relative selection:bg-[#A98545]/40 selection:text-[#F4EAD7] overflow-x-hidden">
      
      {/* Lesotho Atmospheric Panoramic Backdrop with Thatched Rondavels & Maloti Mountains */}
      <LesothoBackdrop
        atmosphere={atmosphere}
        sunbeamIntensity={sunbeamActive ? 0.9 : 0.25}
      />

      {/* Real-time Atmospheric Particle & Lightning Physics Simulation */}
      <WeatherEffects
        atmosphere={atmosphere}
        intensity={sunbeamActive ? 1.0 : 0.6}
        lightningEnabled={true}
      />

      {/* Top Header */}
      <header className="w-full bg-[#0E0C0A]/85 border-b border-[#2E2318] px-4 py-2.5 z-40 sticky top-0 backdrop-blur-md">
        <div className="max-w-[460px] mx-auto flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <SFBrandMonogram size={20} fillColor="#D5A351" strokeColor="#32170F" embossed={true} />
            <h1 className="font-['Syne'] font-extrabold text-sm tracking-widest text-[#F4EAD7] uppercase">
              MORABARABA
            </h1>
            <span className="px-1.5 py-0.5 rounded-xs bg-[#1E1913] border border-[#3D3020] text-[9px] font-bold text-[#D1AF7A] tracking-wider uppercase">
              Lesotho 25
            </span>
            <button
              onClick={() => setCloudSyncModalOpen(true)}
              title={
                isSyncing
                  ? 'Firebase Syncing in progress...'
                  : isCloudSynced
                  ? 'Firebase Cloud Synced · Tap for Storage & Global Leaderboard'
                  : 'Firebase Guest · Tap to Sync & View Leaderboard'
              }
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-[#2A1D11] border-[#D9A855] text-[#FFE79A]'
                  : isCloudSynced
                  ? 'bg-[#182317] border-[#2B4029] text-[#78D385] hover:border-[#4B7047]'
                  : 'bg-[#1E1913] border-[#3D3020] text-[#D1AF7A] hover:border-[#D9A855]/60'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSyncing
                    ? 'bg-[#D9A855] animate-ping'
                    : isCloudSynced
                    ? 'bg-[#52C41A] animate-pulse'
                    : 'bg-[#A89884]'
                }`}
              />
              <span className="hidden xs:inline">
                {isSyncing ? 'Syncing...' : isCloudSynced ? 'Firestore' : 'Cloud'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Career Profile & Records Modal Trigger */}
            <button
              onClick={() => setCareerModalOpen(true)}
              title="Open Morabaraba Career Profile & Match Records"
              className="px-2.5 py-1 rounded-lg bg-[#2A180E] border border-[#D9A855]/70 hover:border-[#FFE79A] text-xs font-bold text-[#FFE79A] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="hidden xs:inline">Career</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#D9A855]/20 text-[#FFE79A] font-mono">
                {careerProfile.rating}
              </span>
            </button>

            {/* Journey Map Route Modal Trigger */}
            <button
              onClick={() => setJourneyModalOpen(true)}
              title="Open Journey Through Lesotho Map"
              className="px-2.5 py-1 rounded-lg bg-[#2A1D11] border border-[#D9A855]/60 hover:border-[#D9A855] text-xs font-bold text-[#FFE79A] transition-all flex items-center gap-1 shadow-sm"
            >
              <Map className="w-3.5 h-3.5 text-[#D9A855]" />
              <span className="hidden xs:inline">Journey</span>
              {progression.bohloaleCrownUnlocked && (
                <Crown className="w-3 h-3 text-[#FFD700]" />
              )}
            </button>

            {/* Turn Clock Toggle */}
            <button
              onClick={() => setIsClockEnabled(!isClockEnabled)}
              title={isClockEnabled ? 'Turn Clock Active' : 'Turn Clock Paused'}
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                isClockEnabled
                  ? 'bg-[#A98545]/20 border-[#A98545] text-[#FFE7B3]'
                  : 'bg-[#1E1913] border-[#3D3020] text-[#8C9090]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>

            {/* Atmospheric Lighting Quick Switcher */}
            <button
              onClick={() => setSunbeamActive(!sunbeamActive)}
              title="Toggle Golden Sunbeam Lighting"
              className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
                sunbeamActive
                  ? 'bg-[#A98545]/20 border-[#A98545] text-[#FFE7B3]'
                  : 'bg-[#1E1913] border-[#3D3020] text-[#8C9090]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setView(view === 'leaderboard' ? 'game' : 'leaderboard')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'leaderboard'
                  ? 'bg-[#D9A855] text-[#120E0A] border-[#FFE79A] shadow-sm'
                  : 'bg-[#1E1913] border-[#3D3020] text-[#D1AF7A] hover:text-[#F4EAD7] hover:border-[#A98545]/60'
              }`}
              title="Career Dashboard & Global Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>{view === 'leaderboard' ? 'Arena' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => setView(view === 'game' ? 'deliverables' : 'game')}
              className="px-2.5 py-1 rounded-lg bg-[#1E1913] border border-[#3D3020] text-xs font-bold text-[#D1AF7A] hover:text-[#F4EAD7] hover:border-[#A98545]/60 transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{view === 'game' ? 'Specs' : 'Game'}</span>
            </button>

            <button
              onClick={() => setPausedMenuOpen(true)}
              className="w-8 h-8 rounded-lg bg-[#1E1913] border border-[#3D3020] flex items-center justify-center text-[#E9E0CE] hover:text-[#F4EAD7] transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Stage (Width-Constrained for Game, Expanded Max-Width for Clean Desktop Dashboard) */}
      <main className={`w-full ${view === 'leaderboard' ? 'max-w-7xl' : 'max-w-[460px]'} flex-1 flex flex-col justify-start px-3.5 sm:px-4 md:px-6 pt-2 pb-16 z-10 transition-all duration-300`}>
        
        {/* ========================================================================= */}
        {/* GAME VIEW: CAMPAIGN PRE-MATCH LOBBY vs ACTIVE MATCH SCREEN */}
        {/* ========================================================================= */}
        {view === 'game' && !isMatchActive && (
          <div id="pre-match-lobby-container" className="w-full animate-lobby-slide-in">
            <CampaignPreMatchView
              currentStageId={gameState.difficultyStage}
              onSelectStage={handleSelectStage}
              onBeginMatch={() => handleStartGame(gameState.isAiOpponent ? 'ai' : 'pass-and-play', gameState.difficultyStage)}
              onOpenDaily={() => setDailyChallengeOpen(true)}
              onOpenPuzzles={() => setTacticalPuzzlesOpen(true)}
              onOpenMastery={() => setMasteryModalOpen(true)}
              onOpenAchievements={() => setAchievementsModalOpen(true)}
              onOpenLeaderboard={() => setView('leaderboard')}
              onOpenCareer={() => setCareerModalOpen(true)}
              onOpenCloudSync={() => setCloudSyncModalOpen(true)}
              onOpenOnlineMatch={() => setOnlineMatchModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
              userDisplayName={currentUser?.displayName || 'Lesotho Herder'}
              userClanTitle={userProfile?.clanTitle}
              isCloudSynced={isCloudSynced}
              dailyStreak={dailyStreak}
              progression={progression}
              onSelectCattleSet={handleSelectCattleSet}
              atmosphere={atmosphere}
              onChangeAtmosphere={setAtmosphere}
              gameMode={gameState.isAiOpponent ? 'ai' : 'pass-and-play'}
              onChangeGameMode={(mode) => {
                if (mode === 'online') {
                  setOnlineMatchModalOpen(true);
                  return;
                }
                setGameState((prev) => ({
                  ...prev,
                  isAiOpponent: mode === 'ai',
                }));
              }}
            />
          </div>
        )}

        {view === 'game' && isMatchActive && (
          <div id="active-match-screen-container" className="w-full flex flex-col space-y-2.5 animate-match-slide-in">
            {/* Top Match Bar */}
            <div className="flex items-center justify-between px-1 py-0.5 animate-hud-slide-down">
              <button
                onClick={() => setIsMatchActive(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14100D]/90 border border-[#3A2B1D] text-xs font-bold text-[#D1AF7A] hover:text-[#FFE79A] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Hub</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-['Space_Grotesk'] tracking-[0.2em] text-[#A98545] uppercase font-bold">
                  {activeStage.mapName}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1E1710] border border-[#483321] text-[#FFE79A]">
                  {gameState.isAiOpponent ? `vs ${activeStage.opponentName}` : '2P Mode'}
                </span>
              </div>

              <button
                onClick={() => setPausedMenuOpen(true)}
                className="p-1.5 rounded-lg bg-[#14100D]/90 border border-[#3A2B1D] text-[#8C9090] hover:text-[#E9E0CE] transition-colors"
                aria-label="Pause Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Contextual Strategy Tip on Initial Stage Load */}
            {isStageLoading && currentStrategyTip && (
              <StrategyTip
                tip={currentStrategyTip}
                stageName={activeStage.opponentName}
                isVisible={isStageLoading}
                onDismiss={() => setIsStageLoading(false)}
              />
            )}

            {/* Online Multiplayer Live Banner & Emote Reactions */}
            {!gameState.isAiOpponent && activeOnlineRoom && (
              <OnlineGameBanner
                room={activeOnlineRoom}
                playerRole={onlinePlayerRole}
                isMyTurn={gameState.turn === onlinePlayerRole}
              />
            )}

            {/* AI / Player 02 Opponent Compact Header */}
            <div className="animate-hud-slide-down">
              <MinimalMatchHeader
                player={gameState.ivory}
                isTurn={gameState.turn === 'ivory'}
                isTrapped={gameState.forcedOpening?.active && gameState.forcedOpening.trappedPlayerId === 'ivory'}
                isOpener={gameState.forcedOpening?.active && gameState.forcedOpening.openingPlayerId === 'ivory'}
                timeRemaining={turnTimeRemaining}
                totalTurnTime={stageTurnTime}
                isClockEnabled={isClockEnabled}
              />
            </div>

            {/* Temporary Contextual In-Match Speech Bubble */}
            {gameState.isAiOpponent && liveDialogue && (
              <div className="px-3 py-1.5 rounded-lg bg-[#191410]/95 border border-[#3A2B1D] flex items-center gap-2 text-xs text-[#D9A855] animate-fadeIn shadow-sm">
                <span className="text-sm">💬</span>
                <p className="italic font-medium text-[11px] text-[#E8CE9D] line-clamp-2">
                  <strong className="text-[#FFE79A] not-italic font-bold">{activeStage.opponentName}:</strong> "{liveDialogue}"
                </p>
              </div>
            )}

            {/* Forced Opening Sotho Special Rule Banner */}
            {gameState.forcedOpening?.active && (
              <ForcedOpeningBanner forcedOpening={gameState.forcedOpening} />
            )}

            {/* Organically Carved Lesotho Sandstone Board (Hero Element with Fluid Yin-Yang Rotating Entrance) */}
            <div
              id="match-board-wrapper"
              key={`match-board-instance-${gameState.moveCount === 0 ? 'start' : 'active'}`}
              className="relative w-full flex items-center justify-center animate-yinyang-entrance"
            >
              <GameBoard
                points={gameState.points}
                turn={gameState.turn}
                phase={gameState.phase}
                selectedPointId={gameState.selectedPointId}
                validTargets={gameState.validTargets}
                capturablePoints={capturablePoints}
                flashMill={gameState.flashMill}
                activeMillLines={gameState.activeMillLines}
                lastMove={lastMoveHighlight}
                doubleMillAnimation={gameState.doubleMillAnimation}
                isDoubleMill={gameState.isDoubleMill}
                isGrandMeridian={gameState.isGrandMeridian}
                grandMeridianAxis={gameState.grandMeridianAxis}
                grandMeridianPoints={gameState.grandMeridianPoints}
                capturesRemaining={gameState.capturesRemaining}
                totalCapturesInSequence={gameState.totalCapturesInSequence}
                onPointClick={handlePointClick}
                stageId={gameState.difficultyStage}
                atmosphere={atmosphere}
                isRoyalSkin={isRoyalSkinEquipped}
                boardSkin={effectiveBoardSkin}
                shakeIntensity={shakeIntensity}
              />
            </div>

            {/* Clear Contextual Instruction */}
            <ContextualInstruction
              instruction={gameState.statusMessage}
              phase={gameState.phase}
              isForcedOpening={gameState.forcedOpening?.active}
              isUrgentClock={isClockEnabled && turnTimeRemaining <= 5}
            />

            {/* Player 01 Header */}
            <div className="animate-hud-slide-up">
              <MinimalMatchHeader
                player={gameState.obsidian}
                isTurn={gameState.turn === 'obsidian'}
                isTrapped={gameState.forcedOpening?.active && gameState.forcedOpening.trappedPlayerId === 'obsidian'}
                isOpener={gameState.forcedOpening?.active && gameState.forcedOpening.openingPlayerId === 'obsidian'}
                showMenuButton={false}
                timeRemaining={turnTimeRemaining}
                totalTurnTime={stageTurnTime}
                isClockEnabled={isClockEnabled}
              />
            </div>

            {/* Match Action Strip */}
            <div className="flex items-center justify-between text-xs text-[#8C9090] pt-1 border-t border-[#3D3020]/80 animate-hud-slide-up">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartGame(gameState.isAiOpponent ? 'ai' : 'pass-and-play')}
                  className="inline-flex items-center gap-1 hover:text-[#D1AF7A] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
                <button
                  onClick={toggleSound}
                  className="inline-flex items-center gap-1 hover:text-[#D1AF7A] transition-colors"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#A98545]" />
                      <span>Audio On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsMatchActive(false)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1E1913] border border-[#3D3020] text-[11px] font-bold text-[#D1AF7A] hover:text-[#FFE79A] transition-colors"
              >
                <span>Campaign Hub</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SPECIFICATIONS & DELIVERABLE DOCUMENTATION VIEW */}
        {/* ========================================================================= */}
        {view === 'deliverables' && (
          <DeliverableShowcase onBackToGame={() => setView('game')} />
        )}

        {/* ========================================================================= */}
        {/* GLOBAL LEADERBOARD & FIRESTORE RANKINGS VIEW */}
        {/* ========================================================================= */}
        {view === 'leaderboard' && (
          <LeaderboardView
            currentUser={currentUser}
            careerProfile={careerProfile}
            matchHistory={matchHistory}
            headToHeadRecords={headToHeadRecords}
            dailyStreak={dailyStreak}
            isCloudSynced={isCloudSynced}
            isSyncing={isSyncing}
            onBackToGame={() => setView('game')}
            onOpenCloudModal={() => setCloudSyncModalOpen(true)}
            onStartMatch={(mode, stageId) => {
              setView('game');
              handleStartGame(mode, stageId || gameState.difficultyStage);
            }}
            onOpenDaily={() => setDailyChallengeOpen(true)}
            onOpenPuzzles={() => setTacticalPuzzlesOpen(true)}
            onOpenAchievements={() => setAchievementsModalOpen(true)}
            onOpenCareer={() => setCareerModalOpen(true)}
            onOpenJourney={() => setJourneyModalOpen(true)}
            onOpenOnlineMatch={() => setOnlineMatchModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSettings={() => setPausedMenuOpen(true)}
            onSelectCattleSet={handleSelectCattleSet}
          />
        )}
      </main>

      {/* Paused Menu Drawer */}
      <PausedMenu
        isOpen={pausedMenuOpen}
        onClose={() => setPausedMenuOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        atmosphere={atmosphere}
        currentStageId={gameState.difficultyStage}
        currentUser={currentUser}
        isCloudSynced={isCloudSynced}
        onSignInWithGoogle={signInWithGoogle}
        onSignOut={signOut}
        onOpenCloudSync={() => setCloudSyncModalOpen(true)}
        onSelectStage={handleSelectStage}
        onSelectAtmosphere={setAtmosphere}
        onNewGame={(mode, stageId) => handleStartGame(mode, stageId || gameState.difficultyStage)}
        onOpenDeliverables={() => {
          setView('deliverables');
          setPausedMenuOpen(false);
        }}
        onOpenJourneyMap={() => setJourneyModalOpen(true)}
        onOpenLeaderboard={() => setView('leaderboard')}
      />

      {/* Journey Map Modal */}
      <JourneyMapModal
        isOpen={journeyModalOpen}
        onClose={() => setJourneyModalOpen(false)}
        currentStageId={gameState.difficultyStage}
        progression={progression}
        onSelectAndStart={(stageId) => {
          handleSelectStage(stageId);
          handleStartGame('ai', stageId);
        }}
        onSelectZone={handleSelectZone}
        onToggleTokenSkin={handleToggleTokenSkin}
        onToggleBoardSkin={handleToggleBoardSkin}
      />

      {/* Victory / Defeat Modal */}
      <VictoryCelebrationModal
        isOpen={victoryModalOpen}
        winner={gameState.winner}
        isAiMatch={gameState.isAiOpponent}
        gameState={gameState}
        stage={activeStage}
        progression={progression}
        onClose={() => setVictoryModalOpen(false)}
        onPlayAgain={() => handleStartGame(gameState.isAiOpponent ? 'ai' : 'pass-and-play')}
        onNextStage={(nextStageId) => {
          handleSelectStage(nextStageId);
          handleStartGame('ai', nextStageId);
        }}
      />

      {/* Pre-Match Tension Showdown Modal */}
      <PreMatchShowdown
        isOpen={preMatchShowdownOpen}
        stage={DIFFICULTY_STAGES[pendingStageForShowdown] || activeStage}
        rivalryWins={loadPlayerMastery().aiRivalries[pendingStageForShowdown]?.wins || 0}
        rivalryLosses={loadPlayerMastery().aiRivalries[pendingStageForShowdown]?.losses || 0}
        onStartMatch={() => {
          setPreMatchShowdownOpen(false);
          handleSelectStage(pendingStageForShowdown);
          handleStartGame('ai', pendingStageForShowdown);
        }}
        onCancel={() => setPreMatchShowdownOpen(false)}
      />

      {/* Daily Global Challenge Modal */}
      <DailyChallengeModal
        isOpen={dailyChallengeOpen}
        onClose={() => setDailyChallengeOpen(false)}
        onDailyStreakUpdate={(streak) => setDailyStreak(streak)}
      />

      {/* Tactical Puzzles Modal */}
      <TacticalPuzzlesModal
        isOpen={tacticalPuzzlesOpen}
        onClose={() => setTacticalPuzzlesOpen(false)}
      />

      {/* Player Profile & Mastery Stats Modal */}
      <MasteryStatsModal
        isOpen={masteryModalOpen}
        onClose={() => setMasteryModalOpen(false)}
        onSelectOpponent={(stageId) => {
          setPendingStageForShowdown(stageId);
          setPreMatchShowdownOpen(true);
        }}
        onOpenLeaderboard={() => {
          setMasteryModalOpen(false);
          setView('leaderboard');
        }}
      />

      {/* Achievements / Honors Modal */}
      <AchievementsModal
        isOpen={achievementsModalOpen}
        onClose={() => setAchievementsModalOpen(false)}
      />

      {/* Firebase Cloud Sync & Global Leaderboard Modal */}
      <CloudSyncModal
        isOpen={cloudSyncModalOpen}
        onClose={() => setCloudSyncModalOpen(false)}
        currentUser={currentUser}
        isCloudSynced={isCloudSynced}
        isSyncing={isSyncing}
        lastSyncedTimestamp={lastSyncedTimestamp}
        syncError={syncError}
        onSyncToCloud={syncAllToCloud}
        onRestoreFromCloud={syncAllFromCloud}
        onSignInWithGoogle={signInWithGoogle}
        onSignOut={signOut}
      />

      {/* Online Multiplayer Match & Friend Invite Modal */}
      <OnlineMatchModal
        isOpen={onlineMatchModalOpen}
        onClose={() => setOnlineMatchModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onStartOnlineGame={handleStartOnlineGame}
        initialRoomCode={initialInviteRoomCode}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Basotho Tactician Authentication & Clan Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onGoogleSignIn={signInWithGoogle}
        onEmailSignUp={signUpWithEmail}
        onEmailSignIn={signInWithEmail}
        onPasswordReset={sendPasswordReset}
        onUpdateProfile={updateProfile}
        onSignOut={signOut}
      />

      {/* Morabaraba Career Profile, Match Ledger & Prestige Honors Modal */}
      <CareerProfileModal
        isOpen={careerModalOpen}
        onClose={() => setCareerModalOpen(false)}
        profile={careerProfile}
        matchHistory={matchHistory}
        headToHeadRecords={headToHeadRecords}
        onUpdateProfile={(updated) => {
          setCareerProfile(updated);
          if (currentUser && !currentUser.isAnonymous) {
            saveCloudCareerProfile(currentUser.uid, updated);
          }
        }}
        onOpenAuthModal={() => {
          setCareerModalOpen(false);
          setAuthModalOpen(true);
        }}
        onSelectStageForRematch={(stageId) => {
          setCareerModalOpen(false);
          handleSelectStage(stageId);
          handleStartGame('ai', stageId);
        }}
      />
    </div>
  );
}
