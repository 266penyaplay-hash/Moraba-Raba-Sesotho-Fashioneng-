import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  PlayerProgression,
  MatchPerformanceStats,
  DifficultyStageId,
  GameMode,
  PlayerId,
  BoardPoint,
  PlayerState,
  ForcedOpeningState,
  GamePhase,
  GameHistoryEntry,
  CattleSetId,
  PlayerCareerProfile,
  DetailedMatchRecord,
  HeadToHeadRecord,
} from '../types';
import { PlayerMasteryData, loadPlayerMastery, savePlayerMastery, getRankTier } from '../utils/masteryStats';
import {
  loadPlayerCareerProfile,
  savePlayerCareerProfile,
  loadMatchHistory,
  saveMatchHistory,
  loadHeadToHeadRecords,
  saveHeadToHeadRecords,
} from '../utils/careerStats';
import { DailyStreakData, loadDailyStreakData, saveDailyStreakData } from '../constants/dailyChallenges';
import { loadSolvedPuzzles } from '../constants/puzzles';
import { Achievement, loadAchievements, saveAchievements } from '../constants/achievements';
import { loadPlayerProgression, savePlayerProgression } from '../constants/stages';
import { INITIAL_POINTS } from '../engine/morabaraba';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use custom firestore database ID from configuration
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface UserProfileData {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  clanTitle?: string;
  avatarIcon?: string;
  isAnonymous?: boolean;
  authProvider?: string;
  status?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  lastPlayedAt?: string;
  lastMatchWinner?: string;
  lastMatchGrade?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Info:', JSON.stringify(errInfo));
  return errInfo;
}

export interface PlayerLoginSession {
  sessionId: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  authProvider: string;
  isAnonymous: boolean;
  platform: string;
  loginAt: string;
  timestamp?: any;
}

export interface GamePlaySession {
  sessionId: string;
  userId: string;
  displayName: string;
  gameMode: string;
  stageId: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  updatedAt: string;
  timestamp?: any;
}

/**
 * Capture every player login session into Firebase Firestore
 */
export async function recordPlayerLoginSession(user: User, provider?: string): Promise<string | null> {
  try {
    const sessionId = `sess_${user.uid.substring(0, 8)}_${Date.now()}`;
    const authProvider =
      provider ||
      (user.isAnonymous
        ? 'anonymous'
        : user.providerData?.[0]?.providerId || (user.email ? 'password' : 'unknown'));

    const displayName = user.displayName || (user.isAnonymous ? 'Basotho Guest Tactician' : 'Basotho Player');
    const nowIso = new Date().toISOString();

    const sessionData: PlayerLoginSession = {
      sessionId,
      userId: user.uid,
      displayName,
      email: user.email || '',
      photoURL: user.photoURL || '',
      authProvider,
      isAnonymous: !!user.isAnonymous,
      platform: 'web',
      loginAt: nowIso,
      timestamp: serverTimestamp(),
    };

    // 1. Write to playerSessions collection
    const sessionRef = doc(db, 'playerSessions', sessionId);
    await setDoc(sessionRef, sessionData);

    // 2. Update user profile document in users collection
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        userId: user.uid,
        displayName,
        email: user.email || '',
        photoURL: user.photoURL || '',
        isAnonymous: !!user.isAnonymous,
        authProvider,
        status: 'online',
        lastLoginAt: nowIso,
        lastActiveAt: nowIso,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'playerSessions');
    return null;
  }
}

/**
 * Capture active game play session start in Firebase Firestore
 */
export async function recordGameSessionStart(
  userId: string,
  gameMode: GameMode | 'daily' | 'puzzle',
  stageId: string,
  displayName?: string
): Promise<string | null> {
  try {
    const sessionId = `game_${userId.substring(0, 8)}_${Date.now()}`;
    const docRef = doc(db, 'gameSessions', sessionId);
    const nowIso = new Date().toISOString();

    const session: GamePlaySession = {
      sessionId,
      userId,
      displayName: displayName || 'Basotho Player',
      gameMode,
      stageId,
      status: 'started',
      startedAt: nowIso,
      updatedAt: nowIso,
      timestamp: serverTimestamp(),
    };

    await setDoc(docRef, session);

    // Also update user's lastActiveAt in users collection
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        lastActiveAt: nowIso,
        currentStageId: stageId,
        currentGameMode: gameMode,
      },
      { merge: true }
    );

    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'gameSessions');
    return null;
  }
}

/**
 * Update game session status in Firebase Firestore
 */
export async function updateGameSessionStatus(
  sessionId: string,
  status: 'in_progress' | 'completed' | 'abandoned',
  extra?: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, 'gameSessions', sessionId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
      ...(extra || {}),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `gameSessions/${sessionId}`);
  }
}

