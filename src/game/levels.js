// Level definitions for Pixel Quest.
// Tile chars: ' ' empty, '#' ground, 'x' stone platform, 'B' brick (breakable),
// '?' mystery block, '!' used mystery block, 'o' coin (parsed to object).
// Enemies, powerups, moving platforms, checkpoint, flag are explicit objects.

export const TILE = 32;

function buildLevel1() {
  const W = 170;
  const H = 15;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));

  const set = (r, c, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) grid[r][c] = ch; };
  const fillRow = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, '#'); set(13, c, '#'); set(14, c, '#'); } };
  const coin = (r, c) => set(r, c, 'o');
  const coins = (r, c1, c2) => { for (let c = c1; c <= c2; c++) set(r, c, 'o'); };

  // --- Ground segments with gaps ---
  ground(0, 24);
  ground(28, 50);
  ground(54, 78);
  ground(82, 104);
  ground(108, 132);
  ground(136, 169);
  // gaps: 25-27, 51-53, 79-81, 105-107, 133-135

  // --- Section 1: Safe intro (0-24) ---
  coins(9, 4, 8);
  set(8, 6, '?');
  set(8, 10, 'B');
  set(8, 11, 'B');
  set(8, 12, 'B');

  // --- Section 2: Basic platforming (28-50) ---
  // elevated stone platforms
  fillRow(9, 30, 33, 'x');
  coins(8, 30, 33);
  set(8, 36, '?');
  set(8, 37, 'B');
  set(8, 38, 'B');
  set(8, 39, '?');
  fillRow(8, 42, 45, 'x');
  coins(7, 42, 45);

  // --- Section 3: First enemy area (46-50) ---
  // enemy placed explicitly below

  // --- Section 4: Coin collection (54-78) ---
  fillRow(9, 56, 60, 'x');
  coins(8, 56, 60);
  fillRow(7, 63, 67, 'x');
  coins(6, 63, 67);
  fillRow(9, 70, 74, 'x');
  coins(8, 70, 74);
  set(8, 76, '?');
  set(8, 77, 'B');

  // --- Section 5: Gaps (79-81) with helper platforms ---
  fillRow(10, 80, 80, 'x');

  // --- Section 6: Moving platform section (82-104) ---
  fillRow(8, 86, 88, 'x');
  coins(7, 86, 88);
  fillRow(8, 94, 96, 'x');
  coins(7, 94, 96);
  set(8, 100, '?');
  set(8, 101, 'B');
  set(8, 102, 'B');

  // --- Section 7: More enemies (108-132) ---
  fillRow(9, 110, 113, 'x');
  coins(8, 110, 113);
  fillRow(7, 116, 119, 'x');
  coins(6, 116, 119);
  fillRow(9, 122, 125, 'x');
  coins(8, 122, 125);
  set(8, 128, '?');

  // --- Section 8: Final challenge (136-160) ---
  fillRow(9, 138, 140, 'x');
  fillRow(7, 143, 145, 'x');
  fillRow(9, 148, 150, 'x');
  coins(6, 143, 145);
  set(8, 152, '?');
  set(8, 153, 'B');
  set(8, 154, 'B');
  fillRow(9, 156, 158, 'x');
  coins(8, 156, 158);

  // --- Explicit objects ---
  const enemies = [
    { x: 14 * TILE, y: 12 * TILE - 28, type: 'walker' },     // first enemy (section 3)
    { x: 32 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 44 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 60 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 72 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 90 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 112 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 118 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 124 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 140 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 150 * TILE, y: 12 * TILE - 28, type: 'walker' },
  ];

  const powerups = [
    { x: 46 * TILE, y: 8 * TILE, type: 'gleam' }, // above ground, collectible floating
  ];

  // Moving platforms: {x,y,width,dir(1/-1),range(px),speed}
  const movingPlatforms = [
    { x: 80 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.2 }, // over gap 79-81
    { x: 90 * TILE, y: 9 * TILE, width: 2 * TILE, dir: 1, range: 96, speed: 1.6 },  // section 6
    { x: 105 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.4 }, // over gap 105-107
    { x: 133 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 }, // over gap 133-135
  ];

  const checkpoint = { x: 84 * TILE, y: 12 * TILE };
  const flag = { x: 164 * TILE, y: 12 * TILE };
  const playerStart = { x: 2 * TILE, y: 10 * TILE };

  return {
    name: 'Greenwood Grove',
    subtitle: 'Level 1',
    width: W,
    height: H,
    grid,
    enemies,
    powerups,
    movingPlatforms,
    checkpoint,
    flag,
    playerStart,
  };
}

