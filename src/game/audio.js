// Retro sound synthesis using the Web Audio API — no external assets.
// All sounds are generated procedurally with oscillators.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch (e) {
      this.ctx = null;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.35;
  }

  // Core tone generator
  tone(freq, dur, type = 'square', vol = 0.2, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // Noise burst for percussive effects
  noise(dur, vol = 0.15, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  jump() { this.tone(420, 0.18, 'square', 0.18, 760); }
  coin() { this.tone(988, 0.07, 'square', 0.18); this.tone(1319, 0.12, 'square', 0.18, null, 0.07); }
  crystal() { this.tone(1319, 0.08, 'triangle', 0.18); this.tone(1760, 0.14, 'triangle', 0.18, null, 0.08); }
  enemy() { this.tone(520, 0.12, 'square', 0.2, 180); this.noise(0.08, 0.1, 0.02); }
  damage() { this.tone(300, 0.25, 'sawtooth', 0.2, 90); this.noise(0.12, 0.12); }
  powerup() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'square', 0.18, null, i * 0.06));
  }
  bump() { this.tone(220, 0.08, 'square', 0.15, 160); }
  break() { this.noise(0.15, 0.18); this.tone(180, 0.1, 'square', 0.12, 80); }
  complete() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.2, null, i * 0.12));
  }
  gameover() {
    [440, 392, 349, 294].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.2, null, i * 0.18));
  }
  click() { this.tone(660, 0.05, 'square', 0.12); }
  checkpoint() { this.tone(784, 0.1, 'square', 0.16); this.tone(1047, 0.14, 'square', 0.16, null, 0.1); }
  ember() { this.tone(440, 0.08, 'sawtooth', 0.16); this.tone(660, 0.12, 'sawtooth', 0.16, null, 0.06); }
  bossHit() { this.tone(200, 0.12, 'square', 0.22, 120); this.noise(0.1, 0.12); }
  bossDefeat() { [330, 262, 196, 131].forEach((f, i) => this.tone(f, 0.25, 'sawtooth', 0.22, null, i * 0.14)); this.noise(0.3, 0.18, 0.5); }
  shadowlordDefeat() { [262, 196, 165, 131, 98].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.22, null, i * 0.16)); this.noise(0.4, 0.2, 0.6); }
  bossShoot() { this.tone(180, 0.1, 'sawtooth', 0.16, 90); }
  shield() { [659, 880, 1175].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.18, null, i * 0.05)); }
  shieldBreak() { this.tone(440, 0.2, 'sawtooth', 0.18, 220); this.noise(0.1, 0.1); }
}

export const audio = new AudioEngine();