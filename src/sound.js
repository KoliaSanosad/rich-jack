// Звуки генерируются кодом (Web Audio) — никаких чужих файлов.
import * as storage from './storage.js';

let ctx = null;
function ac() {
  if (!ctx) {
    const C = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = 'sine', vol = 0.15, delay = 0, slide = 0 } = {}) {
  if (!storage.get().settings.sound) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  click: () => tone(660, 0.06, { type: 'square', vol: 0.05 }),
  spin: () => tone(200, 0.35, { type: 'sawtooth', vol: 0.05, slide: 3 }),
  stop: (i) => tone(320 + i * 40, 0.08, { type: 'triangle', vol: 0.12 }),
  win: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, { delay: i * 0.09, vol: 0.12 })),
  bigWin: () => [523, 659, 784, 1046, 1318, 1046, 1318, 1568].forEach((f, i) => tone(f, 0.24, { type: 'triangle', delay: i * 0.11 })),
  anticip: () => tone(420, 0.5, { type: 'sine', vol: 0.09, slide: 2.4 }),
  freeSpins: () => tone(150, 1.0, { type: 'sawtooth', vol: 0.08, slide: 8 }),
  coin: () => tone(1200, 0.1, { type: 'square', vol: 0.05, slide: 1.5 }),
  level: () => [392, 523, 659, 784].forEach((f, i) => tone(f, 0.25, { delay: i * 0.12, vol: 0.1 })),
};

export function isOn() {
  return storage.get().settings.sound;
}

export function toggle() {
  storage.update((s) => { s.settings.sound = !s.settings.sound; });
  if (isOn()) sfx.click();
  return isOn();
}
