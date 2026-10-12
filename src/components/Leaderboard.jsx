import React from 'react';

// Renders the top-5 leaderboard and highlights the player's just-submitted entry.
// Props: { result } where result = { rank, leaderboard, entryId, madeTop }
export default function Leaderboard({ result }) {
  if (!result) return null;
  const { leaderboard, entryId, rank, madeTop } = result;

  return (
    <div className="w-full max-w-xs mx-auto mb-5">
      <h3 className="text-center text-yellow-300 text-sm mb-2 tracking-wider" style={{ textShadow: '2px 2px 0 #000' }}>
        ★ TOP SCORES ★
      </h3>
      <div className="bg-black/50 rounded border border-white/20 divide-y divide-white/10">
        {leaderboard.length === 0 && (
          <div className="px-3 py-2 text-white/50 text-xs text-center">No scores yet</div>
        )}
        {leaderboard.map((e, i) => {
          const isYou = e.id === entryId;
          return (
            <div
              key={e.id}
              className={`px-3 py-1.5 flex items-center justify-between text-xs font-mono ${
                isYou ? 'bg-yellow-400/30 text-yellow-200' : 'text-white/80'
              }`}
            >
              <span className="w-5 text-center font-bold">{i + 1}</span>
              <span className="flex-1 text-left px-2 truncate">{e.level}</span>
              <span className="text-right">{e.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
      <p className="text-center mt-2 text-white text-sm font-mono" style={{ textShadow: '2px 2px 0 #000' }}>
        {madeTop ? (
          <span className="text-green-300">YOUR RANK: #{rank}</span>
        ) : (
          <span className="text-white/70">YOUR RANK: #{rank} — keep trying!</span>
        )}
      </p>
    </div>
  );
}