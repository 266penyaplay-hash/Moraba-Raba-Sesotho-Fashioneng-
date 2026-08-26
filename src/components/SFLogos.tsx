import React from 'react';
import { SF_COLORS } from '../constants/designTokens';

/**
 * Official Sesotho Fashioneng Lightning Monogram
 * Precision vector reproduction with angular faceted geometry
 */
export const SFMonogram: React.FC<{
  className?: string;
  size?: number;
  variant?: 'gold' | 'violet' | 'cream' | 'flat-gold';
}> = ({ className = '', size = 36, variant = 'gold' }) => {
  const gradientId = `sf-mono-grad-${variant}-${Math.random().toString(36).substr(2, 4)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={`${gradientId}-gold`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="35%" stopColor="#D5A351" />
          <stop offset="70%" stopColor="#C88943" />
          <stop offset="100%" stopColor="#8A4A1C" />
        </linearGradient>

        <linearGradient id={`${gradientId}-violet`} x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="30%" stopColor="#A88BFF" />
          <stop offset="70%" stopColor="#7957FF" />
          <stop offset="100%" stopColor="#3F1D99" />
        </linearGradient>

        <filter id={`${gradientId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#090807" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Main Lightning Body matching image.jpeg */}
      <g filter={`url(#${gradientId}-shadow)`}>
        <path
          d="M51 13 L75 13 L63 36 L77 36 L26 92 L43 53 L38 53 L47 36 L28 50 L51 13 Z"
          fill={
            variant === 'violet'
              ? `url(#${gradientId}-violet)`
              : variant === 'cream'
              ? '#F6E9D2'
              : variant === 'flat-gold'
              ? SF_COLORS.caramel
              : `url(#${gradientId}-gold)`
          }
          stroke={variant === 'cream' ? '#32170F' : '#FFFDF8'}
          strokeWidth="1.2"
          strokeLinejoin="bevel"
        />

        {/* Upper Triangular Cutout */}
        <path
          d="M54.5 19 L63.5 33 L46.5 33 Z"
          fill={variant === 'cream' ? '#32170F' : '#171714'}
        />

        {/* Lower Triangular Cutout Notch */}
        <path
          d="M43 53 L49 63 L49 53 Z"
          fill={variant === 'cream' ? '#32170F' : '#171714'}
        />
      </g>
    </svg>
  );
};


/**
 * Sesotho Fashioneng 2026 Stylized Full Wordmark
 */
export const SFFullWordmark: React.FC<{
  className?: string;
  subtitle?: string;
}> = ({ className = '', subtitle = '2026 BRAND IDENTITY' }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2">
        <SFMonogram size={28} variant="gold" />
        <div className="text-left">
          <div className="font-['Syne'] font-black tracking-[-0.04em] text-xl leading-none text-[#FFFDF8]">
            SESOTHO <span className="text-[#D5A351]">FASHIONENG</span>
          </div>
          <div className="font-['Space_Grotesk'] text-[10px] tracking-[0.28em] font-bold text-[#C88943] uppercase mt-1">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SOTHO 25 / SOTHO 26 Brand Badge
 */
export const SFBadge: React.FC<{
  label?: string;
  className?: string;
  variant?: 'gold' | 'violet' | 'neutral';
}> = ({ label = 'SOTHO 25', className = '', variant = 'gold' }) => {
  const borderCol =
    variant === 'violet'
      ? 'border-[#7957FF]/60 text-[#A88BFF] bg-[#32170F]/80'
      : variant === 'neutral'
      ? 'border-[#512718] text-[#A99C90] bg-[#090807]/80'
      : 'border-[#C88943]/70 text-[#F6E9D2] bg-[#32170F]/80';

  return (
    <div
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-sm border text-[11px] font-['Space_Grotesk'] font-bold tracking-wider uppercase backdrop-blur-md shadow-xs ${borderCol} ${className}`}
    >
      {label}
    </div>
  );
};

/**
 * Connected / Live Status Pill
 */
export const SFConnectedStatus: React.FC<{
  label?: string;
  className?: string;
}> = ({ label = 'CONNECTED', className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#32170F]/90 border border-[#512718] text-[10px] font-['Space_Grotesk'] font-semibold tracking-wider text-[#F6E9D2] backdrop-blur-md shadow-xs ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#36E58B] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#36E58B]"></span>
      </span>
      <span>{label}</span>
    </div>
  );
};
