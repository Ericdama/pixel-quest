// Simple localStorage-backed top-5 leaderboard for Pixel Quest.
const LB_KEY = 'pixelquest_leaderboard';

export function getLeaderboard() {
  try {
    const data = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

// Submit a score. Returns the player's overall rank (1-based) and the top-5 list.
// entry: { score, level, coins, time }
export function submitScore(entry) {
  const list = getLeaderboard();
  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const enriched = { ...entry, id, date: new Date().toISOString() };
  list.push(enriched);
  list.sort((a, b) => b.score - a.score || a.time - b.time);
  const overallRank = list.findIndex((e) => e.id === id) + 1;
  const top = list.slice(0, 5);
  localStorage.setItem(LB_KEY, JSON.stringify(top));
  return { rank: overallRank, leaderboard: top, entryId: id, madeTop: overallRank <= 5 };
}