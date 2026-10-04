import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BonusEvent } from '../types';

interface FireCelebrationEffectProps {
  currentBonus: BonusEvent | null;
}

interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const FireCelebrationEffect: React.FC<FireCelebrationEffectProps> = ({
  currentBonus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<FireParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Trigger fire particles & confetti fireworks when a bonus event occurs
  useEffect(() => {
    if (!currentBonus) return;

    // 1. Fire Confetti Burst (Fiery warm colors: Red, Orange, Gold, Yellow)
    try {
      confetti({
        particleCount: currentBonus.type === 'tetris' ? 70 : 45,
        spread: 80,
        origin: { y: 0.65, x: 0.5 },
        colors: ['#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#ffcc00', '#ffffff'],
        disableForReducedMotion: false,
      });

      if (currentBonus.type === 'tetris') {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#ff2200', '#ff8800', '#ffd700'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#ff2200', '#ff8800', '#ffd700'],
          });
        }, 150);
      }
    } catch {
      // Ignore if confetti not supported
    }

    // 2. Generate local flame particles inside the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      const count = currentBonus.type === 'tetris' ? 140 : 100;
      const colors = ['#dc2626', '#ea580c', '#f97316', '#fbbf24', '#facc15', '#fef08a', '#ffffff'];

      // Bottom erupting fire wall
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: width * 0.5 + (Math.random() - 0.5) * (width * 0.9),
          y: height * 0.8 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 5,
          vy: -(Math.random() * 6 + 4),
          size: Math.random() * 9 + 4,
          life: 0,
          maxLife: Math.random() * 45 + 30,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Center explosion burst of fire sparks
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particlesRef.current.push({
          x: width * 0.5,
          y: height * 0.45,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 7 + 3,
          life: 0,
          maxLife: Math.random() * 35 + 20,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }, [currentBonus]);

  // Particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.96; // Shrink as it rises

        const progress = p.life / p.maxLife;
        if (progress >= 1 || p.size <= 0.5) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      id="fire-celebration-container"
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Canvas for custom rising fire embers & flames */}
      <canvas
        ref={canvasRef}
        width={360}
        height={540}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Floating Animated Fire & "УРАА! БОНУС!" Banner */}
      {currentBonus && (
        <div
          key={currentBonus.id}
          className="relative flex flex-col items-center justify-center select-none px-4 py-3 scale-110 transition-transform duration-300"
        >
          {/* Intense glowing fiery backdrop aura */}
          <div className="absolute -inset-4 bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 rounded-3xl blur-xl opacity-90 animate-pulse" />

          {/* Leaping animated flame tongues above badge */}
          <div className="flex items-end justify-center gap-1.5 -mb-2 z-10">
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0ms' }}>🔥</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>🔥</span>
            <span className="text-3xl animate-bounce" style={{ animationDelay: '200ms' }}>🔥</span>
          </div>

          {/* Main Fire Badge */}
          <div className="relative bg-slate-950/95 border-2 border-amber-400 px-6 py-3 rounded-2xl shadow-[0_0_35px_rgba(239,68,68,0.8),0_0_20px_rgba(245,158,11,0.6)] flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-wider text-yellow-300">
              <span className="text-2xl animate-pulse">🔥</span>
              <span className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">{currentBonus.text}</span>
              <span className="text-2xl animate-pulse">🔥</span>
            </div>

            {currentBonus.subText && (
              <div className="text-xs font-bold text-amber-200 uppercase tracking-wide drop-shadow-sm">
                {currentBonus.subText}
              </div>
            )}

            <div className="text-base font-mono font-black text-white bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-3.5 py-1 rounded-lg border border-yellow-300 shadow-md mt-1">
              +{currentBonus.points} АЧКО!
            </div>
          </div>

          {/* Bottom fire glow embers */}
          <div className="flex items-center justify-center gap-2 -mt-1 z-10 opacity-90">
            <span className="text-xl animate-pulse">✨</span>
            <span className="text-2xl animate-bounce">🔥</span>
            <span className="text-xl animate-pulse">✨</span>
          </div>
        </div>
      )}
    </div>
  );
};
