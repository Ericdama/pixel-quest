// Pixel Quest — core platformer engine.
// Tile-based collision, physics, enemy AI, coins, power-ups, checkpoints, flag.
import { TILE } from './levels';
import { audio } from './audio';
import { bossMusic } from './music';
import {
  drawBackground, drawTiles, drawTileShape, drawPlayer, drawEnemy, drawFlyer, drawFireball, drawBoss, drawBossProjectile, drawBossHp, drawCoin,
  drawCrystal, drawEmber, drawPowerup, drawFlag, drawCheckpoint, drawMovingPlatform, drawParticles, drawShadowLord,
} from './draw';

const VIEW_W = 800;
const VIEW_H = 480;
const STEP = 1000 / 60;

// Physics constants (tuned for 60fps fixed step)
const GRAVITY = 0.75;
const MOVE_ACCEL = 0.7;
const MAX_SPEED = 4.2;
const AIR_ACCEL = 0.45;
const GROUND_FRICTION = 0.78;
const AIR_FRICTION = 0.92;
const ICE_FRICTION = 0.985;
const JUMP_VEL = -13.2;
const MAX_FALL = 15;
const COYOTE_FRAMES = 6;       // grace frames to jump after leaving a ledge
const JUMP_BUFFER_FRAMES = 6;  // early jump press triggers on landing
const ENEMY_SPEED = 1.1;

function isSolid(ch) {
  return ch === '#' || ch === 'x' || ch === 'B' || ch === '?' || ch === '!' || ch === 'i' || ch === 'r' || ch === 'c' || ch === 'd';
}

