import React, { useState } from 'react';
import { SFBadge, SFMonogram, SFFullWordmark } from './SFLogos';
import { SFPatternBackground, SFAngularCorner } from './SFPatterns';
import { SFToken } from './SFTokens';
import { Gift, Sparkles, Check, Lock, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

interface PrizeItem {
  id: string;
  name: string;
  category: string;
  type: 'physical' | 'digital';
  pointsRequired: number;
  unlocked: boolean;
  tag: string;
  description: string;
  accentColor: string;
}

const PRIZES: PrizeItem[] = [
  {
    id: 'p1',
    name: 'Maseru Gold Enamel Morabaraba Pin Set',
    category: 'PHYSICAL COLLECTIBLE',
    type: 'physical',
    pointsRequired: 500,
    unlocked: true,
    tag: 'LIMITED EDITION • 1 OF 250',
    description: 'Heavy die-cast metallic enamel pins crafted with heritage caramel-to-gold plating and dark chocolate recessed rim.',
    accentColor: '#D5A351',
  },
  {
    id: 'p2',
    name: "SF '26 Embroidered Varsity Bomber",
    category: 'STREETWEAR DROP',
    type: 'physical',
    pointsRequired: 1200,
    unlocked: false,
    tag: 'EVENT EXCLUSIVE',
    description: 'Black satin varsity jacket featuring Sesotho Fashioneng lightning star chenille patches and gold sleeve piping.',
    accentColor: '#C88943',
  },
  {
    id: 'p3',
    name: 'Heritage Blanket 5-Panel Cap',
    category: 'STREETWEAR ACCESSORY',
    type: 'physical',
    pointsRequired: 800,
    unlocked: false,
    tag: 'SEASON 01',
    description: 'Structured wool-blend headwear with authentic Basotho geometric jacquard weave and gold monogram clip.',
    accentColor: '#F6E9D2',
  },
  {
    id: 'p4',
    name: 'Digital Violet Holographic Cow Skin',
    category: 'IN-GAME COSMETIC',
    type: 'digital',
    pointsRequired: 300,
    unlocked: true,
    tag: 'DIGITAL RARE',
    description: 'Ultra-rare animated violet cow skin with glowing neon lightning aura for competitive ranked matches.',
    accentColor: '#7957FF',
  },
];

export const PrizeDropScreen: React.FC<{ onBackToGame: () => void }> = ({ onBackToGame }) => {
  const [selectedPrize, setSelectedPrize] = useState<PrizeItem>(PRIZES[0]);
  const [claimedList, setClaimedList] = useState<string[]>(['p1']);

  const handleClaim = (id: string) => {
    if (!claimedList.includes(id)) {
      setClaimedList([...claimedList, id]);
    }
  };

  return (
    <div className="w-full space-y-4 select-none pb-4">
      {/* Top Banner (Uses Pattern Hero) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#32170F] via-[#220D08] to-[#090807] border border-[#512718] p-5 sm:p-6 shadow-xl">
        <SFPatternBackground strength="hero" color="#C88943" />
        <SFAngularCorner position="top-right" size={24} color="#D5A351" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToGame}
              className="inline-flex items-center gap-1.5 text-xs font-['Space_Grotesk'] font-bold text-[#D5A351] hover:text-[#FFFDF8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO GAME
            </button>
            <SFBadge label="DROP #01" variant="gold" />
          </div>

          <div className="mt-3">
            <h1 className="font-['Syne'] font-black text-2xl sm:text-3xl text-[#FFFDF8] uppercase tracking-tight leading-tight">
              SESOTHO FASHIONENG <span className="text-[#D5A351]">PRIZE DROPS</span>
            </h1>
            <p className="font-['Space_Grotesk'] text-xs sm:text-sm text-[#A99C90] mt-1">
              Win competitive matches, complete daily mills, and claim physical streetwear drops and collectible tokens.
            </p>
          </div>

          {/* User Points Stash */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#512718]/80">
            <div>
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider block">
                YOUR EVENT TOKENS
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-xl text-[#D5A351]">
                750 <span className="text-xs text-[#F6E9D2]">SF COINS</span>
              </span>
            </div>
            <div className="h-6 w-px bg-[#512718]" />
            <div>
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#A99C90] uppercase tracking-wider block">
                DROPS CLAIMED
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-xl text-[#36E58B]">
                {claimedList.length} <span className="text-xs text-[#F6E9D2]">/ 4 ITEMS</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRIZES.map((prize) => {
          const isClaimed = claimedList.includes(prize.id);
          const canUnlock = 750 >= prize.pointsRequired;

          return (
            <div
              key={prize.id}
              onClick={() => setSelectedPrize(prize)}
              className={`relative cursor-pointer p-4 rounded-xl border transition-all overflow-hidden ${
                selectedPrize.id === prize.id
                  ? 'bg-[#32170F] border-[#D5A351] shadow-[0_4px_20px_rgba(213,163,81,0.15)]'
                  : 'bg-[#0B0C10] border-[#512718] hover:border-[#C88943]/60'
              }`}
            >
              <SFPatternBackground strength="accent" color={prize.accentColor} />
              <SFAngularCorner position="top-right" size={16} color={prize.accentColor} />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-['Space_Grotesk'] font-bold tracking-wider uppercase px-2 py-0.5 rounded-xs bg-[#090807] border border-[#512718] text-[#D5A351]">
                      {prize.category}
                    </span>
                    <span className="text-[10px] font-['Space_Grotesk'] font-semibold text-[#A99C90]">
                      {prize.pointsRequired} PTS
                    </span>
                  </div>

                  <h3 className="font-['Syne'] font-extrabold text-base text-[#FFFDF8] uppercase leading-snug">
                    {prize.name}
                  </h3>

                  <p className="font-['Space_Grotesk'] text-xs text-[#A99C90] mt-1.5 line-clamp-2">
                    {prize.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#512718]/60">
                  <span className="text-[10px] font-['Space_Grotesk'] font-bold text-[#F6E9D2]/70">
                    {prize.tag}
                  </span>

                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-['Space_Grotesk'] font-bold text-[#36E58B]">
                      <Check className="w-3.5 h-3.5" /> CLAIMED
                    </span>
                  ) : canUnlock ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaim(prize.id);
                      }}
                      className="px-3 py-1 rounded-sm bg-[#D5A351] hover:bg-[#F6E9D2] text-[#090807] text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors"
                    >
                      CLAIM DROP
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-['Space_Grotesk'] font-bold text-[#A99C90]">
                      <Lock className="w-3.5 h-3.5" /> LOCKED
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
