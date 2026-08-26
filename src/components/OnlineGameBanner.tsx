import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, MessageSquare, Send, Sparkles, Trophy } from 'lucide-react';
import { OnlineGameRoom, ChatReaction, sendOnlineReaction } from '../services/firebase';
import { PlayerId } from '../types';

interface OnlineGameBannerProps {
  room: OnlineGameRoom;
  playerRole: PlayerId; // 'obsidian' (Host) or 'ivory' (Guest)
  isMyTurn: boolean;
}

const QUICK_REACTIONS = [
  { emoji: '🐮', text: 'Ke Molamu!' },
  { emoji: '🌧️', text: 'Pula!' },
  { emoji: '✌️', text: 'Khotso!' },
  { emoji: '⚡', text: 'What a Mill!' },
  { emoji: '🔥', text: 'Ha re tsamaye!' },
  { emoji: '🤝', text: 'Good match!' },
];

export const OnlineGameBanner: React.FC<OnlineGameBannerProps> = ({
  room,
  playerRole,
  isMyTurn,
}) => {
  const [isOpenEmotes, setIsOpenEmotes] = useState(false);
  const [lastSent, setLastSent] = useState<number>(0);

  const isHost = playerRole === 'obsidian';
  const myName = isHost ? room.hostName : room.guestName || 'You';
  const myClan = isHost ? room.hostClan : room.guestClan || 'Bakoena';
  const opponentName = isHost ? room.guestName || 'Friend' : room.hostName;
  const opponentClan = isHost ? room.guestClan || 'Bataung' : room.hostClan || 'Bakoena';

  const handleSendReaction = async (reaction: { emoji: string; text: string }) => {
    if (Date.now() - lastSent < 1000) return; // Debounce
    setLastSent(Date.now());
    await sendOnlineReaction(room.id, {
      senderId: isHost ? room.hostId : room.guestId || 'guest',
      senderName: myName,
      text: reaction.text,
      emoji: reaction.emoji,
    });
    setIsOpenEmotes(false);
  };

  // Filter reactions that happened in the last 6 seconds
  const recentReactions = (room.chatReactions || []).filter(
    (r) => Date.now() - r.timestamp < 6500
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-2 px-2">
      {/* Floating Animated Reactions */}
      <div className="fixed top-20 right-6 z-40 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {recentReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -20 }}
              className="bg-neutral-900/90 backdrop-blur-md border border-amber-500/40 text-neutral-100 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5"
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {reaction.senderName}
                </p>
                <p className="text-xs font-semibold text-white">{reaction.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Banner Bar */}
      <div className="bg-neutral-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-2.5 px-4 flex items-center justify-between shadow-lg">
        {/* Left: Player info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {room.id}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
            <span className="text-neutral-400">Playing vs</span>
            <span className="font-bold text-white">{opponentName}</span>
            <span className="text-[10px] text-amber-400/80 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              {opponentClan}
            </span>
          </div>
        </div>

        {/* Center: Turn prompt */}
        <div className="hidden sm:flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isMyTurn
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
                : 'bg-neutral-800 text-neutral-400 border border-white/5'
            }`}
          >
            {isMyTurn ? '✨ YOUR TURN' : `Waiting for ${opponentName}...`}
          </span>
        </div>

        {/* Right: Emotes Trigger */}
        <div className="relative">
          <button
            id="online-reaction-trigger"
            onClick={() => setIsOpenEmotes(!isOpenEmotes)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Taunt / Emote</span>
          </button>

          {/* Quick Emote Dropdown */}
          <AnimatePresence>
            {isOpenEmotes && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl z-50 grid grid-cols-2 gap-1.5"
              >
                {QUICK_REACTIONS.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendReaction(r)}
                    className="p-2 rounded-xl bg-neutral-800/80 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/40 text-left transition-all text-xs flex items-center gap-2"
                  >
                    <span className="text-base">{r.emoji}</span>
                    <span className="text-[11px] font-medium text-white truncate">{r.text}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
