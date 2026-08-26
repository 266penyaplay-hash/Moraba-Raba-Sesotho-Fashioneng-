import React from 'react';
import { COLOR_SWATCHES } from '../constants/designTokens';

export const MaterialColourBoard: React.FC = () => {
  const materials = [
    {
      name: 'Carved Lesotho Sandstone',
      description: 'Warm sedimentary mineral base with natural horizontal strata and subtle grain.',
      hex: '#B78B5B',
      accent: '#D1AF7A',
    },
    {
      name: 'Polished Black Obsidian',
      description: 'Glassy volcanic stone, deep dark body with razor-sharp specular light reflections.',
      hex: '#080807',
      accent: '#252522',
    },
    {
      name: 'Maloti Slate Slab',
      description: 'Dense dark grey metamorphic rock with hand-finished chamfered edges.',
      hex: '#171714',
      accent: '#252522',
    },
    {
      name: 'Carved Ivory & Bone Stone',
      description: 'Smooth, warm organic calcium stone with sandstone shading in recessed crevices.',
      hex: '#F4EAD7',
      accent: '#E9E0CE',
    },
    {
      name: 'Aged Antique Gold Inlay',
      description: 'Prestige metal accent hammered into stone grooves for mill illumination and spine marks.',
      hex: '#A98545',
      accent: '#C7A864',
    },
    {
      name: 'Woven Basotho Wool Texture',
      description: 'Microscopic dry tactile warmth in backdrop atmosphere without visual noise.',
      hex: '#321A12',
      accent: '#4A2B1C',
    },
  ];

  return (
    <div className="w-full space-y-6 text-[#E9E0CE] select-none">
      <div>
        <span className="text-[11px] font-['Space_Grotesk'] tracking-[0.2em] text-[#A98545] uppercase block">
          DELIVERABLE 07
        </span>
        <h2 className="font-['Syne'] font-extrabold text-xl text-[#F4EAD7] tracking-tight uppercase">
          Material & Colour System
        </h2>
        <p className="text-xs text-[#8C9090] mt-1">
          Ancient Basotho × Future Luxury physical world palette for the year 2035.
        </p>
      </div>

      {/* Swatch Grid */}
      <div className="space-y-3">
        <h3 className="font-['Syne'] font-bold text-sm text-[#D1AF7A] uppercase tracking-wider">
          Locked 13-Colour Swatches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COLOR_SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#171714] border border-[#252522]"
            >
              <div
                style={{ backgroundColor: swatch.hex }}
                className="w-10 h-10 rounded-lg shrink-0 border border-[#252522] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] font-bold text-xs text-[#F4EAD7]">
                    {swatch.name}
                  </span>
                  <code className="text-[10px] text-[#A98545] font-mono">{swatch.hex}</code>
                </div>
                <p className="text-[11px] text-[#8C9090] leading-tight truncate mt-0.5">
                  {swatch.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Physical Materials System */}
      <div className="space-y-3 pt-3 border-t border-[#252522]">
        <h3 className="font-['Syne'] font-bold text-sm text-[#D1AF7A] uppercase tracking-wider">
          Tactile Material Taxonomy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {materials.map((mat) => (
            <div
              key={mat.name}
              className="p-3 rounded-xl bg-[#171714]/80 border border-[#252522] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] font-bold text-xs text-[#E9E0CE]">
                  {mat.name}
                </span>
                <span
                  style={{ backgroundColor: mat.hex, borderColor: mat.accent }}
                  className="w-3.5 h-3.5 rounded-full border"
                />
              </div>
              <p className="text-[11px] text-[#8C9090] leading-relaxed">
                {mat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
