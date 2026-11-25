// Достижения (без уровней). Тексты названий/описаний — в src/i18n.
import * as storage from './storage.js';

// test(stats, event) — event это сводка последнего раунда ({ win, bet, freeSpinsTriggered, wild5 }) или null.
export const ACHIEVEMENTS = [
  { id: 'first_spin', test: (s) => s.stats.spins >= 1 },
  { id: 'spins_100', test: (s) => s.stats.spins >= 100 },
  { id: 'spins_1000', test: (s) => s.stats.spins >= 1000 },
  { id: 'free_spins', test: (s, e) => e?.freeSpinsTriggered },
  { id: 'big_win', test: (s, e) => e && e.bet > 0 && e.win >= e.bet * 20 },
  { id: 'wild5', test: (s, e) => e?.wild5 },
  { id: 'rich_10k', test: (s) => s.balance >= 10000 },
  { id: 'rich_100k', test: (s) => s.balance >= 100000 },
  { id: 'daily_7', test: (s) => s.daily.streak >= 7 },
];

/** Проверить достижения. event — сводка последнего раунда. Возвращает новые id. */
export function checkAchievements(event, now = Date.now()) {
  const st = storage.get();
  const fresh = ACHIEVEMENTS.filter((a) => !st.achievements[a.id] && a.test(st, event));
  if (fresh.length) {
    storage.update((s) => fresh.forEach((a) => { s.achievements[a.id] = now; }));
  }
  return fresh.map((a) => a.id);
}
