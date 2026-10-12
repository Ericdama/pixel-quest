import React from 'react';
import { audio } from '@/game/audio';

export default function Settings({ muted, onToggleMute, onBack }) {
  const click = (fn) => () => { audio.click(); fn(); };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 font-mono p-4">
      <h2 className="text-3xl sm:text-4xl font-black text-white mb-8" style={{ textShadow: '3px 3px 0 #1a1a2a' }}>
        SETTINGS
      </h2>
      <div className="bg-black/40 rounded-xl p-6 w-72 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold">Sound Effects</span>
          <button
            onClick={click(onToggleMute)}
            className={`px-4 py-1 rounded-lg font-bold border-b-4 ${
              muted ? 'bg-gray-500 border-gray-700' : 'bg-green-400 border-green-700 text-black'
            }`}
          >
            {muted ? 'OFF' : 'ON'}
          </button>
        </div>
        <p className="text-xs opacity-70 mt-4">
          Tap the game once on mobile to enable audio. More options coming soon!
        </p>
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