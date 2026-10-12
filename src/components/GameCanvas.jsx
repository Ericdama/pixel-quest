import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, VIEW_W, VIEW_H } from '@/game/engine';
import { getLevel } from '@/game/levels';
import { audio } from '@/game/audio';
import MobileControls from '@/components/MobileControls';
import Leaderboard from '@/components/Leaderboard';
import ShareScore from '@/components/ShareScore';
import { submitScore } from '@/game/leaderboard';

export default function GameCanvas({ levelIndex, onExitToMenu, onNextLevel, nextUnlocked, onComplete }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [hud, setHud] = useState({ score: 0, coins: 0, lives: 3, level: '', time: 0, powered: false, powerTime: 0 });
  const [overlay, setOverlay] = useState('none'); // 'none' | 'pause' | 'gameover' | 'complete'
  const [completeData, setCompleteData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [lbResult, setLbResult] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new GameEngine(canvas, {
      onHud: (h) => setHud(h),
      onEsc: () => {
        if (overlay === 'none') {
          engine.setPaused(true);
          setOverlay('pause');
          audio.click();
        }
      },
      onComplete: (data) => {
        setCompleteData(data);
        const lvl = getLevel(levelIndex);
        const res = submitScore({ score: data.score, coins: data.coins, time: data.time, level: lvl.name });
        setLbResult(res);
        setOverlay('complete');
        onComplete?.(data);
      },
      onGameOver: (data) => {
        setGameOverData(data);
        setOverlay('gameover');
      },
    });
    engineRef.current = engine;
    engine.loadLevel(getLevel(levelIndex), { lives: 3, coins: 0, score: 0 });
    engine.attachInput();
    engine.start();
    audio.init();
    audio.resume();

    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  const resume = () => {
    setOverlay('none');
    engineRef.current?.setPaused(false);
    audio.click();
  };
  const restart = () => {
    audio.click();
    engineRef.current?.destroy();
    const engine = new GameEngine(canvasRef.current, {
      onHud: (h) => setHud(h),
      onEsc: () => { if (overlay === 'none') { engine.setPaused(true); setOverlay('pause'); } },
      onComplete: (data) => {
        setCompleteData(data);
        const lvl = getLevel(levelIndex);
        const res = submitScore({ score: data.score, coins: data.coins, time: data.time, level: lvl.name });
        setLbResult(res);
        setOverlay('complete');
        onComplete?.(data);
      },
      onGameOver: (data) => { setGameOverData(data); setOverlay('gameover'); },
    });
    engineRef.current = engine;
    engine.loadLevel(getLevel(levelIndex), { lives: 3, coins: 0, score: 0 });
    engine.attachInput();
    engine.start();
    setOverlay('none');
    setLbResult(null);
  };
  const goMenu = () => {
    audio.click();
    engineRef.current?.destroy();
    onExitToMenu();
  };
  const nextLevel = () => {
    audio.click();
    onNextLevel();
  };

  const press = (action, val) => (e) => {
    e.preventDefault();
    engineRef.current?.setInput(action, val);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black select-none">
      <div className="relative" style={{ width: '100%', maxWidth: '900px', aspectRatio: `${VIEW_W}/${VIEW_H}` }}>
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          className="w-full h-full block"
          style={{ imageRendering: 'pixelated', touchAction: 'none' }}
        />

        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex items-center justify-between pointer-events-none font-mono text-white"
          style={{ textShadow: '2px 2px 0 #1a1a2a' }}>
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-lg">
            <span className="bg-black/40 px-2 py-1 rounded">SCORE {hud.score.toString().padStart(5, '0')}</span>
            <span className="bg-black/40 px-2 py-1 rounded flex items-center gap-1">
              <span className="text-yellow-400">●</span>{hud.coins}
            </span>
          </div>
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-lg items-center">
            {hud.powered && (
              <span className="bg-yellow-500/70 text-black px-2 py-1 rounded animate-pulse">★ {hud.powerTime}s</span>
            )}
            {hud.shield && (
              <span className="bg-cyan-400/70 text-black px-2 py-1 rounded animate-pulse">SHIELD</span>
            )}
            <span className="bg-black/40 px-2 py-1 rounded">♥ {hud.lives}</span>
            <span className="bg-black/40 px-2 py-1 rounded hidden sm:inline">{hud.level}</span>
            <span className="bg-black/40 px-2 py-1 rounded">{hud.time}s</span>
            <button
              className="pointer-events-auto bg-black/50 hover:bg-black/70 px-2 py-1 rounded border border-white/30"
              onClick={() => { engineRef.current?.setPaused(true); setOverlay('pause'); audio.click(); }}
            >II</button>
          </div>
        </div>

        {/* Mobile controls */}
        {isMobile && overlay === 'none' && (
          <MobileControls press={press} />
        )}

        {/* Pause overlay */}
        {overlay === 'pause' && (
          <Overlay>
            <h2 className="text-3xl mb-6 text-yellow-300" style={{ textShadow: '3px 3px 0 #000' }}>PAUSED</h2>
            <MenuButton onClick={resume}>Resume</MenuButton>
            <MenuButton onClick={restart}>Restart Level</MenuButton>
            <MenuButton onClick={goMenu}>Main Menu</MenuButton>
          </Overlay>
        )}

        {/* Game Over */}
        {overlay === 'gameover' && (
          <Overlay>
            <h2 className="text-4xl mb-2 text-red-400" style={{ textShadow: '3px 3px 0 #000' }}>GAME OVER</h2>
            <div className="mb-6 font-mono text-white text-sm space-y-1">
              <p>SCORE: {gameOverData?.score}</p>
              <p>COINS: {gameOverData?.coins}</p>
            </div>
            <MenuButton onClick={restart}>Restart Level</MenuButton>
            <MenuButton onClick={goMenu}>Main Menu</MenuButton>
          </Overlay>
        )}

        {/* Level Complete */}
        {overlay === 'complete' && (
          <Overlay>
            <h2 className="text-4xl mb-2 text-green-300" style={{ textShadow: '3px 3px 0 #000' }}>LEVEL CLEAR!</h2>
            <div className="mb-6 font-mono text-white text-sm space-y-1">
              <p>SCORE: {completeData?.score}</p>
              <p>COINS: {completeData?.coins}</p>
              <p>TIME: {completeData?.time}s</p>
            </div>
            <Leaderboard result={lbResult} />
            <ShareScore
              score={completeData?.score}
              coins={completeData?.coins}
              time={completeData?.time}
              levelName={getLevel(levelIndex).name}
            />
            {nextUnlocked ? (
              <MenuButton onClick={nextLevel}>Continue</MenuButton>
            ) : (
              <MenuButton onClick={goMenu}>Main Menu</MenuButton>
            )}
          </Overlay>
        )}
      </div>
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 font-mono">
      {children}
    </div>
  );
}

function MenuButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="my-1 px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded border-b-4 border-yellow-600 active:translate-y-0.5 transition-all text-sm sm:text-base w-44"
    >
      {children}
    </button>
  );
}