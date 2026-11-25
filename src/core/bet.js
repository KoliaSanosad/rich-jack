// Общая панель ставки — одна на все игры. Ставка это сумма монет.
// Минимум MIN_BET, максимум = весь текущий баланс. Значение хранится в storage.settings.bet.
import * as storage from './storage.js';
import { MIN_BET, BET_STEP, clampBet } from './config.js';
import { sfx } from './sound.js';
import { COIN_SVG } from './ui.js';
import { t } from '../i18n/index.js';

/** Текущая ставка, приведённая к [MIN_BET, баланс]. */
export function currentBet() {
  return clampBet(storage.get().settings.bet, storage.getBalance());
}

export function createBetPanel(container) {
  let locked = false;
  container.className = 'bet-panel';
  container.innerHTML = `
    <div class="bet-main">
      <button class="round-btn" data-bet="dec" aria-label="${t('bet_label')} −" data-testid="bet-dec">−</button>
      <div class="bet-field">
        <small>${t('bet_label')}</small>
        <input id="betInput" class="bet-input" type="number" inputmode="numeric" min="${MIN_BET}" data-testid="bet" />
        <span class="coin-ico bet-coin" aria-hidden="true"></span>
      </div>
      <button class="round-btn" data-bet="inc" aria-label="${t('bet_label')} +" data-testid="bet-inc">+</button>
    </div>
    <div class="bet-quick">
      <button data-bet="min" data-testid="bet-min">${t('bet_min')}</button>
      <button data-bet="half" data-testid="bet-half">${t('bet_half')}</button>
      <button data-bet="double" data-testid="bet-double">${t('bet_double')}</button>
      <button data-bet="max" data-testid="bet-max">${t('bet_max')}</button>
    </div>`;

  container.querySelector('.bet-coin').innerHTML = COIN_SVG;
  const input = container.querySelector('#betInput');

  function setBet(n) {
    const v = clampBet(n, storage.getBalance());
    if (v !== storage.get().settings.bet) storage.update((s) => { s.settings.bet = v; });
    else render();
    sfx.click();
  }

  function onClick(e) {
    const b = e.target.closest('[data-bet]');
    if (!b || locked) return;
    const cur = currentBet();
    const bal = storage.getBalance();
    const map = {
      dec: cur - BET_STEP,
      inc: cur + BET_STEP,
      min: MIN_BET,
      half: Math.floor(cur / 2),
      double: cur * 2,
      max: bal,
    };
    setBet(map[b.dataset.bet]);
  }
  function commitInput() {
    setBet(Number(input.value));
  }

  container.addEventListener('click', onClick);
  input.addEventListener('change', commitInput);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { commitInput(); input.blur(); } });

  function render() {
    const bet = currentBet();
    const bal = storage.getBalance();
    if (document.activeElement !== input) input.value = bet;
    input.max = Math.max(MIN_BET, bal);
    input.disabled = locked;
    container.querySelectorAll('[data-bet]').forEach((b) => {
      const k = b.dataset.bet;
      let dis = locked;
      if (k === 'dec' || k === 'min' || k === 'half') dis = dis || bet <= MIN_BET;
      if (k === 'inc' || k === 'double' || k === 'max') dis = dis || bet >= bal;
      b.disabled = dis;
    });
  }

  const unsub = storage.subscribe(render);
  render();

  return {
    getBet: currentBet,
    setBet,
    setLocked(v) { locked = v; render(); },
    destroy() { unsub(); container.removeEventListener('click', onClick); container.innerHTML = ''; container.className = ''; },
  };
}
