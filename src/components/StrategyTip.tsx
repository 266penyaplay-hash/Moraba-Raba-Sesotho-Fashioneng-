import React, { useEffect, useState } from 'react';
import { StrategyTip as StrategyTipType } from '../types';
import { Sparkles, Compass, BookOpen } from 'lucide-react';

interface StrategyTipProps {
  tip: StrategyTipType | null;
  stageName?: string;
  isVisible: boolean;
  onDismiss?: () => void;
}

export const StrategyTip: React.FC<StrategyTipProps> = ({
  tip,
  stageName,
  isVisible,
  onDismiss,
}) => {
  const [mounted, setMounted] = useState<boolean>(isVisible);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!mounted || !tip) return null;

  const isHistorical = tip.contextTags.includes('history') || tip.contextTags.includes('culture');

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Strategy and Cultural Insight"
      className={`w-full max-w-[460px] mx-auto transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="rounded-xl bg-[#15100B]/95 border border-[#3E2F1F] p-2.5 shadow-lg backdrop-blur-md flex items-center gap-2.5 overflow-hidden">
        {/* Subtle Icon Badge */}
        <div className="shrink-0 w-6 h-6 rounded-lg bg-[#251A10] border border-[#D9A855]/40 flex items-center justify-center text-[#D9A855]">
          {isHistorical ? (
            <BookOpen className="w-3.5 h-3.5 text-[#D9A855]" aria-hidden="true" />
          ) : (
            <Compass className="w-3.5 h-3.5 text-[#E5B560]" aria-hidden="true" />
          )}
        </div>

        {/* Exactly One Line of Insightful Text */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden text-left">
          <span className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider text-[#D9A855]">
            {isHistorical ? 'Basotho Wisdom:' : 'Kraal Strategy:'}
          </span>
          <p
            title={tip.text}
            className="text-xs text-[#E6DCBF] font-['Space_Grotesk'] truncate whitespace-nowrap leading-tight"
          >
            {tip.text}
          </p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss strategy tip"
            className="shrink-0 text-[10px] text-[#A89C8F] hover:text-[#F4EAD7] px-1.5 py-0.5 rounded bg-[#1E1710] border border-[#332517] transition-colors"
          >
            Got it
          </button>
        )}
      </div>
    </aside>
  );
};