export class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.callbacks = callbacks || {};
    this.running = false;
    this.paused = false;
    this.raf = null;
    this.lastTime = 0;
    this.acc = 0;
    this.time = 0;
    this.input = { left: false, right: false, jump: false, jumpPressed: false };
    this.jumpBuffer = 0;
    this.lastHud = '';
    this.bossMusicActive = false;
  }

  loadLevel(levelData, state) {
    this.level = JSON.parse(JSON.stringify(levelData));
    // parse coins, snow crystals, and embers from grid
    this.coins = [];
    this.crystals = [];
    this.embers = [];
    for (let r = 0; r < this.level.height; r++) {
      for (let c = 0; c < this.level.width; c++) {
        const ch = this.level.grid[r][c];
        if (ch === 'o') {
          this.coins.push({ x: c * TILE + 8, y: r * TILE + 8, collected: false });
          this.level.grid[r][c] = ' ';
        } else if (ch === 's') {
          this.crystals.push({ x: c * TILE + 8, y: r * TILE + 6, collected: false });
          this.level.grid[r][c] = ' ';
        } else if (ch === 'e') {
          this.embers.push({ x: c * TILE + 8, y: r * TILE + 6, collected: false });
          this.level.grid[r][c] = ' ';
        }
      }
    }
    // enemies
    this.enemies = this.level.enemies.map((e) => ({
      x: e.x, y: e.y, w: e.w || 28, h: e.h || 28, dir: e.dir || -1, alive: true, vx: 0,
      type: e.type, deadT: 0, originX: e.x, originY: e.y, range: e.range || 64,
      speed: e.speed || 1.3, t: 0,
      hp: e.hp || 1, maxHp: e.hp || 1, bossInvuln: 0, shootTimer: 90 + Math.floor(Math.random() * 60),
    }));
    // powerups
    this.powerups = this.level.powerups.map((p) => ({ ...p, w: 28, h: 28, collected: false }));
    // moving platforms
    this.movingPlatforms = this.level.movingPlatforms.map((p) => ({
      ...p, h: 12, originX: p.x, originY: p.y, curX: p.x, curY: p.y,
    }));
    this.checkpoint = { ...this.level.checkpoint, active: false };
    this.flag = { ...this.level.flag };
    this.particles = [];
    this.bossProjectiles = [];

    // player state
    const start = state && state.checkpoint ? state.checkpoint : this.level.playerStart;
    this.player = {
      x: start.x, y: start.y, w: 22, h: 30, vx: 0, vy: 0,
      facing: 1, onGround: false, state: 'idle', animTime: 0,
      invuln: 0, powered: false, powerTimer: 0, shield: false, dead: false, deadT: 0,
      coyoteTime: 0,
    };
    this.respawnPoint = { x: start.x, y: start.y };

    this.lives = state ? state.lives : 3;
    this.coinCount = state ? state.coins : 0;
    this.score = state ? state.score : 0;
    this.levelStartTime = this.time;
    this.completed = false;
    this.gameOver = false;
    this.bossMusicActive = false;
    this.camera = 0;
    this.bumpTiles = []; // {c,r,offset,dir}
    this.emitHud(true);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  destroy() {
    this.stop();
    bossMusic.stop();
    this.removeInputListeners();
  }

  setPaused(p) {
    this.paused = p;
    if (p) audio.resume();
    if (p) { bossMusic.stop(); this.bossMusicActive = false; }
    if (this.callbacks.onPauseChange) this.callbacks.onPauseChange(p);
  }

  setInput(action, pressed) {
    if (action === 'jump') {
      if (pressed && !this.input.jump) {
        this.input.jumpPressed = true;
        this.jumpBuffer = JUMP_BUFFER_FRAMES;
      }
      this.input.jump = pressed;
    } else {
      this.input[action] = pressed;
    }
  }

  // ---- Input listeners ----
  attachInput() {
    this.keyDown = (e) => this.onKey(e, true);
    this.keyUp = (e) => this.onKey(e, false);
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
  }
  removeInputListeners() {
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
  }
  onKey(e, down) {
    const k = e.key.toLowerCase();
    let handled = true;
    if (k === 'a' || k === 'arrowleft') this.setInput('left', down);
    else if (k === 'd' || k === 'arrowright') this.setInput('right', down);
    else if (k === ' ' || k === 'w' || k === 'arrowup') this.setInput('jump', down);
    else if (k === 'escape' && down) {
      if (this.callbacks.onEsc) this.callbacks.onEsc();
    } else handled = false;
    if (handled) e.preventDefault();
  }

  // ---- Game loop ----
  loop = (now) => {
    if (!this.running) return;
    const dt = now - this.lastTime;
    this.lastTime = now;
    this.acc += Math.min(dt, 100);
    while (this.acc >= STEP) {
      if (!this.paused) this.update();
      this.acc -= STEP;
      this.time += STEP;
    }
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  tileAt(c, r) {
    if (r < 0 || r >= this.level.height) return ' ';
    if (c < 0 || c >= this.level.width) return 'x'; // walls solid
    return this.level.grid[r][c];
  }

  setTile(c, r, ch) {
    if (r >= 0 && r < this.level.height && c >= 0 && c < this.level.width) {
      this.level.grid[r][c] = ch;
    }
  }

  // ---- Update ----
  update() {
    const p = this.player;

    if (this.completed || this.gameOver) {
      this.updateParticles();
      return;
    }

    if (p.dead) {
      p.deadT += 1;
      p.vy += GRAVITY;
      p.y += p.vy;
      p.animTime += 1;
      if (p.deadT > 90) {
        this.handleDeath();
      }
      this.updateEnemies();
      this.updateParticles();
      this.emitHud();
      return;
    }

    // horizontal input
    const accel = p.onGround ? MOVE_ACCEL : AIR_ACCEL;
    if (this.input.left) { p.vx -= accel; p.facing = -1; }
    if (this.input.right) { p.vx += accel; p.facing = 1; }
    if (!this.input.left && !this.input.right) {
      const footC = Math.floor((p.x + p.w / 2) / TILE);
      const footR = Math.floor((p.y + p.h + 1) / TILE);
      const onIce = p.onGround && this.tileAt(footC, footR) === 'i';
      const fric = p.onGround ? (onIce ? ICE_FRICTION : GROUND_FRICTION) : AIR_FRICTION;
      p.vx *= fric;
      if (Math.abs(p.vx) < (onIce ? 0.03 : 0.1)) p.vx = 0;
    }
    p.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, p.vx));

    // coyote time: keep jump grace for a few frames after leaving ground
    if (p.onGround) p.coyoteTime = COYOTE_FRAMES;
    else if (p.coyoteTime > 0) p.coyoteTime--;

    // jump buffer: a recent press triggers on landing or within the coyote window
    if (this.jumpBuffer > 0) this.jumpBuffer--;
    if (this.jumpBuffer > 0 && (p.onGround || p.coyoteTime > 0)) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      p.coyoteTime = 0;
      this.jumpBuffer = 0;
      this.input.jumpPressed = false;
      audio.jump();
      this.spawnDust(p.x + p.w / 2, p.y + p.h, 4);
    }
    this.input.jumpPressed = false;

    // variable jump height
    if (!this.input.jump && p.vy < -4) p.vy = -4;

    // gravity
    p.vy += GRAVITY;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    // move X with collision
    p.x += p.vx;
    this.collideX();

    // move Y with collision
    p.y += p.vy;
    p.onGround = false;
    this.collideY();

    // moving platforms
    this.updateMovingPlatforms();
    this.collideMovingPlatforms();
    // lava
    this.checkLava();

    // anim state
    if (!p.onGround) {
      p.state = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 0.5) {
      p.state = 'run';
      p.animTime += Math.abs(p.vx);
    } else {
      p.state = 'idle';
    }

    // invulnerability & power timer
    if (p.invuln > 0) p.invuln--;
    if (p.powered) {
      p.powerTimer--;
      if (p.powerTimer <= 0) p.powered = false;
    }

    // pit death
    if (p.y > this.level.height * TILE + 64) {
      this.killPlayer(true);
    }

    // enemies
    this.updateEnemies();
    this.collideEnemies();
    // boss projectiles
    this.updateBossProjectiles();
    // boss battle music
    this.updateBossMusic();

    // coins
    this.collectCoins();
    // snow crystals
    this.collectCrystals();
    // embers
    this.collectEmbers();
    // powerups
    this.collectPowerups();
    // checkpoint
    this.checkCheckpoint();
    // flag
    this.checkFlag();

    // bump tiles animate
    this.updateBumpTiles();

    // camera
    const targetCam = p.x + p.w / 2 - VIEW_W / 2;
    this.camera += (targetCam - this.camera) * 0.12;
    this.camera = Math.max(0, Math.min(this.level.width * TILE - VIEW_W, this.camera));

    this.updateParticles();
    this.emitHud();
  }

  collideX() {
    const p = this.player;
    const top = Math.floor(p.y / TILE);
    const bottom = Math.floor((p.y + p.h - 1) / TILE);
    if (p.vx > 0) {
      const right = Math.floor((p.x + p.w - 1) / TILE);
      for (let r = top; r <= bottom; r++) {
        if (isSolid(this.tileAt(right, r))) {
          p.x = right * TILE - p.w;
          p.vx = 0;
          break;
        }
      }
    } else if (p.vx < 0) {
      const left = Math.floor(p.x / TILE);
      for (let r = top; r <= bottom; r++) {
        if (isSolid(this.tileAt(left, r))) {
          p.x = (left + 1) * TILE;
          p.vx = 0;
          break;
        }
      }
    }
  }

  collideY() {
    const p = this.player;
    const left = Math.floor(p.x / TILE);
    const right = Math.floor((p.x + p.w - 1) / TILE);
    if (p.vy > 0) {
      const bottom = Math.floor((p.y + p.h - 1) / TILE);
      for (let c = left; c <= right; c++) {
        if (isSolid(this.tileAt(c, bottom))) {
          p.y = bottom * TILE - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
    } else if (p.vy < 0) {
      const top = Math.floor(p.y / TILE);
      for (let c = left; c <= right; c++) {
        if (isSolid(this.tileAt(c, top))) {
          p.y = (top + 1) * TILE;
          p.vy = 0;
          this.bumpBlock(c, top);
          break;
        }
      }
    }
  }

  bumpBlock(c, r) {
    const ch = this.tileAt(c, r);
    if (ch === '?') {
      // mystery block -> coin
      this.setTile(c, r, '!');
      this.coinCount++;
      this.score += 100;
      audio.coin();
      this.spawnCoinPop(c * TILE + 16, r * TILE);
      this.bumpTiles.push({ c, r, offset: 0, dir: -1 });
    } else if (ch === 'B') {
      // brick -> break (if powered) or bump
      if (this.player.powered) {
        this.setTile(c, r, ' ');
        audio.break();
        this.spawnBrickPieces(c * TILE, r * TILE);
        this.score += 50;
      } else {
        audio.bump();
        this.bumpTiles.push({ c, r, offset: 0, dir: -1 });
      }
    } else if (ch === 'x' || ch === '#') {
      audio.bump();
    }
  }

  updateBumpTiles() {
    for (let i = this.bumpTiles.length - 1; i >= 0; i--) {
      const b = this.bumpTiles[i];
      b.offset += b.dir * 2;
      if (b.offset <= -8) b.dir = 1;
      if (b.offset >= 0) this.bumpTiles.splice(i, 1);
    }
  }

  updateMovingPlatforms() {
    for (const p of this.movingPlatforms) {
      p.curX += p.dir * p.speed;
      if (p.curX > p.originX + p.range) { p.curX = p.originX + p.range; p.dir = -1; }
      if (p.curX < p.originX - p.range) { p.curX = p.originX - p.range; p.dir = 1; }
      p.x = p.curX;
    }
  }

  collideMovingPlatforms() {
    const p = this.player;
    for (const mp of this.movingPlatforms) {
      // standing on top
      if (p.vy >= 0 &&
        p.x + p.w > mp.x && p.x < mp.x + mp.width &&
        p.y + p.h >= mp.y && p.y + p.h <= mp.y + 14 &&
        p.y + p.h + p.vy >= mp.y) {
        p.y = mp.y - p.h;
        p.vy = 0;
        p.onGround = true;
        // carry horizontally
        p.x += mp.dir * mp.speed;
      }
    }
  }

  updateEnemies() {
    for (const e of this.enemies) {
      if (!e.alive) {
        e.deadT++;
        continue;
      }
      if (e.type === 'flyer' || e.type === 'fireball') {
        e.t += 1;
        e.x += e.dir * e.speed;
        e.y = e.originY + Math.sin(e.t * 0.05) * 22;
        if (e.x > e.originX + e.range) e.dir = -1;
        if (e.x < e.originX - e.range) e.dir = 1;
        continue;
      }
      if (e.type === 'boss') {
        if (e.bossInvuln > 0) e.bossInvuln--;
        e.t += 1;
        e.x += e.dir * e.speed;
        if (e.x > e.originX + e.range) e.dir = -1;
        if (e.x < e.originX - e.range) e.dir = 1;
        e.shootTimer--;
        if (e.shootTimer <= 0) {
          e.shootTimer = 110;
          if (Math.abs(this.player.x - e.x) < 460) {
            const px = e.x + e.w / 2;
            const py = e.y + 18;
            const dx = (this.player.x + this.player.w / 2) - px;
            const dy = (this.player.y + this.player.h / 2) - py;
            const dist = Math.hypot(dx, dy) || 1;
            const sp = 3.4;
            this.bossProjectiles.push({ x: px, y: py, vx: (dx / dist) * sp, vy: (dy / dist) * sp - 1.2, w: 14, h: 14, life: 220 });
            audio.bossShoot();
          }
        }
        continue;
      }
      if (e.type === 'shadowlord') {
        if (e.bossInvuln > 0) e.bossInvuln--;
        e.t += 1;
        e.x = e.originX + Math.sin(e.t * 0.018) * e.range;
        e.y = e.originY + Math.sin(e.t * 0.013) * 32;
        e.shootTimer--;
        if (e.shootTimer <= 0) {
          e.shootTimer = 130;
          if (Math.abs(this.player.x - e.x) < 500) {
            const px = e.x + e.w / 2;
            const py = e.y + e.h / 2;
            const dx = (this.player.x + this.player.w / 2) - px;
            const dy = (this.player.y + this.player.h / 2) - py;
            const baseAng = Math.atan2(dy, dx);
            const sp = 3.0;
            for (const off of [-0.3, 0, 0.3]) {
              const ang = baseAng + off;
              this.bossProjectiles.push({ x: px, y: py, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.6, w: 14, h: 14, life: 240 });
            }
            audio.bossShoot();
          }
        }
        continue;
      }
      e.x += e.dir * ENEMY_SPEED;
      // turn at walls
      const ec = Math.floor((e.x + (e.dir > 0 ? e.w : 0)) / TILE);
      const er = Math.floor((e.y + e.h / 2) / TILE);
      if (isSolid(this.tileAt(ec, er))) {
        e.dir *= -1;
        e.x += e.dir * 2;
      }
      // turn at edges (don't walk off)
      const footC = Math.floor((e.x + (e.dir > 0 ? e.w + 2 : -2)) / TILE);
      const footR = Math.floor((e.y + e.h + 2) / TILE);
      if (!isSolid(this.tileAt(footC, footR))) {
        e.dir *= -1;
      }
    }
    // remove long-dead enemies
    this.enemies = this.enemies.filter((e) => e.alive || e.deadT < 120);
  }

  collideEnemies() {
    const p = this.player;
    if (p.dead) return;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (!this.aabb(p, e)) continue;
      const pBottom = p.y + p.h;
      const wasFalling = p.vy > 0;
      if (e.type === 'boss' || e.type === 'shadowlord') {
        const stomp = wasFalling && pBottom - p.vy <= e.y + 22;
        if (stomp && e.bossInvuln <= 0) {
          e.hp--;
          e.bossInvuln = 70;
          p.y = e.y - p.h;
          p.vy = JUMP_VEL * 0.9;
          p.invuln = 60;
          const pushDir = (p.x + p.w / 2 < e.x + e.w / 2) ? -1 : 1;
          p.vx = pushDir * 6;
          p.x += pushDir * 10;
          this.score += 500;
          audio.bossHit();
          this.spawnPoof(e.x + e.w / 2, e.y);
          if (e.hp <= 0) {
            e.alive = false;
            e.deadT = 0;
            this.score += 2000;
            if (e.type === 'shadowlord') audio.shadowlordDefeat();
            else audio.bossDefeat();
            const sparkColor = e.type === 'shadowlord' ? '#c060ff' : '#ff9a3a';
            for (let k = 0; k < 24; k++) this.spawnSparkle(e.x + e.w / 2, e.y + e.h / 2, 1, sparkColor);
          } else {
            e.speed = Math.min(2.6, e.speed + 0.3);
          }
        } else if (p.invuln <= 0) {
          this.damagePlayer();
        }
      } else if (wasFalling && pBottom - p.vy <= e.y + 10) {
        e.alive = false;
        e.deadT = 0;
        p.vy = JUMP_VEL * 0.6;
        this.score += 200;
        audio.enemy();
        this.spawnPoof(e.x + e.w / 2, e.y + e.h / 2);
      } else if (p.invuln <= 0) {
        this.damagePlayer();
      }
    }
  }

  updateBossMusic() {
    const boss = this.enemies.find((e) => (e.type === 'boss' || e.type === 'shadowlord') && e.alive);
    const inArena = boss && Math.abs((this.player.x + this.player.w / 2) - (boss.x + boss.w / 2)) < 480;
    if (inArena && !this.gameOver && !this.completed) {
      if (!this.bossMusicActive) {
        this.bossMusicActive = true;
        bossMusic.start(boss.type === 'shadowlord' ? 'shadowlord' : 'ember');
      }
    } else if (this.bossMusicActive) {
      this.bossMusicActive = false;
      bossMusic.stop();
    }
  }

  updateBossProjectiles() {
    const p = this.player;
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const pr = this.bossProjectiles[i];
      pr.x += pr.vx; pr.y += pr.vy; pr.vy += 0.12; pr.life--;
      if (!p.dead && p.invuln <= 0 && this.aabb(p, pr)) {
        this.damagePlayer();
        this.bossProjectiles.splice(i, 1);
        continue;
      }
      const c = Math.floor((pr.x + pr.w / 2) / TILE);
      const r = Math.floor((pr.y + pr.h / 2) / TILE);
      if (isSolid(this.tileAt(c, r))) { this.bossProjectiles.splice(i, 1); continue; }
      if (pr.life <= 0 || pr.y > this.level.height * TILE) this.bossProjectiles.splice(i, 1);
    }
  }

  collectCoins() {
    const p = this.player;
    for (const c of this.coins) {
      if (c.collected) continue;
      if (p.x < c.x + 16 && p.x + p.w > c.x && p.y < c.y + 16 && p.y + p.h > c.y) {
        c.collected = true;
        this.coinCount++;
        this.score += 100;
        audio.coin();
        this.spawnSparkle(c.x + 8, c.y + 8);
      }
    }
  }

  collectCrystals() {
    const p = this.player;
    for (const c of this.crystals) {
      if (c.collected) continue;
      if (p.x < c.x + 16 && p.x + p.w > c.x && p.y < c.y + 18 && p.y + p.h > c.y) {
        c.collected = true;
        this.score += 250;
        audio.crystal();
        this.spawnSparkle(c.x + 8, c.y + 10, 8, '#aef0ff');
      }
    }
  }

  collectEmbers() {
    const p = this.player;
    for (const c of this.embers) {
      if (c.collected) continue;
      if (p.x < c.x + 16 && p.x + p.w > c.x && p.y < c.y + 18 && p.y + p.h > c.y) {
        c.collected = true;
        this.score += 300;
        audio.ember();
        this.spawnSparkle(c.x + 8, c.y + 10, 8, '#ff9a3a');
      }
    }
  }

  checkLava() {
    const p = this.player;
    if (p.dead) return;
    const left = Math.floor(p.x / TILE);
    const right = Math.floor((p.x + p.w - 1) / TILE);
    const top = Math.floor(p.y / TILE);
    const bottom = Math.floor((p.y + p.h - 1) / TILE);
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        if (this.tileAt(c, r) === 'L') {
          this.killPlayer(true);
          return;
        }
      }
    }
  }

  collectPowerups() {
    const p = this.player;
    for (const pu of this.powerups) {
      if (pu.collected) continue;
      if (p.x < pu.x + pu.w && p.x + p.w > pu.x && p.y < pu.y + pu.h && p.y + p.h > pu.y) {
        pu.collected = true;
        if (pu.type === 'shield') {
          p.shield = true;
          this.score += 500;
          audio.shield();
          this.spawnSparkle(pu.x + 14, pu.y + 14, 12, '#7ad0f0');
        } else {
          p.powered = true;
          p.powerTimer = 60 * 12; // 12 seconds
          this.score += 1000;
          audio.powerup();
          this.spawnSparkle(pu.x + 14, pu.y + 14, 12);
        }
      }
    }
  }

  checkCheckpoint() {
    const p = this.player;
    if (!this.checkpoint.active && p.x + p.w > this.checkpoint.x) {
      this.checkpoint.active = true;
      this.respawnPoint = { x: this.checkpoint.x, y: this.checkpoint.y };
      audio.checkpoint();
    }
  }

  checkFlag() {
    const p = this.player;
    if (this.completed) return;
    if (this.enemies.some((e) => (e.type === 'boss' || e.type === 'shadowlord') && e.alive)) return;
    if (p.x + p.w > this.flag.x && p.x < this.flag.x + 16) {
      this.completed = true;
      const elapsed = Math.floor((this.time - this.levelStartTime) / 1000);
      const timeBonus = Math.max(0, 5000 - elapsed * 10);
      this.score += timeBonus;
      audio.complete();
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete({
          score: this.score,
          coins: this.coinCount,
          time: elapsed,
        });
      }
    }
  }

  damagePlayer() {
    const p = this.player;
    if (p.shield) {
      p.shield = false;
      p.invuln = 90;
      audio.shieldBreak();
      this.spawnPoof(p.x + p.w / 2, p.y + p.h / 2);
      for (let i = 0; i < 10; i++) this.spawnSparkle(p.x + p.w / 2, p.y + p.h / 2, 1, '#7ad0f0');
    } else if (p.powered) {
      p.powered = false;
      p.powerTimer = 0;
      p.invuln = 90;
      audio.damage();
      this.spawnPoof(p.x + p.w / 2, p.y + p.h / 2);
    } else {
      this.killPlayer(false);
    }
  }

  killPlayer(isPit) {
    const p = this.player;
    if (p.dead) return;
    p.dead = true;
    p.deadT = 0;
    p.vy = isPit ? 0 : -10;
    p.state = 'dead';
    audio.damage();
    if (this.callbacks.onDeath) this.callbacks.onDeath();
  }

  handleDeath() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
      bossMusic.stop();
      this.bossMusicActive = false;
      audio.gameover();
      if (this.callbacks.onGameOver) {
        this.callbacks.onGameOver({ score: this.score, coins: this.coinCount });
      }
    } else {
      // respawn
      const p = this.player;
      p.dead = false;
      p.deadT = 0;
      p.x = this.respawnPoint.x;
      p.y = this.respawnPoint.y - 4;
      p.vx = 0; p.vy = 0;
      p.invuln = 120;
      p.state = 'idle';
      // reset enemies near respawn? keep simple
    }
    this.emitHud(true);
  }

  // ---- Particles ----
  spawnSparkle(x, y, n = 6, color = '#ffe066') {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 2,
        life: 30, maxLife: 30, size: 3, color,
      });
    }
  }
  spawnPoof(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 1,
        life: 28, maxLife: 28, size: 4, color: '#fff',
      });
    }
  }
  spawnBrickPieces(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + 16, y: y + 16, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6 - 2,
        life: 40, maxLife: 40, size: 5, color: '#c87850',
      });
    }
  }
  spawnCoinPop(x, y) {
    this.particles.push({ x, y, vx: 0, vy: -4, life: 20, maxLife: 20, size: 6, color: '#ffd633' });
  }
  spawnDust(x, y, n = 4) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2,
        life: 18, maxLife: 18, size: 2, color: '#ddd',
      });
    }
  }
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---- HUD ----
  emitHud(force) {
    const hud = {
      score: this.score,
      coins: this.coinCount,
      lives: this.lives,
      level: this.level.subtitle,
      time: Math.floor((this.time - this.levelStartTime) / 1000),
      powered: this.player.powered,
      powerTime: this.player.powered ? Math.ceil(this.player.powerTimer / 60) : 0,
      shield: this.player.shield,
    };
    const key = `${hud.score}|${hud.coins}|${hud.lives}|${hud.time}|${hud.powered}|${hud.powerTime}|${hud.shield}`;
    if (force || key !== this.lastHud) {
      this.lastHud = key;
      if (this.callbacks.onHud) this.callbacks.onHud(hud);
    }
  }

  // ---- Render ----
  render() {
    const ctx = this.ctx;
    const cam = Math.floor(this.camera);
    drawBackground(ctx, cam, this.level);
    drawTiles(ctx, cam, this.level, this.time);

    // bump tile offset — redraw the tile shifted up to mask the static one
    for (const b of this.bumpTiles) {
      const ch = this.level.grid[b.r][b.c];
      const x = b.c * TILE - cam;
      const y = b.r * TILE + b.offset;
      // mask the original position with sky color, then draw shifted tile
      ctx.fillStyle = '#a8e0f0';
      ctx.fillRect(b.c * TILE - cam, b.r * TILE, TILE, TILE);
      drawTileShape(ctx, ch, x, y, this.time);
    }

    // moving platforms
    for (const mp of this.movingPlatforms) drawMovingPlatform(ctx, mp, cam);

    // checkpoint
    drawCheckpoint(ctx, this.checkpoint, cam, this.time, this.checkpoint.active);

    // flag
    drawFlag(ctx, this.flag, cam, this.time);

    // coins
    for (const c of this.coins) drawCoin(ctx, c, cam, this.time);
    // snow crystals
    for (const c of this.crystals) drawCrystal(ctx, c, cam, this.time);
    // embers
    for (const c of this.embers) drawEmber(ctx, c, cam, this.time);

    // powerups
    for (const pu of this.powerups) drawPowerup(ctx, pu, cam, this.time);

    // enemies
    for (const e of this.enemies) {
      if (e.alive) {
        if (e.type === 'boss') drawBoss(ctx, e, cam, this.time);
        else if (e.type === 'shadowlord') drawShadowLord(ctx, e, cam, this.time);
        else if (e.type === 'fireball') drawFireball(ctx, e, cam, this.time);
        else if (e.type === 'flyer') drawFlyer(ctx, e, cam, this.time);
        else drawEnemy(ctx, e, cam, this.time);
      } else if ((e.type === 'boss' || e.type === 'shadowlord') && e.deadT < 60) {
        ctx.globalAlpha = Math.max(0, 1 - e.deadT / 60);
        if (e.type === 'shadowlord') drawShadowLord(ctx, e, cam, this.time);
        else drawBoss(ctx, e, cam, this.time);
        ctx.globalAlpha = 1;
      } else if (e.deadT < 30) {
        ctx.globalAlpha = 1 - e.deadT / 30;
        ctx.fillStyle = e.type === 'fireball' ? '#ff7a2a' : (e.type === 'flyer' ? '#7ad0f0' : '#c8403a');
        ctx.fillRect(e.x - cam, e.y + e.h - 8, e.w, 8);
        ctx.globalAlpha = 1;
      }
    }
    // boss projectiles
    for (const pr of this.bossProjectiles) drawBossProjectile(ctx, pr, cam, this.time);
    // boss HP bar
    const boss = this.enemies.find((e) => (e.type === 'boss' || e.type === 'shadowlord') && e.alive);
    if (boss) drawBossHp(ctx, boss, cam, boss.type === 'shadowlord' ? 'SHADOW LORD' : null);

    // player
    drawPlayer(ctx, this.player, cam, this.time);

    // particles
    drawParticles(ctx, this.particles, cam);

    // completed banner handled by React overlay
  }
}

export { VIEW_W, VIEW_H };