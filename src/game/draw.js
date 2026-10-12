// Procedural pixel-art rendering. All art is drawn with blocky shapes on canvas
// (imageSmoothing disabled) for an authentic retro look without external assets.
import { TILE } from './levels';

export const PALETTE = {
  sky1: '#5fb8e8',
  sky2: '#a8e0f0',
  sun: '#ffe066',
  cloud: '#ffffff',
  hillFar: '#7fc88a',
  hillNear: '#5fbf6f',
  treeTrunk: '#7a4a28',
  treeLeaves: '#3fae4f',
  grass: '#5fbf4f',
  dirt: '#9c5a30',
  dirtDark: '#6e3e1f',
  stone: '#8a8a9a',
  stoneDark: '#5a5a6a',
  brick: '#c87850',
  brickDark: '#8a4a2a',
  mystery: '#e8b830',
  mysteryDark: '#a87810',
  used: '#9a8a6a',
  coin: '#ffd633',
  coinDark: '#cc9a00',
  flagPole: '#cccccc',
  flagCloth: '#e8463a',
  playerSkin: '#f4c8a0',
  playerSkinShade: '#d89a70',
  playerCap: '#3fae4f',
  playerCapShade: '#2a7a35',
  playerTunic: '#3b6fd6',
  playerTunicShade: '#2a4fa0',
  playerBoots: '#7a4a28',
  playerHair: '#6a3a18',
  white: '#ffffff',
  black: '#1a1a2a',
  red: '#e8463a',
  enemyBody: '#c8403a',
  enemyBodyShade: '#8a2a25',
  enemyFoot: '#3a2a2a',
  gleam: '#ffe066',
  gleam2: '#ff9a3a',
};

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

