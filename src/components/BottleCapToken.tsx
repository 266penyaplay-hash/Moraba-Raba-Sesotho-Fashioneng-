import React from 'react';
import { PlayerId, CattleSetId } from '../types';

export const SFBrandMonogram: React.FC<{
  size?: number;
  fillColor?: string;
  strokeColor?: string;
  embossed?: boolean;
  className?: string;
}> = ({ size = 28, fillColor = '#D5A351', strokeColor = '#32170F', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="monogram-gold" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="35%" stopColor="#D5A351" />
          <stop offset="70%" stopColor="#C88943" />
          <stop offset="100%" stopColor="#8A4A1C" />
        </linearGradient>
      </defs>
      <path
        d="M51 13 L75 13 L63 36 L77 36 L26 92 L43 53 L38 53 L47 36 L28 50 L51 13 Z"
        fill={fillColor === '#D5A351' ? 'url(#monogram-gold)' : fillColor}
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinejoin="bevel"
      />
    </svg>
  );
};

export interface BottleCapTokenProps {
  player: PlayerId;
  size?: number;
  isSelected?: boolean;
  isCapturable?: boolean;
  isLastMoved?: boolean;
  isRoyalSkin?: boolean;
  cattleSet?: CattleSetId;
  viewAngle?: 'top' | 'angled';
  className?: string;
  onClick?: () => void;
}

/**
 * Basotho Cattle Horn & Brand Motif Component for Bottle Cap Enamel Center
 */
