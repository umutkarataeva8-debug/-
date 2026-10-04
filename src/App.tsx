/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import { GameBoard } from './components/GameBoard';
import { PiecePreview } from './components/PiecePreview';
import { ScoreBoard } from './components/ScoreBoard';
import { StatsPanel } from './components/StatsPanel';
import { MobileControls } from './components/MobileControls';
import { Header } from './components/Header';
import { ControlsModal } from './components/ControlsModal';
import { STORAGE_SOUND_MUTED_KEY, STORAGE_MUSIC_MUTED_KEY } from './constants';
import { sound } from './audio';

export default function App() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_SOUND_MUTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_MUSIC_MUTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const {
    board,
    currentPiece,
    ghostY,
    holdPiece,
    canHold,
    nextQueue,
    stats,
    gameStatus,
    clearingRows,
    clearingCells,
    lastAction,
    currentBonus,
    floatingScores,
    startGame,
    togglePause,
    moveHorizontal,
    rotatePiece,
    softDrop,
    hardDrop,
    hold,
  } = useTetris();

  // Keep sound effects in sync with muted state
  useEffect(() => {
    sound.setMuted(isMuted);
    try {
      localStorage.setItem(STORAGE_SOUND_MUTED_KEY, String(isMuted));
    } catch {
      // Ignore
    }
  }, [isMuted]);

  // Keep background music in sync with music muted state
  useEffect(() => {
    sound.setMusicMuted(isMusicMuted);
    try {
      localStorage.setItem(STORAGE_MUSIC_MUTED_KEY, String(isMusicMuted));
    } catch {
      // Ignore
    }
  }, [isMusicMuted]);

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleToggleMusic = () => {
    setIsMusicMuted((prev) => !prev);
  };

  return (
    <div
      id="tetris-app-root"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 selection:bg-amber-500 selection:text-black font-sans"
    >
      {/* Top Header */}
      <Header
        gameStatus={gameStatus}
        isMuted={isMuted}
        isMusicMuted={isMusicMuted}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onTogglePause={togglePause}
        onRestart={startGame}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Game Arena */}
      <main
        id="game-arena"
        className="w-full max-w-5xl mx-auto flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-5 my-auto pt-2"
      >
        {/* Сол тарап: Ачко жана утуштар таблосу (Left Column: Score & Stats) */}
        <aside
          id="left-column-score"
          className="flex flex-col gap-3.5 w-full md:w-64 shrink-0 order-2 lg:order-1"
        >
          <ScoreBoard stats={stats} />
          <div className="hidden md:block">
            <StatsPanel pieceCounts={stats.pieceCounts} />
          </div>
        </aside>

        {/* Орто: Оюн талаасы (Center: Playfield) */}
        <section
          id="center-playfield-section"
          className="flex flex-col items-center order-1 lg:order-2"
        >
          {/* Mobile Quick Bar (screens < md): Сол тарапта Ачко, оң тарапта чыкчу желек */}
          <div className="flex md:hidden items-center justify-between w-full max-w-[310px] gap-2 mb-2">
            {/* Сол: Ачко жана Утуш */}
            <div className="flex-1 bg-slate-900/90 border border-slate-800/90 rounded-xl p-2 flex flex-col justify-center shadow-md">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Ачко:</span>
                <span className="text-amber-400 font-black text-xs font-mono">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                <span>Утуш:</span>
                <span className="text-yellow-400 font-mono font-bold">{stats.wins || 0}/10 🏆</span>
              </div>
            </div>

            {/* Оң: Кийинки чыкчу желек */}
            <div className="flex-1">
              <PiecePreview
                type={nextQueue[0] || null}
                label="Чыкчу желек"
              />
            </div>
          </div>

          <GameBoard
            board={board}
            currentPiece={currentPiece}
            ghostY={ghostY}
            clearingRows={clearingRows}
            clearingCells={clearingCells}
            gameStatus={gameStatus}
            lastAction={lastAction}
            currentBonus={currentBonus}
            floatingScores={floatingScores}
            stats={stats}
            onStartGame={startGame}
            onResumeGame={togglePause}
          />
        </section>

        {/* Оң тарап: Чыкчу желектер жана Кампа (Right Column: Upcoming Flags & Hold) */}
        <aside
          id="right-column-flags"
          className="hidden md:flex flex-col gap-3.5 w-56 lg:w-60 shrink-0 order-3"
        >
          {/* Чыкчу желектер (Desktop shows upcoming flags queue) */}
          <div
            id="next-pieces-container"
            className="flex flex-col gap-2 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-amber-400">
                <span>🏁</span>
                <span>Чыкчу желектер</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded">
                Оң тарап
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <PiecePreview
                type={nextQueue[0] || null}
                label="1-чыкчу желек"
                subLabel="Кезекте"
              />
              {nextQueue.slice(1, 3).map((type, idx) => (
                <div
                  key={idx}
                  className="opacity-85 transform scale-95 -my-1"
                >
                  <PiecePreview
                    type={type}
                    label={`${idx + 2}-чыкчу желек`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Кампа (Запас желек) */}
          <PiecePreview
            type={holdPiece}
            label="Кампа (Запас желек)"
            subLabel="[C] же [Shift]"
            disabled={!canHold}
          />
        </aside>
      </main>

      {/* Touch / Mobile Controls */}
      <footer id="footer-controls" className="w-full max-w-xl mx-auto mt-2">
        <MobileControls
          onMoveLeft={() => moveHorizontal(-1)}
          onMoveRight={() => moveHorizontal(1)}
          onSoftDrop={softDrop}
          onHardDrop={hardDrop}
          onRotateCW={() => rotatePiece(1)}
          onRotateCCW={() => rotatePiece(-1)}
          onHold={hold}
          disabled={gameStatus !== 'PLAYING'}
        />
      </footer>

      {/* Controls / Help Modal */}
      <ControlsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
