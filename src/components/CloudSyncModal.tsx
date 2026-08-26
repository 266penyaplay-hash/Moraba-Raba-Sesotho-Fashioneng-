import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudAlert,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Database,
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Crown,
  X,
  Layers,
  Award,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { fetchGlobalLeaderboard, LeaderboardEntry } from '../services/firebase';
import { loadPlayerMastery, getRankTier } from '../utils/masteryStats';
import { loadDailyStreakData } from '../constants/dailyChallenges';
import { loadSolvedPuzzles } from '../constants/puzzles';
import { loadAchievements } from '../constants/achievements';
import { loadPlayerProgression } from '../constants/stages';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  isCloudSynced: boolean;
  isSyncing: boolean;
  lastSyncedTimestamp: string | null;
  syncError: string | null;
  onSyncToCloud: () => Promise<boolean>;
  onRestoreFromCloud: () => Promise<boolean>;
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isCloudSynced,
  isSyncing,
  lastSyncedTimestamp,
  syncError,
  onSyncToCloud,
  onRestoreFromCloud,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'leaderboard'>('sync');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Local snapshot counts
  const mastery = loadPlayerMastery();
  const rankTier = getRankTier(mastery.rating);
  const daily = loadDailyStreakData();
  const solvedPuzzles = loadSolvedPuzzles();
  const achievements = loadAchievements().filter((a) => a.isUnlocked);
  const progression = loadPlayerProgression();

  useEffect(() => {
    if (isOpen && activeTab === 'leaderboard') {
      loadLeaderboardData();
    }
  }, [isOpen, activeTab]);

  const loadLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await fetchGlobalLeaderboard(25);
      setLeaderboard(data);
    } catch (e) {
      console.warn('Failed to load leaderboard', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleManualSync = async () => {
    setActionMessage('Uploading all local progress to Firestore...');
    const ok = await onSyncToCloud();
    if (ok) {
      setActionMessage('✓ All game data successfully synced to Firebase Firestore!');
      if (activeTab === 'leaderboard') loadLeaderboardData();
    } else {
      setActionMessage('⚠ Sync encountered an issue. Check connection.');
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleManualRestore = async () => {
    setActionMessage('Downloading and merging data from Cloud...');
    const ok = await onRestoreFromCloud();
    if (ok) {
      setActionMessage('✓ Local state synchronized with Firebase Cloud snapshot!');
    } else {
      setActionMessage('⚠ Failed to fetch cloud data.');
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#14100D] border border-[#3A2B1D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2C2116] bg-gradient-to-r from-[#1D1610] via-[#2A1D13] to-[#1D1610] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2B1D12] border border-[#523A25] flex items-center justify-center shadow-inner">
              <Cloud className="w-5 h-5 text-[#FFB84D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#F3EDE2] tracking-wide">
                  Firebase Cloud Sync
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#203D2E] text-[#69D99C] border border-[#2D5A42]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52D48E] animate-pulse"></span>
                  Firestore Active
                </span>
              </div>
              <p className="text-xs text-[#A89884]">
                Cross-device save files, Basotho ELO mastery & global leaderboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9B8977] hover:text-[#F3EDE2] hover:bg-[#2A2016] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Ribbon */}
        <div className="grid grid-cols-2 p-1.5 bg-[#1A130E] border-b border-[#2C2116]">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sync'
                ? 'bg-[#2B1F15] text-[#FFE394] border border-[#523D29] shadow-sm'
                : 'text-[#A08E7B] hover:text-[#F3EDE2]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cloud Storage & Profile
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-[#2B1F15] text-[#FFE394] border border-[#523D29] shadow-sm'
                : 'text-[#A08E7B] hover:text-[#F3EDE2]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
            Basotho Global Standings
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'sync' && (
            <>
              {/* Account Status Card */}
              <div className="p-3.5 rounded-xl bg-[#1D1610] border border-[#3A2B1D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2A1E14] border border-[#4E3722] flex items-center justify-center overflow-hidden">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserIcon className="w-4 h-4 text-[#D9A855]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F3EDE2] flex items-center gap-1.5">
                        {currentUser?.displayName || (currentUser?.isAnonymous ? 'Guest Player' : 'Basotho Player')}
                        {currentUser?.isAnonymous && (
                          <span className="text-[10px] text-[#A08E7B] bg-[#2A2016] px-1.5 py-0.5 rounded border border-[#3E2D1E]">
                            Guest Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A08E7B] truncate max-w-[200px] sm:max-w-[280px]">
                        {currentUser?.email || `UID: ${currentUser?.uid?.slice(0, 14)}...`}
                      </div>
                    </div>
                  </div>

                  {currentUser?.isAnonymous ? (
                    <button
                      onClick={onSignInWithGoogle}
                      className="py-1.5 px-3 rounded-lg bg-[#2A2016] hover:bg-[#3D2C1E] text-[#FFE79A] border border-[#523A25] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign in Google
                    </button>
                  ) : (
                    <button
                      onClick={onSignOut}
                      className="py-1.5 px-2.5 rounded-lg bg-[#241A12] hover:bg-[#332216] text-[#B8A693] hover:text-[#F3EDE2] border border-[#3A2A1B] text-xs transition-colors flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  )}
                </div>

                {/* Cloud Sync Status Ribbon */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2B1F15] text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#A08E7B]">
                    {isCloudSynced ? (
                      <span className="flex items-center gap-1 text-[#69D99C]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Synchronized with Firestore
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#FF8E4D]">
                        <CloudAlert className="w-3.5 h-3.5" />
                        Syncing...
                      </span>
                    )}
                  </div>
                  <span className="text-[#847565]">
                    {lastSyncedTimestamp
                      ? `Last: ${new Date(lastSyncedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      : 'Active now'}
                  </span>
                </div>
              </div>

              {/* Data Entities Summary Card */}
              <div className="p-3.5 rounded-xl bg-[#1D1610] border border-[#3A2B1D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#D9A855] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Cloud Backup Inventory
                  </h3>
                  <span className="text-[10px] text-[#A08E7B]">6 Live Collections</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Player ELO & Rank</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-[#D9A855]" />
                      {mastery.rating} <span className="text-[10px] text-[#D9A855]">({rankTier.name})</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Campaign Cleared</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5EA38A]" />
                      {progression.completedStages?.length || 0} / 5 Stages
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Daily Streak</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#FF7A29]" />
                      {daily.currentStreak} Days
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Tactical Puzzles</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#6BB6FF]" />
                      {solvedPuzzles.length} Solved
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Honors & Badges</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#E5A93C]" />
                      {achievements.length} Unlocked
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#14100D] border border-[#2B2016]">
                    <div className="text-[10px] text-[#8C7A68]">Total Victories</div>
                    <div className="text-sm font-bold text-[#F3EDE2] flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
                      {mastery.totalWins} Wins
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Message Feedback */}
              {actionMessage && (
                <div className="p-2.5 rounded-lg bg-[#241C12] border border-[#523A25] text-xs font-semibold text-[#FFE394] text-center animate-fadeIn">
                  {actionMessage}
                </div>
              )}
              {syncError && (
                <div className="p-2.5 rounded-lg bg-[#3D1414] border border-[#6B2828] text-xs text-[#FFA8A8] text-center">
                  {syncError}
                </div>
              )}

              {/* Manual Cloud Action Controls */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D9A855] to-[#B38030] hover:from-[#E5B562] hover:to-[#C28C3A] text-[#14100D] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing to Cloud...' : 'Sync All to Cloud Now'}
                </button>

                <button
                  onClick={handleManualRestore}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl bg-[#201811] hover:bg-[#2E2218] text-[#E5D7C5] border border-[#443324] font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-[#D9A855]" />
                  Restore / Pull Cloud Save
                </button>
              </div>
            </>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#F3EDE2] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#FFD700]" />
                    Live Basotho Grandmaster Leaderboard
                  </h3>
                  <p className="text-[11px] text-[#A08E7B]">
                    Real-time global tactical ratings powered by Firestore
                  </p>
                </div>
                <button
                  onClick={loadLeaderboardData}
                  disabled={loadingLeaderboard}
                  className="p-1.5 rounded-lg bg-[#241A12] border border-[#3E2D1E] text-[#B8A693] hover:text-[#F3EDE2] text-xs flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loadingLeaderboard ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#A08E7B]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#D9A855]" />
                  Fetching global player rankings...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#A08E7B] bg-[#1A140F] rounded-xl border border-[#2B2016] p-4">
                  <Trophy className="w-8 h-8 text-[#5E4D3B] mx-auto mb-2 opacity-50" />
                  No other players recorded in this season yet. Be the first to reach Morena rank!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {leaderboard.map((entry, idx) => {
                    const isSelf = currentUser && entry.userId === currentUser.uid;
                    return (
                      <div
                        key={entry.userId || idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isSelf
                            ? 'bg-[#2A2014] border-[#D9A855]/60 shadow-sm'
                            : 'bg-[#18130E] border-[#2C2116] hover:bg-[#201812]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 text-center font-bold ${
                              idx === 0
                                ? 'text-[#FFD700]'
                                : idx === 1
                                ? 'text-[#C0C0C0]'
                                : idx === 2
                                ? 'text-[#CD7F32]'
                                : 'text-[#857666]'
                            }`}
                          >
                            #{idx + 1}
                          </span>

                          <div>
                            <div className="font-bold text-[#F3EDE2] flex items-center gap-1.5">
                              {entry.displayName || 'Basotho Tactician'}
                              {isSelf && (
                                <span className="text-[9px] bg-[#D9A855] text-[#14100D] font-bold px-1.5 rounded">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#A08E7B]">
                              {entry.rankTierName} • {entry.totalWins || 0} Wins • 🔥{entry.dailyStreak || 0} Streak
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-[#FFE79A]">{entry.rating}</div>
                          <div className="text-[9px] text-[#8C7A68]">ELO Rating</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#110D0A] border-t border-[#231A12] text-[11px] text-[#786959] flex items-center justify-between">
          <span>Project: penya-play-afrika</span>
          <span>Database: Firestore v2</span>
        </div>
      </div>
    </div>
  );
};
