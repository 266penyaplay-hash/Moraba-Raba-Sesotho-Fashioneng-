import React from 'react';
import { PlayerId } from '../types';

interface SFTokenProps {
  player: PlayerId;
  size?: number; // diameter in pixels
  isSelected?: boolean;
  isCapturable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SFToken: React.FC<SFTokenProps> = ({
  player,
  size = 44,
  isSelected = false,
  isCapturable = false,
  className = '',
  onClick,
}) => {
  const isGold = player === 'gold';
  const id = `token-${player}-${Math.random().toString(36).substr(2, 5)}`;

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center rounded-full select-none cursor-pointer transition-transform duration-200 ${
        isSelected ? 'scale-115 z-30' : 'hover:scale-105'
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]"
      >
        <defs>
          {/* Gold Token Gradients */}
          <linearGradient id={`${id}-gold-rim`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="25%" stopColor="#D5A351" />
            <stop offset="60%" stopColor="#C88943" />
            <stop offset="85%" stopColor="#8A4A1C" />
            <stop offset="100%" stopColor="#32170F" />
          </linearGradient>

          <radialGradient id={`${id}-gold-core`} cx="45" cy="35" r="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F6E9D2" />
            <stop offset="35%" stopColor="#D5A351" />
            <stop offset="75%" stopColor="#8E511D" />
            <stop offset="100%" stopColor="#32170F" />
          </radialGradient>

          {/* Violet Token Gradients */}
          <linearGradient id={`${id}-violet-rim`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D6C4FF" />
            <stop offset="30%" stopColor="#7957FF" />
            <stop offset="70%" stopColor="#3B1879" />
            <stop offset="90%" stopColor="#1E0B3C" />
            <stop offset="100%" stopColor="#0B0C10" />
          </linearGradient>

          <radialGradient id={`${id}-violet-core`} cx="45" cy="35" r="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A88BFF" />
            <stop offset="35%" stopColor="#5522AA" />
            <stop offset="75%" stopColor="#220844" />
            <stop offset="100%" stopColor="#090807" />
          </radialGradient>

          {/* Specular Highlight */}
          <linearGradient id={`${id}-highlight`} x1="20" y1="10" x2="80" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Selection Aura Filter */}
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Selection Glow */}
        {isSelected && (
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={isGold ? '#D5A351' : '#7957FF'}
            strokeWidth="3"
            strokeDasharray="4 2"
            className="animate-spin"
            style={{ transformOrigin: 'center', animationDuration: '6s' }}
          />
        )}

        {/* Capturable Warning Glow */}
        {isCapturable && (
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#FF5A62"
            strokeWidth="3.5"
            strokeDasharray="5 3"
            className="animate-pulse"
          />
        )}

        {/* Outer Heavy Coin Rim */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={isGold ? `url(#${id}-gold-rim)` : `url(#${id}-violet-rim)`}
          stroke="#090807"
          strokeWidth="1.5"
        />

        {/* Micro-ridged Enamel Edge Ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke={isGold ? '#512718' : '#170630'}
          strokeWidth="2.5"
          strokeDasharray="1.5 1.5"
        />

        {/* Inner Coin Recessed Face */}
        <circle
          cx="50"
          cy="50"
          r="37"
          fill={isGold ? `url(#${id}-gold-core)` : `url(#${id}-violet-core)`}
          stroke={isGold ? '#32170F' : '#0B0C10'}
          strokeWidth="1"
        />

        {/* Circular Inscription Detail */}
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke={isGold ? '#C88943' : '#7957FF'}
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />

        {/* Center Embossed SF Lightning Monogram */}
        <g transform="translate(19, 19) scale(0.62)">
          <path
            d="M51 13 L75 13 L63 36 L77 36 L26 92 L43 53 L38 53 L47 36 L28 50 L51 13 Z"
            fill={isGold ? '#FFFDF8' : '#F6E9D2'}
            stroke={isGold ? '#8A4A1C' : '#220844'}
            strokeWidth="1.5"
            strokeLinejoin="bevel"
          />
          {/* Upper Triangular Cutout */}
          <path
            d="M54.5 19 L63.5 33 L46.5 33 Z"
            fill={isGold ? '#32170F' : '#0B0C10'}
          />
          {/* Lower Triangular Cutout Notch */}
          <path
            d="M43 53 L49 63 L49 53 Z"
            fill={isGold ? '#32170F' : '#0B0C10'}
          />
        </g>


        {/* Polished Glass Specular Reflection Crescent */}
        <path
          d="M20 18C30 12 70 12 80 18C75 28 25 28 20 18Z"
          fill={`url(#${id}-highlight)`}
        />
      </svg>
    </div>
  );
};
