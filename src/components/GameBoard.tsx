import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardPoint, GamePhase, PlayerId, DifficultyStageId, CattleSetId } from '../types';
import { CONNECTION_SEGMENTS } from '../engine/morabaraba';
import { DIFFICULTY_STAGES } from '../constants/stages';
import { BottleCapToken } from './BottleCapToken';
import { LesothoAtmosphere } from './LesothoBackdrop';

export interface LastMoveHighlight {
  from?: string;
  to: string;
  player?: PlayerId;
  type?: 'place' | 'move' | 'shoot';
}

interface GameBoardProps {
  points: Record<string, BoardPoint>;
  turn: PlayerId;
  phase: GamePhase;
  selectedPointId: string | null;
  validTargets: string[];
  capturablePoints?: string[];
  flashMill: [string, string, string] | null;
  activeMillLines?: [string, string, string][];
  lastMove?: LastMoveHighlight | null;
  onPointClick: (pointId: string) => void;
  lightingAngle?: { x: number; y: number };
  stageId?: DifficultyStageId;
  atmosphere?: LesothoAtmosphere;
  isRoyalSkin?: boolean;
  cattleSet?: CattleSetId;
  boardSkin?: 'adaptive' | 'firestone' | 'sandstone';
  shakeIntensity?: 'none' | 'light' | 'medium' | 'heavy';
}

