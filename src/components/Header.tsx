import React from 'react';
import { Volume2, VolumeX, Music, Music2, Pause, Play, RotateCcw, HelpCircle } from 'lucide-react';
import { GameStatus } from '../types';

interface HeaderProps {
  gameStatus: GameStatus;
  isMuted: boolean;
  isMusicMuted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameStatus,
  isMuted,
  isMusicMuted,
  onToggleMute,
  onToggleMusic,
  onTogglePause,
  onRestart,
  onOpenHelp,
}) => {
  return (
    <header
      id="game-header"
      className="w-full max-w-4xl mx-auto flex items-center justify-between py-2.5 px-3 sm:px-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl backdrop-blur-md mb-2 sm:mb-3 shadow-xl"
    >
      {/* Title with Kyrgyzstan flag & arcade logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black text-sm">
          🇰🇬
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-100 uppercase">
              Тетрис
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
              Желектер
            </span>
          </div>
          <p className="text-[10px] text-amber-400/90 font-mono hidden sm:block">
            ОТТУУ БОНУСТАР • ШАЙЫР МУЗЫКА
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Background Music toggle */}
        <button
          type="button"
          id="btn-toggle-music"
          onClick={onToggleMusic}
          title={isMusicMuted ? 'Музыканы күйгүзүү (Вкл. музыку)' : 'Музыканы өчүрүү (Выкл. музыку)'}
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border ${
            isMusicMuted
              ? 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/20'
          }`}
        >
          {isMusicMuted ? (
            <Music2 className="w-4 h-4 text-slate-400" />
          ) : (
            <Music className="w-4 h-4 text-amber-400 animate-pulse" />
          )}
          <span className="hidden sm:inline">
            {isMusicMuted ? 'Музыка: Жок' : 'Музыка'}
          </span>
        </button>

        {/* Sound Effects toggle */}
        <button
          type="button"
          id="btn-toggle-sound"
          onClick={onToggleMute}
          title={isMuted ? 'Үндү күйгүзүү' : 'Үндү өчүрүү'}
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border ${
            isMuted
              ? 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
          <span className="hidden sm:inline">{isMuted ? 'Үн: Жок' : 'Үн'}</span>
        </button>

        {/* Pause/Resume */}
        {gameStatus !== 'IDLE' && gameStatus !== 'GAME_OVER' && (
          <button
            type="button"
            id="btn-toggle-pause"
            onClick={onTogglePause}
            title={gameStatus === 'PAUSED' ? 'Улантуу' : 'Пауза'}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-700/60"
          >
            {gameStatus === 'PAUSED' ? (
              <Play className="w-4 h-4 text-cyan-400" />
            ) : (
              <Pause className="w-4 h-4 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {gameStatus === 'PAUSED' ? 'Старт' : 'Пауза'}
            </span>
          </button>
        )}

        {/* Restart button */}
        <button
          type="button"
          id="btn-header-restart"
          onClick={onRestart}
          title="Кайра ойноо"
          className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-700/60"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Кайра</span>
        </button>

        {/* Controls Help */}
        <button
          type="button"
          id="btn-open-help"
          onClick={onOpenHelp}
          title="Жардам / Башкаруу"
          className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-400 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-700/60"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </header>
  );
};
