import React, { useEffect, useRef } from 'react';
import { audio } from '@/game/audio';

// Animated retro background for the main menu — drifting hills, sun, clouds.
export default function MainMenu({ onPlay, onLevelSelect, onSettings }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    const draw = () => {
      t += 1;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#5fb8e8');
      g.addColorStop(1, '#a8e0f0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // sun
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(W - 80, 70, 40, 0, Math.PI * 2);
      ctx.fill();
      // clouds
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        const cx = ((i * 200 + t * 0.3) % (W + 200)) - 100;
        const cy = 40 + i * 25;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy + 4, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // hills
      ctx.fillStyle = '#5fbf6f';
      for (let i = 0; i < 6; i++) {
        const bx = ((i * 160 + t * 0.15) % (W + 160)) - 80;
        ctx.beginPath();
        ctx.arc(bx + 80, H - 40, 80, Math.PI, 0);
        ctx.fill();
      }
      // ground
      ctx.fillStyle = '#9c5a30';
      ctx.fillRect(0, H - 40, W, 40);
      ctx.fillStyle = '#5fbf4f';
      ctx.fillRect(0, H - 40, W, 10);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const click = (fn) => () => { audio.init(); audio.click(); fn(); };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 font-mono">
        {/* Title */}
        <div className="text-center mb-8 mt-8">
          <h1
            className="text-5xl sm:text-7xl font-black text-yellow-300 tracking-wider"
            style={{ textShadow: '4px 4px 0 #2a7a35, 8px 8px 0 #1a1a2a' }}
          >
            PIXEL QUEST
          </h1>
          <p className="text-white text-sm sm:text-lg mt-2" style={{ textShadow: '2px 2px 0 #000' }}>
            A Retro Platform Adventure
          </p>
        </div>

        <div className="flex flex-col gap-3 w-56">
          <button
            onClick={click(onPlay)}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg border-b-4 border-yellow-600 active:translate-y-0.5 transition-all text-lg"
          >
            ▶ PLAY
          </button>
          <button
            onClick={click(onLevelSelect)}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-lg border-b-4 border-gray-400 active:translate-y-0.5 transition-all"
          >
            LEVEL SELECT
          </button>
          <button
            onClick={click(onSettings)}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-lg border-b-4 border-gray-400 active:translate-y-0.5 transition-all"
          >
            SETTINGS
          </button>
        </div>

        {/* Controls info */}
        <div className="mt-8 bg-black/50 rounded-lg p-4 text-white text-xs sm:text-sm text-center">
          <p className="font-bold mb-1 text-yellow-300">CONTROLS</p>
          <p>A / ← →  Move</p>
          <p>Space / W / ↑  Jump</p>
          <p>Esc  Pause</p>
          <p className="mt-1 opacity-70">Touch controls appear on mobile</p>
        </div>
      </div>
    </div>
  );
}