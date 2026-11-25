import { describe, it, expect } from 'vitest';
import { NEBESNY_DEF } from '../src/games/nebesny/config.js';
import { WESTERN_DEF } from '../src/games/western/config.js';
import { createEngine, exactRtp } from '../src/games/slot/engine.js';
import { TARGET_RTP } from '../src/core/config.js';

// поле, где каждый барабан заполнен одним символом из списка
const cols = (...syms) => syms.map((s) => [s, s, s]);

describe('слот «Небесный Куш»', () => {
  const eng = createEngine(NEBESNY_DEF);
  const id = (name) => NEBESNY_DEF.symbols.findIndex((s) => s.id === name);
  const S = id('star'), U = id('ufo'), W = id('wild'), R = id('rocket'), M = id('moon');

  it('RTP по формуле = 95% (±0.2)', () => {
    expect(Math.abs(exactRtp(NEBESNY_DEF).rtp - TARGET_RTP)).toBeLessThan(0.002);
  });
  it('поле 5×3', () => {
    const g = eng.spinGrid();
    expect(g).toHaveLength(5);
    g.forEach((c) => expect(c).toHaveLength(3));
  });
  it('3 звезды слева платят по всем 10 линиям', () => {
    const res = eng.evaluate(cols(S, S, S, M, M), 10);
    expect(res.lineWins).toHaveLength(10);
    expect(res.total).toBe(10 * 5 * 10);
  });
  it('активны только выбранные линии', () => {
    const res = eng.evaluate(cols(S, S, S, M, M), 10, 3);
    expect(res.lineWins).toHaveLength(3);
    expect(res.total).toBe(3 * 5 * 10);
  });
  it('дикий символ заменяет', () => {
    expect(eng.lineMultiplier([U, W, W, U, S])).toMatchObject({ symbol: U, count: 4, mult: 100 });
  });
  it('5 диких — высшая выплата', () => {
    expect(eng.lineMultiplier([W, W, W, W, W]).mult).toBe(1000);
  });
  it('ракета не платит на линии и не заменяется диким', () => {
    expect(eng.lineMultiplier([R, R, R, R, R]).mult).toBe(0);
    expect(eng.lineMultiplier([W, R, R, S, S]).mult).toBe(0);
  });
  it('3 ракеты дают бесплатные вращения и выплату', () => {
    const g = cols(M, S, M, S, M);
    g[0][0] = R; g[2][1] = R; g[4][2] = R;
    const res = eng.evaluate(g, 1, 10);
    expect(res.scatter.freeSpins).toBe(8);
    expect(res.scatter.win).toBe(20);
  });
  it('множитель бесплатных вращений', () => {
    const a = eng.evaluate(cols(S, S, S, M, M), 10, 10).total;
    const b = eng.evaluate(cols(S, S, S, M, M), 10, 10, 2).total;
    expect(b).toBe(a * 2);
  });
});

describe('слот «Дикий Запад»', () => {
  const eng = createEngine(WESTERN_DEF);
  const id = (name) => WESTERN_DEF.symbols.findIndex((s) => s.id === name);
  const HS = id('horseshoe'), DY = id('dynamite'), MB = id('moneybag'), SH = id('sheriff'), BN = id('bandit');

  it('поле 3×3, 1 линия, 7 символов', () => {
    expect(WESTERN_DEF.reels).toBe(3);
    expect(WESTERN_DEF.rows).toBe(3);
    expect(WESTERN_DEF.lines).toHaveLength(1);
    expect(WESTERN_DEF.symbols).toHaveLength(7);
  });
  it('сапога больше нет, есть звезда шерифа и бандит', () => {
    expect(id('boot')).toBe(-1);
    expect(SH).toBeGreaterThanOrEqual(0);
    expect(BN).toBeGreaterThanOrEqual(0);
  });
  it('3 подковы в ряд платят ×4 ставки на линию', () => {
    expect(eng.lineMultiplier([HS, HS, HS])).toMatchObject({ symbol: HS, count: 3, mult: 4, wilds: 0 });
  });
  it('3 звезды шерифа платят ×7, 3 бандита ×38', () => {
    expect(eng.lineMultiplier([SH, SH, SH])).toMatchObject({ symbol: SH, count: 3, mult: 7 });
    expect(eng.lineMultiplier([BN, BN, BN])).toMatchObject({ symbol: BN, count: 3, mult: 38 });
  });
  it('дикий (мешок) заменяет и удваивает выигрыш линии', () => {
    expect(eng.lineMultiplier([MB, HS, HS])).toMatchObject({ symbol: HS, count: 3, mult: 4, wilds: 1 });
    expect(eng.evaluate(cols(MB, HS, HS), 10, 1).total).toBe(4 * 10 * 2);
  });
  it('3 мешка платят по своей таблице без удвоения', () => {
    expect(eng.lineMultiplier([MB, MB, MB])).toMatchObject({ symbol: MB, count: 3, mult: 148, wilds: 0 });
  });
  it('бонус «Взрыв динамита» срабатывает при 3+ динамитах', () => {
    const grid = cols(HS, SH, HS);
    grid[0][0] = DY; grid[1][1] = DY; grid[2][2] = DY;
    const out = eng.evaluateWithBonus(grid, 10, 1, 1, () => 0);
    expect(out.bonus).not.toBeNull();
    expect(out.total).toBeGreaterThanOrEqual(out.base.total);
  });
  it('без 3 динамитов бонуса нет', () => {
    const out = eng.evaluateWithBonus(cols(HS, SH, HS), 10, 1, 1, () => 0);
    expect(out.bonus).toBeNull();
  });
});