// Level 2 — Frostbite Falls: icy theme with slippery ice, snow crystals, flyers.
function buildLevel2() {
  const W = 170;
  const H = 15;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));
  const set = (r, c, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) grid[r][c] = ch; };
  const fillRow = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, 'i'); set(13, c, 'i'); set(14, c, 'i'); } };
  const crystals = (r, c1, c2) => { for (let c = c1; c <= c2; c++) set(r, c, 's'); };

  // ground segments (ice) with gaps
  ground(0, 22);
  ground(26, 46);
  ground(50, 70);
  ground(74, 96);
  ground(100, 120);
  ground(124, 169);
  // gaps: 23-25, 47-49, 71-73, 97-99, 121-123

  // Section 1: intro (0-22)
  crystals(9, 4, 9);
  set(8, 6, '?');
  fillRow(9, 14, 17, 'i');
  crystals(8, 14, 17);

  // Section 2: slippery platforms (26-46)
  fillRow(9, 28, 31, 'i');
  crystals(8, 28, 31);
  set(8, 34, '?');
  set(8, 35, 'B');
  fillRow(8, 38, 41, 'i');
  crystals(7, 38, 41);

  // Section 3: first enemies (50-70)
  fillRow(9, 52, 55, 'i');
  crystals(8, 52, 55);
  fillRow(7, 58, 61, 'i');
  crystals(6, 58, 61);
  set(8, 64, '?');
  set(8, 65, 'B');
  fillRow(9, 67, 69, 'i');

  // Section 4: crystal collection + flyers (74-96)
  fillRow(8, 76, 79, 'i');
  crystals(7, 76, 79);
  fillRow(6, 82, 85, 'i');
  crystals(5, 82, 85);
  fillRow(8, 88, 91, 'i');
  crystals(7, 88, 91);
  set(8, 94, '?');

  // Section 5: gaps + moving platforms (100-120)
  fillRow(9, 102, 105, 'i');
  crystals(8, 102, 105);
  fillRow(7, 108, 111, 'i');
  crystals(6, 108, 111);
  fillRow(9, 114, 117, 'i');
  set(8, 118, '?');

  // Section 6: final challenge (124-160)
  fillRow(9, 126, 128, 'i');
  fillRow(7, 131, 133, 'i');
  fillRow(9, 136, 138, 'i');
  crystals(6, 131, 133);
  set(8, 141, '?');
  set(8, 142, 'B');
  fillRow(9, 145, 147, 'i');
  crystals(8, 145, 147);
  fillRow(7, 150, 152, 'i');
  crystals(6, 150, 152);

  const enemies = [
    { x: 16 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 30 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 40 * TILE, y: 7 * TILE, type: 'flyer', range: 80, speed: 1.4 },
    { x: 56 * TILE, y: 6 * TILE, type: 'flyer', range: 96, speed: 1.6 },
    { x: 78 * TILE, y: 5 * TILE, type: 'flyer', range: 80, speed: 1.5 },
    { x: 84 * TILE, y: 4 * TILE, type: 'flyer', range: 96, speed: 1.7 },
    { x: 104 * TILE, y: 6 * TILE, type: 'flyer', range: 80, speed: 1.5 },
    { x: 116 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.8 },
    { x: 130 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 140 * TILE, y: 6 * TILE, type: 'flyer', range: 80, speed: 1.6 },
    { x: 148 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 155 * TILE, y: 5 * TILE, type: 'flyer', range: 64, speed: 1.5 },
  ];

  const powerups = [
    { x: 64 * TILE, y: 6 * TILE, type: 'gleam' },
  ];

  const movingPlatforms = [
    { x: 47 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.4 },
    { x: 71 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
    { x: 97 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 121 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
  ];

  const checkpoint = { x: 96 * TILE, y: 12 * TILE };
  const flag = { x: 164 * TILE, y: 12 * TILE };
  const playerStart = { x: 2 * TILE, y: 10 * TILE };

  return {
    name: 'Frostbite Falls',
    subtitle: 'Level 2',
    theme: 'ice',
    width: W,
    height: H,
    grid,
    enemies,
    powerups,
    movingPlatforms,
    checkpoint,
    flag,
    playerStart,
  };
}

// Level 3 — Ember Caverns: lava theme with deadly lava pits, fireball enemies, embers.
function buildLevel3() {
  const W = 170;
  const H = 15;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));
  const set = (r, c, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) grid[r][c] = ch; };
  const fillRow = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, 'r'); set(13, c, 'r'); set(14, c, 'r'); } };
  const lava = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, 'L'); set(13, c, 'L'); set(14, c, 'L'); } };
  const embers = (r, c1, c2) => { for (let c = c1; c <= c2; c++) set(r, c, 'e'); };

  // ground segments separated by lava lakes
  ground(0, 23);
  lava(24, 27);
  ground(28, 48);
  lava(49, 53);
  ground(54, 74);
  lava(75, 79);
  ground(80, 100);
  lava(101, 105);
  ground(106, 126);
  lava(127, 131);
  ground(132, 169);

  // Section 1: intro (0-22)
  embers(9, 4, 9);
  set(8, 6, '?');
  fillRow(9, 14, 17, 'x');
  embers(8, 14, 17);
  set(8, 20, 'B');

  // Section 2: platforms over lava (28-48)
  fillRow(9, 30, 33, 'x');
  embers(8, 30, 33);
  set(8, 36, '?');
  set(8, 37, 'B');
  fillRow(8, 40, 43, 'x');
  embers(7, 40, 43);
  fillRow(9, 46, 48, 'x');

  // Section 3: ember collection + fireballs (54-74)
  fillRow(9, 56, 59, 'x');
  embers(8, 56, 59);
  fillRow(7, 62, 65, 'x');
  embers(6, 62, 65);
  set(8, 68, '?');
  fillRow(9, 70, 73, 'x');
  embers(8, 70, 73);

  // Section 4: moving platforms over lava (80-100)
  fillRow(9, 82, 84, 'x');
  embers(8, 82, 84);
  fillRow(7, 88, 90, 'x');
  embers(6, 88, 90);
  set(8, 94, '?');
  set(8, 95, 'B');
  fillRow(9, 97, 99, 'x');

  // Section 5: enemies (106-126)
  fillRow(9, 108, 111, 'x');
  embers(8, 108, 111);
  fillRow(7, 114, 117, 'x');
  embers(6, 114, 117);
  fillRow(9, 120, 123, 'x');
  set(8, 125, '?');

  // Section 6: final challenge (132-169)
  fillRow(9, 134, 136, 'x');
  fillRow(7, 139, 141, 'x');
  fillRow(9, 144, 146, 'x');
  embers(6, 139, 141);
  set(8, 149, '?');
  set(8, 150, 'B');
  fillRow(9, 153, 155, 'x');
  embers(8, 153, 155);
  fillRow(7, 158, 160, 'x');
  embers(6, 158, 160);
  fillRow(9, 163, 165, 'x');

  const enemies = [
    { x: 16 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 32 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 42 * TILE, y: 6 * TILE, type: 'fireball', range: 80, speed: 1.5 },
    { x: 58 * TILE, y: 5 * TILE, type: 'fireball', range: 96, speed: 1.7 },
    { x: 72 * TILE, y: 4 * TILE, type: 'fireball', range: 80, speed: 1.6 },
    { x: 84 * TILE, y: 5 * TILE, type: 'fireball', range: 96, speed: 1.8 },
    { x: 96 * TILE, y: 4 * TILE, type: 'fireball', range: 80, speed: 1.5 },
    { x: 110 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 116 * TILE, y: 5 * TILE, type: 'fireball', range: 96, speed: 1.7 },
    { x: 122 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 150 * TILE, y: 10 * TILE, type: 'boss', w: 72, h: 64, hp: 5, range: 12 * TILE, speed: 1.0 },
  ];

  const powerups = [
    { x: 68 * TILE, y: 6 * TILE, type: 'gleam' },
    { x: 145 * TILE, y: 7 * TILE, type: 'shield' },
  ];

  const movingPlatforms = [
    { x: 49 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
    { x: 75 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 101 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.7 },
    { x: 127 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
  ];

  const checkpoint = { x: 134 * TILE, y: 12 * TILE };
  const flag = { x: 167 * TILE, y: 12 * TILE };
  const playerStart = { x: 2 * TILE, y: 10 * TILE };

  return {
    name: 'Ember Caverns',
    subtitle: 'Level 3',
    theme: 'lava',
    width: W,
    height: H,
    grid,
    enemies,
    powerups,
    movingPlatforms,
    checkpoint,
    flag,
    playerStart,
  };
}

// Level 4 — Storm Spires: sky theme with floating cloud platforms and bottomless voids.
function buildLevel4() {
  const W = 170;
  const H = 15;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));
  const set = (r, c, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) grid[r][c] = ch; };
  const fillRow = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, 'c'); set(13, c, 'c'); set(14, c, 'c'); } };
  const coins = (r, c1, c2) => { for (let c = c1; c <= c2; c++) set(r, c, 'o'); };

  ground(0, 20);
  ground(25, 45);
  ground(50, 70);
  ground(75, 95);
  ground(100, 120);
  ground(125, 169);

  // Section 1: intro (0-20)
  coins(9, 3, 8);
  set(8, 6, '?');
  fillRow(9, 12, 15, 'x');
  coins(8, 12, 15);
  set(8, 18, 'B');

  // Section 2: platforms (25-45)
  fillRow(9, 27, 30, 'x');
  coins(8, 27, 30);
  set(8, 33, '?');
  set(8, 34, 'B');
  fillRow(8, 37, 40, 'x');
  coins(7, 37, 40);
  fillRow(9, 43, 45, 'x');

  // Section 3: flyers (50-70)
  fillRow(9, 52, 55, 'x');
  coins(8, 52, 55);
  fillRow(7, 58, 61, 'x');
  coins(6, 58, 61);
  set(8, 64, '?');
  fillRow(9, 67, 70, 'x');
  coins(8, 67, 70);

  // Section 4: moving platforms (75-95)
  fillRow(9, 77, 80, 'x');
  coins(8, 77, 80);
  fillRow(7, 83, 86, 'x');
  coins(6, 83, 86);
  set(8, 89, '?');
  set(8, 90, 'B');
  fillRow(9, 92, 95, 'x');

  // Section 5: enemies (100-120)
  fillRow(9, 102, 105, 'x');
  coins(8, 102, 105);
  fillRow(7, 108, 111, 'x');
  coins(6, 108, 111);
  fillRow(9, 114, 117, 'x');
  set(8, 118, '?');

  // Section 6: final (125-169)
  fillRow(9, 127, 129, 'x');
  fillRow(7, 132, 134, 'x');
  fillRow(9, 137, 139, 'x');
  coins(6, 132, 134);
  set(8, 142, '?');
  set(8, 143, 'B');
  fillRow(9, 146, 148, 'x');
  coins(8, 146, 148);
  fillRow(7, 151, 153, 'x');
  coins(6, 151, 153);
  fillRow(9, 156, 158, 'x');

  const enemies = [
    { x: 14 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 28 * TILE, y: 6 * TILE, type: 'flyer', range: 80, speed: 1.5 },
    { x: 40 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 54 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.6 },
    { x: 62 * TILE, y: 4 * TILE, type: 'flyer', range: 80, speed: 1.7 },
    { x: 78 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.6 },
    { x: 88 * TILE, y: 4 * TILE, type: 'flyer', range: 80, speed: 1.8 },
    { x: 104 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 110 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.7 },
    { x: 116 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 130 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 140 * TILE, y: 5 * TILE, type: 'flyer', range: 80, speed: 1.6 },
    { x: 150 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 158 * TILE, y: 5 * TILE, type: 'flyer', range: 64, speed: 1.5 },
  ];

  const powerups = [
    { x: 64 * TILE, y: 6 * TILE, type: 'gleam' },
  ];

  const movingPlatforms = [
    { x: 21 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
    { x: 46 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 71 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
    { x: 96 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 121 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.5 },
  ];

  const checkpoint = { x: 80 * TILE, y: 12 * TILE };
  const flag = { x: 165 * TILE, y: 12 * TILE };
  const playerStart = { x: 2 * TILE, y: 10 * TILE };

  return {
    name: 'Storm Spires',
    subtitle: 'Level 4',
    theme: 'sky',
    width: W,
    height: H,
    grid,
    enemies,
    powerups,
    movingPlatforms,
    checkpoint,
    flag,
    playerStart,
  };
}

// Level 5 — Shadow Citadel: dark theme with the flying Shadow Lord final boss.
function buildLevel5() {
  const W = 170;
  const H = 15;
  const grid = Array.from({ length: H }, () => new Array(W).fill(' '));
  const set = (r, c, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) grid[r][c] = ch; };
  const fillRow = (r, c1, c2, ch) => { for (let c = c1; c <= c2; c++) set(r, c, ch); };
  const ground = (c1, c2) => { for (let c = c1; c <= c2; c++) { set(12, c, 'd'); set(13, c, 'd'); set(14, c, 'd'); } };
  const coins = (r, c1, c2) => { for (let c = c1; c <= c2; c++) set(r, c, 'o'); };

  ground(0, 22);
  ground(27, 48);
  ground(53, 74);
  ground(79, 100);
  ground(105, 126);
  ground(131, 169);

  // Section 1: intro (0-22)
  coins(9, 4, 9);
  set(8, 6, '?');
  fillRow(9, 14, 17, 'x');
  coins(8, 14, 17);
  set(8, 20, 'B');

  // Section 2: platforms (27-48)
  fillRow(9, 29, 32, 'x');
  coins(8, 29, 32);
  set(8, 35, '?');
  set(8, 36, 'B');
  fillRow(8, 39, 42, 'x');
  coins(7, 39, 42);
  fillRow(9, 45, 48, 'x');

  // Section 3: enemies (53-74)
  fillRow(9, 55, 58, 'x');
  coins(8, 55, 58);
  fillRow(7, 61, 64, 'x');
  coins(6, 61, 64);
  set(8, 67, '?');
  fillRow(9, 70, 73, 'x');
  coins(8, 70, 73);

  // Section 4: moving platforms (79-100)
  fillRow(9, 81, 84, 'x');
  coins(8, 81, 84);
  fillRow(7, 87, 90, 'x');
  coins(6, 87, 90);
  set(8, 93, '?');
  set(8, 94, 'B');
  fillRow(9, 97, 100, 'x');

  // Section 5: enemies (105-126)
  fillRow(9, 107, 110, 'x');
  coins(8, 107, 110);
  fillRow(7, 113, 116, 'x');
  coins(6, 113, 116);
  fillRow(9, 119, 122, 'x');
  set(8, 124, '?');

  // Section 6: boss arena (131-169) — platforms to reach the flying boss
  fillRow(9, 138, 140, 'x');
  fillRow(7, 145, 147, 'x');
  fillRow(9, 152, 154, 'x');
  fillRow(7, 158, 160, 'x');

  const enemies = [
    { x: 16 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 30 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 40 * TILE, y: 6 * TILE, type: 'flyer', range: 80, speed: 1.6 },
    { x: 56 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.8 },
    { x: 72 * TILE, y: 4 * TILE, type: 'flyer', range: 80, speed: 1.7 },
    { x: 82 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.9 },
    { x: 94 * TILE, y: 4 * TILE, type: 'flyer', range: 80, speed: 1.6 },
    { x: 108 * TILE, y: 12 * TILE - 28, type: 'walker' },
    { x: 114 * TILE, y: 5 * TILE, type: 'flyer', range: 96, speed: 1.8 },
    { x: 120 * TILE, y: 12 * TILE - 28, type: 'walker' },
    // Shadow Lord — final boss: flying, spread shots, 6 HP
    { x: 155 * TILE, y: 6 * TILE, type: 'shadowlord', w: 64, h: 64, hp: 6, range: 10 * TILE, speed: 1.2 },
  ];

  const powerups = [
    { x: 67 * TILE, y: 6 * TILE, type: 'gleam' },
    { x: 135 * TILE, y: 7 * TILE, type: 'shield' },
  ];

  const movingPlatforms = [
    { x: 23 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 49 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.7 },
    { x: 75 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
    { x: 101 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.7 },
    { x: 127 * TILE, y: 10 * TILE, width: 2 * TILE, dir: 1, range: 64, speed: 1.6 },
  ];

  const checkpoint = { x: 105 * TILE, y: 12 * TILE };
  const flag = { x: 167 * TILE, y: 12 * TILE };
  const playerStart = { x: 2 * TILE, y: 10 * TILE };

  return {
    name: 'Shadow Citadel',
    subtitle: 'Level 5',
    theme: 'dark',
    width: W,
    height: H,
    grid,
    enemies,
    powerups,
    movingPlatforms,
    checkpoint,
    flag,
    playerStart,
  };
}

const builders = [buildLevel1, buildLevel2, buildLevel3, buildLevel4, buildLevel5];

export function getLevel(index) {
  const b = builders[index] || builders[0];
  return b();
}

export const LEVEL_COUNT = builders.length;