// Общие элементы интерфейса ядра: модальные окна, тосты, крупный выигрыш, монетки.
import { $, el } from './util.js';
import { fmt } from './util.js';
import { sfx } from './sound.js';
import { t } from '../i18n/index.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const COIN_SVG = `<svg viewBox="0 0 100 100" class="coin" aria-hidden="true"><defs><radialGradient id="gcoin" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff6a8"/><stop offset=".6" stop-color="#ffc21f"/><stop offset="1" stop-color="#c77400"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#gcoin)" stroke="#8a4b00" stroke-width="5"/><circle cx="50" cy="50" r="35" fill="none" stroke="#fff2a6" stroke-width="3" opacity=".7"/><path d="M50 22 57 41 77 42 61 54 67 74 50 62 33 74 39 54 23 42 43 41Z" fill="#a85f00"/></svg>`;
export const coinInline = `<span class="coin-inline">${COIN_SVG}</span>`;

// ---------- модальное окно ----------
export function initModal() {
  $('modal').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || (e.target === $('modal') && $('modal').dataset.closable)) closeModal();
  });
}
export function openModal(html, { closable = true, kind = '' } = {}) {
  $('modalBody').innerHTML = html + (closable ? `<button class="btn alt" data-close data-testid="modal-close">${t('close')}</button>` : '');
  $('modal').hidden = false;
  $('modal').dataset.closable = closable ? '1' : '';
  $('modal').dataset.kind = kind;
  return $('modalBody');
}
export function closeModal() {
  $('modal').hidden = true;
}
export function isModalOpen() {
  return !$('modal').hidden;
}

// ---------- тосты ----------
export function toast(html) {
  const node = el('div', 'toast', html);
  $('toasts').appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

// ---------- крупный выигрыш ----------
const TIER_INFO = {
  big: { key: 'bigwin_big', coins: 14, hold: 2200, count: 1100 },
  mega: { key: 'bigwin_mega', coins: 26, hold: 2800, count: 1700 },
  epic: { key: 'bigwin_epic', coins: 44, hold: 3400, count: 2300 },
};

export function bigWin(amount, tier = 'big', shakeEl = null) {
  const info = TIER_INFO[tier] || TIER_INFO.big;
  const r = reduced();
  const box = $('bigWin');
  box.className = `big-win ${tier}`;
  $('bigWinTitle').textContent = t(info.key);
  if (shakeEl) { shakeEl.classList.add('shake'); setTimeout(() => shakeEl.classList.remove('shake'), 700); }
  const sumEl = $('bigWinSum');
  const dur = r ? 0 : info.count;
  const t0 = performance.now();
  let lastTick = 0;
  sumEl.classList.add('counting');
  const tick = (now) => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1;
    const eased = 1 - Math.pow(1 - k, 2.5);
    sumEl.textContent = `+${fmt(amount * eased)}`;
    if (!r && k < 1 && now - lastTick > 70) { sfx.coin(); lastTick = now; }
    if (k < 1) requestAnimationFrame(tick);
    else {
      sumEl.textContent = `+${fmt(amount)}`;
      sumEl.classList.remove('counting');
      sumEl.classList.add('pop-done');
      setTimeout(() => sumEl.classList.remove('pop-done'), 400);
      sfx.coin();
    }
  };
  requestAnimationFrame(tick);
  const coins = $('bigWinCoins');
  coins.innerHTML = '';
  if (!r) {
    for (let i = 0; i < info.coins; i++) {
      const c = el('i', null, COIN_SVG);
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDuration = `${1.1 + Math.random() * 1.4}s`;
      c.style.animationDelay = `${Math.random() * 0.6}s`;
      coins.appendChild(c);
    }
  }
  box.hidden = false;
  clearTimeout(bigWin._t);
  bigWin._t = setTimeout(() => { box.hidden = true; }, r ? 900 : info.hold);
}

export function coinBurst(anchor, n = 7) {
  if (reduced() || !anchor) return;
  const m = anchor.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const c = el('i', 'burst-coin', COIN_SVG);
    c.style.left = `${m.left + m.width / 2 - 15}px`;
    c.style.top = `${m.bottom - 40}px`;
    c.style.setProperty('--dx', `${Math.random() * 160 - 80}px`);
    c.style.setProperty('--dy', `${-70 - Math.random() * 70}px`);
    c.style.animationDelay = `${Math.random() * 0.12}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
}
