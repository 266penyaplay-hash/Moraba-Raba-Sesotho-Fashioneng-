import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardPoint, GamePhase, PlayerId, DifficultyStageId, CattleSetId, DoubleMillAnimationState } from '../types';
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
  doubleMillAnimation?: DoubleMillAnimationState | null;
  isDoubleMill?: boolean;
  isGrandMeridian?: boolean;
  grandMeridianAxis?: 'horizontal' | 'vertical' | 'diagonal' | null;
  grandMeridianPoints?: string[];
  capturesRemaining?: number;
  totalCapturesInSequence?: number;
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
  doubleMillAnimation = null,
  isDoubleMill = false,
  isGrandMeridian = false,
  grandMeridianAxis = null,
  grandMeridianPoints = [],
  capturesRemaining = 0,
  totalCapturesInSequence = 2,
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

  // Determine active mills to highlight:
  const doubleMillLines = doubleMillAnimation?.mills || [];
  const renderedMillLines = doubleMillLines.length > 0 
    ? doubleMillLines 
    : activeMillLines.length > 0 
    ? activeMillLines 
    : flashMill 
    ? [flashMill] 
    : [];

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

              {/* Elegant Old Gold Gradient for Smooth Double Mill */}
              <linearGradient id="old-gold-double-mill" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF6D1" />
                <stop offset="30%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#AA7D2A" />
                <stop offset="85%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#FFF6D1" />
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

              {/* Grand Meridian Celestial Laser Gradient */}
              <linearGradient id="grand-meridian-beam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="15%" stopColor="#FFE79A" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="85%" stopColor="#FF9800" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>

              {/* Grand Meridian Intense Glow Filter */}
              <filter id="grand-meridian-glow-filter" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.0" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Double Mill Grand Glow Filter */}
              <filter id="double-mill-glow-filter" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="5.0" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Solid Bronze Inlaid Pin Gradient */}
              <linearGradient id="solid-bronze-pin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E5B96E" />
                <stop offset="50%" stopColor="#A88242" />
                <stop offset="100%" stopColor="#664B24" />
              </linearGradient>

              {/* Hover Warm Radiant Glow */}
              <radialGradient id="hover-warm-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFE79A" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#D5A351" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#A98545" stopOpacity="0" />
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

            {/* 3. Center Kraal Diamond Emblem at (50, 50) */}
            <g transform="translate(50, 50)" opacity="0.4">
              <polygon points="0,-2.6 2.6,0 0,2.6 -2.6,0" fill="#A98545" opacity="0.7" />
              <circle cx="0" cy="0" r="0.8" fill="#FFE79A" />
            </g>

            {/* 4a. Smooth Double Mill & Active Mill Radiant Pulse Line(s) */}
            {renderedMillLines.map((millPoints, mIdx) => {
              const isDoubleMillAnimationActive = Boolean(doubleMillAnimation?.active || isDoubleMill);
              const p0 = points[millPoints[0]];
              const p1 = points[millPoints[1]];
              const p2 = points[millPoints[2]];
              if (!p0 || !p1 || !p2) return null;

              return (
                <g key={`mill-pulse-${mIdx}`}>
                  {/* Underlay Ambient Glow Pulse */}
                  <line
                    x1={p0.x}
                    y1={p0.y}
                    x2={p1.x}
                    y2={p1.y}
                    stroke={isDoubleMillAnimationActive ? 'url(#old-gold-double-mill)' : 'url(#mill-pulse-gold)'}
                    strokeWidth={isDoubleMillAnimationActive ? 5.2 : 3.8}
                    filter={isDoubleMillAnimationActive ? 'url(#double-mill-glow-filter)' : 'url(#mill-glow-filter)'}
                    className="animate-pulse"
                    opacity={0.85}
                  />
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isDoubleMillAnimationActive ? 'url(#old-gold-double-mill)' : 'url(#mill-pulse-gold)'}
                    strokeWidth={isDoubleMillAnimationActive ? 5.2 : 3.8}
                    filter={isDoubleMillAnimationActive ? 'url(#double-mill-glow-filter)' : 'url(#mill-glow-filter)'}
                    className="animate-pulse"
                    opacity={0.85}
                  />

                  {/* Foreground Crisp Old Gold Stroke */}
                  <motion.line
                    x1={p0.x}
                    y1={p0.y}
                    x2={p1.x}
                    y2={p1.y}
                    stroke={isDoubleMillAnimationActive ? 'url(#old-gold-double-mill)' : 'url(#mill-pulse-gold)'}
                    strokeWidth={isDoubleMillAnimationActive ? 3.0 : 2.2}
                    strokeLinecap="round"
                    initial={isDoubleMillAnimationActive ? { pathLength: 0, opacity: 0 } : false}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: mIdx * 0.15 }}
                  />
                  <motion.line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isDoubleMillAnimationActive ? 'url(#old-gold-double-mill)' : 'url(#mill-pulse-gold)'}
                    strokeWidth={isDoubleMillAnimationActive ? 3.0 : 2.2}
                    strokeLinecap="round"
                    initial={isDoubleMillAnimationActive ? { pathLength: 0, opacity: 0 } : false}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: mIdx * 0.15 + 0.2 }}
                  />
                </g>
              );
            })}

            {/* 4a-2. Grand Meridian Continuous Celestial Laser Beam across Full Kraal Axis */}
            {(isGrandMeridian || doubleMillAnimation?.isGrandMeridian) && (
              <g className="pointer-events-none">
                {(() => {
                  const isHoriz = grandMeridianAxis === 'horizontal' || doubleMillAnimation?.meridianAxis === 'horizontal' || (!grandMeridianAxis && !doubleMillAnimation?.meridianAxis);
                  const startPt = isHoriz ? points['a4'] : points['d1'];
                  const endPt = isHoriz ? points['g4'] : points['d7'];
                  if (!startPt || !endPt) return null;

                  return (
                    <g key="grand-meridian-axis-beam">
                      {/* Wide Radiant Gaussian Beam Underlay */}
                      <line
                        x1={startPt.x}
                        y1={startPt.y}
                        x2={endPt.x}
                        y2={endPt.y}
                        stroke="url(#grand-meridian-beam)"
                        strokeWidth="8.5"
                        filter="url(#grand-meridian-glow-filter)"
                        opacity="0.9"
                        className="animate-pulse"
                      />
                      {/* Core Focused Laser Beam Line */}
                      <motion.line
                        x1={startPt.x}
                        y1={startPt.y}
                        x2={endPt.x}
                        y2={endPt.y}
                        stroke="#FFFFFF"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                      {/* Inner High Gold Conduit */}
                      <motion.line
                        x1={startPt.x}
                        y1={startPt.y}
                        x2={endPt.x}
                        y2={endPt.y}
                        stroke="#FFD700"
                        strokeWidth="1.8"
                        strokeDasharray="6 3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </g>
                  );
                })()}
              </g>
            )}

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

            {/* 5. The 24 Clean & Satisfying Solid Board Intersection Touchpoints */}
            {(Object.values(points || {}) as BoardPoint[]).map((pt) => {
              const isEmpty = pt.piece === null;
              const isTarget = (validTargets || []).includes(pt.id);
              const isMillMember = renderedMillLines.some((m) => m.includes(pt.id));
              const isOrigin = lastMove?.from === pt.id;
              const isDestination = lastMove?.to === pt.id;

              return (
                <g
                  key={`node-${pt.id}`}
                  onClick={() => onPointClick(pt.id)}
                  className="cursor-pointer group"
                >
                  {/* Solid Flush Inlaid Bronze Point - Smooth, tactile, completely hole-free */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="1.6"
                    fill="url(#solid-bronze-pin)"
                    stroke="#593E1A"
                    strokeWidth="0.4"
                  />
                  {/* Subtle Specular Micro-Reflection on top edge for tactile metallic feel */}
                  <circle
                    cx={pt.x - 0.4}
                    cy={pt.y - 0.4}
                    r="0.5"
                    fill="#FFF3D4"
                    opacity="0.85"
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

                  {/* Satisfying Hover Warm Light Expansion on Empty Nodes */}
                  {isEmpty && !isTarget && !isOrigin && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.8"
                      fill="url(#hover-warm-glow)"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  )}

                  {/* Legal Move Target: Soothing, Inviting Radiant Golden Beacon */}
                  {isEmpty && isTarget && (
                    <g className="pointer-events-none animate-pulse">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.6"
                        fill="url(#legal-move-glow)"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.4"
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth="1.1"
                        strokeDasharray="2.5 1.5"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="1.2"
                        fill="#FFFDF7"
                        opacity="0.9"
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

                  {/* Grand Meridian Axis Node Ring */}
                  {(isGrandMeridian || doubleMillAnimation?.isGrandMeridian) && (grandMeridianPoints.includes(pt.id) || doubleMillAnimation?.meridianPoints?.includes(pt.id)) && (
                    <g className="pointer-events-none">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5.6"
                        fill="none"
                        stroke="#FFE79A"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                        filter="url(#grand-meridian-glow-filter)"
                        className="animate-spin origin-center"
                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                      />
                    </g>
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
                const isDoubleMillCenter = doubleMillAnimation?.centerPointId === pt.id;

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
                      zIndex: isDoubleMillCenter ? 35 : isSelected ? 30 : 20,
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
                        scale: isDoubleMillCenter ? 1.2 : isSelected ? 1.12 : 1,
                        y: isDoubleMillCenter ? -8 : isSelected ? -6 : 0,
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
                        isDoubleMillCenter
                          ? 'shadow-[0_10px_25px_rgba(212,175,55,0.7),0_0_16px_rgba(255,242,178,0.8)]'
                          : isLastMoved && !isSelected && !isCapturable
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
                        isDoubleMillElevated={isDoubleMillCenter}
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

          {/* =================================================================== */}
          {/* 7. LUXURY "SMOOTH DOUBLE MILL" & "GRAND HORIZON" ANNOUNCEMENT BANNER */}
          {/* =================================================================== */}
          <AnimatePresence>
            {doubleMillAnimation?.active && (
              <motion.div
                initial={{ opacity: 0, scale: 0.78, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute inset-x-3 sm:inset-x-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center justify-center text-center px-4 py-3.5 rounded-2xl border-2 backdrop-blur-md ${
                  doubleMillAnimation?.isGrandMeridian || isGrandMeridian
                    ? 'bg-[#140A04]/95 border-[#FFD700] shadow-[0_20px_60px_rgba(255,215,0,0.6),0_0_40px_rgba(0,0,0,0.95)]'
                    : 'bg-[#140D08]/95 border-[#D4AF37] shadow-[0_16px_50px_rgba(212,175,55,0.45),0_0_30px_rgba(0,0,0,0.95)]'
                }`}
              >
                {doubleMillAnimation?.isGrandMeridian || isGrandMeridian ? (
                  <>
                    <div className="flex items-center gap-1.5 text-[#FFD700] text-[10px] font-['Space_Grotesk'] font-extrabold uppercase tracking-widest">
                      <span className="text-[#FFE79A] animate-pulse">⚡</span>
                      <span>LEKHALA LA METSI · GRAND HORIZON</span>
                      <span className="text-[#FFE79A] animate-pulse">⚡</span>
                    </div>
                    <div className="font-['Syne'] font-extrabold text-xl sm:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FFE79A] to-[#FFD700] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase mt-0.5">
                      Grand Horizon Double Mill
                    </div>
                    <div className="text-[11px] font-['Space_Grotesk'] text-[#FFE79A] font-bold mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#FFD700]/20 rounded-full border border-[#FFD700]/50 text-[#FFF6D1]">Unbroken Kraal Meridian</span>
                      <span>·</span>
                      <span className="text-[#52C41A] font-extrabold">2 Consecutive Captures</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-[#FFE79A] text-[10px] font-['Space_Grotesk'] font-extrabold uppercase tracking-widest">
                      <span className="text-[#D4AF37]">✦</span>
                      <span>TWIN KRAAL STRIKE</span>
                      <span className="text-[#D4AF37]">✦</span>
                    </div>
                    <div className="font-['Syne'] font-extrabold text-xl sm:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#FFE79A] to-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase mt-0.5">
                      Smooth Double Mill
                    </div>
                    <div className="text-[11px] font-['Space_Grotesk'] text-[#D5A351] font-semibold mt-1 flex items-center gap-1.5">
                      <span>2 Mills Synchronized</span>
                      <span>·</span>
                      <span className="text-[#FFE79A] font-bold">2 Consecutive Captures</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================================== */}
          {/* 8. SEQUENTIAL TWO-CAPTURE OVERLAY PILL */}
          {/* =================================================================== */}
          <AnimatePresence>
            {isDoubleMill && !doubleMillAnimation?.active && capturesRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
              >
                <div className="px-3.5 py-1 rounded-full bg-[#1A120B]/95 border border-[#D4AF37] shadow-[0_4px_16px_rgba(212,175,55,0.35)] flex items-center gap-2 text-[11px] font-['Space_Grotesk'] font-bold text-[#FFE79A]">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                  <span>
                    CAPTURE {totalCapturesInSequence - capturesRemaining + 1} OF {totalCapturesInSequence}
                  </span>
                  <div className="flex items-center gap-1 ml-1">
                    <span className={`w-2 h-2 rounded-full border border-[#D4AF37] ${capturesRemaining <= 1 ? 'bg-[#D4AF37]' : 'bg-transparent'}`} />
                    <span className={`w-2 h-2 rounded-full border border-[#D4AF37] ${capturesRemaining === 0 ? 'bg-[#D4AF37]' : 'bg-transparent'}`} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

