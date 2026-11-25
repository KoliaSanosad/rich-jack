// Уровни (опыт за ставки) и достижения.
import * as storage from './storage.js';
import { XP_BASE, XP_STEP, XP_PER_COIN_BET, LINE_BET_STEPS, maxLineBetForLevel } from './config.js';

export function xpToNext(level) {
  return XP_BASE + XP_STEP * (level - 1);
}

/** Ставки на линию, доступные на этом уровне. */
export function lineBetOptions(level) {
  const max = maxLineBetForLevel(level);
  return LINE_BET_STEPS.filter((b) => b <= max);
}

/** Добавить опыт за ставку. Возвращает новые уровни (если были). */
export function addXpForBet(bet) {
  let levelsGained = [];
  storage.update((st) => {
    st.xp += bet * XP_PER_COIN_BET;
    while (st.xp >= xpToNext(st.level)) {
      st.xp -= xpToNext(st.level);
      st.level++;
      levelsGained.push(st.level);
    }
  });
  return levelsGained;
}

export const ACHIEVEMENTS = [
  { id: 'first_spin', name: 'Первый старт', desc: 'Сделать первое вращение', test: (s) => s.stats.spins >= 1 },
  { id: 'spins_100', name: 'Пилот', desc: 'Сделать 100 вращений', test: (s) => s.stats.spins >= 100 },
  { id: 'spins_1000', name: 'Ветеран космоса', desc: 'Сделать 1000 вращений', test: (s) => s.stats.spins >= 1000 },
  { id: 'free_spins', name: 'Ракетный запуск', desc: 'Запустить бесплатные вращения', test: (s, e) => e?.freeSpinsTriggered },
  { id: 'big_win', name: 'Сверхновая', desc: 'Выиграть ×20 от ставки за одно вращение', test: (s, e) => e && e.win >= e.bet * 20 },
  { id: 'wild5', name: 'Горизонт событий', desc: '5 чёрных дыр на одной линии', test: (s, e) => e?.wild5 },
  { id: 'level_5', name: 'Орбита', desc: 'Достичь 5 уровня', test: (s) => s.level >= 5 },
  { id: 'level_10', name: 'Дальний космос', desc: 'Достичь 10 уровня', test: (s) => s.level >= 10 },
  { id: 'level_20', name: 'Покоритель галактики', desc: 'Достичь 20 уровня', test: (s) => s.level >= 20 },
  { id: 'daily_7', name: 'Неделя в полёте', desc: 'Забирать ежедневный бонус 7 дней подряд', test: (s) => s.daily.streak >= 7 },
];

/** Проверить достижения. event — данные последнего вращения. Возвращает новые. */
export function checkAchievements(event, now = Date.now()) {
  const st = storage.get();
  const fresh = ACHIEVEMENTS.filter((a) => !st.achievements[a.id] && a.test(st, event));
  if (fresh.length) {
    storage.update((s) => fresh.forEach((a) => { s.achievements[a.id] = now; }));
  }
  return fresh;
}
