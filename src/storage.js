// ЕДИНСТВЕННОЕ место, где хранятся баланс и прогресс.
// Сейчас — localStorage. Позже сюда же подключим Firebase, остальной код менять не придётся.
import { STARTING_BALANCE } from './config.js';

const KEY = 'nebesny_kush_save_v1';

function defaults() {
  return {
    version: 1,
    ageConfirmed: false,
    balance: STARTING_BALANCE,
    xp: 0, // опыт внутри текущего уровня
    level: 1,
    stats: { spins: 0, totalBet: 0, totalWon: 0, biggestWin: 0 },
    achievements: {}, // id -> время получения
    daily: { lastDate: null, streak: 0 },
    rescueLastAt: 0,
    rewarded: { date: null, count: 0 },
    lastInterstitialAt: 0,
    noAds: false,
    freeSpins: { left: 0, bet: 0, totalWin: 0 },
    settings: { sound: true, lineBet: 1, lines: 10, speed: 2, slot: 'nebesny' },
  };
}

let backend = null;
let state = defaults();
const listeners = new Set();

function merge(base, saved) {
  for (const k of Object.keys(saved || {})) {
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof saved[k] === 'object') {
      merge(base[k], saved[k]);
    } else if (k in base) base[k] = saved[k];
  }
  return base;
}

function persist() {
  try {
    backend?.setItem(KEY, JSON.stringify(state));
  } catch {
    /* хранилище недоступно — играем без сохранения */
  }
  listeners.forEach((fn) => fn(state));
}

/** Загрузка сохранения. store — объект с getItem/setItem (по умолчанию localStorage). */
export function load(store = globalThis.localStorage) {
  backend = store || null;
  state = defaults();
  try {
    const raw = backend?.getItem(KEY);
    if (raw) merge(state, JSON.parse(raw));
    // известные слоты; неизвестный id сбрасываем на «Небесный Куш»
    if (!['nebesny', 'western'].includes(state.settings.slot)) state.settings.slot = 'nebesny';
  } catch {
    state = defaults();
  }
  return get();
}

/** Копия всего состояния только для чтения. */
export function get() {
  return structuredClone(state);
}

export function getBalance() {
  return state.balance;
}

/** Начислить монеты (выигрыш, бонус, покупка). */
export function addCoins(amount) {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('bad amount');
  state.balance += Math.floor(amount);
  persist();
  return state.balance;
}

/** Списать монеты (ставка). Возвращает false, если не хватает. */
export function spendCoins(amount) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('bad amount');
  if (state.balance < amount) return false;
  state.balance -= amount;
  persist();
  return true;
}

/** Изменить прогресс/настройки (НЕ баланс). fn получает изменяемый черновик. */
export function update(fn) {
  const before = state.balance;
  fn(state);
  state.balance = before; // баланс меняется только через addCoins/spendCoins
  persist();
  return get();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Для тестов и кнопки «начать заново» в будущем. */
export function reset() {
  state = defaults();
  persist();
}
