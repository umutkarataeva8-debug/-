import React, { useMemo } from 'react';
import { BoardMatrix, ActivePiece, GameStatus, TetrominoType, BonusEvent, FloatingScore, BoardCoord, GameStats } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';
import { FlagBlockCell } from './FlagBlockCell';
import { FireCelebrationEffect } from './FireCelebrationEffect';
import { FloatingScoresOverlay } from './FloatingScoresOverlay';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface GameBoardProps {
  board: BoardMatrix;
  currentPiece: ActivePiece | null;
  ghostY: number;
  clearingRows: number[];
  clearingCells?: BoardCoord[];
  gameStatus: GameStatus;
  lastAction: string | null;
  currentBonus: BonusEvent | null;
  floatingScores: FloatingScore[];
  stats?: GameStats;
  onStartGame: () => void;
  onResumeGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPiece,
  ghostY,
  clearingRows,
  clearingCells = [],
  gameStatus,
  lastAction,
  currentBonus,
  floatingScores,
  stats,
  onStartGame,
  onResumeGame,
}) => {
  // Compute full display board grid with ghost piece and active piece
  const displayGrid = useMemo(() => {
    // Start with a copy of board cells
    const grid: {
      type: TetrominoType | null;
      isGhost: boolean;
      isActive: boolean;
      isClearing: boolean;
      isFlagMatch: boolean;
    }[][] = board.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        const isFlagMatch = clearingCells.some((c) => c.x === cIdx && c.y === rIdx);
        return {
          type: cell,
          isGhost: false,
          isActive: false,
          isClearing: clearingRows.includes(rIdx),
          isFlagMatch,
        };
      })
    );

    // Overlay ghost piece if game is playing
    if (gameStatus === 'PLAYING' && currentPiece) {
      const { matrix, x, type } = currentPiece;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const targetY = ghostY + r;
            const targetX = x + c;
            if (
              targetY >= 0 &&
              targetY < BOARD_HEIGHT &&
              targetX >= 0 &&
              targetX < BOARD_WIDTH
            ) {
              // Only draw ghost if empty cell on board
              if (!grid[targetY][targetX].type) {
                grid[targetY][targetX] = {
                  type,
                  isGhost: true,
                  isActive: false,
                  isClearing: false,
                  isFlagMatch: false,
                };
              }
            }
          }
        }
      }

      // Overlay active piece
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c]) {
            const targetY = currentPiece.y + r;
            const targetX = x + c;
            if (
              targetY >= 0 &&
              targetY < BOARD_HEIGHT &&
              targetX >= 0 &&
              targetX < BOARD_WIDTH
            ) {
              grid[targetY][targetX] = {
                type,
                isGhost: false,
                isActive: true,
                isClearing: false,
                isFlagMatch: false,
              };
            }
          }
        }
      }
    }

    return grid;
  }, [board, currentPiece, ghostY, clearingRows, clearingCells, gameStatus]);

  return (
    <div
      id="tetris-board-wrapper"
      className={`relative p-1.5 sm:p-2 bg-slate-900 border-2 rounded-2xl select-none overflow-hidden transition-all duration-200 ${
        clearingCells.length > 0
          ? 'border-amber-400 shadow-[0_0_40px_rgba(239,68,68,0.9),0_0_20px_rgba(245,158,11,0.7)] ring-4 ring-orange-500/80 scale-[1.01]'
          : 'border-slate-700/80 shadow-2xl shadow-cyan-950/30'
      }`}
    >
      {/* Visual Fire and Bonus Celebrations Layer */}
      <FireCelebrationEffect currentBonus={currentBonus} />

      {/* Floating Scores Popups Layer ("ачко чыгып турсун") */}
      <FloatingScoresOverlay floatingScores={floatingScores} />

      {/* 10x20 Playfield */}
      <div
        id="tetris-playfield"
        className="grid grid-cols-10 gap-[1.5px] bg-slate-950 rounded-xl p-1.5 border border-slate-800/90 relative"
        style={{
          width: 'min(72vw, 300px)',
          height: 'min(144vw, 600px)',
          maxHeight: '62vh',
        }}
      >
        {displayGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <FlagBlockCell
              key={`${rIdx}-${cIdx}`}
              type={cell.type}
              isGhost={cell.isGhost}
              isActive={cell.isActive}
              isClearing={cell.isClearing}
              isFlagMatch={cell.isFlagMatch}
            />
          ))
        )}
      </div>

      {/* Floating Action Text Badge */}
      {lastAction && gameStatus === 'PLAYING' && !currentBonus && (
        <div
          id="action-banner"
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-bounce"
        >
          <span className="px-4 py-1.5 rounded-full text-sm font-black tracking-widest text-yellow-300 bg-black/85 border border-yellow-400/80 shadow-lg shadow-yellow-500/20 backdrop-blur-xs">
            {lastAction}
          </span>
        </div>
      )}

      {/* Overlay: IDLE (Start Game) */}
      {gameStatus === 'IDLE' && (
        <div
          id="idle-overlay"
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/20">
            <Play className="w-6 h-6 fill-cyan-400 ml-0.5" />
          </div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider mb-1">
            Дүйнөлүк Тетрис
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-lg mb-2">
            <span>🇰🇬</span>
            <span>🇰🇿</span>
            <span>🇹🇷</span>
            <span>🇧🇷</span>
            <span>🇩🇪</span>
            <span>🇫🇷</span>
            <span>🇯🇵</span>
          </div>
          <p className="text-xs text-slate-400 mb-5 max-w-[220px]">
            Мамлекеттик желектер менен ойноңуз, оттуу бонустарды жана упайларды чогултуңуз!
          </p>
          <button
            id="start-game-btn"
            onClick={onStartGame}
            className="w-full max-w-[200px] py-3 px-6 bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            Оюнду баштоо 🚀
          </button>
        </div>
      )}

      {/* Overlay: PAUSED */}
      {gameStatus === 'PAUSED' && (
        <div
          id="paused-overlay"
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30"
        >
          <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest mb-1">
            Тыныгуу (Пауза)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Улантуу үчүн баскычты басыңыз</p>
          <button
            id="resume-game-btn"
            onClick={onResumeGame}
            className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer"
          >
            Улантуу (Продолжить)
          </button>
        </div>
      )}

      {/* Overlay: VICTORY (10 утуш болгондо оюн аяктады) */}
      {gameStatus === 'VICTORY' && (
        <div
          id="victory-overlay"
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-5 text-center z-30 select-none animate-in fade-in zoom-in-95 duration-300"
        >
          {/* Radiant Trophy with pulsating fiery glow */}
          <div className="relative mb-2.5 flex items-center justify-center">
            <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 rounded-full blur-xl opacity-80 animate-pulse" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-2 border-yellow-200 flex items-center justify-center text-slate-950 shadow-2xl shadow-yellow-500/50">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 fill-amber-300 drop-shadow-md animate-bounce" />
            </div>
            <span className="absolute -top-1.5 -right-2 text-xl sm:text-2xl animate-spin">✨</span>
            <span className="absolute -bottom-1 -left-2 text-xl sm:text-2xl animate-bounce">🔥</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black uppercase tracking-widest mb-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>10 УТУШ БОЛДУ!</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 uppercase tracking-wider mb-1 drop-shadow-sm">
            Оюн аяктады! Жеңиш!
          </h3>
          <p className="text-xs text-slate-300 mb-3 max-w-[240px] leading-relaxed">
            Сиз 10 утушка жетип, оюнду толук жеңиш менен ийгиликтүү аяктадыңыз!
          </p>

          {/* Stats summary card */}
          {stats && (
            <div className="w-full max-w-[230px] bg-slate-900/90 border border-amber-500/40 rounded-xl p-2 mb-3.5 grid grid-cols-2 gap-2 text-left shadow-lg">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Утуштар:</span>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300">10 / 10 🏆</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Упай (Ачко):</span>
                <span className="text-xs sm:text-sm font-mono font-black text-yellow-400">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Линиялар:</span>
                <span className="text-xs sm:text-sm font-mono font-black text-emerald-300">{stats.lines}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Деңгээл:</span>
                <span className="text-xs sm:text-sm font-mono font-black text-cyan-300">{stats.level}</span>
              </div>
            </div>
          )}

          <button
            id="restart-victory-btn"
            onClick={onStartGame}
            className="w-full max-w-[220px] py-2.5 px-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/40 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Кайра ойноо (10 утуш) 🔁</span>
          </button>
        </div>
      )}

      {/* Overlay: GAME OVER */}
      {gameStatus === 'GAME_OVER' && (
        <div
          id="game-over-overlay"
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-5 text-center z-30"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2.5">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-rose-400 uppercase tracking-widest mb-1">
            Оюн бүттү!
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Жаңы рекорд коюп, бонустарды утуп алыңыз!
          </p>
          <button
            id="restart-game-btn"
            onClick={onStartGame}
            className="py-3 px-6 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            Кайра ойноо 🔁
          </button>
        </div>
      )}
    </div>
  );
};
