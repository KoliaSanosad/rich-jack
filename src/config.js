// ВСЕ ЧИСЛА ЭКОНОМИКИ — ТОЛЬКО ЗДЕСЬ.
// Монеты виртуальные: их нельзя вывести, обменять или передать.

export const GAME_NAME = 'Небесный Куш';

export const STARTING_BALANCE = 2000;

// Ежедневный бонус: дни 1–7 серии. После 7-го дня серия продолжается с наградой дня 7.
// Пропуск дня — серия начинается заново.
export const DAILY_BONUS = [500, 600, 700, 800, 1000, 1200, 1500];

// Спасательный бонус: когда баланс ниже минимальной ставки, за просмотр видео.
export const RESCUE_BONUS = 200;
export const RESCUE_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 часа

// Ставки. Игрок выбирает ставку НА ЛИНИЮ и число активных линий (1–10).
// Общая ставка = ставка на линию × число линий.
export const LINES_TOTAL = 10; // всего линий в слоте
export const MIN_LINE_BET = 1; // минимальная ставка на линию
export const LINE_BET_STEPS = [1, 2, 3, 5, 10, 15, 20, 30, 50, 75, 100];
export const MAX_LINE_BET_LEVEL_1 = 10; // макс. ставка на линию на 1 уровне
export const MAX_LINE_BET_TOP = 100; // макс. ставка на линию к 20 уровню
export const MAX_BET_TOP_LEVEL = 20;
// Минимальная общая ставка (1 линия × мин. ставка на линию) — порог спасательного бонуса.
export const MIN_BET = MIN_LINE_BET;

/** Максимальная ставка на линию для уровня: 10 на 1-м, линейно до 100 к 20-му. */
export function maxLineBetForLevel(level) {
  if (level >= MAX_BET_TOP_LEVEL) return MAX_LINE_BET_TOP;
  const t = (Math.max(1, level) - 1) / (MAX_BET_TOP_LEVEL - 1);
  return Math.round(MAX_LINE_BET_LEVEL_1 + t * (MAX_LINE_BET_TOP - MAX_LINE_BET_LEVEL_1));
}

// Уровни: опыт = поставленные монеты (1 монета ставки = 1 опыт).
// Чтобы перейти с уровня L на L+1, нужно XP_BASE + XP_STEP * (L - 1) опыта.
export const XP_PER_COIN_BET = 1;
export const XP_BASE = 1000;
export const XP_STEP = 500;

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

// Пороги спецэффектов (во сколько раз выигрыш больше ставки):
// win — любой выигрыш больше 101% ставки (лёгкий эффект),
// big/mega/epic — крупные выигрыши (эффект на весь экран).
export const WIN_TIERS = { win: 1.01, big: 15, mega: 50, epic: 100 };

// ---------- Слот 1 «Небесный Куш» ----------
export const TARGET_RTP = 0.95;

export const SLOT1 = {
  reels: 5,
  rows: 3,
  // 10 линий: номер ряда (0 — верх, 2 — низ) на каждом барабане
  lines: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0],
  ],
  // Символы. pays — множитель ставки НА ЛИНИЮ за 3/4/5 подряд слева.
  symbols: [
    { id: 'star', name: 'Звезда', pays: [5, 15, 40] },
    { id: 'moon', name: 'Луна', pays: [5, 20, 50] },
    { id: 'comet', name: 'Комета', pays: [10, 30, 80] },
    { id: 'ringed', name: 'Планета с кольцами', pays: [15, 40, 120] },
    { id: 'alien', name: 'Инопланетянин', pays: [20, 60, 200] },
    { id: 'ufo', name: 'НЛО', pays: [30, 100, 400] },
    { id: 'wild', name: 'Чёрная дыра', pays: [50, 200, 1000], wild: true },
    { id: 'rocket', name: 'Ракета', pays: [0, 0, 0], scatter: true },
  ],
  // Веса символов на каждом барабане (шанс выпадения в каждой клетке).
  weights: [
    // star moon comet ringed planet ufo wild rocket
    [18, 19, 15, 12, 9, 6, 0, 3],
    [18, 19, 15, 12, 9, 6, 4, 3],
    [18, 19, 15, 12, 9, 6, 4, 3],
    [18, 19, 15, 12, 9, 6, 4, 3],
    [18, 19, 15, 12, 9, 6, 4, 3],
  ],
  // Ракеты (scatter) в любом месте: выплата × ОБЩАЯ ставка и бесплатные вращения
  scatterPays: { 3: 2, 4: 10, 5: 50 },
  freeSpins: { 3: 8, 4: 12, 5: 20 },
  freeSpinMultiplier: 2,
  // Бонус слота 1: scatter-символ даёт бесплатные вращения (обрабатывается движком).
  bonus: { type: 'freeSpins' },
};

// ---------- Слот «Дикий Запад» (western) ----------
// Два бонуса: звезда шерифа (scatter) — бесплатные вращения; подкова (coin) — «Собери монеты».
// Веса и значения подобраны симуляцией 10 млн спинов: RTP ≈ 95% (линии ~70% + вращения ~12% + монеты ~12%).
export const WESTERN = {
  reels: 5,
  rows: 3,
  lines: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0],
  ],
  // Порядок символов ДОЛЖЕН совпадать с порядком весов ниже.
  symbols: [
    { id: 'wheel', name: 'Колесо фургона', pays: [4, 20, 60] },
    { id: 'revolver', name: 'Револьвер', pays: [5, 25, 75] },
    { id: 'cactus', name: 'Кактус', pays: [10, 30, 100] },
    { id: 'hat', name: 'Шляпа', pays: [12, 50, 150] },
    { id: 'bandit', name: 'Бандит', pays: [15, 60, 200] },
    { id: 'sheriff', name: 'Шериф', pays: [25, 100, 500] },
    { id: 'dynamite', name: 'Динамит (WILD)', pays: [50, 200, 1000], wild: true },
    { id: 'star', name: 'Звезда шерифа', pays: [0, 0, 0], scatter: true },
    { id: 'coin', name: 'Подкова-монета', pays: [0, 0, 0], coin: true },
  ],
  weights: [
    // wheel rev cac hat ban she wild star coin
    [20, 18, 15, 12, 10, 7, 0, 3, 10],
    [20, 18, 15, 12, 10, 7, 8, 3, 10],
    [20, 18, 15, 12, 10, 7, 8, 2, 10],
    [20, 18, 15, 12, 10, 7, 8, 3, 10],
    [20, 18, 15, 12, 10, 7, 0, 3, 10],
  ],
  // Звезда (scatter) в любом месте: выплата × ОБЩАЯ ставка + бесплатные вращения
  scatterPays: { 3: 2, 4: 10, 5: 50 },
  freeSpins: { 3: 8, 4: 12, 5: 20 },
  freeSpinMultiplier: 2,
  // Бонус «Собери монеты»: 6+ подков за вращение → 3 респина, монеты залипают,
  // новая монета сбрасывает счётчик до 3. Значения монет — в долях ОБЩЕЙ ставки.
  collect: {
    symbol: 'coin',
    trigger: 6,
    respinProb: 0.135,
    values: [[1, 34], [2, 23], [3, 16], [5, 12], [10, 8], [15, 4], [25, 2], [50, 0.8]],
    grand: 15, // полное поле (15 монет) — дополнительный приз × общей ставки
  },
  bonus: { type: 'freeSpins' },
};
