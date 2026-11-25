import { describe, it, expect, beforeEach } from 'vitest';
import * as storage from '../src/core/storage.js';
import * as bonuses from '../src/core/bonuses.js';
import { checkAchievements } from '../src/core/achievements.js';
import { clampBet, MIN_BET, STARTING_BALANCE, PRODUCTS } from '../src/core/config.js';
import { memStore } from './memstore.js';

const DAY = 86400000;
const t0 = new Date(2026, 10, 23, 12).getTime();

beforeEach(() => storage.load(memStore()));

describe('баланс', () => {
  it('стартовый баланс 2000', () => expect(storage.getBalance()).toBe(STARTING_BALANCE));
  it('нельзя потратить больше, чем есть', () => {
    expect(storage.spendCoins(5000)).toBe(false);
    expect(storage.getBalance()).toBe(2000);
  });
  it('update не может изменить баланс', () => {
    storage.update((s) => { s.balance = 999999; });
    expect(storage.getBalance()).toBe(2000);
  });
  it('сохранение переживает перезапуск', () => {
    const store = memStore();
    storage.load(store);
    storage.spendCoins(100);
    storage.load(store);
    expect(storage.getBalance()).toBe(1900);
  });
});

describe('ставка (общая панель)', () => {
  it('минимум 10, максимум = баланс', () => {
    expect(clampBet(1, 2000)).toBe(MIN_BET);
    expect(clampBet(5, 2000)).toBe(10);
    expect(clampBet(50, 2000)).toBe(50);
    expect(clampBet(99999, 2000)).toBe(2000); // не больше баланса
  });
  it('минимальная ставка равна 10', () => expect(MIN_BET).toBe(10));
  it('при балансе ниже минимума максимум не опускается ниже 10', () => {
    expect(clampBet(50, 3)).toBe(MIN_BET);
  });
});

describe('ежедневный бонус', () => {
  it('серия 500..1500, с 8-го дня 1000, сброс при пропуске', () => {
    const got = [];
    for (let d = 0; d < 9; d++) got.push(bonuses.claimDaily(t0 + d * DAY).amount);
    expect(got).toEqual([500, 600, 700, 800, 1000, 1200, 1500, 1000, 1000]);
    expect(bonuses.claimDaily(t0 + 8 * DAY)).toBeNull(); // второй раз в тот же день
    expect(bonuses.claimDaily(t0 + 10 * DAY).amount).toBe(500); // пропустил день
  });
});

describe('спасательный бонус', () => {
  it('только при балансе ниже минимальной ставки и раз в 4 часа', () => {
    expect(bonuses.rescueStatus(t0).needed).toBe(false);
    storage.spendCoins(2000); // баланс 0 — ниже минимальной ставки
    expect(bonuses.claimRescue(t0)).toBe(200);
    storage.spendCoins(200);
    expect(bonuses.claimRescue(t0 + 3 * 3600000)).toBe(0);
    expect(bonuses.claimRescue(t0 + 4 * 3600000)).toBe(200);
  });
});

describe('видео за награду', () => {
  it('100 монет, максимум 10 в день', () => {
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += bonuses.claimRewarded(t0);
    expect(sum).toBe(1000);
    expect(bonuses.claimRewarded(t0 + DAY)).toBe(100);
  });
});

describe('достижения (без уровней)', () => {
  it('первое вращение и крупный выигрыш', () => {
    storage.update((s) => { s.stats.spins = 1; });
    const fresh = checkAchievements({ win: 500, bet: 10 });
    expect(fresh).toContain('first_spin');
    expect(fresh).toContain('big_win'); // 500 >= 10×20
  });
});

describe('правила Google Play', () => {
  it('в пакетах нет слова «кэш», монеты целые', () => {
    PRODUCTS.forEach((p) => {
      expect(Number.isInteger(p.coins)).toBe(true);
      expect(JSON.stringify(p).toLowerCase()).not.toMatch(/кэш|cash/);
    });
  });
});
