// ЕДИНСТВЕННОЕ место, где хранятся баланс и прогресс.
// Сейчас — localStorage. Позже сюда же подключим Firebase, остальной код менять не придётся.
// Игры НЕ обращаются к storage напрямую — только через api ядра (bet, win, getBalance).
import { STARTING_BALANCE, DEFAULT_BET } from './config.js';

const KEY = 'rich_jack_save_v1';

function defaults() {
  return {
    version: 1,
    ageConfirmed: false,
    balance: STARTING_BALANCE,
    stats: { spins: 0, totalBet: 0, totalWon: 0, biggestWin: 0 },
    achievements: {}, // id -> время получения
    daily: { lastDate: null, streak: 0 },
    rescueLastAt: 0,
    rewarded: { date: null, count: 0 },
    lastInterstitialAt: 0,
    noAds: false,
    settings: { sound: true, bet: DEFAULT_BET, speed: 2, lang: 'ru', lines: 0 }, // lines: 0 = все линии слота
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
  state.balance -= Math.floor(amount);
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

/** Для тестов и кнопки «начать заново». */
export function reset() {
  state = defaults();
  persist();
}
