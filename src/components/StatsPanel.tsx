import React from 'react';
import { TetrominoType } from '../types';
import { COUNTRY_FLAGS } from '../constants';

interface StatsPanelProps {
  pieceCounts: Record<TetrominoType, number>;
}

const PIECES_ORDER: TetrominoType[] = ['T', 'I', 'O', 'S'];

export const StatsPanel: React.FC<StatsPanelProps> = ({ pieceCounts }) => {
  return (
    <div
      id="game-stats-panel"
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
          4 Мамлекеттин желектери
        </span>
        <span className="text-[10px] text-amber-400 font-medium">
          Желектер
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
        {PIECES_ORDER.map((type) => {
          const flag = COUNTRY_FLAGS[type];
          return (
            <div
              key={type}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 flex flex-col items-center hover:border-slate-700 transition-colors"
              title={`${flag.emoji} ${flag.nameKy} (${type})`}
            >
              <span className="text-xl leading-none mb-1 drop-shadow-sm">
                {flag.emoji}
              </span>
              <span className="text-[11px] font-bold text-slate-200 truncate max-w-full">
                {flag.nameKy}
              </span>
              <span
                className="text-[10px] font-mono font-black mt-0.5"
                style={{ color: flag.accentColor }}
              >
                {type}
              </span>
              <span className="text-xs sm:text-sm font-mono text-amber-300 font-bold mt-1">
                {pieceCounts[type] || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
