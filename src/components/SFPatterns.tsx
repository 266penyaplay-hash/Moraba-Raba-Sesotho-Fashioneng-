import React from 'react';

/**
 * Geometric Sesotho Lightning-Star Pattern System
 * 3 Precise Strengths as requested by Brand Proposal:
 * 1. Pattern Hero: High contrast, used on loading, victory, prize drops
 * 2. Pattern Accent: Medium contrast, card corners, banners, empty states
 * 3. Pattern Ghost: 3-6% opacity, behind non-gameplay sections
 */

export type PatternStrength = 'hero' | 'accent' | 'ghost';

export const SFPatternBackground: React.FC<{
  strength?: PatternStrength;
  className?: string;
  color?: string;
}> = ({ strength = 'ghost', className = '', color = '#C88943' }) => {
  const patternId = `sf-pat-${strength}-${Math.random().toString(36).substr(2, 4)}`;

  const opacity =
    strength === 'hero' ? 0.45 : strength === 'accent' ? 0.18 : 0.045; // Ghost is strictly 4.5% (between 3-6%)

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(25)"
          >
            {/* Basotho Lightning Star Geometric Unit */}
            {/* Outer diamond cross */}
            <path
              d="M30 0L60 30L30 60L0 30Z"
              fill="none"
              stroke={color}
              strokeWidth="0.75"
              strokeOpacity={opacity}
            />
            {/* Central lightning motif */}
            <path
              d="M34 14L22 32H30L24 48L40 28H32L34 14Z"
              fill={color}
              fillOpacity={opacity * 1.2}
            />
            {/* Corner chevron accents */}
            <path
              d="M0 0L10 10M60 0L50 10M60 60L50 50M0 60L10 50"
              stroke={color}
              strokeWidth="0.5"
              strokeOpacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

/**
 * Restrained subtle film grain overlay (~2.5% - 3% opacity)
 */
export const SFGrainTexture: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-50 mix-blend-screen opacity-[0.035] ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

/**
 * Lightning Notched Angular Corner decoration
 */
export const SFAngularCorner: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: number;
  color?: string;
}> = ({ position = 'top-right', size = 18, color = '#C88943' }) => {
  const rotation =
    position === 'top-right'
      ? 'rotate-0'
      : position === 'bottom-right'
      ? 'rotate-90'
      : position === 'bottom-left'
      ? 'rotate-180'
      : '-rotate-90';

  return (
    <div
      style={{ width: size, height: size }}
      className={`absolute ${
        position === 'top-right'
          ? 'top-0 right-0'
          : position === 'top-left'
          ? 'top-0 left-0'
          : position === 'bottom-right'
          ? 'bottom-0 right-0'
          : 'bottom-0 left-0'
      } ${rotation} pointer-events-none`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M0 0H24V24L14 14H6L0 0Z"
          fill={color}
          fillOpacity="0.85"
        />
      </svg>
    </div>
  );
};