export const BASOTHO_CLANS = [
  { id: 'bakoena', name: 'Bakoena', totem: 'Crocodile (Koena)', symbol: '🐊', motto: 'Bana ba Koena ea Hlokoa' },
  { id: 'bataung', name: 'Bataung', totem: 'Lion (Tau)', symbol: '🦁', motto: 'Bataung ba Marapo' },
  { id: 'batloung', name: 'Batloung', totem: 'Elephant (Tlou)', symbol: '🐘', motto: 'Batloung ba Mohale' },
  { id: 'bafokeng', name: 'Bafokeng', totem: 'Hare & Dew (Phoka)', symbol: '🌾', motto: 'Bafokeng ba Matšoana' },
  { id: 'bakhatla', name: 'Bakhatla', totem: 'Monkey & Lightning (Khatla)', symbol: '🦅', motto: 'Bakhatla ba Tabane' },
  { id: 'basiea', name: 'Basiea', totem: 'Wildcat / Leopard (Sia)', symbol: '🐆', motto: 'Basiea ba Raphoka' },
  { id: 'makgolokwe', name: 'Makgolokwe', totem: 'Porcupine (Noko)', symbol: '🦔', motto: 'Makgolokwe a Mahlatsi' },
  { id: 'batsoeneng', name: 'Batsoeneng', totem: 'Baboon (Tšoene)', symbol: '🐒', motto: 'Batsoeneng ba Kolo' },
];

export const TACTICIAN_AVATARS = [
  { id: 'mokorotlo', label: 'Mokorotlo Crown', icon: '👑', color: '#D5A351' },
  { id: 'royal_bull', label: 'Maloti Royal Bull', icon: '🐂', color: '#E87D3E' },
  { id: 'seana_marena', label: 'Seana Marena Blanket', icon: '🧥', color: '#7957FF' },
  { id: 'thaba_shield', label: 'Thaba-Bosiu Shield', icon: '🛡️', color: '#38BDF8' },
  { id: 'spear_crest', label: 'Warrior Spear', icon: '🗡️', color: '#EF4444' },
  { id: 'mountain_sun', label: 'Lesotho Golden Sun', icon: '☀️', color: '#F59E0B' },
  { id: 'flame_stone', label: 'Firestone Hearth', icon: '🔥', color: '#F97316' },
  { id: 'diamond_star', label: 'Letseng Diamond Star', icon: '💎', color: '#A855F7' },
];

/**
 * Sign in anonymously for zero-friction instant cloud sync
 */
export async function signInAsGuest(): Promise<User | null> {
  try {
    const cred = await signInAnonymously(auth);
    if (cred.user) {
      await recordPlayerLoginSession(cred.user, 'anonymous');
    }
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/admin-restricted-operation' || error?.code === 'auth/operation-not-allowed') {
      console.info('Firebase anonymous auth not active. Local persistence will be used until Google sign-in.');
    } else {
      console.warn('Firebase guest sign-in notice:', error?.message || error);
    }
    return null;
  }
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  clanTitle = 'Bakoena',
  avatarIcon = 'mokorotlo'
): Promise<{ user: User | null; error: string | null }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      const cleanName = displayName.trim() || 'Basotho Tactician';
      await updateProfile(cred.user, {
        displayName: cleanName,
      });

      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(
        userRef,
        {
          userId: cred.user.uid,
          displayName: cleanName,
          email: cred.user.email || email.trim(),
          clanTitle,
          avatarIcon,
          isAnonymous: false,
          authProvider: 'password',
          status: 'online',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await recordPlayerLoginSession(cred.user, 'password');
    }
    return { user: cred.user, error: null };
  } catch (err: any) {
    console.error('Sign up error:', err);
    let msg = 'Failed to create account. Please try again.';
    if (err.code === 'auth/email-already-in-use') {
      msg = 'This email is already registered. Please sign in instead.';
    } else if (err.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { user: null, error: msg };
  }
}

/**
 * Sign In with Email and Password
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await recordPlayerLoginSession(cred.user, 'password');
    }
    return { user: cred.user, error: null };
  } catch (err: any) {
    console.error('Sign in error:', err);
    let msg = 'Incorrect email or password.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Invalid email or password combination.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { user: null, error: msg };
  }
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Password reset error:', err);
    return { success: false, error: err?.message || 'Failed to send password reset email.' };
  }
}

/**
 * Update Profile Details in Firebase Auth and Firestore
 */
export async function updateUserProfileData(
  userId: string,
  data: { displayName?: string; clanTitle?: string; avatarIcon?: string; photoURL?: string }
): Promise<boolean> {
  try {
    if (auth.currentUser && data.displayName) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL,
      });
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to update profile data:', error);
    return false;
  }
}