// Icy/snowy background for ice-themed levels.
function drawIceBackground(ctx, cam) {
  const W = 800, H = 480;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#9fd8f0');
  g.addColorStop(1, '#e8f6ff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // pale sun
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.arc(W - 110, 70, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // far snowy mountains
  const farOff = -cam * 0.2;
  ctx.fillStyle = '#cfe8f5';
  for (let i = 0; i < 8; i++) {
    const bx = ((i * 240 + farOff) % (W + 240)) - 120;
    ctx.beginPath();
    ctx.moveTo(bx, H - 100);
    ctx.lineTo(bx + 120, H - 260);
    ctx.lineTo(bx + 240, H - 100);
    ctx.closePath();
    ctx.fill();
  }
  // near snow hills
  const nearOff = -cam * 0.4;
  ctx.fillStyle = '#f0fbff';
  for (let i = 0; i < 10; i++) {
    const bx = ((i * 180 + nearOff) % (W + 180)) - 90;
    ctx.beginPath();
    ctx.arc(bx + 90, H - 70, 90, Math.PI, 0);
    ctx.fill();
  }
  // falling snow
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const sx = (((i * 53 + cam * 0.2) % W) + W) % W;
    const sy = (((i * 91 + cam * 0.5) % H) + H) % H;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // snow-capped pines
  const treeOff = -cam * 0.55;
  for (let i = 0; i < 24; i++) {
    const tx = ((i * 90 + treeOff) % (W + 90)) - 45;
    const ty = H - 110;
    px(ctx, tx + 13, ty, 6, 22, '#5a3a28');
    ctx.fillStyle = '#2f7a4f';
    ctx.beginPath();
    ctx.moveTo(tx + 16, ty - 28);
    ctx.lineTo(tx + 2, ty - 4);
    ctx.lineTo(tx + 30, ty - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(tx + 16, ty - 28);
    ctx.lineTo(tx + 6, ty - 10);
    ctx.lineTo(tx + 26, ty - 10);
    ctx.closePath();
    ctx.fill();
  }
}

// Lava/volcano background for fire-themed levels.
function drawLavaBackground(ctx, cam) {
  const W = 800, H = 480;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#2a0a14');
  g.addColorStop(0.6, '#4a1218');
  g.addColorStop(1, '#7a1a14');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // distant cave glow
  const glowOff = -cam * 0.2;
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 280 + glowOff) % (W + 280)) - 140;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ff5a2a';
    ctx.beginPath();
    ctx.arc(bx + 140, H - 60, 120, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // stalactites from ceiling
  const stOff = -cam * 0.5;
  ctx.fillStyle = '#3a1018';
  for (let i = 0; i < 20; i++) {
    const tx = ((i * 100 + stOff) % (W + 100)) - 50;
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    ctx.lineTo(tx + 12, 60 + (i % 3) * 20);
    ctx.lineTo(tx + 24, 0);
    ctx.closePath();
    ctx.fill();
  }
  // floating embers
  for (let i = 0; i < 30; i++) {
    const ex = (((i * 61 + cam * 0.3) % W) + W) % W;
    const ey = (((i * 97 - cam * 0.4) % H) + H) % H;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ff9a3a';
    ctx.fillRect(ex, ey, 2, 2);
  }
  ctx.globalAlpha = 1;
}

// Sky/cloud background for sky-themed levels.
function drawSkyBackground(ctx, cam) {
  const W = 800, H = 480;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a8fd8');
  g.addColorStop(1, '#a8d8f0');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // sun glow
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.arc(W - 110, 70, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // far clouds (parallax)
  const farOff = -cam * 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < 8; i++) {
    const cx = ((i * 240 + farOff) % (W + 240)) - 120;
    const cy = 80 + (i % 3) * 40;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.arc(cx + 30, cy + 6, 24, 0, Math.PI * 2);
    ctx.arc(cx - 26, cy + 8, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // floating islands (parallax)
  const islandOff = -cam * 0.4;
  for (let i = 0; i < 10; i++) {
    const ix = ((i * 200 + islandOff) % (W + 200)) - 100;
    const iy = H - 140 + (i % 2) * 20;
    ctx.fillStyle = '#6acf7a';
    ctx.beginPath();
    ctx.ellipse(ix + 80, iy, 70, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a8a4a';
    ctx.fillRect(ix + 10, iy, 140, 10);
  }
  // birds
  const birdOff = -cam * 0.5;
  ctx.strokeStyle = '#3a3a4a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 300 + birdOff) % (W + 300)) - 150;
    const by = 120 + (i % 2) * 60;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + 6, by - 6, bx + 12, by);
    ctx.quadraticCurveTo(bx + 18, by - 6, bx + 24, by);
    ctx.stroke();
  }
}

// Dark/void background for the final citadel level.
function drawDarkBackground(ctx, cam) {
  const W = 800, H = 480;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a0a1a');
  g.addColorStop(0.6, '#1a0a2a');
  g.addColorStop(1, '#2a0a1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const sx = (((i * 67 + cam * 0.1) % W) + W) % W;
    const sy = (i * 53) % (H - 100);
    ctx.globalAlpha = 0.3 + (i % 3) * 0.2;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // crescent moon
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = '#e8e8f0';
  ctx.beginPath();
  ctx.arc(W - 110, 80, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0a0a1a';
  ctx.beginPath();
  ctx.arc(W - 95, 70, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // dark spires (parallax)
  const spireOff = -cam * 0.3;
  ctx.fillStyle = '#1a0a2a';
  for (let i = 0; i < 12; i++) {
    const sx = ((i * 140 + spireOff) % (W + 140)) - 70;
    const h = 120 + (i % 3) * 40;
    ctx.beginPath();
    ctx.moveTo(sx, H);
    ctx.lineTo(sx + 35, H - h);
    ctx.lineTo(sx + 70, H);
    ctx.closePath();
    ctx.fill();
  }
  // glowing windows
  ctx.fillStyle = '#ff6a3a';
  for (let i = 0; i < 12; i++) {
    const sx = ((i * 140 + spireOff) % (W + 140)) - 70;
    const h = 120 + (i % 3) * 40;
    ctx.globalAlpha = 0.5 + Math.sin(cam * 0.01 + i) * 0.2;
    ctx.fillRect(sx + 28, H - h + 30, 4, 4);
    ctx.fillRect(sx + 32, H - h + 50, 4, 4);
  }
  ctx.globalAlpha = 1;
  // fog
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#6a3a6a';
  for (let i = 0; i < 5; i++) {
    const fx = ((i * 260 - cam * 0.6) % (W + 260)) - 130;
    ctx.beginPath();
    ctx.ellipse(fx + 130, H - 40, 130, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawBackground(ctx, cam, level) {
  if (level.theme === 'ice') { drawIceBackground(ctx, cam); return; }
  if (level.theme === 'lava') { drawLavaBackground(ctx, cam); return; }
  if (level.theme === 'sky') { drawSkyBackground(ctx, cam); return; }
  if (level.theme === 'dark') { drawDarkBackground(ctx, cam); return; }
  const W = 800, H = 480;
  // sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PALETTE.sky1);
  g.addColorStop(1, PALETTE.sky2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sun
  px(ctx, W - 120, 40, 64, 64, PALETTE.sun);
  ctx.globalAlpha = 0.25;
  px(ctx, W - 128, 32, 80, 80, PALETTE.sun);
  ctx.globalAlpha = 1;

  // parallax far hills
  const farOff = -cam * 0.2;
  ctx.fillStyle = PALETTE.hillFar;
  for (let i = 0; i < 8; i++) {
    const bx = ((i * 220 + farOff) % (W + 220)) - 110;
    ctx.beginPath();
    ctx.arc(bx + 110, H - 120, 110, Math.PI, 0);
    ctx.fill();
  }
  // near hills
  const nearOff = -cam * 0.4;
  ctx.fillStyle = PALETTE.hillNear;
  for (let i = 0; i < 10; i++) {
    const bx = ((i * 180 + nearOff) % (W + 180)) - 90;
    ctx.beginPath();
    ctx.arc(bx + 90, H - 80, 90, Math.PI, 0);
    ctx.fill();
  }
  // clouds
  const cloudOff = -cam * 0.15;
  ctx.fillStyle = PALETTE.cloud;
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 260 + cloudOff) % (W + 260)) - 130;
    const cy = 60 + (i % 3) * 30;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.arc(cx + 24, cy + 4, 18, 0, Math.PI * 2);
    ctx.arc(cx - 22, cy + 6, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // distant trees (parallax)
  const treeOff = -cam * 0.55;
  for (let i = 0; i < 24; i++) {
    const tx = ((i * 90 + treeOff) % (W + 90)) - 45;
    const ty = H - 120;
    px(ctx, tx + 12, ty, 8, 24, PALETTE.treeTrunk);
    ctx.fillStyle = PALETTE.treeLeaves;
    ctx.beginPath();
    ctx.arc(tx + 16, ty - 6, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTileShape(ctx, ch, x, y, t) {
  if (ch === '#') {
    // grass-topped ground
    px(ctx, x, y, 32, 32, PALETTE.dirt);
    px(ctx, x, y, 32, 8, PALETTE.grass);
    px(ctx, x, y + 8, 32, 2, '#4aa83f');
    // dirt texture
    px(ctx, x + 4, y + 14, 4, 4, PALETTE.dirtDark);
    px(ctx, x + 20, y + 22, 4, 4, PALETTE.dirtDark);
    px(ctx, x + 12, y + 26, 4, 4, PALETTE.dirtDark);
  } else if (ch === 'x') {
    px(ctx, x, y, 32, 32, PALETTE.stone);
    px(ctx, x, y, 32, 4, '#a0a0b0');
    px(ctx, x, y + 28, 32, 4, PALETTE.stoneDark);
    px(ctx, x + 2, y + 10, 4, 4, PALETTE.stoneDark);
    px(ctx, x + 22, y + 18, 4, 4, PALETTE.stoneDark);
  } else if (ch === 'B') {
    px(ctx, x, y, 32, 32, PALETTE.brick);
    px(ctx, x, y, 32, 3, PALETTE.brickDark);
    px(ctx, x, y + 15, 32, 2, PALETTE.brickDark);
    px(ctx, x + 14, y, 3, 15, PALETTE.brickDark);
    px(ctx, x + 7, y + 17, 3, 15, PALETTE.brickDark);
    px(ctx, x + 22, y + 17, 3, 15, PALETTE.brickDark);
    px(ctx, x, y + 29, 32, 3, PALETTE.brickDark);
  } else if (ch === '?') {
    const pulse = Math.sin(t * 0.006) * 0.5 + 0.5;
    px(ctx, x, y, 32, 32, PALETTE.mystery);
    px(ctx, x, y, 32, 4, PALETTE.mysteryDark);
    px(ctx, x, y + 28, 32, 4, PALETTE.mysteryDark);
    px(ctx, x, y, 4, 32, PALETTE.mysteryDark);
    px(ctx, x + 28, y, 4, 32, PALETTE.mysteryDark);
    ctx.fillStyle = PALETTE.white;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.fillText('?', x + 16, y + 17);
    ctx.globalAlpha = 1;
  } else if (ch === 'i') {
    px(ctx, x, y, 32, 32, '#bfeaf5');
    px(ctx, x, y, 32, 6, '#ffffff');
    px(ctx, x, y + 26, 32, 6, '#9fd0e8');
    px(ctx, x, y, 4, 32, '#d8f2fa');
    px(ctx, x + 28, y, 4, 32, '#9fd0e8');
    px(ctx, x + 8, y + 12, 6, 2, '#9fd0e8');
    px(ctx, x + 18, y + 18, 8, 2, '#9fd0e8');
    px(ctx, x + 6, y + 22, 4, 2, '#9fd0e8');
  } else if (ch === 'r') {
    px(ctx, x, y, 32, 32, '#5a3a3a');
    px(ctx, x, y, 32, 6, '#7a4a3a');
    px(ctx, x, y + 26, 32, 6, '#3a1a1a');
    px(ctx, x + 2, y + 10, 4, 4, '#3a1a1a');
    px(ctx, x + 20, y + 18, 4, 4, '#3a1a1a');
    px(ctx, x + 12, y + 22, 4, 4, '#7a4a3a');
    ctx.globalAlpha = 0.5 + Math.sin(t * 0.01 + x * 0.2) * 0.2;
    px(ctx, x + 6, y + 8, 2, 8, '#ff5a2a');
    px(ctx, x + 22, y + 16, 2, 6, '#ff5a2a');
    ctx.globalAlpha = 1;
  } else if (ch === 'L') {
    const pulse = Math.sin(t * 0.01 + x * 0.1) * 0.3 + 0.7;
    px(ctx, x, y, 32, 32, '#c83020');
    px(ctx, x, y, 32, 10, '#ff5a2a');
    px(ctx, x, y, 6, 32, '#e84a20');
    px(ctx, x + 26, y, 6, 32, '#a82010');
    ctx.globalAlpha = 0.6 * pulse;
    px(ctx, x + 8, y + 12, 4, 4, '#ffb060');
    px(ctx, x + 18, y + 20, 5, 5, '#ffb060');
    ctx.globalAlpha = 1;
  } else if (ch === 'c') {
    px(ctx, x, y, 32, 32, '#f0f8ff');
    px(ctx, x, y, 32, 10, '#ffffff');
    px(ctx, x, y + 26, 32, 6, '#c8d8e8');
    px(ctx, x + 4, y + 14, 6, 4, '#d8e8f8');
    px(ctx, x + 18, y + 18, 8, 4, '#d8e8f8');
  } else if (ch === 'd') {
    px(ctx, x, y, 32, 32, '#2a2a3a');
    px(ctx, x, y, 32, 4, '#3a3a4a');
    px(ctx, x, y + 28, 32, 4, '#1a1a2a');
    px(ctx, x + 2, y + 10, 4, 4, '#1a1a2a');
    px(ctx, x + 20, y + 18, 4, 4, '#1a1a2a');
    px(ctx, x + 12, y + 22, 4, 4, '#3a3a4a');
    ctx.globalAlpha = 0.4 + Math.sin(t * 0.008 + x * 0.1) * 0.2;
    px(ctx, x + 14, y + 12, 4, 4, '#a040ff');
    ctx.globalAlpha = 1;
  } else if (ch === '!') {
    px(ctx, x, y, 32, 32, PALETTE.used);
    px(ctx, x, y, 32, 4, '#6a5a3a');
    px(ctx, x, y + 28, 32, 4, '#6a5a3a');
    px(ctx, x, y, 4, 32, '#6a5a3a');
    px(ctx, x + 28, y, 4, 32, '#6a5a3a');
  }
}

export function drawTiles(ctx, cam, level, t) {
  const startC = Math.max(0, Math.floor(cam / TILE) - 1);
  const endC = Math.min(level.width - 1, Math.ceil((cam + 800) / TILE) + 1);
  for (let r = 0; r < level.height; r++) {
    for (let c = startC; c <= endC; c++) {
      const ch = level.grid[r][c];
      if (ch === ' ' || ch === 'o') continue;
      drawTileShape(ctx, ch, c * TILE - cam, r * TILE, t);
    }
  }
}

export function drawCoin(ctx, coin, cam, t) {
  if (coin.collected) return;
  const x = coin.x - cam;
  const y = coin.y + Math.sin(t * 0.006 + coin.x * 0.05) * 3;
  const w = Math.abs(Math.sin(t * 0.008 + coin.x * 0.1)) * 14 + 4;
  const cx = x + 16;
  px(ctx, cx - w / 2, y, w, 14, PALETTE.coin);
  px(ctx, cx - w / 2, y, w, 3, '#fff0a0');
  px(ctx, cx - w / 2, y + 11, w, 3, PALETTE.coinDark);
  if (w > 8) px(ctx, cx - 1, y + 4, 2, 6, PALETTE.coinDark);
}

// Floating snow crystal collectible (ice levels).
export function drawCrystal(ctx, c, cam, t) {
  if (c.collected) return;
  const x = c.x - cam + 8;
  const y = c.y + 10 + Math.sin(t * 0.005 + c.x * 0.05) * 3;
  const rot = t * 0.003;
  const pulse = Math.sin(t * 0.008) * 0.3 + 0.7;
  ctx.globalAlpha = 0.3 * pulse;
  ctx.fillStyle = '#aef0ff';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#e8fbff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.moveTo(0, 7);
    ctx.lineTo(-3, 10);
    ctx.moveTo(0, 7);
    ctx.lineTo(3, 10);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Flying icy enemy (snow bat) — hovers and bobs, stompable.
export function drawFlyer(ctx, e, cam, t) {
  if (!e.alive) return;
  const x = e.x - cam;
  const y = e.y;
  const w = e.w, h = e.h;
  const flap = Math.sin(t * 0.02) * 6;
  ctx.fillStyle = '#5aa8d8';
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 12);
  ctx.lineTo(x - 8, y + 6 - flap);
  ctx.lineTo(x + 2, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w - 2, y + 12);
  ctx.lineTo(x + w + 8, y + 6 - flap);
  ctx.lineTo(x + w - 2, y + 16);
  ctx.closePath();
  ctx.fill();
  px(ctx, x + 4, y + 4, w - 8, h - 8, '#7ad0f0');
  px(ctx, x + 4, y + 4, w - 8, 3, '#aee8f8');
  px(ctx, x + 7, y + 9, 3, 3, PALETTE.white);
  px(ctx, x + w - 10, y + 9, 3, 3, PALETTE.white);
  px(ctx, x + 8, y + 10, 1, 2, PALETTE.black);
  px(ctx, x + w - 9, y + 10, 1, 2, PALETTE.black);
  px(ctx, x + 10, y + 14, 2, 3, PALETTE.white);
  px(ctx, x + w - 12, y + 14, 2, 3, PALETTE.white);
}

// Flying fireball enemy (lava levels) — hovers and bobs, stompable.
export function drawFireball(ctx, e, cam, t) {
  if (!e.alive) return;
  const x = e.x - cam;
  const y = e.y;
  const w = e.w, h = e.h;
  const pulse = Math.sin(t * 0.02) * 0.3 + 0.7;
  ctx.globalAlpha = 0.4 * pulse;
  ctx.fillStyle = '#ff5a2a';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  px(ctx, x + 4, y + 4, w - 8, h - 8, '#ff7a2a');
  px(ctx, x + 4, y + 4, w - 8, 4, '#ffb060');
  px(ctx, x + 6, y + 8, 4, 4, '#ffe0a0');
  px(ctx, x + w - 10, y + 8, 4, 4, '#ffe0a0');
  const flick = Math.sin(t * 0.03) * 3;
  ctx.fillStyle = '#ffd060';
  ctx.beginPath();
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 10, y - 8 - flick);
  ctx.lineTo(x + 14, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff5a2a';
  ctx.beginPath();
  ctx.moveTo(x + w - 14, y);
  ctx.lineTo(x + w - 10, y - 6 + flick);
  ctx.lineTo(x + w - 6, y);
  ctx.closePath();
  ctx.fill();
}

// Floating ember collectible (lava levels).
export function drawEmber(ctx, c, cam, t) {
  if (c.collected) return;
  const x = c.x - cam + 8;
  const y = c.y + 10 + Math.sin(t * 0.005 + c.x * 0.05) * 3;
  const pulse = Math.sin(t * 0.01) * 0.3 + 0.7;
  ctx.globalAlpha = 0.35 * pulse;
  ctx.fillStyle = '#ff7a2a';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ff9a3a';
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 8, y + 2);
  ctx.lineTo(x + 5, y + 10);
  ctx.lineTo(x - 5, y + 10);
  ctx.lineTo(x - 8, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd060';
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x + 4, y + 2);
  ctx.lineTo(x - 4, y + 2);
  ctx.closePath();
  ctx.fill();
}

export function drawPowerup(ctx, pu, cam, t) {
  if (pu.collected) return;
  const x = pu.x - cam;
  const y = pu.y + Math.sin(t * 0.005) * 4;
  const cx = x + 16;
  const pulse = Math.sin(t * 0.01) * 0.5 + 0.5;

  if (pu.type === 'shield') {
    // cyan glow
    ctx.globalAlpha = 0.3 + pulse * 0.3;
    ctx.fillStyle = '#7ad0f0';
    ctx.beginPath();
    ctx.arc(cx, y + 14, 16 + pulse * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // shield body
    ctx.fillStyle = '#3a8fd6';
    ctx.beginPath();
    ctx.moveTo(cx, y + 2);
    ctx.lineTo(cx + 12, y + 6);
    ctx.lineTo(cx + 12, y + 15);
    ctx.quadraticCurveTo(cx + 12, y + 24, cx, y + 27);
    ctx.quadraticCurveTo(cx - 12, y + 24, cx - 12, y + 15);
    ctx.lineTo(cx - 12, y + 6);
    ctx.closePath();
    ctx.fill();
    // shield face highlight
    ctx.fillStyle = '#aee8ff';
    ctx.beginPath();
    ctx.moveTo(cx, y + 5);
    ctx.lineTo(cx + 8, y + 8);
    ctx.lineTo(cx + 8, y + 14);
    ctx.quadraticCurveTo(cx + 8, y + 20, cx, y + 22);
    ctx.quadraticCurveTo(cx - 8, y + 20, cx - 8, y + 14);
    ctx.lineTo(cx - 8, y + 8);
    ctx.closePath();
    ctx.fill();
    // cross emblem
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1.5, y + 9, 3, 10);
    ctx.fillRect(cx - 5, y + 12, 10, 3);
    return;
  }

  // glow
  ctx.globalAlpha = 0.3 + pulse * 0.3;
  ctx.fillStyle = PALETTE.gleam;
  ctx.beginPath();
  ctx.arc(cx, y + 14, 16 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // star body
  ctx.fillStyle = PALETTE.gleam;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? 12 : 5;
    const px2 = cx + Math.cos(ang) * rad;
    const py2 = y + 14 + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.gleam2;
  ctx.beginPath();
  ctx.arc(cx - 3, y + 11, 2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnemy(ctx, e, cam, t) {
  if (!e.alive) return;
  const x = e.x - cam;
  const y = e.y;
  const w = e.w, h = e.h;
  const wob = Math.sin(t * 0.01) * 2;
  // body
  px(ctx, x + 2, y, w - 4, h - 8, PALETTE.enemyBody);
  px(ctx, x + 2, y, w - 4, 4, PALETTE.enemyBodyShade);
  px(ctx, x + 2, y + h - 12, w - 4, 4, PALETTE.enemyBodyShade);
  // feet
  const footOff = Math.sin(t * 0.015) * 3;
  px(ctx, x + 2, y + h - 6 + wob, 8, 6, PALETTE.enemyFoot);
  px(ctx, x + w - 10, y + h - 6 - wob, 8, 6, PALETTE.enemyFoot);
  // eyes
  px(ctx, x + 6, y + 8, 4, 5, PALETTE.white);
  px(ctx, x + w - 10, y + 8, 4, 5, PALETTE.white);
  const look = e.dir > 0 ? 2 : 0;
  px(ctx, x + 6 + look, y + 9, 2, 3, PALETTE.black);
  px(ctx, x + w - 10 + look, y + 9, 2, 3, PALETTE.black);
  // angry brow
  px(ctx, x + 5, y + 6, 5, 2, PALETTE.black);
  px(ctx, x + w - 10, y + 6, 5, 2, PALETTE.black);
}

// Large multi-hit boss (Ember Titan) for the end of Level 3.
export function drawBoss(ctx, e, cam, t) {
  const x = Math.floor(e.x - cam);
  const y = Math.floor(e.y);
  const w = e.w, h = e.h;
  const flash = e.bossInvuln > 0 && Math.floor(e.bossInvuln / 4) % 2 === 0;
  // heat aura
  ctx.globalAlpha = 0.3 + Math.sin(t * 0.01) * 0.1;
  ctx.fillStyle = '#ff5a2a';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, h * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const body = flash ? '#ff9a5a' : '#4a2a2a';
  const bodyDark = flash ? '#c8602a' : '#2a1414';
  const bodyLite = flash ? '#ffb070' : '#6a3a2a';
  // arms
  px(ctx, x, y + 18, 10, h - 28, body);
  px(ctx, x + w - 10, y + 18, 10, h - 28, body);
  px(ctx, x, y + 18, 10, 4, bodyLite);
  px(ctx, x + w - 10, y + 18, 10, 4, bodyLite);
  // body
  px(ctx, x + 6, y + 10, w - 12, h - 14, body);
  px(ctx, x + 6, y + 10, w - 12, 6, bodyLite);
  px(ctx, x + 6, y + h - 18, w - 12, 6, bodyDark);
  // head dome
  px(ctx, x + 16, y, w - 32, 14, body);
  px(ctx, x + 16, y, w - 32, 4, bodyLite);
  // horns
  ctx.fillStyle = bodyDark;
  ctx.beginPath(); ctx.moveTo(x + 14, y + 2); ctx.lineTo(x + 18, y - 12); ctx.lineTo(x + 22, y + 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w - 22, y + 2); ctx.lineTo(x + w - 18, y - 12); ctx.lineTo(x + w - 14, y + 2); ctx.closePath(); ctx.fill();
  // glowing eyes
  ctx.globalAlpha = 0.6 + Math.sin(t * 0.02) * 0.3;
  px(ctx, x + 22, y + 18, 8, 6, '#ffe060');
  px(ctx, x + w - 30, y + 18, 8, 6, '#ffe060');
  ctx.globalAlpha = 1;
  px(ctx, x + 24, y + 20, 4, 3, '#fff8c0');
  px(ctx, x + w - 28, y + 20, 4, 3, '#fff8c0');
  // mouth
  px(ctx, x + 24, y + 30, w - 48, 3, bodyDark);
  px(ctx, x + 26, y + 33, 4, 3, bodyDark);
  px(ctx, x + w - 30, y + 33, 4, 3, bodyDark);
  // lava cracks
  ctx.globalAlpha = 0.6 + Math.sin(t * 0.015 + x * 0.05) * 0.3;
  px(ctx, x + 14, y + 24, 2, 16, '#ff7a2a');
  px(ctx, x + w - 16, y + 28, 2, 14, '#ff7a2a');
  px(ctx, x + w / 2 - 1, y + 40, 2, 12, '#ff7a2a');
  ctx.globalAlpha = 1;
  // feet
  const foot = Math.sin(t * 0.02) * 2;
  px(ctx, x + 10, y + h - 8 + foot, 16, 8, bodyDark);
  px(ctx, x + w - 26, y + h - 8 - foot, 16, 8, bodyDark);
}

// Shadow Lord — flying final boss with a waving cape and glowing purple eyes.
export function drawShadowLord(ctx, e, cam, t) {
  const x = Math.floor(e.x - cam);
  const y = Math.floor(e.y);
  const w = e.w, h = e.h;
  const flash = e.bossInvuln > 0 && Math.floor(e.bossInvuln / 4) % 2 === 0;
  // dark aura
  ctx.globalAlpha = 0.35 + Math.sin(t * 0.01) * 0.15;
  ctx.fillStyle = '#6a0a8a';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, h * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const body = flash ? '#c060ff' : '#2a103a';
  const bodyDark = flash ? '#8030c0' : '#1a0820';
  const bodyLite = flash ? '#d080ff' : '#4a2050';
  // cape (waving)
  const wave = Math.sin(t * 0.02) * 4;
  ctx.fillStyle = bodyDark;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 20);
  ctx.lineTo(x - 4, y + h + wave);
  ctx.lineTo(x + 16, y + h - 4);
  ctx.lineTo(x + w - 16, y + h - 4);
  ctx.lineTo(x + w + 4, y + h + wave);
  ctx.lineTo(x + w - 8, y + 20);
  ctx.closePath();
  ctx.fill();
  // body
  px(ctx, x + 8, y + 10, w - 16, h - 18, body);
  px(ctx, x + 8, y + 10, w - 16, 5, bodyLite);
  px(ctx, x + 8, y + h - 14, w - 16, 5, bodyDark);
  // head
  px(ctx, x + 14, y, w - 28, 14, body);
  px(ctx, x + 14, y, w - 28, 4, bodyLite);
  // horns
  ctx.fillStyle = bodyDark;
  ctx.beginPath(); ctx.moveTo(x + 12, y + 2); ctx.lineTo(x + 16, y - 14); ctx.lineTo(x + 20, y + 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w - 20, y + 2); ctx.lineTo(x + w - 16, y - 14); ctx.lineTo(x + w - 12, y + 2); ctx.closePath(); ctx.fill();
  // glowing purple eyes
  ctx.globalAlpha = 0.7 + Math.sin(t * 0.02) * 0.3;
  px(ctx, x + 18, y + 18, 8, 6, '#c060ff');
  px(ctx, x + w - 26, y + 18, 8, 6, '#c060ff');
  ctx.globalAlpha = 1;
  px(ctx, x + 20, y + 20, 4, 3, '#ffffff');
  px(ctx, x + w - 24, y + 20, 4, 3, '#ffffff');
  // mouth
  px(ctx, x + 22, y + 30, w - 44, 3, bodyDark);
  // shadow cracks
  ctx.globalAlpha = 0.5 + Math.sin(t * 0.015 + x * 0.05) * 0.3;
  px(ctx, x + 12, y + 24, 2, 14, '#c060ff');
  px(ctx, x + w - 14, y + 26, 2, 12, '#c060ff');
  px(ctx, x + w / 2 - 1, y + 38, 2, 10, '#c060ff');
  ctx.globalAlpha = 1;
  // floating hands
  const handFloat = Math.sin(t * 0.025) * 3;
  px(ctx, x - 4, y + h / 2 + handFloat, 10, 10, body);
  px(ctx, x + w - 6, y + h / 2 - handFloat, 10, 10, body);
  px(ctx, x - 4, y + h / 2 + handFloat, 10, 3, bodyLite);
  px(ctx, x + w - 6, y + h / 2 - handFloat, 10, 3, bodyLite);
}

// Fireball lobbed by the boss.
export function drawBossProjectile(ctx, pr, cam, t) {
  const x = pr.x - cam;
  const y = pr.y;
  const pulse = Math.sin(t * 0.03) * 0.3 + 0.7;
  ctx.globalAlpha = 0.5 * pulse;
  ctx.fillStyle = '#ff5a2a';
  ctx.beginPath();
  ctx.arc(x + pr.w / 2, y + pr.h / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  px(ctx, x, y, pr.w, pr.h, '#ff9a3a');
  px(ctx, x, y, pr.w, 4, '#ffd060');
  px(ctx, x + 3, y + 4, 3, 3, '#fff0a0');
}

// Boss HP bar shown while the Ember Titan is alive and on screen.
export function drawBossHp(ctx, boss, cam, label) {
  const W = 800;
  if (boss.x - cam > W + 100 || boss.x - cam < -200) return;
  const barW = 260, barH = 12;
  const bx = W / 2 - barW / 2;
  const by = 54;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
  ctx.fillStyle = '#3a1010';
  ctx.fillRect(bx, by, barW, barH);
  const frac = Math.max(0, boss.hp / boss.maxHp);
  ctx.fillStyle = '#ff5a2a';
  ctx.fillRect(bx, by, barW * frac, barH);
  px(ctx, bx, by, barW * frac, 3, '#ffb060');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label || 'EMBER TITAN', W / 2, by + barH / 2);
}

export function drawFlag(ctx, flag, cam, t) {
  const x = flag.x - cam;
  const y = flag.y - 128;
  // pole
  px(ctx, x, y, 6, 160, PALETTE.flagPole);
  px(ctx, x, y - 6, 6, 6, '#e0e0e0');
  // cloth waving
  const wave = Math.sin(t * 0.008) * 4;
  ctx.fillStyle = PALETTE.flagCloth;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 6);
  ctx.lineTo(x + 50 + wave, y + 18);
  ctx.lineTo(x + 6, y + 30);
  ctx.closePath();
  ctx.fill();
  px(ctx, x + 14, y + 12, 4, 4, PALETTE.white);
  // base block
  px(ctx, x - 8, flag.y - 8, 22, 12, PALETTE.stone);
}

export function drawCheckpoint(ctx, cp, cam, t, active) {
  if (!cp) return;
  const x = cp.x - cam;
  const y = cp.y - 64;
  px(ctx, x, y, 4, 64, '#888');
  const col = active ? '#5fe0a0' : '#bbb';
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + 34, y + 14);
  ctx.lineTo(x + 4, y + 24);
  ctx.closePath();
  ctx.fill();
  if (active) {
    ctx.globalAlpha = 0.4 + Math.sin(t * 0.01) * 0.3;
    ctx.fillStyle = '#5fe0a0';
    ctx.beginPath();
    ctx.arc(x + 4, y + 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawMovingPlatform(ctx, p, cam) {
  const x = p.x - cam;
  px(ctx, x, p.y, p.width, 12, PALETTE.stone);
  px(ctx, x, p.y, p.width, 3, '#a8a8b8');
  px(ctx, x, p.y + 9, p.width, 3, PALETTE.stoneDark);
  // bolts
  px(ctx, x + 4, p.y + 4, 3, 3, PALETTE.stoneDark);
  px(ctx, x + p.width - 7, p.y + 4, 3, 3, PALETTE.stoneDark);
}

export function drawParticles(ctx, particles, cam) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    px(ctx, p.x - cam, p.y, p.size, p.size, p.color);
  }
  ctx.globalAlpha = 1;
}

export function drawPlayer(ctx, p, cam, t) {
  const sx = Math.floor(p.x - cam);
  const sy = Math.floor(p.y);
  const flip = p.facing < 0;

  // shadow
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = PALETTE.black;
  ctx.beginPath();
  ctx.ellipse(sx + p.w / 2, p.y + p.h + 2, p.w / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // power aura
  if (p.powered) {
    const pulse = Math.sin(t * 0.02) * 0.3 + 0.7;
    ctx.globalAlpha = 0.35 * pulse;
    ctx.fillStyle = PALETTE.gleam;
    ctx.beginPath();
    ctx.arc(sx + p.w / 2, sy + p.h / 2, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // shield aura
  if (p.shield) {
    const pulse = Math.sin(t * 0.015) * 0.3 + 0.7;
    ctx.globalAlpha = 0.45 * pulse;
    ctx.strokeStyle = '#7ad0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx + p.w / 2, sy + p.h / 2, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.2 * pulse;
    ctx.fillStyle = '#7ad0f0';
    ctx.beginPath();
    ctx.arc(sx + p.w / 2, sy + p.h / 2, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // invulnerability flash
  if (p.invuln > 0 && Math.floor(t / 60) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.save();
  if (flip) {
    ctx.translate(sx + p.w, sy);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(sx, sy);
  }

  const bob = p.state === 'idle' ? Math.sin(t * 0.005) * 1 : 0;
  const runPhase = Math.sin(p.animTime * 0.35);
  const bodyY = bob;

  // legs
  let legLY = 0, legRY = 0;
  if (p.state === 'run') {
    legLY = runPhase * 4;
    legRY = -runPhase * 4;
  } else if (p.state === 'jump') {
    legLY = -3; legRY = 3;
  } else if (p.state === 'fall') {
    legLY = 2; legRY = -2;
  } else if (p.state === 'dead') {
    legLY = 4; legRY = 4;
  }

  // boots
  px(ctx, 3, 24 + legLY, 7, 6, PALETTE.playerBoots);
  px(ctx, 14, 24 + legRY, 7, 6, PALETTE.playerBoots);
  // legs (tunic lower)
  px(ctx, 3, 20 + Math.min(legLY, 0), 7, 5, PALETTE.playerTunicShade);
  px(ctx, 14, 20 + Math.min(legRY, 0), 7, 5, PALETTE.playerTunicShade);

  // tunic / body
  px(ctx, 2, 13 + bodyY, 20, 11, PALETTE.playerTunic);
  px(ctx, 2, 13 + bodyY, 20, 3, PALETTE.playerTunicShade);
  // buttons
  px(ctx, 10, 15 + bodyY, 2, 2, PALETTE.gleam);
  px(ctx, 10, 19 + bodyY, 2, 2, PALETTE.gleam);

  // arms (swing when running)
  let armL = 0, armR = 0;
  if (p.state === 'run') { armL = -runPhase * 3; armR = runPhase * 3; }
  else if (p.state === 'jump') { armL = -4; armR = -4; }
  px(ctx, 0, 14 + bodyY + armL, 3, 8, PALETTE.playerSkin);
  px(ctx, 21, 14 + bodyY + armR, 3, 8, PALETTE.playerSkin);
  // hands
  px(ctx, 0, 20 + bodyY + armL, 3, 2, PALETTE.playerSkinShade);
  px(ctx, 21, 20 + bodyY + armR, 3, 2, PALETTE.playerSkinShade);

  // head
  px(ctx, 4, 3 + bodyY, 16, 12, PALETTE.playerSkin);
  px(ctx, 4, 3 + bodyY, 16, 2, PALETTE.playerSkinShade);
  // hair sideburns
  px(ctx, 4, 6 + bodyY, 2, 6, PALETTE.playerHair);
  px(ctx, 18, 6 + bodyY, 2, 6, PALETTE.playerHair);

  // cap
  px(ctx, 3, 0 + bodyY, 18, 4, PALETTE.playerCap);
  px(ctx, 2, 3 + bodyY, 20, 3, PALETTE.playerCap);
  px(ctx, 14, 0 + bodyY, 8, 3, PALETTE.playerCapShade);
  // cap brim
  px(ctx, 12, 3 + bodyY, 10, 2, PALETTE.playerCapShade);

  // eyes
  px(ctx, 9, 8 + bodyY, 2, 3, PALETTE.black);
  px(ctx, 15, 8 + bodyY, 2, 3, PALETTE.black);
  // cheek
  px(ctx, 6, 11 + bodyY, 2, 2, '#f08080');
  px(ctx, 18, 11 + bodyY, 2, 2, '#f08080');

  if (p.state === 'dead') {
    // X eyes
    px(ctx, 8, 7 + bodyY, 4, 1, PALETTE.black);
    px(ctx, 8, 10 + bodyY, 4, 1, PALETTE.black);
    px(ctx, 14, 7 + bodyY, 4, 1, PALETTE.black);
    px(ctx, 14, 10 + bodyY, 4, 1, PALETTE.black);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}