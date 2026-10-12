import React, { useState, useEffect } from 'react';
import MainMenu from '@/components/MainMenu';
import LevelSelect from '@/components/LevelSelect';
import Settings from '@/components/Settings';
import GameCanvas from '@/components/GameCanvas';
import { audio } from '@/game/audio';

const UNLOCK_KEY = 'pixelquest_unlocked';

export default function Game() {
  const [screen, setScreen] = useState('menu'); // menu | levelselect | settings | playing
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlocked, setUnlocked] = useState([0]);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(UNLOCK_KEY) || '[0]');
      if (Array.isArray(saved) && saved.length) setUnlocked(saved);
    } catch (e) { /* ignore */ }
  }, []);

  const unlock = (i) => {
    setUnlocked((prev) => {
      if (prev.includes(i)) return prev;
      const next = [...prev, i];
      localStorage.setItem(UNLOCK_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handlePlay = () => {
    setLevelIndex(0);
    setScreen('playing');
  };
  const handleSelect = (i) => {
    setLevelIndex(i);
    setScreen('playing');
  };
  const handleComplete = () => {
    unlock(levelIndex + 1);
  };
  const handleNext = () => {
    const next = levelIndex + 1;
    if (unlocked.includes(next)) {
      setLevelIndex(next);
      setScreen('playing');
    } else {
      setScreen('menu');
    }
  };
  const toggleMute = () => {
    setMuted((m) => {
      audio.init();
      audio.setMuted(!m);
      return !m;
    });
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {screen === 'menu' && (
        <MainMenu
          onPlay={handlePlay}
          onLevelSelect={() => setScreen('levelselect')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'levelselect' && (
        <LevelSelect unlocked={unlocked} onSelect={handleSelect} onBack={() => setScreen('menu')} />
      )}
      {screen === 'settings' && (
        <Settings muted={muted} onToggleMute={toggleMute} onBack={() => setScreen('menu')} />
      )}
      {screen === 'playing' && (
        <GameCanvas
          key={levelIndex}
          levelIndex={levelIndex}
          onExitToMenu={() => setScreen('menu')}
          onNextLevel={handleNext}
          onComplete={handleComplete}
          nextUnlocked={unlocked.includes(levelIndex + 1)}
        />
      )}
    </div>
  );
}