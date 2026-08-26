import React from 'react';
import { PlayerId } from '../types';

interface CattleTokenProps {
  player: PlayerId;
  size?: number;
  isSelected?: boolean;
  isCapturable?: boolean;
  viewAngle?: 'top' | 'angled';
  className?: string;
  onClick?: () => void;
}

export const CattleToken: React.FC<CattleTokenProps> = ({
  player,
  size = 42,
  isSelected = false,
  isCapturable = false,
  viewAngle = 'top',
  className = '',
  onClick,
}) => {
  const isObsidian = player === 'obsidian';
  const tokenUid = `cattle-${player}-${Math.random().toString(36).slice(2, 6)}`;

  // Top-Down Abstract Sculpture View (Standard Gameplay)
  if (viewAngle === 'top') {
    return (
      <div
        onClick={onClick}
        style={{ width: size, height: size }}
        className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-all duration-200 ${
          isSelected
            ? '-translate-y-1.5 drop-shadow-[0_12px_14px_rgba(0,0,0,0.9)] z-30'
            : 'hover:scale-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]'
        } ${className}`}
        aria-label={`${isObsidian ? 'Player 01 Obsidian' : 'Player 02 Ivory'} Cattle Token`}
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
            {/* Obsidian Token Materials (Polished black mineral, charcoal facet reflections) */}
            <linearGradient id={`${tokenUid}-obs-body`} x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#252522" />
              <stop offset="35%" stopColor="#171714" />
              <stop offset="75%" stopColor="#080807" />
              <stop offset="100%" stopColor="#040403" />
            </linearGradient>

            <linearGradient id={`${tokenUid}-obs-specular`} x1="30" y1="20" x2="70" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8C9090" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#252522" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#080807" stopOpacity="0" />
            </linearGradient>

            <linearGradient id={`${tokenUid}-obs-inlay`} x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E9E0CE" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A98545" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4A2B1C" stopOpacity="0.6" />
            </linearGradient>

            {/* Ivory Stone Materials (Warm bone, sandstone shadowing, antique-gold inlay) */}
            <linearGradient id={`${tokenUid}-ivory-body`} x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="30%" stopColor="#F4EAD7" />
              <stop offset="70%" stopColor="#E9E0CE" />
              <stop offset="100%" stopColor="#D1AF7A" />
            </linearGradient>

            <linearGradient id={`${tokenUid}-ivory-shadow`} x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B78B5B" stopOpacity="0.1" />
              <stop offset="70%" stopColor="#B78B5B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4A2B1C" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id={`${tokenUid}-ivory-gold`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C7A864" />
              <stop offset="50%" stopColor="#A98545" />
              <stop offset="100%" stopColor="#4A2B1C" />
            </linearGradient>

            {/* Ember Shadow Filter for Capturable State */}
            <filter id={`${tokenUid}-ember-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#9B4B2D" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Contact Base Shadow */}
          <ellipse
            cx="50"
            cy={isSelected ? '56' : '52'}
            rx="32"
            ry="24"
            fill="#000000"
            fillOpacity={isSelected ? '0.7' : '0.45'}
            className="transition-all duration-200"
          />

          {/* Abstract Cattle Sculpture Form: Sweeping Horns, Tapered Ridge & Faceted Body */}
          <g filter={isCapturable ? `url(#${tokenUid}-ember-glow)` : undefined}>
            {isObsidian ? (
              // PLAYER 01: OBSIDIAN SCULPTURE
              <>
                {/* 1. Horn Span (Sculpted forward-sweeping horns) */}
                <path
                  d="M16 38 C 12 18, 30 14, 50 24 C 70 14, 88 18, 84 38 C 76 34, 66 31, 50 34 C 34 31, 24 34, 16 38 Z"
                  fill="url(#"
                  style={{ fill: `url(#${tokenUid}-obs-body)` }}
                  stroke="#252522"
                  strokeWidth="1.2"
                />

                {/* Left Horn Facet */}
                <path
                  d="M16 38 C 22 22, 36 20, 50 26 L 50 34 C 36 32, 24 35, 16 38 Z"
                  fill="#252522"
                  fillOpacity="0.6"
                />

                {/* 2. Main Torso / Planar Stone Block */}
                <path
                  d="M26 34 L 74 34 L 66 78 L 50 86 L 34 78 Z"
                  fill={`url(#${tokenUid}-obs-body)`}
                  stroke="#171714"
                  strokeWidth="1.2"
                />

                {/* Left Flank Shadow */}
                <path
                  d="M26 34 L 50 34 L 50 86 L 34 78 Z"
                  fill="#080807"
                  fillOpacity="0.8"
                />

                {/* Right Specular Mineral Sheen */}
                <path
                  d="M50 34 L 74 34 L 66 78 L 50 86 Z"
                  fill={`url(#${tokenUid}-obs-specular)`}
                />

                {/* 3. Central Carved Bronze Spine & Heritage Inlay */}
                <line
                  x1="50"
                  y1="24"
                  x2="50"
                  y2="82"
                  stroke={`url(#${tokenUid}-obs-inlay)`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Distinct Diamond Marking */}
                <polygon
                  points="50,42 54,48 50,54 46,48"
                  fill="#A98545"
                  stroke="#080807"
                  strokeWidth="0.8"
                />

                {/* Horn Tips Bronze Caps */}
                <circle cx="16" cy="38" r="2" fill="#A98545" />
                <circle cx="84" cy="38" r="2" fill="#A98545" />
              </>
            ) : (
              // PLAYER 02: IVORY STONE SCULPTURE
              <>
                {/* 1. Horn Span (Sculpted regal wide-curved horns) */}
                <path
                  d="M14 32 C 10 12, 32 10, 50 20 C 68 10, 90 12, 86 32 C 78 28, 68 26, 50 28 C 32 26, 22 28, 14 32 Z"
                  fill={`url(#${tokenUid}-ivory-body)`}
                  stroke="#B78B5B"
                  strokeWidth="1.2"
                />

                {/* Horn Sandstone Crease */}
                <path
                  d="M14 32 C 24 20, 36 18, 50 22 L 50 28 C 34 26, 22 28, 14 32 Z"
                  fill="#B78B5B"
                  fillOpacity="0.35"
                />

                {/* 2. Main Torso / Carved Bone Prism */}
                <path
                  d="M24 30 L 76 30 L 68 76 L 50 84 L 32 76 Z"
                  fill={`url(#${tokenUid}-ivory-body)`}
                  stroke="#B78B5B"
                  strokeWidth="1.2"
                />

                {/* Under-edge Sandstone Shadow */}
                <path
                  d="M24 30 L 76 30 L 68 76 L 50 84 L 32 76 Z"
                  fill={`url(#${tokenUid}-ivory-shadow)`}
                />

                {/* 3. Antique Gold Geometric Inlay (Basotho Heritage Line) */}
                <line
                  x1="50"
                  y1="20"
                  x2="50"
                  y2="80"
                  stroke={`url(#${tokenUid}-ivory-gold)`}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                {/* Distinct Triangle Marking */}
                <polygon
                  points="50,40 56,50 44,50"
                  fill="#A98545"
                  stroke="#4A2B1C"
                  strokeWidth="0.8"
                />

                {/* Horn Tips Antique Gold Caps */}
                <circle cx="14" cy="32" r="2.2" fill="#C7A864" stroke="#4A2B1C" strokeWidth="0.5" />
                <circle cx="86" cy="32" r="2.2" fill="#C7A864" stroke="#4A2B1C" strokeWidth="0.5" />
              </>
            )}
          </g>

          {/* Selected State: Quiet contact elevation ring */}
          {isSelected && (
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="38"
              fill="none"
              stroke="#A98545"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}

          {/* Capturable State: Restrained Ember Edge */}
          {isCapturable && (
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="38"
              fill="none"
              stroke="#9B4B2D"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>
    );
  }

  // 3D Angled / Showcase Perspective View (For Deliverable Showcase)
  return (
    <div
      style={{ width: size, height: size * 1.15 }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_16px_24px_rgba(0,0,0,0.9)]"
      >
        <defs>
          <linearGradient id={`${tokenUid}-ang-obs`} x1="20" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#252522" />
            <stop offset="40%" stopColor="#171714" />
            <stop offset="85%" stopColor="#080807" />
          </linearGradient>

          <linearGradient id={`${tokenUid}-ang-ivory`} x1="20" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="40%" stopColor="#F4EAD7" />
            <stop offset="80%" stopColor="#D1AF7A" />
            <stop offset="100%" stopColor="#4A2B1C" />
          </linearGradient>
        </defs>

        {/* Cast Shadow on Sandstone Pedestal */}
        <ellipse cx="60" cy="115" rx="46" ry="16" fill="#000000" fillOpacity="0.75" />

        {isObsidian ? (
          // ANGLED OBSIDIAN SCULPTURE
          <g>
            {/* Base Pedestal Thickness */}
            <path
              d="M30 75 L 60 96 L 90 75 L 90 90 L 60 110 L 30 90 Z"
              fill="#080807"
              stroke="#171714"
            />
            {/* Front Left Facet */}
            <path
              d="M30 75 L 60 96 L 60 48 L 30 38 Z"
              fill="#171714"
              stroke="#252522"
              strokeWidth="0.8"
            />
            {/* Front Right Facet (Illuminated) */}
            <path
              d="M60 96 L 90 75 L 90 38 L 60 48 Z"
              fill="url(#)"
              style={{ fill: `url(#${tokenUid}-ang-obs)` }}
              stroke="#252522"
              strokeWidth="0.8"
            />
            {/* Top Plane */}
            <path
              d="M30 38 L 60 48 L 90 38 L 60 26 Z"
              fill="#252522"
              stroke="#8C9090"
              strokeWidth="0.5"
            />
            {/* Angled Horn Left */}
            <path
              d="M30 38 C 16 24, 18 10, 36 12 C 40 18, 48 24, 52 28 Z"
              fill="#171714"
              stroke="#252522"
            />
            {/* Angled Horn Right */}
            <path
              d="M90 38 C 104 24, 102 10, 84 12 C 80 18, 72 24, 68 28 Z"
              fill="#252522"
              stroke="#8C9090"
            />
            {/* Antique Bronze Spine Line */}
            <line x1="60" y1="26" x2="60" y2="96" stroke="#A98545" strokeWidth="2" strokeLinecap="round" />
            <polygon points="60,54 65,62 60,70 55,62" fill="#C7A864" />
          </g>
        ) : (
          // ANGLED IVORY SCULPTURE
          <g>
            {/* Base Pedestal Thickness */}
            <path
              d="M30 75 L 60 96 L 90 75 L 90 90 L 60 110 L 30 90 Z"
              fill="#4A2B1C"
              stroke="#B78B5B"
            />
            {/* Front Left Facet */}
            <path
              d="M30 75 L 60 96 L 60 48 L 30 38 Z"
              fill="#D1AF7A"
              stroke="#B78B5B"
              strokeWidth="0.8"
            />
            {/* Front Right Facet */}
            <path
              d="M60 96 L 90 75 L 90 38 L 60 48 Z"
              fill={`url(#${tokenUid}-ang-ivory)`}
              stroke="#E9E0CE"
              strokeWidth="0.8"
            />
            {/* Top Plane */}
            <path
              d="M30 38 L 60 48 L 90 38 L 60 26 Z"
              fill="#FFFDF8"
              stroke="#E9E0CE"
              strokeWidth="0.8"
            />
            {/* Angled Horn Left */}
            <path
              d="M30 38 C 14 20, 16 8, 38 10 C 42 16, 50 22, 54 26 Z"
              fill="#E9E0CE"
              stroke="#B78B5B"
            />
            {/* Angled Horn Right */}
            <path
              d="M90 38 C 106 20, 104 8, 82 10 C 78 16, 70 22, 66 26 Z"
              fill="#F4EAD7"
              stroke="#B78B5B"
            />
            {/* Antique Gold Spine Line */}
            <line x1="60" y1="26" x2="60" y2="96" stroke="#A98545" strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="60,54 66,66 54,66" fill="#C7A864" stroke="#4A2B1C" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
