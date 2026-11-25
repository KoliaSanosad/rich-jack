// ВСЯ ЭКОНОМИКА — ТОЛЬКО ЗДЕСЬ.
// Монеты виртуальные: их нельзя вывести, обменять на деньги/призы или передать.

export const APP_NAME = 'Rich Jack';

export const STARTING_BALANCE = 2000;

// Ежедневный бонус: дни 1–7 серии. С 8-го дня — фиксированно DAILY_BONUS_AFTER.
// Пропуск дня — серия начинается заново.
export const DAILY_BONUS = [500, 600, 700, 800, 1000, 1200, 1500];
export const DAILY_BONUS_AFTER = 1000;

// Спасательный бонус: когда баланс ниже минимальной ставки, раз в 4 часа.
export const RESCUE_BONUS = 200;
export const RESCUE_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 часа

// Ставки. Одна общая ставка (сумма монет) на все игры.
// Минимум 10, максимум = весь текущий баланс.
export const MIN_BET = 10;
export const BET_STEP = 10; // шаг кнопок «−» и «+»
export const DEFAULT_BET = 50;

/** Привести ставку к допустимому диапазону [MIN_BET, balance]. */
export function clampBet(bet, balance) {
  const max = Math.max(MIN_BET, Math.floor(balance));
  return Math.max(MIN_BET, Math.min(max, Math.floor(bet || MIN_BET)));
}

// Реклама (только в приложении)
export const REWARDED_VIDEO_COINS = 100;
export const REWARDED_VIDEO_MAX_PER_DAY = 10;
export const INTERSTITIAL_MIN_INTERVAL_MS = 4 * 60 * 1000; // 4 минуты

// Пакеты (только в приложении, Google Play Billing). Цена здесь — для справки,
// в приложении показывается цена из Google Play.
export const PRODUCTS = [
  { id: 'coins_1000', coins: 1000, price: '$2.99', tag: '' },
  { id: 'coins_2500', coins: 2500, price: '$4.99', tag: '+50%' },
  { id: 'coins_6000', coins: 6000, price: '$9.99', tag: 'Популярный' },
  { id: 'coins_15000', coins: 15000, price: '$19.99', tag: 'Самый выгодный' },
  { id: 'no_ads', coins: 0, price: '$2.99', tag: '', noAds: true },
];

// Ссылка на страницу в Google Play (пока приложения нет — пусто, кнопка покажет «Скоро»).
export const PLAY_STORE_URL = '';

// Автопрокрутка: число прокрутов (2–100) и скорость вращения (1–3).
export const AUTOSPIN = { presets: [10, 25, 50, 100], min: 2, max: 100, speeds: [1, 2, 3], defaultSpeed: 2 };

// Пороги спецэффектов (во сколько раз выигрыш больше ставки).
export const WIN_TIERS = { win: 1.01, big: 15, mega: 50, epic: 100 };

// Целевой RTP слотов.
export const TARGET_RTP = 0.95;
