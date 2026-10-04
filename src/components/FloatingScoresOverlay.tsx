import React from 'react';
import { FloatingScore } from '../types';

interface FloatingScoresOverlayProps {
  floatingScores: FloatingScore[];
}

export const FloatingScoresOverlay: React.FC<FloatingScoresOverlayProps> = ({
  floatingScores,
}) => {
  if (floatingScores.length === 0) return null;

  return (
    <div
      id="floating-scores-layer"
      className="absolute inset-0 pointer-events-none z-25 overflow-hidden"
    >
      {floatingScores.map((item) => (
        <div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border-2 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.6)] animate-float-up text-xs sm:text-sm font-black text-amber-300 font-mono select-none backdrop-blur-xs whitespace-nowrap"
          style={{
            left: `${Math.min(85, Math.max(15, item.xPercent))}%`,
            top: `${Math.min(85, Math.max(15, item.yPercent))}%`,
          }}
        >
          {item.emoji && <span className="text-base">{item.emoji}</span>}
          <span className="text-yellow-200">+{item.points}</span>
          <span className="text-[11px] text-amber-400/90 font-bold uppercase">
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
};
