import React from 'react';
import { X, Keyboard, Smartphone, Sparkles, Flame } from 'lucide-react';
import { COUNTRY_FLAGS } from '../constants';
import { TetrominoType } from '../types';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PIECE_TYPES: TetrominoType[] = ['T', 'I', 'O', 'S'];

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="controls-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="controls-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Оюн эрежеси жана башкаруу
            </h2>
          </div>
          <button
            id="btn-close-controls-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Country Flags Guide */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-2">
              <span>🌍 4 Мамлекеттин желектери (Фигуралар)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PIECE_TYPES.map((type) => {
                const flag = COUNTRY_FLAGS[type];
                return (
                  <div
                    key={type}
                    className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex items-center gap-2"
                  >
                    <span className="text-xl">{flag.emoji}</span>
                    <div className="overflow-hidden">
                      <div className="font-bold text-slate-100 truncate text-[11px]">
                        {flag.nameKy}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Фигура: [{type}]
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bonuses & Fire & Uraa */}
          <div className="bg-gradient-to-r from-red-950/40 via-amber-950/40 to-slate-950/80 p-3 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1.5">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
              <span>Оттуу бонустар, окшош желектер жана упайлар</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
              Окшош желектер бат-бат чыгып турат. Окшош желектер бири-бирине тийгенде (дал келгенде), алар <strong>өчүп (жок болуп)</strong> кетет, кошумча чоң ачко берилет жана үстүндөгү блоктор ылдый түшөт! Экранда оттуу жалын, <strong>«Жаңы утуш»</strong> жазуусу жана калкып чыгуучу упайлар чыгат:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-amber-200/90">
              <div className="bg-slate-900/80 px-2 py-1 rounded">✨ Окшош желек өчүү: +150+ ачко</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded">🇰🇬 Кыргызстан желеги: +200+ бонус</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded">1-3 Линия: +100 - +500 ачко</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded text-yellow-300 font-bold">
                🔥 Тетрис (4 линия): +800 ачко!
              </div>
            </div>
          </div>

          {/* Keyboard Controls */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Клавиатура менен башкаруу</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Оңго / Солго</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-200">
                  ← / →
                </span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Тез түшүрүү</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-200">
                  ↓ же S
                </span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Айлантуу</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-cyan-300">
                  ↑ же W
                </span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Түз ыргытуу</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-amber-300">
                  Space (Пробел)
                </span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Кампага сактоо</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-blue-300">
                  C же Shift
                </span>
              </div>
              <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span>Тыныгуу (Пауза)</span>
                <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-200">
                  P же Esc
                </span>
              </div>
            </div>
          </div>

          {/* Smartphone / Touch */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Телефон жана сенсордук башкаруу</span>
            </div>
            <p className="text-slate-400 leading-relaxed bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-[11px]">
              Экрандын ылдый жагындагы чоң баскычтар аркылуу фигураларды оңго-солго жылдырып, айлантып жана түз түшүрсөңүз болот.
            </p>
          </div>
        </div>

        <button
          id="btn-confirm-controls-modal"
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer mt-1"
        >
          Түшүндүм, ойноого даярмын! 🎮
        </button>
      </div>
    </div>
  );
};
