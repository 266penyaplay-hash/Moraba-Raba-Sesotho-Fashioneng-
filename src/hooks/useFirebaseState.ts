import { useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInAsGuest,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  updateUserProfileData,
  fetchUserProfileData,
  UserProfileData,
  logOut,
  saveCloudProgression,
  fetchCloudProgression,
  recordCloudMatch,
  recordPlayerLoginSession,
  recordGameSessionStart,
  updateGameSessionStatus,
  syncAllLocalToCloud,
  syncAllCloudToLocal,
} from '../services/firebase';
import { PlayerProgression, MatchPerformanceStats, DifficultyStageId, GameMode, PlayerId } from '../types';
import { loadPlayerProgression, savePlayerProgression } from '../constants/stages';

export function useFirebaseState() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const lastRecordedLoginUidRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const p = await fetchUserProfileData(uid);
      if (p) setUserProfile(p);
    } catch (e) {
      console.warn('Could not load profile:', e);
    }
  }, []);

  // Monitor Auth state and auto-sign in as guest if not signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsCloudSynced(true);
        setAuthLoading(false);
        loadProfile(user.uid);

        // Record player login session if not recorded yet in this tab session
        if (lastRecordedLoginUidRef.current !== user.uid) {
          lastRecordedLoginUidRef.current = user.uid;
          recordPlayerLoginSession(user);
        }

        // Fetch cloud data and merge into local
        try {
          setIsSyncing(true);
          await syncAllCloudToLocal(user.uid);
          // Then push merged snapshot to cloud
          const res = await syncAllLocalToCloud(user.uid, user);
          if (res.success) {
            setLastSyncedTimestamp(res.timestamp);
            setIsCloudSynced(true);
          }
        } catch (e) {
          console.warn('Initial cloud sync notice:', e);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Automatically initialize guest authentication for seamless zero-friction play
        try {
          const guest = await signInAsGuest();
          if (guest) {
            setCurrentUser(guest);
            setIsCloudSynced(true);
            loadProfile(guest.uid);
          }
        } catch (err) {
          console.warn('Guest sign-in fallback:', err);
        }
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadProfile]);

  // Save progression both locally and to Cloud Firestore
  const syncProgression = useCallback(
    async (progression: PlayerProgression) => {
      savePlayerProgression(progression);
      if (currentUser) {
        try {
          const ok = await saveCloudProgression(currentUser.uid, progression);
          setIsCloudSynced(ok);
        } catch (err) {
          console.warn('Progression sync warning:', err);
          setIsCloudSynced(false);
        }
      }
    },
    [currentUser]
  );

  // Explicit full sync: Push local data to Firestore
  const triggerPushSync = useCallback(async () => {
    if (!currentUser) return false;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await syncAllLocalToCloud(currentUser.uid, currentUser);
      if (res.success) {
        setIsCloudSynced(true);
        setLastSyncedTimestamp(res.timestamp);
      } else {
        setIsCloudSynced(false);
        setSyncError('Could not write some data to cloud.');
      }
      return res.success;
    } catch (err: any) {
      setSyncError(err?.message || 'Sync failed');
      setIsCloudSynced(false);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  // Explicit full restore: Pull cloud data to local
  const triggerPullRestore = useCallback(async () => {
    if (!currentUser) return false;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await syncAllCloudToLocal(currentUser.uid);
      if (res.success) {
        setIsCloudSynced(true);
        setLastSyncedTimestamp(new Date().toISOString());
      }
      return res.success;
    } catch (err: any) {
      setSyncError(err?.message || 'Restore failed');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser]);

  // Start tracking active game play session
  const recordGameStart = useCallback(
    async (gameMode: GameMode | 'daily' | 'puzzle', stageId: string) => {
      if (currentUser) {
        try {
          const sessId = await recordGameSessionStart(
            currentUser.uid,
            gameMode,
            stageId,
            currentUser.displayName || (currentUser.isAnonymous ? 'Guest Warrior' : 'Basotho Tactician')
          );
          activeSessionIdRef.current = sessId;
          return sessId;
        } catch (e) {
          console.warn('Game start session record warning:', e);
          return null;
        }
      }
      return null;
    },
    [currentUser]
  );

  // Save match record to Cloud Firestore
  const recordMatch = useCallback(
    async (
      winner: PlayerId | 'draw',
      stageId: DifficultyStageId | string,
      gameMode: GameMode | 'daily' | 'puzzle' | 'online',
      stats: MatchPerformanceStats
    ) => {
      if (currentUser) {
        try {
          await recordCloudMatch(
            currentUser.uid,
            winner,
            stageId,
            gameMode,
            stats,
            currentUser.displayName || (currentUser.isAnonymous ? 'Guest Warrior' : 'Basotho Tactician'),
            activeSessionIdRef.current || undefined
          );

          if (activeSessionIdRef.current) {
            await updateGameSessionStatus(activeSessionIdRef.current, 'completed', {
              winner,
              totalTurns: stats.totalTurns,
              grade: stats.grade,
            });
          }

          // Sync updated local mastery / stats in background
          triggerPushSync();
        } catch (e) {
          console.warn('Failed to record match stats:', e);
        }
      }
    },
    [currentUser, triggerPushSync]
  );

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setSyncError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setCurrentUser(user);
        setIsCloudSynced(true);
        setIsSyncing(true);
        loadProfile(user.uid);
        // Pull & merge cloud data
        await syncAllCloudToLocal(user.uid);
        // Push merged state
        const res = await syncAllLocalToCloud(user.uid, user);
        if (res.success) {
          setLastSyncedTimestamp(res.timestamp);
        }
      }
    } catch (e: any) {
      setSyncError(e?.message || 'Google sign-in error');
    } finally {
      setIsSyncing(false);
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async (
    email: string,
    pass: string,
    displayName: string,
    clanTitle?: string,
    avatarIcon?: string
  ) => {
    setAuthLoading(true);
    setSyncError(null);
    try {
      const { user, error } = await signUpWithEmail(email, pass, displayName, clanTitle, avatarIcon);
      if (error) {
        setSyncError(error);
        return { success: false, error };
      }
      if (user) {
        setCurrentUser(user);
        setIsCloudSynced(true);
        loadProfile(user.uid);
        await syncAllLocalToCloud(user.uid, user);
        return { success: true, error: null };
      }
      return { success: false, error: 'Sign up could not complete' };
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setAuthLoading(true);
    setSyncError(null);
    try {
      const { user, error } = await signInWithEmail(email, pass);
      if (error) {
        setSyncError(error);
        return { success: false, error };
      }
      if (user) {
        setCurrentUser(user);
        setIsCloudSynced(true);
        loadProfile(user.uid);
        await syncAllCloudToLocal(user.uid);
        await syncAllLocalToCloud(user.uid, user);
        return { success: true, error: null };
      }
      return { success: false, error: 'Sign in failed' };
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    return await sendPasswordReset(email);
  };

  const handleUpdateProfile = async (data: { displayName?: string; clanTitle?: string; avatarIcon?: string; photoURL?: string }) => {
    if (!currentUser) return false;
    const ok = await updateUserProfileData(currentUser.uid, data);
    if (ok) {
      loadProfile(currentUser.uid);
    }
    return ok;
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await logOut();
      const guest = await signInAsGuest();
      setCurrentUser(guest);
      if (guest) {
        loadProfile(guest.uid);
        await syncAllLocalToCloud(guest.uid, guest);
      }
    } catch (e: any) {
      setSyncError(e?.message || 'Sign out error');
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    currentUser,
    userProfile,
    authLoading,
    isCloudSynced,
    isSyncing,
    lastSyncedTimestamp,
    syncError,
    syncProgression,
    recordMatch,
    recordGameStart,
    updateGameSessionStatus,
    syncAllToCloud: triggerPushSync,
    syncAllFromCloud: triggerPullRestore,
    signInWithGoogle: handleGoogleSignIn,
    signUpWithEmail: handleEmailSignUp,
    signInWithEmail: handleEmailSignIn,
    sendPasswordReset: handlePasswordReset,
    updateProfile: handleUpdateProfile,
    refreshProfile: () => currentUser && loadProfile(currentUser.uid),
    signInAsGuest,
    signOut: handleSignOut,
  };
}
