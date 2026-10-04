import React from 'react';
import { TetrominoType } from '../types';
import { COUNTRY_FLAGS } from '../constants';

interface FlagBlockCellProps {
  type: TetrominoType | null;
  isGhost?: boolean;
  isClearing?: boolean;
  isFlagMatch?: boolean;
  isActive?: boolean;
  sizeClassName?: string;
  showEmoji?: boolean;
}

export const FlagBlockCell: React.FC<FlagBlockCellProps> = ({
  type,
  isGhost = false,
  isClearing = false,
  isFlagMatch = false,
  isActive = false,
  sizeClassName = 'w-full h-full',
  showEmoji = false,
}) => {
  if (!type) {
    return (
      <div
        className={`${sizeClassName} rounded-[3px] bg-slate-950/40 border border-slate-900/60 transition-colors`}
      />
    );
  }

  const flag = COUNTRY_FLAGS[type];

  // If identical flag matched and is extinguishing ("окшош желектер өчсүн жана огонь чыксын")
  if (isFlagMatch) {
    return (
      <div
        className={`${sizeClassName} rounded-[3px] bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_22px_#ef4444,0_0_12px_#f59e0b] ring-2 ring-yellow-200 flex items-center justify-center relative overflow-hidden z-20 animate-pulse`}
      >
        {/* Blazing animated fire SVG tongues */}
        <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0 animate-bounce">
          {/* Deep crimson outer flame */}
          <path
            d="M 16 1 C 18 7 27 12 27 21 C 27 27.5 22 31.5 16 31.5 C 10 31.5 5 27.5 5 21 C 5 12 14 7 16 1 Z"
            fill="#dc2626"
          />
          {/* Searing orange middle flame */}
          <path
            d="M 16 6 C 17.5 10.5 24 14.5 24 22 C 24 26.5 20.5 29.5 16 29.5 C 11.5 29.5 8 26.5 8 22 C 8 14.5 14.5 10.5 16 6 Z"
            fill="#ea580c"
          />
          {/* Radiant yellow core */}
          <path
            d="M 16 11 C 17 14.5 21 17.5 21 23 C 21 26 18.5 28 16 28 C 13.5 28 11 26 11 23 C 11 17.5 15 14.5 16 11 Z"
            fill="#facc15"
          />
          {/* White-hot center ember */}
          <ellipse cx="16" cy="24" rx="2.5" ry="3.5" fill="#ffffff" />
        </svg>
        <span className="relative z-10 text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">🔥</span>
      </div>
    );
  }

  // If row is clearing, flash pure bright white-gold fire
  if (isClearing) {
    return (
      <div
        className={`${sizeClassName} rounded-[3px] bg-amber-100 shadow-[0_0_14px_#f59e0b] border border-white animate-pulse flex items-center justify-center`}
      >
        <span className="text-[10px]">🔥</span>
      </div>
    );
  }

  // If Ghost piece
  if (isGhost) {
    return (
      <div
        className={`${sizeClassName} rounded-[3px] flex items-center justify-center relative overflow-hidden transition-all`}
        style={{
          border: `1.5px dashed ${flag.primaryColor}`,
          backgroundColor: `${flag.primaryColor}18`,
        }}
      >
        <span className="text-[8px] opacity-60 font-black" style={{ color: flag.accentColor }}>
          {flag.code}
        </span>
      </div>
    );
  }

  // Render SVG Flag Graphics for each country
  return (
    <div
      className={`${sizeClassName} rounded-[3px] relative overflow-hidden flex items-center justify-center shadow-xs select-none transition-all ${
        isActive ? 'brightness-110' : ''
      }`}
      style={{
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.3)`,
      }}
      title={`${flag.emoji} ${flag.nameKy} (${flag.nameEn})`}
    >
      {/* Country Specific Micro-Flag SVG */}
      {(type === 'T' || type === 'L') && (
        // 🇰🇬 Кыргызстан: Red field with yellow sun & tunduk
        <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0">
          <rect width="32" height="32" fill="#dc2626" />
          {/* Sun Rays */}
          <circle cx="16" cy="16" r="8" fill="#facc15" />
          <circle cx="16" cy="16" r="6" fill="#dc2626" />
          {/* Tunduk Cross */}
          <circle cx="16" cy="16" r="4.5" fill="#facc15" />
          <line x1="16" y1="12" x2="16" y2="20" stroke="#dc2626" strokeWidth="1.2" />
          <line x1="12" y1="16" x2="20" y2="16" stroke="#dc2626" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="1.5" fill="#dc2626" />
        </svg>
      )}

      {(type === 'I' || type === 'J') && (
        // 🇰🇿 Казакстан: Sky blue with golden steppe sun & eagle
        <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0">
          <rect width="32" height="32" fill="#0284c7" />
          {/* Left ornament pattern strip */}
          <rect x="0" y="0" width="4" height="32" fill="#facc15" opacity="0.85" />
          {/* Sun & soaring eagle */}
          <circle cx="18" cy="13" r="5" fill="#facc15" />
          <path
            d="M 12 21 Q 18 17 24 21 Q 18 19 12 21 Z"
            fill="#facc15"
          />
        </svg>
      )}

      {type === 'O' && (
        // 🇺🇿 Өзбекстан: Azure blue, white with red borders, emerald green, crescent & stars
        <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0">
          {/* Azure blue top */}
          <rect x="0" y="0" width="32" height="11" fill="#0284c7" />
          {/* Red divider stripe 1 */}
          <rect x="0" y="11" width="32" height="1.5" fill="#dc2626" />
          {/* White center */}
          <rect x="0" y="12.5" width="32" height="7" fill="#ffffff" />
          {/* Red divider stripe 2 */}
          <rect x="0" y="19.5" width="32" height="1.5" fill="#dc2626" />
          {/* Emerald green bottom */}
          <rect x="0" y="21" width="32" height="11" fill="#16a34a" />
          {/* White crescent moon */}
          <circle cx="6" cy="5.5" r="3.2" fill="#ffffff" />
          <circle cx="7.2" cy="5.5" r="2.6" fill="#0284c7" />
          {/* 12 Stars */}
          <circle cx="10.5" cy="4" r="0.6" fill="#ffffff" />
          <circle cx="12.5" cy="4" r="0.6" fill="#ffffff" />
          <circle cx="14.5" cy="4" r="0.6" fill="#ffffff" />
          <circle cx="11.5" cy="6.5" r="0.6" fill="#ffffff" />
          <circle cx="13.5" cy="6.5" r="0.6" fill="#ffffff" />
        </svg>
      )}

      {(type === 'S' || type === 'Z') && (
        // 🇹🇷 Түркия: Crimson red with white crescent moon & 5-point star
        <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0">
          <rect width="32" height="32" fill="#e11d48" />
          {/* White crescent moon */}
          <circle cx="14" cy="16" r="6.5" fill="#ffffff" />
          <circle cx="16" cy="16" r="5.2" fill="#e11d48" />
          {/* White Star */}
          <polygon
            points="22,13 23,15 25.5,15 23.5,16.5 24.5,19 22,17.5 19.5,19 20.5,16.5 18.5,15 21,15"
            fill="#ffffff"
          />
        </svg>
      )}

      {/* Gloss reflection overlay for tactile 3D feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />

      {/* Optional Emoji badge */}
      {showEmoji && (
        <span className="absolute z-10 text-[11px] drop-shadow-md">
          {flag.emoji}
        </span>
      )}
    </div>
  );
};
