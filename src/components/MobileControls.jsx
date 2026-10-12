import React from 'react';

// On-screen touch controls for mobile. Buttons are large and placed at the
// bottom corners so they don't cover the gameplay area.
export default function MobileControls({ press }) {
  const btn =
    'w-16 h-16 rounded-full bg-white/25 active:bg-white/50 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold select-none touch-none';
  const handlers = (action) => ({
    onTouchStart: press(action, true),
    onTouchEnd: press(action, false),
    onTouchCancel: press(action, false),
    onMouseDown: press(action, true),
    onMouseUp: press(action, false),
    onMouseLeave: press(action, false),
    onContextMenu: (e) => e.preventDefault(),
  });
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between pointer-events-none">
      {/* D-pad left/right */}
      <div className="flex gap-3 pointer-events-auto">
        <button className={btn} aria-label="Move left" {...handlers('left')}>◀</button>
        <button className={btn} aria-label="Move right" {...handlers('right')}>▶</button>
      </div>
      {/* Jump */}
      <div className="pointer-events-auto">
        <button
          className="w-20 h-20 rounded-full bg-yellow-400/70 active:bg-yellow-300 border-2 border-yellow-200 flex items-center justify-center text-black font-bold text-lg select-none touch-none"
          aria-label="Jump"
          {...handlers('jump')}
        >JUMP</button>
      </div>
    </div>
  );
}