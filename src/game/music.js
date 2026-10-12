// Retro boss battle music — fast-paced chiptune synthesized with the Web Audio API.
// Two unique themes: an aggressive fire theme for the Ember Titan and a darker,
// menacing theme for the Shadow Lord. A look-ahead scheduler keeps the loop in time
// without blocking the game loop.
import { audio } from './audio';

const TEMPO = 152;                 // BPM — fast and urgent
const SIXTEENTH = 60 / TEMPO / 4;   // duration of one 16th note (seconds)
const BAR = 16;                     // steps per bar

// Note name -> frequency (Hz). null entry = rest.
const FREQ = {
  rest: null,
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.00, Ab2: 103.83, A2: 110.00, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, Bb5: 932.33,
};

// --- Ember Titan theme: C minor, driving 16th bass, fiery arpeggiated lead ---
const EMBER = {
  bass: [
    'C2', 'rest', 'C3', 'Eb2', 'C2', 'rest', 'G2', 'Bb2',
    'C2', 'rest', 'C3', 'Eb2', 'C2', 'rest', 'F2', 'Ab2',
    'C2', 'rest', 'C3', 'Eb2', 'C2', 'rest', 'G2', 'Bb2',
    'F2', 'rest', 'F3', 'Ab2', 'F2', 'rest', 'G2', 'Bb2',
  ],
  lead: [
    'C4', 'Eb4', 'G4', 'C5', 'Eb4', 'G4', 'C5', 'Eb5',
    'G4', 'Bb4', 'D5', 'G5', 'Bb4', 'D5', 'G5', 'Bb4',
    'C5', 'Eb5', 'G5', 'C5', 'Eb5', 'G5', 'C5', 'Eb5',
    'F4', 'Ab4', 'C5', 'F5', 'Ab4', 'C5', 'F5', 'Ab4',
  ],
  kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  hat:  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
};

// --- Shadow Lord theme: D minor, darker, menacing descending lead, heavier beat ---
const SHADOW = {
  bass: [
    'D2', 'rest', 'rest', 'D3', 'A2', 'rest', 'D2', 'rest',
    'rest', 'D2', 'rest', 'A2', 'rest', 'rest', 'D2', 'rest',
    'D2', 'rest', 'rest', 'D3', 'A2', 'rest', 'D2', 'rest',
    'C2', 'rest', 'C3', 'G2', 'rest', 'C2', 'rest', 'G2',
  ],
  lead: [
    'D5', 'A4', 'F5', 'D5', 'A4', 'F5', 'D5', 'A4',
    'D5', 'A4', 'F5', 'D5', 'A4', 'F5', 'D5', 'A4',
    'C5', 'G4', 'Eb5', 'C5', 'G4', 'Eb5', 'C5', 'G4',
    'D5', 'A4', 'F5', 'D5', 'A4', 'F5', 'Eb5', 'F5',
  ],
  kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  hat:  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
};

const THEMES = { ember: EMBER, shadowlord: SHADOW };

class BossMusic {
  constructor() {
    this.playing = false;
    this.theme = null;
    this.step = 0;
    this.nextNoteTime = 0;
    this.timer = null;
  }

  start(themeKey) {
    const theme = THEMES[themeKey] || EMBER;
    if (this.playing && this.theme === theme) return;
    this.stop();
    audio.init();
    audio.resume();
    if (!audio.ctx) return;
    this.playing = true;
    this.theme = theme;
    this.step = 0;
    this.nextNoteTime = audio.ctx.currentTime + 0.08;
    this.schedule();
  }

  stop() {
    this.playing = false;
    this.theme = null;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  schedule() {
    if (!this.playing || !audio.ctx) return;
    const lookAhead = 0.12;
    while (this.nextNoteTime < audio.ctx.currentTime + lookAhead) {
      this.playStep(this.step, this.nextNoteTime);
      this.nextNoteTime += SIXTEENTH;
      this.step = (this.step + 1) % this.theme.bass.length;
    }
    this.timer = setTimeout(() => this.schedule(), 25);
  }

  playStep(step, t) {
    const th = this.theme;
    const bass = th.bass[step];
    if (bass) this.voice(FREQ[bass], t, SIXTEENTH * 0.95, 'square', 0.16, 0.7);
    const lead = th.lead[step];
    if (lead) this.voice(FREQ[lead], t, SIXTEENTH * 0.85, 'square', 0.10, 0.5);
    if (th.kick[step]) this.kick(t);
    if (th.hat[step]) this.hat(t);
  }

  voice(freq, t, dur, type, vol, decay) {
    const ctx = audio.ctx;
    if (!ctx || audio.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * decay);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  kick(t) {
    const ctx = audio.ctx;
    if (!ctx || audio.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  hat(t) {
    const ctx = audio.ctx;
    if (!ctx || audio.muted) return;
    const dur = 0.03;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    src.connect(hp); hp.connect(gain); gain.connect(audio.master);
    src.start(t);
  }
}

export const bossMusic = new BossMusic();