interface DustImpact {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  points,
  selectedPointId,
  validTargets,
  capturablePoints = [],
  flashMill,
  activeMillLines = [],
  lastMove = null,
  onPointClick,
  stageId = 'matenase',
  atmosphere = 'golden-dawn',
  isRoyalSkin = false,
  cattleSet = 'heritage',
  boardSkin = 'adaptive',
  shakeIntensity = 'none',
}) => {
  const currentStage = DIFFICULTY_STAGES[stageId] || DIFFICULTY_STAGES.matenase;
  const [impacts, setImpacts] = useState<DustImpact[]>([]);
  const [prevPointPieces, setPrevPointPieces] = useState<Record<string, PlayerId | null>>({});

  // Dynamic board tremor physics keyframes
  const shakeVariants = {
    none: { x: 0, y: 0, rotate: 0 },
    light: {
      x: [0, -1.5, 1.5, -0.8, 0.8, 0],
      y: [0, 1.2, -1.2, 0.6, 0],
      rotate: [0, -0.2, 0.2, 0],
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    medium: {
      x: [0, -3.5, 3.5, -2, 2, -1, 0],
      y: [0, 2.5, -2.5, 1.5, -1, 0],
      rotate: [0, -0.5, 0.5, -0.3, 0],
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    heavy: {
      x: [0, -6, 6, -4.5, 4.5, -2.5, 2.5, -1, 1, 0],
      y: [0, 5, -5, 3.5, -3.5, 2, -2, 0],
      rotate: [0, -1.2, 1.2, -0.8, 0.8, -0.3, 0.3, 0],
      transition: { duration: 0.55, ease: 'easeInOut' },
    },
  };

  const isWinterDawn = atmosphere === 'winter-snow' || atmosphere === 'golden-dawn';
  const isStorm = atmosphere === 'mokhotlong-storm' || atmosphere === 'highland-storm';
  const isSunset = atmosphere === 'khubetsoana-red';
  const isMidnight = atmosphere === 'tsoenene';

  // Detect piece placements/movements to spawn stone dust impact rings
  useEffect(() => {
    const newImpacts: DustImpact[] = [];
    (Object.entries(points) as [string, BoardPoint][]).forEach(([id, pt]) => {
      const prevPiece = prevPointPieces[id];
      if (pt.piece && pt.piece !== prevPiece) {
        newImpacts.push({
          id: `impact-${id}-${Date.now()}-${Math.random()}`,
          x: pt.x,
          y: pt.y,
          timestamp: Date.now(),
        });
      }
    });

    if (newImpacts.length > 0) {
      setImpacts((prev) => [...prev.slice(-3), ...newImpacts]);
      const timer = setTimeout(() => {
        setImpacts((prev) => prev.filter((imp) => Date.now() - imp.timestamp < 1000));
      }, 900);
      return () => clearTimeout(timer);
    }

    const currentMap: Record<string, PlayerId | null> = {};
    (Object.entries(points) as [string, BoardPoint][]).forEach(([id, pt]) => {
      currentMap[id] = pt.piece;
    });
    setPrevPointPieces(currentMap);
  }, [points]);

  return (
    <div
      id="game-board-container"
      className="relative w-full max-w-[460px] mx-auto aspect-square select-none p-1 sm:p-2 animate-board-slide-in"
    >
      
      {/* ========================================================================= */}
      {/* SUBTLE BASOTHO FRAME MATTING (Restrained 10% Prominence) */}
      {/* ========================================================================= */}
      <div className="absolute -inset-1.5 sm:-inset-2.5 pointer-events-none z-0 rounded-[24px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            backgroundColor: isStorm ? '#0D0C0B' : isSunset ? '#200D07' : isMidnight ? '#0B0910' : '#17120C',
          }}
        />
        {/* Very subtle border frieze on outer perimeter only */}
        <div className="absolute inset-0 opacity-20 border border-[#8C6D48]/40 rounded-[24px]" />
      </div>

      {/* ========================================================================= */}
      {/* SOLID HAND-CARVED BASOTHO SLAB (Warm Sandstone / Dark Basalt) */}
      {/* ========================================================================= */}
      <motion.div
        animate={shakeIntensity}
        variants={shakeVariants}
        className="relative w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,255,255,0.06)] border border-[#423120]/90 z-10"
      >
        {/* Base Stone Material */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: boardSkin === 'sandstone'
              ? 'radial-gradient(ellipse at 48% 46%, #33271C 0%, #221A12 55%, #15100B 100%)'
              : boardSkin === 'firestone' || isSunset
              ? 'radial-gradient(ellipse at 48% 46%, #28140E 0%, #1A0C08 55%, #0C0503 100%)'
              : isStorm
              ? 'radial-gradient(ellipse at 48% 46%, #191C22 0%, #101217 55%, #08090C 100%)'
              : 'radial-gradient(ellipse at 48% 46%, #251E17 0%, #18130E 55%, #0C0907 100%)',
          }}
        />

        {/* 10% Visual Prominence: Restrained Basotho Engraved Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 mix-blend-overlay z-[2]">
          <defs>
            <pattern id="restrained-basotho-texture" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 0 18 L 18 0 L 36 18 L 18 36 Z" fill="none" stroke="#D5A351" strokeWidth="0.7" />
              <path d="M 9 18 L 18 9 L 27 18 L 18 27 Z" fill="none" stroke="#A98545" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#restrained-basotho-texture)" />
        </svg>

        {/* Restrained Outer Border Band */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-[3] overflow-visible"
        >
          <rect
            x="3.5"
            y="3.5"
            width="93"
            height="93"
            rx="4"
            fill="none"
            stroke="#3A2A1A"
            strokeWidth="1.8"
            strokeOpacity="0.85"
          />
          <rect
            x="5.5"
            y="5.5"
            width="89"
            height="89"
            rx="3"
            fill="none"
            stroke="#634524"
            strokeWidth="0.6"
            strokeOpacity="0.4"
          />
        </svg>

        {/* ===================================================================== */}
        {/* PLAYABLE BOARD ARENA (~60-70% OF THE VIEWPORT) */}
        {/* ===================================================================== */}
        <div className="absolute inset-5 sm:inset-6 z-10">
          
          {/* Main SVG: Clear Engraved Connections & Recessed Node Sockets */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Carved Deep Trench Shadow */}
              <linearGradient id="engraved-path-base" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0A0806" />
                <stop offset="100%" stopColor="#080705" />
              </linearGradient>

              {/* Restrained Bronze-Stone Inlaid Connection Line */}
              <linearGradient id="inlaid-bronze-line" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8C6838" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#A88349" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#8C6838" stopOpacity="0.85" />
              </linearGradient>

              {/* Radiant Mill Gold Pulse */}
              <linearGradient id="mill-pulse-gold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFE79A" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>

              {/* Mill Glow Filter */}
              <filter id="mill-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Recessed Empty Node Cupule Depression */}
              <radialGradient id="recessed-socket-depth" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#060504" />
                <stop offset="60%" stopColor="#100D0A" />
                <stop offset="100%" stopColor="#1F1811" />
              </radialGradient>

              {/* Legal Move Glow */}
              <radialGradient id="legal-move-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE79A" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#D9A855" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#A98545" stopOpacity="0" />
              </radialGradient>

              {/* Last Move Origin Departure Ghost Glow */}
              <radialGradient id="origin-departure-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE79A" stopOpacity="0.6" />
                <stop offset="45%" stopColor="#D5A351" stopOpacity="0.3" />
                <stop offset="85%" stopColor="#8C6838" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#3A2A1A" stopOpacity="0" />
              </radialGradient>

              {/* Last Move Destination Radiant Shimmer */}
              <radialGradient id="dest-shimmer-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#FFE79A" stopOpacity="0.75" />
                <stop offset="70%" stopColor="#FFD700" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#D9A855" stopOpacity="0" />
              </radialGradient>

              {/* Animated Vector Trail between Origin & Destination */}
              <linearGradient id="move-vector-trail" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C88943" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#FFE79A" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
              </linearGradient>

              {/* Destination Shimmer Glow Filter */}
              <filter id="dest-glow-filter" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Deep Carved Base Trench for Board Lines */}
            <g stroke="url(#engraved-path-base)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              {CONNECTION_SEGMENTS.map(([p1Id, p2Id], idx) => {
                const p1 = points[p1Id];
                const p2 = points[p2Id];
                if (!p1 || !p2) return null;
                return (
                  <line
                    key={`trench-${idx}-${p1Id}-${p2Id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                  />
                );
              })}
            </g>

            {/* 2. Clean, Inlaid Bronze/Carved Stone Connection Lines */}
            <g stroke="url(#inlaid-bronze-line)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              {CONNECTION_SEGMENTS.map(([p1Id, p2Id], idx) => {
                const p1 = points[p1Id];
                const p2 = points[p2Id];
                if (!p1 || !p2) return null;
                return (
                  <line
                    key={`line-${idx}-${p1Id}-${p2Id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                  />
                );
              })}
            </g>

            {/* 3. Center Kraal Subtle Marker at Point d4 (50, 50) */}
            <g transform="translate(50, 50)" opacity="0.35">
              <circle cx="0" cy="0" r="3.5" fill="none" stroke="#A98545" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
            </g>

            {/* 4a. Active Mill Radiant Pulse Line(s) */}
            {(activeMillLines.length > 0 ? activeMillLines : flashMill ? [flashMill] : []).map((millPoints, mIdx) => (
              <g key={`mill-pulse-${mIdx}`} stroke="url(#mill-pulse-gold)" strokeWidth="3.2" filter="url(#mill-glow-filter)" className="transition-all duration-300">
                <line
                  x1={points[millPoints[0]]?.x ?? 0}
                  y1={points[millPoints[0]]?.y ?? 0}
                  x2={points[millPoints[1]]?.x ?? 0}
                  y2={points[millPoints[1]]?.y ?? 0}
                />
                <line
                  x1={points[millPoints[1]]?.x ?? 0}
                  y1={points[millPoints[1]]?.y ?? 0}
                  x2={points[millPoints[2]]?.x ?? 0}
                  y2={points[millPoints[2]]?.y ?? 0}
                />
              </g>
            ))}

            {/* 4b. Recent Move Connecting Travel Trail */}
            {lastMove?.from && lastMove?.to && points[lastMove.from] && points[lastMove.to] && (
              <g className="pointer-events-none transition-all duration-300">
                <line
                  x1={points[lastMove.from].x}
                  y1={points[lastMove.from].y}
                  x2={points[lastMove.to].x}
                  y2={points[lastMove.to].y}
                  stroke="#080604"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
                <line
                  x1={points[lastMove.from].x}
                  y1={points[lastMove.from].y}
                  x2={points[lastMove.to].x}
                  y2={points[lastMove.to].y}
                  stroke="url(#move-vector-trail)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 2.5"
                  className="animate-pulse"
                />
                {/* Midpoint Directional Beacon */}
                <circle
                  cx={(points[lastMove.from].x + points[lastMove.to].x) / 2}
                  cy={(points[lastMove.from].y + points[lastMove.to].y) / 2}
                  r="1.3"
                  fill="#FFE79A"
                  stroke="#2E1F12"
                  strokeWidth="0.4"
                />
              </g>
            )}

            {/* 5. The 24 Clearly Empty Sockets / Nodes */}
            {(Object.values(points || {}) as BoardPoint[]).map((pt) => {
              const isEmpty = pt.piece === null;
              const isTarget = (validTargets || []).includes(pt.id);
              const isMillMember = flashMill?.includes(pt.id);
              const isOrigin = lastMove?.from === pt.id;
              const isDestination = lastMove?.to === pt.id;

              return (
                <g
                  key={`node-${pt.id}`}
                  onClick={() => onPointClick(pt.id)}
                  className="cursor-pointer group"
                >
                  {/* Recessed Outer Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.8"
                    fill="url(#recessed-socket-depth)"
                    stroke="#423120"
                    strokeWidth="0.8"
                  />

                  {/* Inner Cavity Ring (Clean and Empty - No misleading occupied dots) */}
                  <circle
                    cx={pt.x}
                    cy={pt.y + 0.2}
                    r="2.6"
                    fill="#0A0806"
                    stroke="#1E160E"
                    strokeWidth="0.4"
                  />

                  {/* Origin Point: Distinct Departure Highlight Border & Shimmer */}
                  {isOrigin && (
                    <g className="pointer-events-none">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.8"
                        fill="url(#origin-departure-glow)"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.2"
                        fill="none"
                        stroke="#D5A351"
                        strokeWidth="1.2"
                        strokeDasharray="2.5 1.5"
                        className="opacity-90"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="1.2"
                        fill="#C88943"
                        opacity="0.85"
                      />
                    </g>
                  )}

                  {/* Destination Point: Underlying Radiant Shimmer & Gold Beacon Ring */}
                  {isDestination && (
                    <g className="pointer-events-none">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="6.0"
                        fill="url(#dest-shimmer-glow)"
                        filter="url(#dest-glow-filter)"
                        className="animate-pulse"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.9"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="1.4"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${pt.x}px ${pt.y}px`, animationDuration: '10s' }}
                      />
                    </g>
                  )}

                  {/* Hover Cue for Empty Sockets */}
                  {isEmpty && !isTarget && !isOrigin && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.2"
                      fill="none"
                      stroke="#8C6838"
                      strokeWidth="0.6"
                      className="opacity-0 group-hover:opacity-80 transition-opacity duration-200"
                    />
                  )}

                  {/* Legal Move Target: Soft Warm Glow */}
                  {isEmpty && isTarget && (
                    <g className="animate-pulse">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.6"
                        fill="url(#legal-move-glow)"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.6"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="1.1"
                        strokeDasharray="2 1.5"
                      />
                    </g>
                  )}

                  {/* Mill Formation Gold Pulse Ring */}
                  {isMillMember && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.8"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="1.6"
                      filter="url(#mill-glow-filter)"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* =================================================================== */}
          {/* 6. PHYSICAL BOTTLE CAP CATTLE TOKENS LAYER */}
          {/* =================================================================== */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <AnimatePresence>
              {(Object.values(points || {}) as BoardPoint[]).map((pt) => {
                if (!pt.piece) return null;
                const isSelected = selectedPointId === pt.id;
                const isCapturable = (capturablePoints || []).includes(pt.id);
                const isLastMoved = lastMove?.to === pt.id;

                return (
                  <div
                    key={`cap-${pt.id}`}
                    style={{
                      position: 'absolute',
                      left: `${pt.x}%`,
                      top: `${pt.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 0,
                      height: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="pointer-events-auto"
                  >
                    <motion.div
                      initial={{
                        scale: 1.4,
                        y: -18,
                        opacity: 0,
                      }}
                      animate={{
                        scale: isSelected ? 1.12 : 1,
                        y: isSelected ? -6 : 0,
                        opacity: 1,
                      }}
                      exit={{
                        scale: 0.3,
                        opacity: 0,
                        y: 6,
                        transition: { duration: 0.2, ease: 'easeOut' },
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 26,
                        mass: 0.7,
                      }}
                      className={`relative flex items-center justify-center rounded-full ${
                        isLastMoved && !isSelected && !isCapturable
                          ? 'shadow-[0_0_14px_rgba(255,215,0,0.55)]'
                          : ''
                      }`}
                    >
                      <BottleCapToken
                        player={pt.piece}
                        size={39}
                        isSelected={isSelected}
                        isCapturable={isCapturable}
                        isLastMoved={isLastMoved}
                        isRoyalSkin={isRoyalSkin}
                        cattleSet={cattleSet}
                        onClick={() => onPointClick(pt.id)}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
