import React, { useState } from 'react';
import { audio } from '@/game/audio';

// Lets the player share their final score + level progress to Instagram or TikTok.
// Uses the native Web Share sheet when available (mobile), with clipboard fallback
// plus direct deep-link buttons for Instagram and TikTok.
export default function ShareScore({ score, coins, time, levelName }) {
  const [status, setStatus] = useState(null); // 'shared' | 'copied' | null

  const text = `🎮 I just cleared ${levelName} in Pixel Quest!\n🏆 Score: ${score} | 🪙 Coins: ${coins} | ⏱️ ${time}s\nCan you beat my score?`;
  const url = window.location.origin;
  const fullText = `${text}\n${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    audio.click();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Pixel Quest', text, url });
        setStatus('shared');
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    const ok = await copy();
    setStatus(ok ? 'copied' : 'copied');
  };

  const openApp = async (platform) => {
    audio.click();
    await copy();
    setStatus('copied');
    const link = platform === 'instagram'
      ? 'https://www.instagram.com'
      : 'https://www.tiktok.com';
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="my-2 flex flex-col items-center gap-2">
      <div className="flex flex-wrap gap-2 justify-center">
        <ShareBtn onClick={handleShare} className="bg-blue-500 hover:bg-blue-400 border-blue-700">
          📤 Share
        </ShareBtn>
        <ShareBtn onClick={() => openApp('instagram')} className="bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:opacity-90 border-pink-800">
          Instagram
        </ShareBtn>
        <ShareBtn onClick={() => openApp('tiktok')} className="bg-black hover:bg-zinc-800 border-zinc-700">
          TikTok
        </ShareBtn>
      </div>
      {status && (
        <p className="text-xs text-green-300" style={{ textShadow: '1px 1px 0 #000' }}>
          {status === 'shared' ? 'Shared!' : 'Score copied — paste it into your post!'}
        </p>
      )}
    </div>
  );
}

function ShareBtn({ onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-white font-bold rounded border-b-4 active:translate-y-0.5 transition-all text-xs sm:text-sm ${className}`}
    >
      {children}
    </button>
  );
}