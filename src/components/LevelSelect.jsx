import React from 'react';
import { audio } from '@/game/audio';
import { LEVEL_COUNT } from '@/game/levels';

export default function LevelSelect({ unlocked, onSelect, onBack }) {
  const click = (fn) => () => { audio.click(); fn(); };
  const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => i);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 font-mono p-4">
      <h2 className="text-3xl sm:text-4xl font-black text-white mb-6" style={{ textShadow: '3px 3px 0 #1a1a2a' }}>
        SELECT LEVEL
      </h2>
      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        {levels.map((i) => {
          const isUnlocked = unlocked.includes(i);
          return (
            <button
              key={i}
              disabled={!isUnlocked}
              onClick={click(() => isUnlocked && onSelect(i))}
              className={`relative aspect-square rounded-xl border-4 flex flex-col items-center justify-center font-bold text-2xl transition-all ${
                isUnlocked
                  ? 'bg-yellow-400 hover:bg-yellow-300 border-yellow-600 text-black active:translate-y-0.5'
                  : 'bg-gray-500 border-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUnlocked ? (
                <>
                  <span className="text-4xl">▶</span>
                  <span className="text-sm">Level {i + 1}</span>
                </>
              ) : (
                <span className="text-4xl">🔒</span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={click(onBack)}
        className="mt-8 px-6 py-2 bg-white text-black font-bold rounded-lg border-b-4 border-gray-400 active:translate-y-0.5"
      >
        ← BACK
      </button>
    </div>
  );
}