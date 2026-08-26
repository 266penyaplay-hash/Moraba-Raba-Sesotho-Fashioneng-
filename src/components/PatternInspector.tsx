import React, { useState } from 'react';
import { SF_COLORS, SF_TOKEN_METRICS } from '../constants/designTokens';
import { SFPatternBackground, SFAngularCorner, PatternStrength } from './SFPatterns';
import { SFBadge, SFMonogram, SFFullWordmark, SFConnectedStatus } from './SFLogos';
import { SFToken } from './SFTokens';
import { Eye, Layers, Palette, Sparkles, Check, ArrowLeft } from 'lucide-react';

export const PatternInspector: React.FC<{ onBackToGame: () => void }> = ({ onBackToGame }) => {
  const [activePattern, setActivePattern] = useState<PatternStrength>('hero');
  const [patternColor, setPatternColor] = useState<string>('#C88943');

  return (
    <div className="w-full space-y-6 select-none pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#32170F] to-[#090807] border border-[#512718] p-5">
        <SFPatternBackground strength="accent" color="#C88943" />
        <SFAngularCorner position="top-right" size={24} color="#D5A351" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <button
              onClick={onBackToGame}
              className="inline-flex items-center gap-1.5 text-xs font-['Space_Grotesk'] font-bold text-[#D5A351] hover:text-[#FFFDF8] mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> BACK TO GAME
            </button>
            <h1 className="font-['Syne'] font-black text-2xl text-[#FFFDF8] uppercase">
              DESIGN SYSTEM & PATTERN TOKENS
            </h1>
            <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-0.5">
              Sesotho Fashioneng 2026 Brand Identity Proposal Implementation
            </p>
          </div>
          <SFBadge label="TOKENS 1.0" variant="gold" />
        </div>
      </div>

      {/* 1. The Three Pattern Strengths Comparative Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D5A351]" />
            <h2 className="font-['Syne'] font-extrabold text-base text-[#FFFDF8] uppercase">
              1. Three Pattern Strengths
            </h2>
          </div>
          <span className="text-[11px] font-['Space_Grotesk'] text-[#A99C90]">
            Geometric Lightning-Star
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pattern 1: Hero */}
          <div className="relative h-44 rounded-xl bg-[#090807] border-2 border-[#D5A351] p-4 flex flex-col justify-between overflow-hidden shadow-lg">
            <SFPatternBackground strength="hero" color="#C88943" />
            <SFAngularCorner position="top-right" size={18} color="#D5A351" />

            <div className="relative z-10">
              <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#090807] bg-[#D5A351] px-2 py-0.5 rounded-xs uppercase tracking-wider">
                1. PATTERN HERO
              </span>
              <h3 className="font-['Syne'] font-extrabold text-lg text-[#FFFDF8] uppercase mt-2">
                High Contrast
              </h3>
            </div>

            <p className="relative z-10 font-['Space_Grotesk'] text-xs text-[#F6E9D2] bg-[#090807]/80 p-2 rounded-sm border border-[#512718]">
              Used on loading, victory cards, prize drops, and campaign hero banners.
            </p>
          </div>

          {/* Pattern 2: Accent */}
          <div className="relative h-44 rounded-xl bg-[#1A0C08] border border-[#512718] p-4 flex flex-col justify-between overflow-hidden shadow-md">
            <SFPatternBackground strength="accent" color="#C88943" />
            <SFAngularCorner position="top-right" size={18} color="#C88943" />

            <div className="relative z-10">
              <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#D5A351] bg-[#090807] px-2 py-0.5 rounded-xs border border-[#512718] uppercase tracking-wider">
                2. PATTERN ACCENT
              </span>
              <h3 className="font-['Syne'] font-extrabold text-lg text-[#FFFDF8] uppercase mt-2">
                Medium Contrast
              </h3>
            </div>

            <p className="relative z-10 font-['Space_Grotesk'] text-xs text-[#A99C90] bg-[#090807]/80 p-2 rounded-sm border border-[#512718]">
              Used in card corners, mode selector cards, and empty state containers.
            </p>
          </div>

          {/* Pattern 3: Ghost */}
          <div className="relative h-44 rounded-xl bg-[#0B0C10] border border-[#512718]/60 p-4 flex flex-col justify-between overflow-hidden">
            <SFPatternBackground strength="ghost" color="#C88943" />

            <div className="relative z-10">
              <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#A99C90] bg-[#090807] px-2 py-0.5 rounded-xs border border-[#512718]/40 uppercase tracking-wider">
                3. PATTERN GHOST
              </span>
              <h3 className="font-['Syne'] font-extrabold text-lg text-[#FFFDF8] uppercase mt-2">
                3–6% Opacity
              </h3>
            </div>

            <p className="relative z-10 font-['Space_Grotesk'] text-xs text-[#A99C90] bg-[#090807]/80 p-2 rounded-sm border border-[#512718]">
              Subtle ambient background behind non-gameplay panels. Never on the board.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Brand Color Palette Tokens */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#D5A351]" />
          <h2 className="font-['Syne'] font-extrabold text-base text-[#FFFDF8] uppercase">
            2. Sesotho Fashioneng Palette Tokens
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SF_TOKEN_METRICS.map((token) => (
            <div
              key={token.name}
              className="p-3 rounded-lg bg-[#0B0C10] border border-[#512718] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  style={{ backgroundColor: token.hex }}
                  className="w-7 h-7 rounded-md border border-[#FFFDF8]/20 shadow-inner"
                />
                <span className="font-['Space_Grotesk'] text-[11px] font-bold text-[#F6E9D2]">
                  {token.hex}
                </span>
              </div>
              <div>
                <span className="font-['Syne'] font-bold text-xs text-[#FFFDF8] block">
                  {token.name}
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#A99C90] leading-tight block mt-0.5 line-clamp-2">
                  {token.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Collectible Enamel Tokens & Geometry */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D5A351]" />
          <h2 className="font-['Syne'] font-extrabold text-base text-[#FFFDF8] uppercase">
            3. Collectible Player Tokens & Badges
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-[#32170F]/60 border border-[#512718] flex flex-wrap items-center justify-around gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <SFToken player="gold" size={56} />
            <span className="font-['Syne'] font-bold text-xs text-[#D5A351] uppercase">
              Gold Player Piece
            </span>
            <span className="text-[10px] text-[#A99C90] max-w-[140px]">
              Caramel-to-gold alloy with embossed cream lightning
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <SFToken player="violet" size={56} />
            <span className="font-['Syne'] font-bold text-xs text-[#A88BFF] uppercase">
              Violet Opponent Piece
            </span>
            <span className="text-[10px] text-[#A99C90] max-w-[140px]">
              Deep black-violet with glowing active edge
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <SFBadge label="SOTHO 25" variant="gold" />
              <SFConnectedStatus />
            </div>
            <span className="font-['Syne'] font-bold text-xs text-[#FFFDF8] uppercase">
              Restrained UI Geometry
            </span>
            <span className="text-[10px] text-[#A99C90] max-w-[140px]">
              Lightning cuts, notches and pill status
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