/**
 * Fetch Custom Profile Data from Firestore
 */
export async function fetchUserProfileData(userId: string): Promise<UserProfileData | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Sign in with Google Account to persist cross-device progress & sync cloud saves
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      await recordPlayerLoginSession(cred.user, 'google.com');
    }
    return cred.user;
  } catch (error) {
    console.error('Firebase Google sign-in error:', error);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign-out error:', error);
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Campaign Progression
// ----------------------------------------------------
export async function saveCloudProgression(userId: string, progression: PlayerProgression): Promise<boolean> {
  try {
    const docRef = doc(db, 'playerProgression', userId);
    await setDoc(
      docRef,
      {
        ...progression,
        userId,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save progression to Firestore:', error);
    return false;
  }
}

export async function fetchCloudProgression(userId: string): Promise<PlayerProgression | null> {
  try {
    const docRef = doc(db, 'playerProgression', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlayerProgression;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch progression from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Player Mastery & Rating
// ----------------------------------------------------
export async function saveCloudMastery(userId: string, mastery: PlayerMasteryData): Promise<boolean> {
  try {
    const docRef = doc(db, 'playerMastery', userId);
    const rankTier = getRankTier(mastery.rating);
    await setDoc(
      docRef,
      {
        ...mastery,
        userId,
        rankTier: rankTier.id,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save mastery to Firestore:', error);
    return false;
  }
}

export async function fetchCloudMastery(userId: string): Promise<PlayerMasteryData | null> {
  try {
    const docRef = doc(db, 'playerMastery', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlayerMasteryData;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch mastery from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Daily Challenge Streaks
// ----------------------------------------------------
export async function saveCloudDailyStreak(userId: string, data: DailyStreakData): Promise<boolean> {
  try {
    const docRef = doc(db, 'dailyChallenges', userId);
    await setDoc(
      docRef,
      {
        ...data,
        userId,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save daily streak to Firestore:', error);
    return false;
  }
}

export async function fetchCloudDailyStreak(userId: string): Promise<DailyStreakData | null> {
  try {
    const docRef = doc(db, 'dailyChallenges', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyStreakData;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch daily streak from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Tactical Puzzles Solved
// ----------------------------------------------------
export async function saveCloudTacticalPuzzles(userId: string, solvedPuzzleIds: string[]): Promise<boolean> {
  try {
    const docRef = doc(db, 'tacticalPuzzles', userId);
    await setDoc(
      docRef,
      {
        userId,
        solvedPuzzleIds,
        totalSolved: solvedPuzzleIds.length,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save tactical puzzles to Firestore:', error);
    return false;
  }
}

export async function fetchCloudTacticalPuzzles(userId: string): Promise<string[] | null> {
  try {
    const docRef = doc(db, 'tacticalPuzzles', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.solvedPuzzleIds as string[]) || [];
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch tactical puzzles from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Achievements & Honors
// ----------------------------------------------------
export async function saveCloudAchievements(userId: string, achievements: Achievement[]): Promise<boolean> {
  try {
    const docRef = doc(db, 'achievements', userId);
    const map: Record<string, { isUnlocked: boolean; unlockedAt?: string }> = {};
    let count = 0;
    achievements.forEach((a) => {
      if (a.isUnlocked) {
        map[a.id] = { isUnlocked: true, unlockedAt: a.unlockedAt };
        count += 1;
      }
    });

    await setDoc(
      docRef,
      {
        userId,
        unlockedAchievements: map,
        totalUnlocked: count,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save achievements to Firestore:', error);
    return false;
  }
}

export async function fetchCloudAchievements(userId: string): Promise<Record<string, { isUnlocked: boolean; unlockedAt?: string }> | null> {
  try {
    const docRef = doc(db, 'achievements', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.unlockedAchievements as Record<string, { isUnlocked: boolean; unlockedAt?: string }>) || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch achievements from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Player Career Profile & Records
// ----------------------------------------------------
export async function saveCloudCareerProfile(userId: string, profile: PlayerCareerProfile): Promise<boolean> {
  try {
    const docRef = doc(db, 'playerCareer', userId);
    await setDoc(
      docRef,
      {
        ...profile,
        userId,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save career profile to Firestore:', error);
    return false;
  }
}

export async function fetchCloudCareerProfile(userId: string): Promise<PlayerCareerProfile | null> {
  try {
    const docRef = doc(db, 'playerCareer', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlayerCareerProfile;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch career profile from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Head-to-Head Rivalry Records
// ----------------------------------------------------
export async function saveCloudHeadToHead(userId: string, records: HeadToHeadRecord[]): Promise<boolean> {
  try {
    const docRef = doc(db, 'headToHead', userId);
    await setDoc(
      docRef,
      {
        userId,
        records,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Failed to save head-to-head records to Firestore:', error);
    return false;
  }
}

export async function fetchCloudHeadToHead(userId: string): Promise<HeadToHeadRecord[] | null> {
  try {
    const docRef = doc(db, 'headToHead', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return (data.records as HeadToHeadRecord[]) || null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch head-to-head records from Firestore:', error);
    return null;
  }
}

// ----------------------------------------------------
// Cloud Save & Fetch: Detailed Match Records
// ----------------------------------------------------
export async function saveCloudDetailedMatch(matchRecord: DetailedMatchRecord): Promise<boolean> {
  try {
    const docRef = doc(db, 'matches', matchRecord.matchId);
    await setDoc(docRef, {
      ...matchRecord,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to save detailed match record to Firestore:', error);
    return false;
  }
}

export async function fetchCloudPlayerMatchHistory(userId: string, limitCount = 30): Promise<DetailedMatchRecord[]> {
  try {
    const matchesCol = collection(db, 'matches');
    const q = query(matchesCol, orderBy('date', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    // Filter matching userId or opponentId for full ledger
    const matches = snap.docs
      .map((d) => d.data() as DetailedMatchRecord)
      .filter((m) => m.userId === userId || m.opponentId === userId);
    return matches;
  } catch (error) {
    console.error('Failed to fetch player match history from Firestore:', error);
    return [];
  }
}

// ----------------------------------------------------
// Global Basotho Leaderboard Sync & Queries
// ----------------------------------------------------
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  rating: number;
  rankTierName: string;
  rankTierTranslation: string;
  totalWins: number;
  dailyStreak: number;
  puzzlesSolved: number;
  honorsCount: number;
  region?: string;
  photoURL?: string;
  updatedAt: string;
}

export async function updateCloudLeaderboardEntry(
  userId: string,
  displayName: string,
  rating: number,
  totalWins: number,
  dailyStreak: number,
  puzzlesSolved: number,
  honorsCount: number,
  photoURL?: string
): Promise<void> {
  try {
    const tier = getRankTier(rating);
    const docRef = doc(db, 'leaderboard', userId);
    await setDoc(
      docRef,
      {
        userId,
        displayName: displayName || 'Basotho Tactician',
        rating,
        rankTierName: tier.name,
        rankTierTranslation: tier.translation,
        totalWins,
        dailyStreak,
        puzzlesSolved,
        honorsCount,
        photoURL: photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to update leaderboard entry:', error);
  }
}

export async function fetchGlobalLeaderboard(limitCount = 50): Promise<LeaderboardEntry[]> {
  try {
    const colRef = collection(db, 'leaderboard');
    const q = query(colRef, orderBy('rating', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LeaderboardEntry);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 50
): () => void {
  try {
    const colRef = collection(db, 'leaderboard');
    const q = query(colRef, orderBy('rating', 'desc'), limit(limitCount));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const entries = snap.docs.map((d) => d.data() as LeaderboardEntry);
        callback(entries);
      },
      (error) => {
        console.error('Firestore Leaderboard subscription error:', error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Failed to subscribe to leaderboard:', error);
    return () => {};
  }
}

// ----------------------------------------------------
// Comprehensive Cloud Sync: Push All Local Data
// ----------------------------------------------------
export async function syncAllLocalToCloud(userId: string, user?: User | null): Promise<{
  success: boolean;
  syncedEntities: number;
  timestamp: string;
}> {
  try {
    const progression = loadPlayerProgression();
    const mastery = loadPlayerMastery();
    const dailyStreak = loadDailyStreakData();
    const solvedPuzzles = loadSolvedPuzzles();
    const achievements = loadAchievements();
    const careerProfile = loadPlayerCareerProfile();
    const headToHead = loadHeadToHeadRecords();

    const name = user?.displayName || (user?.isAnonymous ? 'Basotho Guest' : 'Basotho Tactician');
    const photo = user?.photoURL || '';

    // Parallel sync to Firestore
    await Promise.all([
      saveCloudProgression(userId, progression),
      saveCloudMastery(userId, mastery),
      saveCloudDailyStreak(userId, dailyStreak),
      saveCloudTacticalPuzzles(userId, solvedPuzzles),
      saveCloudAchievements(userId, achievements),
      saveCloudCareerProfile(userId, careerProfile),
      saveCloudHeadToHead(userId, headToHead),
      updateCloudLeaderboardEntry(
        userId,
        name,
        mastery.rating,
        mastery.totalWins,
        dailyStreak.currentStreak,
        solvedPuzzles.length,
        achievements.filter((a) => a.isUnlocked).length,
        photo
      ),
    ]);

    return {
      success: true,
      syncedEntities: 8,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Full cloud sync failure:', error);
    return {
      success: false,
      syncedEntities: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

// ----------------------------------------------------
// Comprehensive Cloud Sync: Pull & Merge All from Cloud
// ----------------------------------------------------
export async function syncAllCloudToLocal(userId: string): Promise<{
  success: boolean;
  changesApplied: boolean;
}> {
  try {
    const [cloudProg, cloudMastery, cloudDaily, cloudPuzzles, cloudAch, cloudCareer, cloudH2H] = await Promise.all([
      fetchCloudProgression(userId),
      fetchCloudMastery(userId),
      fetchCloudDailyStreak(userId),
      fetchCloudTacticalPuzzles(userId),
      fetchCloudAchievements(userId),
      fetchCloudCareerProfile(userId),
      fetchCloudHeadToHead(userId),
    ]);

    let changes = false;

    // 1. Merge Campaign Progression
    if (cloudProg) {
      const localProg = loadPlayerProgression();
      const mergedCompleted = Array.from(
        new Set([...(localProg.completedStages || []), ...(cloudProg.completedStages || [])])
      );
      const mergedZones = Array.from(
        new Set([...(localProg.unlockedZones || ['maseru']), ...(cloudProg.unlockedZones || [])])
      );
      const bestStreak = Math.max(
        localProg.winStreak?.bestStreak || 0,
        cloudProg.winStreak?.bestStreak || 0
      );

      savePlayerProgression({
        ...localProg,
        ...cloudProg,
        completedStages: mergedCompleted,
        unlockedZones: mergedZones,
        royalCattleUnlocked: localProg.royalCattleUnlocked || cloudProg.royalCattleUnlocked,
        firestoneBoardUnlocked: localProg.firestoneBoardUnlocked || cloudProg.firestoneBoardUnlocked,
        bohloaleCrownUnlocked: localProg.bohloaleCrownUnlocked || cloudProg.bohloaleCrownUnlocked,
        beatMorenaAchievementUnlocked: localProg.beatMorenaAchievementUnlocked || cloudProg.beatMorenaAchievementUnlocked,
        winStreak: {
          ...(cloudProg.winStreak || localProg.winStreak),
          bestStreak,
        },
      });
      changes = true;
    }

    // 2. Merge Mastery Data
    if (cloudMastery) {
      const localMastery = loadPlayerMastery();
      savePlayerMastery({
        ...localMastery,
        ...cloudMastery,
        rating: Math.max(localMastery.rating, cloudMastery.rating),
        peakRating: Math.max(localMastery.peakRating, cloudMastery.peakRating),
        totalMatches: Math.max(localMastery.totalMatches, cloudMastery.totalMatches),
        totalWins: Math.max(localMastery.totalWins, cloudMastery.totalWins),
        totalMillsFormed: Math.max(localMastery.totalMillsFormed, cloudMastery.totalMillsFormed),
        totalCattleCaptured: Math.max(localMastery.totalCattleCaptured, cloudMastery.totalCattleCaptured),
        longestWinStreak: Math.max(localMastery.longestWinStreak, cloudMastery.longestWinStreak),
        aiRivalries: {
          ...localMastery.aiRivalries,
          ...(cloudMastery.aiRivalries || {}),
        },
      });
      changes = true;
    }

    // 3. Merge Career Profile & Records
    if (cloudCareer) {
      const localCareer = loadPlayerCareerProfile();
      savePlayerCareerProfile({
        ...localCareer,
        ...cloudCareer,
        rating: Math.max(localCareer.rating, cloudCareer.rating),
        peakRating: Math.max(localCareer.peakRating, cloudCareer.peakRating),
        careerXp: Math.max(localCareer.careerXp, cloudCareer.careerXp),
        careerLevel: Math.max(localCareer.careerLevel, cloudCareer.careerLevel),
        recordsByMode: {
          ...localCareer.recordsByMode,
          ...(cloudCareer.recordsByMode || {}),
          overall: {
            ...localCareer.recordsByMode.overall,
            ...(cloudCareer.recordsByMode?.overall || {}),
            matches: Math.max(localCareer.recordsByMode.overall.matches, cloudCareer.recordsByMode?.overall?.matches || 0),
            wins: Math.max(localCareer.recordsByMode.overall.wins, cloudCareer.recordsByMode?.overall?.wins || 0),
          },
        },
        majorOpponentsDefeated: Array.from(
          new Set([...(localCareer.majorOpponentsDefeated || []), ...(cloudCareer.majorOpponentsDefeated || [])])
        ),
      });
      changes = true;
    }

    // 4. Merge Head-to-Head Records
    if (cloudH2H && Array.isArray(cloudH2H)) {
      const localH2H = loadHeadToHeadRecords();
      const h2hMap = new Map(localH2H.map((item) => [item.opponentId, item]));
      cloudH2H.forEach((cloudItem) => {
        const localItem = h2hMap.get(cloudItem.opponentId);
        if (localItem) {
          h2hMap.set(cloudItem.opponentId, {
            ...localItem,
            ...cloudItem,
            totalMatches: Math.max(localItem.totalMatches, cloudItem.totalMatches),
            wins: Math.max(localItem.wins, cloudItem.wins),
            losses: Math.max(localItem.losses, cloudItem.losses),
            draws: Math.max(localItem.draws, cloudItem.draws),
          });
        } else {
          h2hMap.set(cloudItem.opponentId, cloudItem);
        }
      });
      saveHeadToHeadRecords(Array.from(h2hMap.values()));
      changes = true;
    }

    // 3. Merge Daily Streak
    if (cloudDaily) {
      const localDaily = loadDailyStreakData();
      saveDailyStreakData({
        ...localDaily,
        ...cloudDaily,
        currentStreak: Math.max(localDaily.currentStreak, cloudDaily.currentStreak),
        bestStreak: Math.max(localDaily.bestStreak, cloudDaily.bestStreak),
        history: {
          ...localDaily.history,
          ...(cloudDaily.history || {}),
        },
      });
      changes = true;
    }

    // 4. Merge Solved Puzzles
    if (cloudPuzzles && Array.isArray(cloudPuzzles)) {
      const localPuzzles = loadSolvedPuzzles();
      const combined = Array.from(new Set([...localPuzzles, ...cloudPuzzles]));
      try {
        localStorage.setItem('morabaraba_solved_puzzles_v1', JSON.stringify(combined));
        changes = true;
      } catch {
        // Ignore
      }
    }

    // 5. Merge Achievements
    if (cloudAch) {
      const localAch = loadAchievements();
      const merged = localAch.map((a) => {
        if (cloudAch[a.id]?.isUnlocked || a.isUnlocked) {
          return {
            ...a,
            isUnlocked: true,
            unlockedAt: cloudAch[a.id]?.unlockedAt || a.unlockedAt || new Date().toISOString(),
          };
        }
        return a;
      });
      saveAchievements(merged);
      changes = true;
    }

    return { success: true, changesApplied: changes };
  } catch (error) {
    console.error('Cloud pull merge error:', error);
    return { success: false, changesApplied: false };
  }
}

// ----------------------------------------------------
// Real-time listener for player progression changes
// ----------------------------------------------------
export function subscribeToProgression(
  userId: string,
  onUpdate: (progression: PlayerProgression) => void
): () => void {
  const docRef = doc(db, 'playerProgression', userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as PlayerProgression);
      }
    },
    (error) => {
      console.warn('Firestore progression listener error:', error);
    }
  );
}

// ----------------------------------------------------
// Match Recording to Cloud Firestore
// ----------------------------------------------------
export async function recordCloudMatch(
  userId: string,
  winner: PlayerId | 'draw',
  stageId: DifficultyStageId | string,
  gameMode: GameMode | 'daily' | 'puzzle' | 'online',
  stats: MatchPerformanceStats,
  displayName?: string,
  sessionId?: string
): Promise<string | null> {
  try {
    const matchId = `match_${userId.substring(0, 8)}_${Date.now()}`;
    const matchesCol = collection(db, 'matches');
    const matchDoc = doc(matchesCol, matchId);

    const nowIso = new Date().toISOString();
    const matchPayload = {
      matchId,
      sessionId: sessionId || null,
      userId,
      winner,
      stageId,
      gameMode,
      displayName: displayName || 'Basotho Warrior',
      totalTurns: stats.totalTurns || 0,
      playerMoves: stats.playerMoves || 0,
      playerMills: stats.playerMills || 0,
      playerMovesPerMill: stats.playerMovesPerMill || 0,
      playerCaptureRatio: stats.playerCaptureRatio || 0,
      playerKraalRetention: stats.playerKraalRetention || 0,
      tempoBadge: stats.tempoBadge || 'None',
      grade: stats.grade || 'C',
      createdAt: nowIso,
      timestamp: serverTimestamp(),
    };

    await setDoc(matchDoc, matchPayload);

    // Update user stats in users document
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        lastPlayedAt: nowIso,
        lastMatchWinner: winner,
        lastMatchGrade: stats.grade || 'C',
        updatedAt: nowIso,
      },
      { merge: true }
    );

    return matchId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'matches');
    return null;
  }
}

export async function fetchRecentCloudMatches(limitCount = 10): Promise<any[]> {
  try {
    const matchesCol = collection(db, 'matches');
    const q = query(matchesCol, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Failed to fetch match history from Firestore:', error);
    return [];
  }
}

// ----------------------------------------------------
// Real-Time Online Multiplayer Game Rooms & Invites
// ----------------------------------------------------

export interface ChatReaction {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  emoji: string;
  timestamp: number;
}

export interface OnlineGameRoom {
  id: string; // 6-character room invite code, e.g. "SF-8392"
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  hostClan?: string;
  hostRating?: number;
  guestId?: string | null;
  guestName?: string | null;
  guestPhoto?: string | null;
  guestClan?: string | null;
  guestRating?: number;
  status: 'waiting' | 'ready' | 'playing' | 'completed' | 'abandoned';
  stageId: DifficultyStageId;
  atmosphere: string;
  cattleSet: CattleSetId;
  turn: PlayerId; // 'obsidian' (Host) or 'ivory' (Guest)
  phase: GamePhase;
  boardPoints: Record<string, BoardPoint>;
  obsidian: PlayerState;
  ivory: PlayerState;
  forcedOpening: ForcedOpeningState | null;
  pendingMillCount: number;
  activeMillLines: [string, string, string][];
  flashMill: [string, string, string] | null;
  winner: PlayerId | null;
  moveCount: number;
  history: GameHistoryEntry[];
  lastMove?: { from?: string; to: string; type: string; player: string; capturePointId?: string } | null;
  lastMoveAt?: string;
  createdAt: string;
  chatReactions?: ChatReaction[];
  rematchRequestedBy?: string | null;
}

/**
 * Generate a friendly 6-character Basotho Match Invite Code
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'SF-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new online multiplayer room and invite code
 */
export async function createOnlineRoom(
  user: User,
  stageId: DifficultyStageId = 'matenase',
  atmosphere = 'golden-dawn',
  cattleSet: CattleSetId = 'classic',
  profileExtra?: { clanTitle?: string; avatarIcon?: string; rating?: number }
): Promise<{ room: OnlineGameRoom | null; error: string | null }> {
  try {
    const roomCode = generateRoomCode();
    const docRef = doc(db, 'gameRooms', roomCode);

    // Initial points snapshot
    const initialPointsSnapshot: Record<string, BoardPoint> = {};
    for (const [key, pt] of Object.entries(INITIAL_POINTS)) {
      initialPointsSnapshot[key] = { ...pt, piece: null };
    }

    const hostName = user.displayName || (user.isAnonymous ? 'Basotho Tactician' : 'Basotho Player');
    const roomData: OnlineGameRoom = {
      id: roomCode,
      hostId: user.uid,
      hostName,
      hostPhoto: user.photoURL || '',
      hostClan: profileExtra?.clanTitle || 'Bakoena',
      hostRating: profileExtra?.rating || 1200,
      guestId: null,
      guestName: null,
      guestPhoto: '',
      guestClan: '',
      guestRating: 1200,
      status: 'waiting',
      stageId,
      atmosphere,
      cattleSet,
      turn: 'obsidian',
      phase: 'placing',
      boardPoints: initialPointsSnapshot,
      obsidian: {
        id: 'obsidian',
        name: hostName,
        inHand: 12,
        onBoard: 0,
        captured: 0,
        score: 0,
        materialLabel: 'Polished Black Obsidian · Host',
      },
      ivory: {
        id: 'ivory',
        name: 'Waiting for Friend...',
        inHand: 12,
        onBoard: 0,
        captured: 0,
        score: 0,
        materialLabel: 'Basotho Ivory · Guest',
      },
      forcedOpening: null,
      pendingMillCount: 0,
      activeMillLines: [],
      flashMill: null,
      winner: null,
      moveCount: 0,
      history: [],
      lastMove: null,
      lastMoveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      chatReactions: [],
      rematchRequestedBy: null,
    };

    await setDoc(docRef, roomData);
    return { room: roomData, error: null };
  } catch (err: any) {
    console.error('Failed to create game room:', err);
    return { room: null, error: err?.message || 'Could not create room.' };
  }
}

/**
 * Join an existing online game room using an invite code
 */
export async function joinOnlineRoom(
  roomCodeInput: string,
  user: User,
  profileExtra?: { clanTitle?: string; avatarIcon?: string; rating?: number }
): Promise<{ room: OnlineGameRoom | null; error: string | null }> {
  try {
    const cleanCode = roomCodeInput.trim().toUpperCase();
    const docRef = doc(db, 'gameRooms', cleanCode);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return { room: null, error: `Match room "${cleanCode}" was not found. Check the code and try again.` };
    }

    const currentData = snap.data() as OnlineGameRoom;

    // Check if host is rejoining their own room
    if (currentData.hostId === user.uid) {
      return { room: currentData, error: null };
    }

    // Check if user is already the guest in this room
    if (currentData.guestId === user.uid) {
      return { room: currentData, error: null };
    }

    // Check if room already full
    if (currentData.guestId && currentData.guestId !== user.uid && currentData.status !== 'waiting') {
      return { room: null, error: `Match room "${cleanCode}" is already in progress with another player.` };
    }

    const guestName = user.displayName || (user.isAnonymous ? 'Challenger Guest' : 'Basotho Challenger');

    const updatedData: Partial<OnlineGameRoom> = {
      guestId: user.uid,
      guestName,
      guestPhoto: user.photoURL || '',
      guestClan: profileExtra?.clanTitle || 'Bataung',
      guestRating: profileExtra?.rating || 1200,
      status: 'playing',
      ivory: {
        ...currentData.ivory,
        name: guestName,
      },
      lastMoveAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updatedData);
    return { room: { ...currentData, ...updatedData } as OnlineGameRoom, error: null };
  } catch (err: any) {
    console.error('Failed to join game room:', err);
    return { room: null, error: err?.message || 'Failed to join match.' };
  }
}

/**
 * Get Room Snapshot
 */
export async function getOnlineRoom(roomCode: string): Promise<OnlineGameRoom | null> {
  try {
    const docRef = doc(db, 'gameRooms', roomCode.trim().toUpperCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as OnlineGameRoom;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch room:', err);
    return null;
  }
}

/**
 * Subscribe to real-time updates for an online multiplayer room
 */
export function subscribeToOnlineRoom(
  roomCode: string,
  onUpdate: (room: OnlineGameRoom | null) => void
): () => void {
  const cleanCode = roomCode.trim().toUpperCase();
  const docRef = doc(db, 'gameRooms', cleanCode);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as OnlineGameRoom);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('Online room subscription warning:', error);
    }
  );
}

/**
 * Update the game state in a room (moves, turns, captures, mills, win status)
 */
export async function updateOnlineRoomGameState(
  roomCode: string,
  partialState: Partial<OnlineGameRoom>
): Promise<boolean> {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const docRef = doc(db, 'gameRooms', cleanCode);
    await updateDoc(docRef, {
      ...partialState,
      lastMoveAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Failed to update online game state:', err);
    return false;
  }
}

/**
 * Send an animated Basotho reaction / quick emote to the opponent
 */
export async function sendOnlineReaction(
  roomCode: string,
  reaction: Omit<ChatReaction, 'id' | 'timestamp'>
): Promise<boolean> {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const docRef = doc(db, 'gameRooms', cleanCode);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;

    const room = snap.data() as OnlineGameRoom;
    const existing = room.chatReactions || [];
    const newEntry: ChatReaction = {
      ...reaction,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    // Keep only the latest 8 reactions
    const updatedList = [...existing.slice(-7), newEntry];
    await updateDoc(docRef, {
      chatReactions: updatedList,
    });
    return true;
  } catch (err) {
    console.error('Failed to send reaction:', err);
    return false;
  }
}

/**
 * Leave or Abandon an online multiplayer match room
 */
export async function leaveOnlineRoom(roomCode: string, userId: string): Promise<void> {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const docRef = doc(db, 'gameRooms', cleanCode);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const room = snap.data() as OnlineGameRoom;
    if (room.hostId === userId && room.status === 'waiting') {
      // If host leaves before anyone joins, delete room
      await deleteDoc(docRef);
    } else {
      await updateDoc(docRef, {
        status: 'abandoned',
      });
    }
  } catch (err) {
    console.error('Failed to leave online room:', err);
  }
}

/**
 * Restart online match for a rematch
 */
export async function restartOnlineMatch(roomCode: string, stageId: DifficultyStageId): Promise<boolean> {
  try {
    const cleanCode = roomCode.trim().toUpperCase();
    const docRef = doc(db, 'gameRooms', cleanCode);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;

    const room = snap.data() as OnlineGameRoom;

    // Fresh points
    const freshPoints: Record<string, BoardPoint> = {};
    for (const [key, pt] of Object.entries(INITIAL_POINTS)) {
      freshPoints[key] = { ...pt, piece: null };
    }

    await updateDoc(docRef, {
      status: 'playing',
      stageId,
      turn: 'obsidian',
      phase: 'placing',
      boardPoints: freshPoints,
      obsidian: {
        ...room.obsidian,
        inHand: 12,
        onBoard: 0,
        captured: 0,
      },
      ivory: {
        ...room.ivory,
        inHand: 12,
        onBoard: 0,
        captured: 0,
      },
      forcedOpening: null,
      pendingMillCount: 0,
      activeMillLines: [],
      flashMill: null,
      winner: null,
      moveCount: 0,
      history: [],
      lastMove: null,
      lastMoveAt: new Date().toISOString(),
      rematchRequestedBy: null,
    });
    return true;
  } catch (err) {
    console.error('Failed to restart match:', err);
    return false;
  }
}