export const BasothoCattleEmblem: React.FC<{
  setId?: CattleSetId;
  isPlayer: boolean;
  size?: number;
  className?: string;
}> = ({ setId = 'heritage', isPlayer, size = 28, className = '' }) => {
  const primaryColor = isPlayer ? '#1F1710' : '#E8CE9D';
  const secondaryColor = isPlayer ? '#3D2A1A' : '#A88242';
  const accentColor = isPlayer ? '#8C6239' : '#FFD700';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible ${className}`}
    >
      <defs>
        <filter id={`cattle-emboss-${isPlayer ? 'p1' : 'p2'}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="1.2" stdDeviation="0.8" floodColor="#000000" floodOpacity={isPlayer ? '0.4' : '0.9'} />
        </filter>
      </defs>

      <g filter={`url(#cattle-emboss-${isPlayer ? 'p1' : 'p2'})`}>
        {/* Set 1: Basotho Heritage (Default authentic horn curve + kraal shield notch) */}
        {setId === 'heritage' && (
          <g>
            {/* Majestic Sweeping Cattle Horns */}
            <path
              d="M14 38 C 10 14, 32 10, 50 24 C 68 10, 90 14, 86 38 C 78 33, 66 29, 50 34 C 34 29, 22 33, 14 38 Z"
              fill={primaryColor}
            />
            {/* Horn Tip Accents */}
            <path d="M14 38 C 12 28, 22 18, 30 16" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M86 38 C 88 28, 78 18, 70 16" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />
            {/* Central Cattle Head / Forehead Plate */}
            <path
              d="M36 34 L64 34 L58 64 L50 72 L42 64 Z"
              fill={primaryColor}
              stroke={secondaryColor}
              strokeWidth="1.5"
            />
            {/* Basotho Diamond Kraal Brand Mark on Forehead */}
            <polygon points="50,40 56,48 50,56 44,48" fill={accentColor} />
            {/* Muzzle Ridge */}
            <circle cx="50" cy="65" r="2.2" fill={secondaryColor} />
          </g>
        )}

        {/* Set 2: Classic Caps (Vintage pressed metal cattle mark) */}
        {setId === 'classic' && (
          <g>
            <path
              d="M18 42 C 14 20, 32 14, 50 26 C 68 14, 86 20, 82 42 C 74 38, 64 34, 50 38 C 36 34, 26 38, 18 42 Z"
              fill={primaryColor}
            />
            <path
              d="M38 38 L62 38 L56 68 L50 74 L44 68 Z"
              fill={primaryColor}
            />
            <circle cx="50" cy="52" r="4.5" fill={accentColor} />
            <line x1="38" y1="52" x2="62" y2="52" stroke={secondaryColor} strokeWidth="1.8" />
          </g>
        )}

        {/* Set 3: Maloti (Mountain kingdom peaks framing bull horns) */}
        {setId === 'maloti' && (
          <g>
            {/* Triple Mountain Peaks */}
            <path d="M26 66 L38 42 L50 56 L62 42 L74 66 Z" fill={secondaryColor} opacity="0.6" />
            {/* Horns arching over the peaks */}
            <path
              d="M12 36 C 8 12, 30 8, 50 22 C 70 8, 92 12, 88 36 C 80 30, 68 26, 50 30 C 32 26, 20 30, 12 36 Z"
              fill={primaryColor}
            />
            <polygon points="50,32 58,46 50,60 42,46" fill={accentColor} />
          </g>
        )}

        {/* Set 4: Mountain Kingdom (Mokorotlo crown + royal horns) */}
        {setId === 'mountain-kingdom' && (
          <g>
            {/* Mokorotlo woven hat silhouette */}
            <path
              d="M50 14 L55 24 L64 36 L36 36 L45 24 Z"
              fill={accentColor}
            />
            {/* Sweeping wide horns below hat */}
            <path
              d="M14 44 C 10 22, 30 20, 50 34 C 70 20, 90 22, 86 44 C 76 38, 64 36, 50 40 C 36 36, 24 38, 14 44 Z"
              fill={primaryColor}
            />
            {/* Cattle Head Base */}
            <path d="M38 42 L62 42 L56 68 L50 74 L44 68 Z" fill={primaryColor} />
            <circle cx="50" cy="54" r="3" fill={accentColor} />
          </g>
        )}

        {/* Set 5: Royal Obsidian (Gold inlaid diamond kraal crest) */}
        {setId === 'royal-obsidian' && (
          <g>
            {/* Outer Diamond Crest */}
            <polygon
              points="50,14 82,50 50,86 18,50"
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
            />
            {/* Majestic Horns */}
            <path
              d="M20 40 C 16 22, 34 18, 50 30 C 66 18, 84 22, 80 40 C 72 36, 62 32, 50 36 C 38 32, 28 36, 20 40 Z"
              fill={primaryColor}
            />
            <circle cx="50" cy="50" r="6" fill={primaryColor} stroke={accentColor} strokeWidth="1.5" />
            <polygon points="50,46 54,50 50,54 46,50" fill={accentColor} />
          </g>
        )}

        {/* Set 6: Tsoenene (Ancestral sacred rock petroglyph) */}
        {setId === 'tsoenene' && (
          <g>
            {/* Petroglyph Cattle Outline */}
            <path
              d="M18 36 C 14 16, 32 12, 50 26 C 68 12, 86 16, 82 36 C 72 32, 62 28, 50 32 C 38 28, 28 32, 18 36 Z"
              fill="none"
              stroke={primaryColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="46" r="8" fill="none" stroke={primaryColor} strokeWidth="2.5" />
            <circle cx="50" cy="46" r="3.5" fill={accentColor} />
            <line x1="50" y1="56" x2="50" y2="76" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
            <line x1="38" y1="72" x2="62" y2="72" stroke={secondaryColor} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}

        {/* Set 7: Tournament Champion (Laurel wreath & embossed championship horns) */}
        {setId === 'champion' && (
          <g>
            {/* Laurel Wreath */}
            <path
              d="M22 62 C 16 46, 20 32, 30 22 M78 62 C 84 46, 80 32, 70 22"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Horns */}
            <path
              d="M16 38 C 12 16, 32 12, 50 24 C 68 12, 88 16, 84 38 C 76 33, 64 30, 50 34 C 36 30, 24 33, 16 38 Z"
              fill={primaryColor}
            />
            <path d="M38 36 L62 36 L56 64 L50 70 L44 64 Z" fill={primaryColor} />
            <polygon points="50,42 56,48 50,54 44,48" fill={accentColor} />
          </g>
        )}
      </g>
    </svg>
  );
};

/**
 * Generate 21-tooth corrugated crown perimeter path for authentic bottle cap
 */
function generateCrownPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number = 21): string {
  const points: { x: number; y: number }[] = [];
  const total = teeth * 2;
  for (let i = 0; i < total; i++) {
    const angle = (i * Math.PI) / teeth - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < total; i++) {
    const p0 = points[(i - 1 + total) % total];
    const p1 = points[i];
    const p2 = points[(i + 1) % total];
    const p3 = points[(i + 2) % total];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d + ' Z';
}

/**
 * Premium 3D Bottle Cap Cattle Piece
 * 
 * Foundation:
 * - PLAYER (Player 01 / 'obsidian'): Warm Ivory / Sandstone enamel cap with rich dark cattle symbol & bronze crimps.
 * - OPPONENT (Player 02 / 'ivory' / AI): Obsidian / Charcoal enamel cap with antique-gold cattle symbol & metal crimps.
 * - 21 fluted crimps, stepped concentric collar bead, realistic stamped metal edge, subtle scratches.
 */
export const BottleCapToken: React.FC<BottleCapTokenProps> = ({
  player,
  size = 42,
  isSelected = false,
  isCapturable = false,
  isLastMoved = false,
  isRoyalSkin = false,
  cattleSet = 'heritage',
  viewAngle = 'top',
  className = '',
  onClick,
}) => {
  const isPlayer = player === 'obsidian'; // Player 01: Warm Ivory / Sandstone
  const capId = `bcap-${player}-${Math.random().toString(36).slice(2, 6)}`;

  // 21 fluted teeth geometric data
  const numTeeth = 21;
  const teethData = Array.from({ length: numTeeth }, (_, i) => {
    const angleDeg = (i * 360) / numTeeth - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const halfStepRad = Math.PI / numTeeth;

    const valleyLeftRad = angleRad - halfStepRad;
    const valleyRightRad = angleRad + halfStepRad;

    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    const lightDot = -(cosAngle * 0.707 + sinAngle * 0.707);

    return {
      index: i,
      angleDeg,
      angleRad,
      cosAngle,
      sinAngle,
      lightDot,
      peak: {
        x: 50 + Math.cos(angleRad) * 48.5,
        y: 50 + Math.sin(angleRad) * 48.5,
      },
      collar: {
        x: 50 + Math.cos(angleRad) * 38.5,
        y: 50 + Math.sin(angleRad) * 38.5,
      },
      valleyLeft: {
        x: 50 + Math.cos(valleyLeftRad) * 43.5,
        y: 50 + Math.sin(valleyLeftRad) * 43.5,
      },
      valleyRight: {
        x: 50 + Math.cos(valleyRightRad) * 43.5,
        y: 50 + Math.sin(valleyRightRad) * 43.5,
      },
      collarLeft: {
        x: 50 + Math.cos(valleyLeftRad) * 38.5,
        y: 50 + Math.sin(valleyLeftRad) * 38.5,
      },
      collarRight: {
        x: 50 + Math.cos(valleyRightRad) * 38.5,
        y: 50 + Math.sin(valleyRightRad) * 38.5,
      },
    };
  });

  const outerSilhouette = generateCrownPath(50, 50, 48.5, 43.5, numTeeth);
  const shadowSilhouette = generateCrownPath(50, isSelected ? 56 : 53, 48.5, 43.5, numTeeth);
  const midFluteBoundary = generateCrownPath(50, 50, 42.5, 38.5, numTeeth);

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-all duration-200 ${
        isSelected
          ? '-translate-y-1.5 z-30'
          : 'hover:scale-105'
      } ${className}`}
      aria-label={`${isPlayer ? 'Player Warm Ivory' : 'Opponent Obsidian'} Bottle Cap Cattle Token`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* PLAYER: Warm Ivory / Sandstone Enamel Center Gradients */}
          <radialGradient id={`${capId}-ivory-face`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="35%" stopColor="#F5EBD9" />
            <stop offset="75%" stopColor="#E5D3B8" />
            <stop offset="100%" stopColor="#C4AA84" />
          </radialGradient>

          {/* OPPONENT: Obsidian / Charcoal Enamel Center Gradients */}
          <radialGradient id={`${capId}-obsidian-face`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#2A241F" />
            <stop offset="35%" stopColor="#1A1613" />
            <stop offset="75%" stopColor="#0F0D0B" />
            <stop offset="100%" stopColor="#050404" />
          </radialGradient>

          {/* Metallic Crimp Rim Gradients */}
          <linearGradient id={`${capId}-metal-crimp`} x1="15" y1="12" x2="85" y2="88" gradientUnits="userSpaceOnUse">
            {isPlayer ? (
              <>
                <stop offset="0%" stopColor="#FFF9EB" />
                <stop offset="25%" stopColor="#DFC08E" />
                <stop offset="55%" stopColor="#A88349" />
                <stop offset="85%" stopColor="#63451E" />
                <stop offset="100%" stopColor="#24170A" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#E0D2C0" />
                <stop offset="25%" stopColor="#9C856E" />
                <stop offset="55%" stopColor="#635242" />
                <stop offset="85%" stopColor="#33281E" />
                <stop offset="100%" stopColor="#120E0A" />
              </>
            )}
          </linearGradient>

          {/* Gloss Sheen */}
          <linearGradient id={`${capId}-enamel-sheen`} x1="20" y1="15" x2="70" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Capturable Warning Filter */}
          <filter id={`${capId}-capturable-filter`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.2" floodColor="#E02424" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* 1. Realistic Corrugated Contact Shadow */}
        <path
          d={shadowSilhouette}
          fill="#000000"
          fillOpacity={isSelected ? '0.85' : '0.65'}
          filter="drop-shadow(0 3px 5px rgba(0,0,0,0.85))"
          className="transition-all duration-200"
        />

        {/* 2. Fluted Metal Crown Edge (21 Flutes) */}
        <g filter={isCapturable ? `url(#${capId}-capturable-filter)` : undefined}>
          {/* Base Metal Skirt */}
          <path
            d={outerSilhouette}
            fill={`url(#${capId}-metal-crimp)`}
            stroke="#080705"
            strokeWidth="0.7"
          />

          {/* 21 Fluted Crimps */}
          {teethData.map((tooth) => {
            const isFacing = tooth.lightDot > 0;
            const crestHighlightOpacity = Math.max(0.2, Math.min(0.9, (tooth.lightDot + 1) * 0.45));
            const shadowOpacity = Math.max(0.3, Math.min(0.9, (1 - tooth.lightDot) * 0.5));

            return (
              <g key={`flute-${tooth.index}`}>
                {/* Valley Shadow */}
                <line
                  x1={tooth.collarLeft.x}
                  y1={tooth.collarLeft.y}
                  x2={tooth.valleyLeft.x}
                  y2={tooth.valleyLeft.y}
                  stroke="#080604"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeOpacity={shadowOpacity}
                />
                {/* Crest Specular Highlight */}
                <line
                  x1={tooth.collar.x}
                  y1={tooth.collar.y}
                  x2={tooth.peak.x}
                  y2={tooth.peak.y}
                  stroke={isFacing ? '#FFFFFF' : '#FFF3D6'}
                  strokeWidth={isFacing ? '1.2' : '0.8'}
                  strokeLinecap="round"
                  strokeOpacity={crestHighlightOpacity}
                />
              </g>
            );
          })}

          {/* Crease Boundary */}
          <path
            d={midFluteBoundary}
            fill="none"
            stroke="#080705"
            strokeWidth="0.5"
            strokeOpacity="0.7"
          />

          {/* 3. Stepped Collar Metal Rim */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill={isPlayer ? '#A88349' : '#33281E'}
            stroke="#080705"
            strokeWidth="0.8"
          />

          {/* Raised Beveled Metal Ring */}
          <circle
            cx="50"
            cy="50"
            r="36.5"
            fill="none"
            stroke={`url(#${capId}-metal-crimp)`}
            strokeWidth="2"
          />

          {/* 4. Enamel Center Disc */}
          <circle
            cx="50"
            cy="50"
            r="34"
            fill={isPlayer ? `url(#${capId}-ivory-face)` : `url(#${capId}-obsidian-face)`}
            stroke={isPlayer ? '#A88349' : '#080705'}
            strokeWidth="1"
          />

          {/* Inner Accent Ring */}
          <circle
            cx="50"
            cy="50"
            r="31"
            fill="none"
            stroke={isPlayer ? '#8C6239' : '#C7A864'}
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
            strokeOpacity={isPlayer ? '0.5' : '0.75'}
          />

          {/* 5. Authentic Cattle Emblem Center */}
          <g transform="translate(23, 23)">
            <BasothoCattleEmblem
              setId={cattleSet}
              isPlayer={isPlayer}
              size={54}
            />
          </g>

          {/* 6. Enamel Specular Curved Gloss */}
          <path
            d="M24 28 C 36 16, 64 16, 76 28 C 66 36, 34 36, 24 28 Z"
            fill={`url(#${capId}-enamel-sheen)`}
          />
        </g>

        {/* Selected State: Controlled Antique-Gold Halo */}
        {isSelected && (
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#D5A351"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="animate-spin"
            style={{ transformOrigin: 'center', animationDuration: '8s' }}
          />
        )}

        {/* Last Moved State: Shimmering Gold Border & Radiant Ring */}
        {isLastMoved && !isSelected && !isCapturable && (
          <g>
            <circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              stroke="#FFE79A"
              strokeWidth="2.2"
              strokeDasharray="5 3"
              className="animate-spin"
              style={{ transformOrigin: 'center', animationDuration: '12s' }}
            />
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1.2"
              className="animate-pulse"
              opacity="0.8"
            />
          </g>
        )}

        {/* Capturable State: Controlled Red/Bronze Danger Halo */}
        {isCapturable && (
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#E02424"
            strokeWidth="2.4"
            strokeDasharray="3 2"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};
