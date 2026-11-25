// Ежедневный бонус, спасательный бонус, видео за награду.
import * as storage from './storage.js';
import {
  DAILY_BONUS, RESCUE_BONUS, RESCUE_COOLDOWN_MS, MIN_BET,
  REWARDED_VIDEO_COINS, REWARDED_VIDEO_MAX_PER_DAY,
} from './config.js';
import { dayKey, daysBetween } from './util.js';

/** Какой день серии будет сегодня и доступен ли бонус. */
export function dailyStatus(now = Date.now()) {
  const { daily } = storage.get();
  const today = dayKey(now);
  if (daily.lastDate === today) {
    return { available: false, day: daily.streak, amount: DAILY_BONUS[Math.min(daily.streak, 7) - 1] };
  }
  const continues = daily.lastDate && daysBetween(daily.lastDate, today) === 1;
  const day = continues ? daily.streak + 1 : 1;
  return { available: true, day, amount: DAILY_BONUS[Math.min(day, 7) - 1] };
}

export function claimDaily(now = Date.now()) {
  const s = dailyStatus(now);
  if (!s.available) return null;
  storage.update((st) => {
    st.daily.lastDate = dayKey(now);
    st.daily.streak = s.day;
  });
  storage.addCoins(s.amount);
  return s;
}

/** Спасательный бонус: баланс ниже минимальной ставки, раз в 4 часа. */
export function rescueStatus(now = Date.now()) {
  const st = storage.get();
  const needed = st.balance < MIN_BET && st.freeSpins.left === 0;
  const waitMs = Math.max(0, st.rescueLastAt + RESCUE_COOLDOWN_MS - now);
  return { needed, available: needed && waitMs === 0, waitMs, amount: RESCUE_BONUS };
}

/** Вызывать только ПОСЛЕ досмотренного видео. */
export function claimRescue(now = Date.now()) {
  if (!rescueStatus(now).available) return 0;
  storage.update((st) => { st.rescueLastAt = now; });
  storage.addCoins(RESCUE_BONUS);
  return RESCUE_BONUS;
}

export function rewardedStatus(now = Date.now()) {
  const { rewarded } = storage.get();
  const used = rewarded.date === dayKey(now) ? rewarded.count : 0;
  const left = Math.max(0, REWARDED_VIDEO_MAX_PER_DAY - used);
  return { left, available: left > 0, amount: REWARDED_VIDEO_COINS };
}

/** Вызывать только ПОСЛЕ досмотренного видео. */
export function claimRewarded(now = Date.now()) {
  if (!rewardedStatus(now).available) return 0;
  const today = dayKey(now);
  storage.update((st) => {
    if (st.rewarded.date !== today) st.rewarded = { date: today, count: 0 };
    st.rewarded.count++;
  });
  storage.addCoins(REWARDED_VIDEO_COINS);
  return REWARDED_VIDEO_COINS;
}
