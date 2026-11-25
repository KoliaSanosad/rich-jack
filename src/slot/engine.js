// Математика слота. Чистые функции, без DOM — легко тестировать.
import { weightedIndex, randomInt } from '../rng.js';

export function createEngine(def) {
  const wildIdx = def.symbols.findIndex((s) => s.wild);
  const scatterIdx = def.symbols.findIndex((s) => s.scatter);
  const coinIdx = def.symbols.findIndex((s) => s.coin);
  const totals = def.weights.map((w) => w.reduce((a, b) => a + b, 0));
  const linesCount = def.lines.length;
  // честное число 0..1 (на основе crypto через randomInt)
  const rand01 = () => randomInt(1 << 24) / (1 << 24);

  /** Случайное поле: grid[барабан][ряд] = индекс символа. */
  function spinGrid(pick = weightedIndex) {
    const grid = [];
    for (let r = 0; r < def.reels; r++) {
      const col = [];
      for (let row = 0; row < def.rows; row++) col.push(pick(def.weights[r], totals[r]));
      grid.push(col);
    }
    return grid;
  }

  /** Множитель (в ставках на линию) для символов линии. wilds — сколько диких заменили символ. */
  function lineMultiplier(syms) {
    if (scatterIdx >= 0 && syms[0] === scatterIdx) return { mult: 0, symbol: -1, count: 0, wilds: 0 };
    // вариант А: только дикие подряд (платят по своей таблице, без удвоения — это сам дикий)
    let w = 0;
    while (w < syms.length && syms[w] === wildIdx) w++;
    const wildMult = wildIdx >= 0 && w >= 3 ? def.symbols[wildIdx].pays[w - 3] : 0;
    let best = { mult: wildMult, symbol: wildIdx, count: w, wilds: 0 };
    // вариант Б: первый не-дикий символ + дикие как замена (дикие удваивают, если заданы)
    const target = w < syms.length ? syms[w] : -1;
    if (target >= 0 && target !== scatterIdx) {
      let n = 0;
      let wilds = 0;
      while (n < syms.length && (syms[n] === target || syms[n] === wildIdx)) {
        if (syms[n] === wildIdx) wilds++;
        n++;
      }
      const m = n >= 3 ? def.symbols[target].pays[n - 3] : 0;
      if (m > best.mult) best = { mult: m, symbol: target, count: n, wilds };
    }
    if (best.mult === 0) return { mult: 0, symbol: -1, count: 0, wilds: 0 };
    return best;
  }

  /**
   * Подсчёт выигрыша.
   * lineBet — ставка на одну линию; lines — сколько линий активно (1..linesCount);
   * multiplier — для бесплатных вращений. Выплаты считаются только по активным линиям,
   * скаттер — от общей ставки (lineBet × lines).
   */
  function evaluate(grid, lineBet, lines = linesCount, multiplier = 1) {
    const activeLines = Math.max(1, Math.min(linesCount, lines));
    const totalBet = lineBet * activeLines;
    const lineWins = [];
    let total = 0;
    for (let li = 0; li < activeLines; li++) {
      const rows = def.lines[li];
      const syms = rows.map((row, reel) => grid[reel][row]);
      const r = lineMultiplier(syms);
      if (r.mult > 0) {
        // дикий-удвоитель: если дикие заменили символ в линии, множитель слота применяется
        const wildMult = r.wilds > 0 ? (def.wildWinMultiplier || 1) : 1;
        const win = r.mult * lineBet * multiplier * wildMult;
        total += win;
        lineWins.push({
          line: li,
          symbol: r.symbol,
          count: r.count,
          win,
          cells: rows.slice(0, r.count).map((row, reel) => [reel, row]),
        });
      }
    }
    const scatterCells = [];
    if (scatterIdx >= 0) grid.forEach((col, reel) => col.forEach((s, row) => s === scatterIdx && scatterCells.push([reel, row])));
    const sc = Math.min(scatterCells.length, 5);
    const scatterWin = ((def.scatterPays && def.scatterPays[sc]) || 0) * totalBet * multiplier;
    const freeSpins = (def.freeSpins && def.freeSpins[sc]) || 0;
    total += scatterWin;
    return {
      lineWins,
      scatter: { count: scatterCells.length, win: scatterWin, freeSpins, cells: freeSpins ? scatterCells : [] },
      total,
    };
  }

  /**
   * Полный исход вращения с учётом бонуса «Горячий респин».
   * Возвращает базовую оценку, данные респина (если был) и общий выигрыш.
   */
  function evaluateWithBonus(grid, lineBet, lines = linesCount, multiplier = 1, pick = weightedIndex) {
    const base = evaluate(grid, lineBet, lines, multiplier);
    let bonus = null;
    if (def.bonus?.type === 'respin') {
      const sym = def.symbols.findIndex((s) => s.id === def.bonus.symbol);
      if (sym >= 0) {
        const counts = grid.map((col) => col.reduce((n, s) => n + (s === sym ? 1 : 0), 0));
        const totalSym = counts.reduce((a, b) => a + b, 0);
        if (totalSym >= def.bonus.trigger) {
          // перекручиваем барабан с наименьшим числом бонус-символов (остальные «горячие» держим)
          let reel = 0;
          for (let r = 1; r < def.reels; r++) if (counts[r] < counts[reel]) reel = r;
          const newCol = [];
          for (let row = 0; row < def.rows; row++) newCol.push(pick(def.weights[reel], totals[reel]));
          const grid2 = grid.map((c, i) => (i === reel ? newCol : c));
          const result = evaluate(grid2, lineBet, lines, multiplier);
          bonus = { reel, newCol, grid: grid2, result };
        }
      }
    }
    const total = base.total + (bonus ? bonus.result.total : 0);
    return { base, bonus, total };
  }

  /**
   * Бонус «Собери монеты» (hold-and-collect). Исход полностью определяется ДО анимации,
   * честно (через crypto): какие монеты залипли, их значения, что добавилось в респинах.
   * Значения монет — в долях ОБЩЕЙ ставки. rand — функция 0..1 (для тестов/симуляции).
   * Возвращает { triggered, payout, coins, locked, steps, full, sumUnits }.
   */
  function evaluateCollect(grid, totalBet, rand = rand01) {
    const c = def.collect;
    if (coinIdx < 0 || !c) return { triggered: false, payout: 0, coins: 0 };
    const cells = [];
    grid.forEach((col, reel) => col.forEach((s, row) => { if (s === coinIdx) cells.push({ reel, row }); }));
    if (cells.length < c.trigger) return { triggered: false, payout: 0, coins: cells.length };
    const vals = c.values;
    const vTotal = vals.reduce((a, [, w]) => a + w, 0);
    const pickVal = () => { let x = rand() * vTotal; for (const [v, w] of vals) { x -= w; if (x < 0) return v; } return vals[vals.length - 1][0]; };
    const cellsN = def.reels * def.rows;
    const filled = new Set(cells.map((p) => `${p.reel}-${p.row}`));
    const locked = cells.map((p) => ({ reel: p.reel, row: p.row, val: pickVal() }));
    let sum = locked.reduce((a, p) => a + p.val, 0);
    const steps = [];
    let respins = 3;
    while (respins > 0 && filled.size < cellsN) {
      const land = [];
      for (let reel = 0; reel < def.reels; reel++) {
        for (let row = 0; row < def.rows; row++) {
          const key = `${reel}-${row}`;
          if (filled.has(key)) continue;
          if (rand() < c.respinProb) { const val = pickVal(); filled.add(key); land.push({ reel, row, val }); sum += val; }
        }
      }
      steps.push({ land, respins });
      respins = land.length > 0 ? 3 : respins - 1;
    }
    const full = filled.size >= cellsN;
    if (full) sum += c.grand || 0;
    return { triggered: true, payout: Math.floor(sum * totalBet), coins: cells.length, locked, steps, full, sumUnits: sum };
  }

  return { def, wildIdx, scatterIdx, coinIdx, totals, spinGrid, evaluate, lineMultiplier, evaluateWithBonus, evaluateCollect };
}

