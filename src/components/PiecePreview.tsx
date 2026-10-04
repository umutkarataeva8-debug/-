import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINOES, COUNTRY_FLAGS } from '../constants';
import { FlagBlockCell } from './FlagBlockCell';

interface PiecePreviewProps {
  type: TetrominoType | null;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  label,
  subLabel,
  disabled = false,
}) => {
  const matrix = type ? TETROMINOES[type][0] : null;
  const flagInfo = type ? COUNTRY_FLAGS[type] : null;

  return (
    <div
      id={`preview-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 flex flex-col items-center shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between w-full mb-1.5">
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-amber-400/90 font-medium">
            {subLabel}
          </span>
        )}
      </div>

      <div className="w-20 h-16 sm:w-24 sm:h-20 flex flex-col items-center justify-center bg-slate-950/70 rounded-lg border border-slate-800/60 p-1">
        {matrix && type ? (
          <div
            className="grid gap-[2px] transition-opacity duration-150 mb-1"
            style={{
              gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))`,
              opacity: disabled ? 0.35 : 1,
            }}
          >
            {matrix.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div key={`${rIdx}-${cIdx}`} className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  {cell ? (
                    <FlagBlockCell type={type} />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <span className="text-slate-700 text-xs">—</span>
        )}

        {/* Country Badge Label */}
        {flagInfo && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 truncate max-w-[85px]">
            <span>{flagInfo.emoji}</span>
            <span className="truncate">{flagInfo.nameKy}</span>
          </div>
        )}
      </div>
    </div>
  );
};
