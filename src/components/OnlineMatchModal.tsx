import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  Play,
  Sparkles,
  Shield,
  RefreshCw,
  AlertCircle,
  Link2,
  Radio,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  OnlineGameRoom,
  createOnlineRoom,
  joinOnlineRoom,
  subscribeToOnlineRoom,
  leaveOnlineRoom,
  UserProfileData,
  BASOTHO_CLANS,
  TACTICIAN_AVATARS,
} from '../services/firebase';
import { DifficultyStageId, CattleSetId } from '../types';
import { DIFFICULTY_STAGES } from '../constants/stages';
import { sound } from '../utils/audio';

interface OnlineMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfileData | null;
  onStartOnlineGame: (room: OnlineGameRoom, role: 'obsidian' | 'ivory') => void;
  initialRoomCode?: string | null;
  onOpenAuthModal: () => void;
}

export const OnlineMatchModal: React.FC<OnlineMatchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onStartOnlineGame,
  initialRoomCode,
  onOpenAuthModal,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');

  // Creation options
  const [selectedStage, setSelectedStage] = useState<DifficultyStageId>('matenase');
  const [selectedCattleSet, setSelectedCattleSet] = useState<CattleSetId>('classic');

  // Active room state
  const [activeRoom, setActiveRoom] = useState<OnlineGameRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState(initialRoomCode || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync initial room code
  useEffect(() => {
    if (initialRoomCode) {
      setJoinCodeInput(initialRoomCode);
      setTab('join');
    }
  }, [initialRoomCode]);

  // Subscribe to room if active
  useEffect(() => {
    if (!activeRoom?.id) return;

    const unsubscribe = subscribeToOnlineRoom(activeRoom.id, (updated) => {
      if (!updated) {
        setActiveRoom(null);
        return;
      }
      setActiveRoom(updated);

      // If guest joined while host was waiting, play chime
      if (
        currentUser &&
        updated.hostId === currentUser.uid &&
        updated.guestId &&
        updated.status === 'playing'
      ) {
        sound.playMill();
      }
    });

    return () => unsubscribe();
  }, [activeRoom?.id, currentUser]);

  if (!isOpen) return null;

  const userDisplayName =
    userProfile?.displayName || currentUser?.displayName || 'Basotho Tactician';
  const userClan = userProfile?.clanTitle || 'Bakoena';
  const userAvatarId = userProfile?.avatarIcon || 'mokorotlo';
  const userAvatarObj =
    TACTICIAN_AVATARS.find((a) => a.id === userAvatarId) || TACTICIAN_AVATARS[0];

  const handleCreateRoom = async () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    setErrorMsg(null);
    setIsCreating(true);

    const stageConfig = DIFFICULTY_STAGES[selectedStage] || DIFFICULTY_STAGES.matenase;
    const { room, error } = await createOnlineRoom(
      currentUser,
      selectedStage,
      stageConfig.atmosphere,
      selectedCattleSet,
      {
        clanTitle: userClan,
        avatarIcon: userAvatarId,
        rating: 1250,
      }
    );

    setIsCreating(false);
    if (error || !room) {
      setErrorMsg(error || 'Failed to create room.');
    } else {
      sound.playSelect();
      setActiveRoom(room);
    }
  };

  const handleJoinRoom = async (codeToJoin?: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    const code = (codeToJoin || joinCodeInput).trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter a 6-character room code.');
      return;
    }

    setErrorMsg(null);
    setIsJoining(true);

    const { room, error } = await joinOnlineRoom(code, currentUser, {
      clanTitle: userClan,
      avatarIcon: userAvatarId,
      rating: 1200,
    });

    setIsJoining(false);
    if (error || !room) {
      setErrorMsg(error || 'Failed to join match.');
    } else {
      sound.playFanfare();
      onStartOnlineGame(room, 'ivory');
      onClose();
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!activeRoom) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoom.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!activeRoom) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoom.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Play Morabaraba with me!',
          text: `Join my live Morabaraba Sesotho match! Room code: ${activeRoom.id}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleHostLaunchMatch = () => {
    if (!activeRoom) return;
    onStartOnlineGame(activeRoom, 'obsidian');
    onClose();
  };

  const handleCancelRoom = async () => {
    if (activeRoom && currentUser) {
      await leaveOnlineRoom(activeRoom.id, currentUser.uid);
      setActiveRoom(null);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="online-match-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !activeRoom) onClose();
        }}
      >
        <motion.div
          id="online-match-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-neutral-900 border border-amber-500/30 shadow-2xl text-neutral-100"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-b from-amber-950/40 to-neutral-900 border-b border-white/5">
            <button
              id="online-modal-close-btn"
              onClick={() => {
                if (activeRoom) handleCancelRoom();
                onClose();
              }}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-2xl shadow-lg border border-amber-400/30">
                🐮
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Live Matchmaking & Invites</span>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                    P2P Cloud
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Play real-time Morabaraba with friends across any device
                </p>
              </div>
            </div>

            {!activeRoom && (
              <div className="flex items-center gap-2 mt-5 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  id="tab-create-room"
                  onClick={() => {
                    setTab('create');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'create'
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Create Match & Invite
                </button>
                <button
                  id="tab-join-room"
                  onClick={() => {
                    setTab('join');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'join'
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Join with Code
                </button>
              </div>
            )}
          </div>

          {/* Feedback Error */}
          {errorMsg && (
            <div className="px-6 pt-4">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-xs bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 pt-3 max-h-[70vh] overflow-y-auto space-y-4">
            {/* ACTIVE WAITING ROOM (Host created room) */}
            {activeRoom ? (
              <div className="space-y-4">
                {/* Room Code Card */}
                <div className="p-5 rounded-2xl bg-neutral-950/80 border border-amber-500/40 text-center space-y-3 shadow-inner">
                  <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono">
                    Match Invite Code
                  </span>
                  <div className="text-4xl font-extrabold tracking-widest text-amber-400 font-mono select-all">
                    {activeRoom.id}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      id="copy-room-code-btn"
                      onClick={handleCopyCode}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                    </button>

                    <button
                      id="copy-room-link-btn"
                      onClick={handleCopyLink}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      id="share-room-btn"
                      onClick={handleNativeShare}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Players Matchup Card */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Host Card */}
                  <div className="p-3.5 rounded-xl bg-neutral-800/60 border border-amber-500/30 text-center space-y-1.5">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 text-xl mx-auto">
                      {userAvatarObj.icon}
                    </div>
                    <p className="text-xs font-bold text-white truncate">{activeRoom.hostName}</p>
                    <p className="text-[10px] text-amber-300 font-mono">
                      Host · {activeRoom.hostClan || 'Bakoena'}
                    </p>
                    <span className="inline-block text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                      Obsidian Herd (12)
                    </span>
                  </div>

                  {/* Guest Slot */}
                  <div
                    className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-all ${
                      activeRoom.guestId
                        ? 'bg-neutral-800/60 border-emerald-500/40'
                        : 'bg-neutral-900/40 border-dashed border-white/10'
                    }`}
                  >
                    {activeRoom.guestId ? (
                      <>
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 text-xl mx-auto">
                          🛡️
                        </div>
                        <p className="text-xs font-bold text-white truncate">{activeRoom.guestName}</p>
                        <p className="text-[10px] text-emerald-300 font-mono">
                          Guest · {activeRoom.guestClan || 'Bataung'}
                        </p>
                        <span className="inline-block text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                          Ivory Herd (12)
                        </span>
                      </>
                    ) : (
                      <div className="py-2">
                        <div className="w-8 h-8 rounded-full border border-dashed border-neutral-600 flex items-center justify-center text-neutral-500 mx-auto mb-1">
                          <Users className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">Waiting for friend...</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Share code to invite</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Action */}
                {activeRoom.guestId ? (
                  <button
                    id="host-launch-game-btn"
                    onClick={handleHostLaunchMatch}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Friend Joined! Launch Match</span>
                  </button>
                ) : (
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Lounge open. Friend will appear as soon as they enter the code.</span>
                  </div>
                )}

                <button
                  id="cancel-room-btn"
                  onClick={handleCancelRoom}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold hover:bg-neutral-700 transition-colors"
                >
                  Cancel & Close Room
                </button>
              </div>
            ) : (
              <>
                {/* TAB 1: CREATE MATCH ROOM */}
                {tab === 'create' && (
                  <div className="space-y-4">
                    {/* User Profile Overview */}
                    <div className="p-3 bg-neutral-800/40 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-lg">
                          {userAvatarObj.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{userDisplayName}</p>
                          <p className="text-[10px] text-amber-400/80">
                            {userClan} Totem · Host
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onOpenAuthModal}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Customize
                      </button>
                    </div>

                    {/* Arena Atmosphere Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Choose Arena Atmosphere
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(DIFFICULTY_STAGES).map((stg) => {
                          const isSelected = selectedStage === stg.id;
                          return (
                            <button
                              key={stg.id}
                              type="button"
                              onClick={() => setSelectedStage(stg.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-neutral-800/40 border-white/5 text-neutral-400 hover:border-white/20'
                              }`}
                            >
                              <p className="text-xs font-bold text-white truncate">{stg.mapName}</p>
                              <p className="text-[10px] text-neutral-400 truncate">{stg.mapSubtitle || stg.name}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Create Room Button */}
                    <button
                      id="create-room-submit-btn"
                      onClick={handleCreateRoom}
                      disabled={isCreating}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isCreating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          <span>Generate Invite Code & Open Room</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 2: JOIN MATCH ROOM */}
                {tab === 'join' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Enter 6-Character Match Code
                      </label>
                      <input
                        id="join-code-input"
                        type="text"
                        maxLength={8}
                        placeholder="e.g. SF-7492"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 rounded-xl bg-neutral-800/80 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-lg font-mono text-center tracking-widest text-amber-300 placeholder-neutral-600 outline-none uppercase"
                      />
                    </div>

                    <button
                      id="join-room-submit-btn"
                      onClick={() => handleJoinRoom()}
                      disabled={isJoining || !joinCodeInput.trim()}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isJoining ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Connect & Join Match</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-neutral-400">
                      You can also open direct invite links sent to you on WhatsApp, Telegram, or email.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