/** Точный (аналитический) RTP с учётом бесплатных вращений. */
export function exactRtp(def) {
  const eng = createEngine(def);
  const n = def.symbols.length;
  const probs = def.weights.map((w) => {
    const t = w.reduce((a, b) => a + b, 0);
    return w.map((x) => x / t);
  });
  // ожидание множителя одной линии (все линии одинаковы: клетки независимы)
  let lineE = 0;
  const syms = [0, 0, 0, 0, 0];
  const rec = (reel, p) => {
    if (p === 0) return;
    if (reel === 5) {
      lineE += p * eng.lineMultiplier(syms).mult;
      return;
    }
    for (let s = 0; s < n; s++) {
      syms[reel] = s;
      rec(reel + 1, p * probs[reel][s]);
    }
  };
  rec(0, 1);
  // распределение числа scatter на 15 клетках
  let dist = [1];
  for (let r = 0; r < def.reels; r++) {
    const ps = probs[r][eng.scatterIdx];
    for (let row = 0; row < def.rows; row++) {
      const nd = new Array(dist.length + 1).fill(0);
      dist.forEach((v, k) => {
        nd[k] += v * (1 - ps);
        nd[k + 1] += v * ps;
      });
      dist = nd;
    }
  }
  let scatterE = 0;
  let q = 0;
  let pTrigger = 0;
  dist.forEach((p, k) => {
    const c = Math.min(k, 5);
    scatterE += p * (def.scatterPays[c] || 0);
    q += p * (def.freeSpins[c] || 0);
    if (def.freeSpins[c]) pTrigger += p;
  });
  const base = lineE * 1 + scatterE; // lineE уже в долях общей ставки (10 линий × 1/10)
  const m = def.freeSpinMultiplier;
  const rtp = base * (1 + (m * q) / (1 - q));
  return { rtp, base, lineRtp: lineE, scatterRtp: scatterE, freeSpinsPerSpin: q, triggerChance: pTrigger };
}
