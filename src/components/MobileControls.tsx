import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ChevronsDown,
  RotateCw,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  disabled = false,
}) => {
  const handleAction = (
    e: React.MouseEvent | React.TouchEvent,
    action: () => void
  ) => {
    e.preventDefault();
    if (!disabled) {
      action();
    }
  };

  return (
    <div
      id="mobile-touch-controls"
      className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 select-none touch-manipulation pt-2"
    >
      {/* Left side: D-Pad navigation (Left, Right, Soft Drop, Hard Drop) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2 shadow-lg shadow-black/20">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Движение
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-move-left"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onMoveLeft)}
            aria-label="Влево"
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="btn-move-right"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onMoveRight)}
            aria-label="Вправо"
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-soft-drop"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onSoftDrop)}
            aria-label="Вниз"
            className="h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm text-xs font-semibold gap-1"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Вниз</span>
          </button>

          <button
            type="button"
            id="btn-hard-drop"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onHardDrop)}
            aria-label="Сброс"
            className="h-11 bg-slate-800 hover:bg-slate-700 active:bg-orange-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-xs font-bold gap-1"
          >
            <ChevronsDown className="w-4 h-4" />
            <span>Сброс</span>
          </button>
        </div>
      </div>

      {/* Right side: Actions (Rotate Clockwise, Counter-Clockwise, Hold) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2 shadow-lg shadow-black/20">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
          Действия
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            id="btn-rotate-ccw"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onRotateCCW)}
            aria-label="Поворот против часовой"
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 disabled:opacity-40 rounded-xl flex flex-col items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold text-slate-400">↺ -90°</span>
          </button>

          <button
            type="button"
            id="btn-rotate-cw"
            disabled={disabled}
            onPointerDown={(e) => handleAction(e, onRotateCW)}
            aria-label="Поворот по часовой"
            className="h-12 bg-slate-800 hover:bg-slate-700 active:bg-purple-600 disabled:opacity-40 rounded-xl flex flex-col items-center justify-center text-cyan-300 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <RotateCw className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold text-cyan-300">↻ +90°</span>
          </button>
        </div>

        <button
          type="button"
          id="btn-hold"
          disabled={disabled}
          onPointerDown={(e) => handleAction(e, onHold)}
          aria-label="Запас"
          className="h-11 bg-slate-800 hover:bg-slate-700 active:bg-blue-600 disabled:opacity-40 rounded-xl flex items-center justify-center text-blue-300 active:scale-95 transition-all cursor-pointer shadow-sm text-xs font-semibold gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Запас (Hold)</span>
        </button>
      </div>
    </div>
  );
};
