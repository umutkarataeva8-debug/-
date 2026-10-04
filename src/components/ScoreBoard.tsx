import React from 'react';
import { GameStats } from '../types';
import { Trophy, Zap, Layers, Award, Flame } from 'lucide-react';

interface ScoreBoardProps {
  stats: GameStats;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats }) => {
  // Lines until next level (every 10 lines)
  const linesInCurrentLevel = stats.lines % 10;
  const progressPercent = Math.min(100, (linesInCurrentLevel / 10) * 100);
  const currentWins = stats.wins || 0;
  const targetWins = stats.targetWins || 10;
  const winsProgress = Math.min(100, (currentWins / targetWins) * 100);

  return (
    <div
      id="game-scoreboard"
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 sm:p-3.5 flex flex-col gap-2.5 shadow-lg shadow-black/20 text-slate-100"
    >
      {/* Top Header: АЧКО */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
          <Award className="w-4 h-4 text-amber-400" />
          <span>АЧКО ЖАНА УТУШТАР</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
          Сол тарап
        </span>
      </div>

      {/* Target: 10 Wins Tracker Banner */}
      <div
        id="wins-target-card"
        className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-300 ${
          currentWins >= targetWins
            ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-orange-500/30 border-yellow-400/80 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
            : currentWins >= 8
            ? 'bg-amber-950/40 border-amber-500/60 shadow-md'
            : 'bg-slate-950/80 border-slate-800/90'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
            <span>Утуштар (Жеңиш)</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-black text-sm">
            <span className={currentWins >= targetWins ? 'text-yellow-300 text-base' : 'text-amber-400'}>
              {currentWins}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">{targetWins}</span>
          </div>
        </div>

        {/* 10 Visual Progress Segments */}
        <div className="grid grid-cols-10 gap-1 w-full">
          {Array.from({ length: targetWins }).map((_, idx) => {
            const isFilled = idx < currentWins;
            return (
              <div
                key={idx}
                title={`${idx + 1}-утуш`}
                className={`h-2 rounded-sm transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_6px_rgba(245,158,11,0.8)] scale-y-110'
                    : 'bg-slate-800/80 border border-slate-700/50'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          {currentWins >= targetWins ? (
            <span className="text-yellow-300 font-bold flex items-center gap-1">
              <span>🎉</span> 10 утуш болду, оюн аяктады!
            </span>
          ) : currentWins === targetWins - 1 ? (
            <span className="text-amber-300 font-bold animate-pulse">
              🔥 Акыркы 1 утуш калды!
            </span>
          ) : (
            <span>10 утуш болгондо оюн аяктайт</span>
          )}
          <span className="font-mono text-slate-500">{Math.round(winsProgress)}%</span>
        </div>
      </div>

      {/* Score and High Score */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Упай (Ачко)</span>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-tight">
            {stats.score.toLocaleString()}
          </span>
          {stats.totalBonusPoints > 0 && (
            <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">
              Бонус: +{stats.totalBonusPoints}
            </span>
          )}
        </div>

        <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span>Рекорд</span>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-black text-yellow-400/90 tracking-tight">
            {stats.highScore.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
            Эң мыкты
          </span>
        </div>
      </div>

      {/* Level & Lines */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Деңгээл</span>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-black text-cyan-300">
            {stats.level}
          </span>
          {/* Level Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Линиялар</span>
          </div>
          <span className="text-xl sm:text-2xl font-mono font-black text-emerald-300">
            {stats.lines}
          </span>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">
            {10 - linesInCurrentLevel} калды
          </span>
        </div>
      </div>

      {/* Combo streak indicator if active */}
      {stats.combo > 1 && (
        <div
          id="combo-indicator"
          className="bg-gradient-to-r from-red-600/30 via-orange-500/30 to-amber-500/30 border border-amber-500/60 rounded-lg py-1.5 px-3 flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wide">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            <span>Комбо x{stats.combo}</span>
          </div>
          <span className="text-[11px] font-mono font-black text-yellow-300">
            +{stats.combo * 50 * stats.level} ачко!
          </span>
        </div>
      )}
    </div>
  );
};
