// Симуляция RTP для всех слотов.
// Запуск: npm run rtp   (или node tools/rtp.js 200000 nebesny — число спинов и слот)
import { NEBESNY_DEF } from '../src/games/nebesny/config.js';
import { WESTERN_DEF } from '../src/games/western/config.js';
import { createEngine, exactRtp } from '../src/games/slot/engine.js';
import { TARGET_RTP } from '../src/core/config.js';

const SPINS = Number(process.argv[2]) || 1_000_000;
const onlyId = process.argv[3];
const TOLERANCE = 0.015; // ±1.5 п.п. — разброс симуляции
const pct = (x) => (x * 100).toFixed(2) + '%';

const SLOTS = [
  { id: 'nebesny', name: 'Небесный Куш', def: NEBESNY_DEF },
  { id: 'western', name: 'Дикий Запад', def: WESTERN_DEF },
];

function simulate(def, spins) {
  const eng = createEngine(def);
  const lines = def.lines.length;
  const LINE_BET = 1;
  const BET = LINE_BET * lines;
  let bet = 0, won = 0, hits = 0, maxWin = 0, bonuses = 0, bonusPlayed = 0;
  for (let i = 0; i < spins; i++) {
    bet += BET;
    let spinWin = 0;
    if (def.bonus?.type === 'respin') {
      const out = eng.evaluateWithBonus(eng.spinGrid(), LINE_BET, lines, 1);
      spinWin = out.total;
      if (out.bonus) { bonuses++; bonusPlayed++; }
    } else {
      const res = eng.evaluate(eng.spinGrid(), LINE_BET, lines);
      spinWin = res.total;
      let fs = res.scatter.freeSpins;
      if (fs) bonuses++;
      while (fs > 0) {
        fs--; bonusPlayed++;
        const r = eng.evaluate(eng.spinGrid(), LINE_BET, lines, def.freeSpinMultiplier);
        spinWin += r.total;
        fs += r.scatter.freeSpins;
      }
    }
    if (spinWin > 0) hits++;
    if (spinWin > maxWin) maxWin = spinWin;
    won += spinWin;
  }
  return { rtp: won / bet, hits, maxWin, bet: BET, bonuses, bonusPlayed };
}

let allOk = true;
for (const s of SLOTS) {
  if (onlyId && s.id !== onlyId) continue;
  const t0 = Date.now();
  const r = simulate(s.def, SPINS);
  const ex = s.def.bonus?.type === 'freeSpins' ? exactRtp(s.def) : null;
  console.log(`\n=== ${s.name} (${s.def.reels}×${s.def.rows}, ${s.def.lines.length} линий) ===`);
  console.log(`Спинов: ${SPINS.toLocaleString('ru')}  (${((Date.now() - t0) / 1000).toFixed(1)} с)`);
  console.log(`RTP по симуляции:  ${pct(r.rtp)}   цель ${pct(TARGET_RTP)}`);
  if (ex) console.log(`RTP по формуле:    ${pct(ex.rtp)}`);
  console.log(`Частота выигрыша:  ${pct(r.hits / SPINS)}`);
  console.log(`Бонус: раз в ${Math.round(SPINS / Math.max(1, r.bonuses))} спинов, сыграно ${r.bonusPlayed}`);
  console.log(`Самый большой выигрыш: ${r.maxWin} при ставке ${r.bet} (×${(r.maxWin / r.bet).toFixed(0)})`);
  const ok = Math.abs(r.rtp - TARGET_RTP) < TOLERANCE && (!ex || Math.abs(ex.rtp - TARGET_RTP) < 0.002);
  console.log(ok ? 'OK: RTP в норме' : 'ОШИБКА: RTP вне допуска');
  if (!ok) allOk = false;
}
process.exit(allOk ? 0 : 1);
