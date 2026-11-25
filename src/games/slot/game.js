// Общий «движок игры» для слотов. Каждый слот = createSlotGame(meta).
// Возвращает контракт игры { id, title, tag, icon, category, mount, unmount }.
// Монеты только через api (bet, win, getBalance). К storage напрямую не обращается.
import { createEngine } from './engine.js';
import { WIN_TIERS, AUTOSPIN } from '../../core/config.js';
import { coinInline } from '../../core/ui.js';
import { el } from '../../core/util.js';
import { fmt } from '../../core/util.js';
import { t } from '../../i18n/index.js';

const LINE_COLORS = ['#ffd54a', '#38d9ff', '#ff3df2', '#7dff6b', '#ff8a3d', '#b28cff', '#ff5c7a', '#5cffd6', '#fff35c', '#7ab8ff'];

export function createSlotGame(meta) {
  const { id, theme, logo, def, symbols, category = 'slots' } = meta;
  const isFreeSlot = def.bonus?.type === 'freeSpins';
  const isRespinSlot = def.bonus?.type === 'respin';
  const linesTotal = def.lines.length;
  const clampLines = (n) => (Number.isInteger(n) && n >= 1 && n <= linesTotal ? n : linesTotal);
  const symHtml = (i) => symbols[def.symbols[i].id];

  let activeCleanup = null;
  const game = {
    id,
    category,
    icon: symbols[def.symbols[0].id],
    get title() { return t(meta.titleKey); },
    get tag() { return t(meta.tagKey); },
    preview: def.symbols.slice(0, 3).map((s) => symbols[s.id]),
    mount,
    unmount,
  };
  return game;

  // ===================================================================
  function mount(container, api) {
    const reduced = api.reduced;
    const engine = createEngine(def);
    let grid = engine.spinGrid();
    let spinning = false;
    let autoLeft = 0;
    let speed = 2;
    // Бесплатные вращения — состояние внутри игры (не трогаем storage).
    let fs = { left: 0, lineBet: 0, lines: 0, totalWin: 0 };
    let lines = clampLines(api.getLines()); // число активных линий (для слотов с одной линией всегда 1)
    let reelEls = [];
    const timers = new Set();
    const later = (fn, ms) => { const h = setTimeout(() => { timers.delete(h); fn(); }, ms); timers.add(h); return h; };

    document.documentElement.dataset.slot = theme;
    container.className = 'slot';
    container.innerHTML = `
      <h1 class="logo"><span class="logo-top">${logo.top}</span><span class="logo-main">${logo.main}</span></h1>
      <section class="machine">
        <div class="bulbs" aria-hidden="true"></div>
        <div class="fs-banner" hidden data-testid="fs-banner"></div>
        <div class="window">
          <div class="reels" data-testid="reels"></div>
          <svg class="lines-overlay" viewBox="0 0 500 300" preserveAspectRatio="none"></svg>
          <div class="glass" aria-hidden="true"></div>
        </div>
      </section>
      <div class="win-panel"><small>${t('slot_win_label')}</small><div class="win-msg" data-testid="win-msg">${t(meta.greetKey)}</div></div>
      ${linesTotal > 1 ? `
      <div class="slot-lines" data-testid="lines-panel">
        <button class="lines-btn" data-lines="dec" data-testid="lines-dec" aria-label="${t('slot_lines')} −">−</button>
        <div class="lines-val"><small>${t('slot_lines')}</small><b data-testid="lines">${linesTotal}</b></div>
        <button class="lines-btn" data-lines="inc" data-testid="lines-inc" aria-label="${t('slot_lines')} +">+</button>
        <div class="lines-hint"><small>${t('slot_per_line')}</small><span class="lines-hint-val"><b class="line-bet" data-testid="line-bet">0</b>${coinInline}</span></div>
      </div>` : ''}
      <div class="live-speed">
        <small>${t('slot_speed')}</small>
        <div class="live-speed-btns">
          <button data-spd="1" data-testid="live-spd-1">1</button>
          <button data-spd="2" data-testid="live-spd-2">2</button>
          <button data-spd="3" data-testid="live-spd-3">3</button>
        </div>
      </div>
      <section class="controls">
        <button class="auto-btn" data-testid="auto-btn" aria-label="${t('nav_auto')}"><span class="auto-ico">↻</span><small>${t('nav_auto')}</small></button>
        <button class="spin-btn" data-testid="spin" aria-label="${t('slot_spin')}"><span class="spin-label">${t('slot_spin')}</span><small class="spin-sub"></small></button>
        <button class="pay-btn" data-testid="pay-btn" aria-label="${t('nav_paytable')}"><span>📜</span><small>${t('nav_paytable')}</small></button>
      </section>`;

    const q = (sel) => container.querySelector(sel);
    const machine = q('.machine');
    const winMsg = q('.win-msg');
    const overlay = q('.lines-overlay');
    const spinBtn = q('.spin-btn');
    const autoBtn = q('.auto-btn');

    buildBulbs(q('.bulbs'));
    buildReels();
    render();

    // события
    spinBtn.addEventListener('click', () => { if (autoLeft > 0) stopAuto(); else spin(); });
    autoBtn.addEventListener('click', showAutoPicker);
    q('.pay-btn').addEventListener('click', showPaytable);
    q('.live-speed').querySelectorAll('[data-spd]').forEach((b) =>
      b.addEventListener('click', () => { speed = Number(b.dataset.spd); api.sound.click(); render(); }));
    container.querySelectorAll('[data-lines]').forEach((b) =>
      b.addEventListener('click', () => {
        if (spinning || autoLeft > 0 || (isFreeSlot && fs.left > 0)) return;
        const nv = clampLines(lines + (b.dataset.lines === 'inc' ? 1 : -1));
        if (nv === lines) return;
        lines = nv;
        api.setLines(lines); // сохранить выбор; вызовет render через подписку
        api.sound.click();
      }));
    const keyHandler = (e) => { if (e.code === 'Space' && !api.isModalOpen()) { e.preventDefault(); spin(); } };
    document.addEventListener('keydown', keyHandler);
    const unsub = api.subscribe(render);

    // ---------- интерфейс барабанов ----------
    function buildReels() {
      const wrap = q('.reels');
      wrap.innerHTML = '';
      reelEls = [];
      wrap.dataset.reels = def.reels;
      for (let r = 0; r < def.reels; r++) {
        const reel = el('div', 'reel');
        const strip = el('div', 'strip');
        reel.appendChild(strip);
        wrap.appendChild(reel);
        reelEls.push(strip);
        setStrip(r, grid[r]);
      }
      overlay.setAttribute('viewBox', `0 0 ${def.reels * 100} ${def.rows * 100}`);
    }
    function cellsHtml(list, reel) {
      return list.map((s, row) => `<div class="cell" data-reel="${reel}" data-row="${row}" data-sym="${def.symbols[s].id}">${symHtml(s)}</div>`).join('');
    }
    function setStrip(r, col) {
      const strip = reelEls[r];
      strip.classList.remove('moving');
      strip.style.transform = 'translateY(0)';
      strip.innerHTML = cellsHtml(col, r);
    }
    function animateReels(newGrid, { suspense = false, only = null } = {}) {
      const sf = speed >= 3 ? 0.38 : speed === 2 ? 0.62 : 1;
      const FILL = reduced ? 3 : Math.max(5, Math.round(14 * sf));
      const base = reduced ? 30 : Math.round(650 * sf);
      const step = reduced ? 0 : Math.round(170 * sf);
      const last = def.reels;
      const extraFor = (r) => (suspense && !reduced && r >= last - 2 ? Math.round(650 * sf) * (r - (last - 3)) : 0);
      return Promise.all(newGrid.map((col, r) => new Promise((resolve) => {
        if (only && !only.includes(r)) { setStrip(r, col); resolve(); return; }
        const strip = reelEls[r];
        const reel = strip.parentElement;
        const fillers = Array.from({ length: FILL + r * (reduced ? 0 : 3) }, () => api.rng.int(def.symbols.length));
        const all = [...col, ...fillers, ...grid[r]];
        strip.classList.remove('moving');
        strip.innerHTML = cellsHtml(all, r).replace(/data-reel="\d+" data-row="\d+"/g, '');
        const offset = all.length - def.rows;
        strip.style.transform = `translateY(calc(var(--cell) * -${offset}))`;
        strip.getBoundingClientRect();
        const extra = extraFor(r);
        const dur = base + step * r + extra;
        strip.style.setProperty('--dur', `${dur}ms`);
        strip.classList.add('moving');
        strip.style.transform = 'translateY(0)';
        if (extra) { reel.classList.add('anticip'); api.sound.anticip(); }
        later(() => { setStrip(r, col); api.sound.stop(r); reel.classList.remove('anticip'); resolve(); }, dur + 20);
      })));
    }
    function clearWins() {
      container.querySelectorAll('.cell.win').forEach((c) => c.classList.remove('win'));
      overlay.innerHTML = '';
    }
    function showWins(res) {
      const mark = ([reel, row]) => container.querySelector(`.cell[data-reel="${reel}"][data-row="${row}"]`)?.classList.add('win');
      let svg = '';
      res.lineWins.forEach((w) => {
        w.cells.forEach(mark);
        const pts = def.lines[w.line].slice(0, w.count).map((row, reel) => `${reel * 100 + 50},${row * 100 + 50}`).join(' ');
        const c = LINE_COLORS[w.line % LINE_COLORS.length];
        svg += `<polyline points="${pts}" stroke="${c}" color="${c}"/>`;
      });
      (res.scatter?.cells || []).forEach(mark);
      overlay.innerHTML = svg;
    }

    // ---------- вращение ----------
    async function spin() {
      if (spinning) return;
      const inFree = isFreeSlot && fs.left > 0;
      const bet = api.getBet();
      // итоговая ставка = ставка на линию × число линий (= bet). RTP не зависит от числа линий.
      const activeLines = inFree ? fs.lines : lines;
      const lineBet = inFree ? fs.lineBet : bet / activeLines;

      if (!inFree) {
        if (api.getBalance() < bet) { api.needCoins(); return; }
        if (!api.bet(bet)) return;
      }

      spinning = true;
      clearWins();
      winMsg.className = 'win-msg';
      winMsg.textContent = inFree ? t('msg_free') : theme === 'space' ? t('msg_spinning_space') : t('msg_spinning');
      render();
      api.sound.spin();

      const newGrid = engine.spinGrid();
      const mult = inFree ? def.freeSpinMultiplier : 1;
      let res, respin = null, totalWin;
      if (isRespinSlot) {
        const out = engine.evaluateWithBonus(newGrid, lineBet, activeLines, 1);
        res = out.base; respin = out.bonus; totalWin = Math.floor(out.total);
      } else {
        res = engine.evaluate(newGrid, lineBet, activeLines, mult);
        totalWin = Math.floor(res.total);
      }

      if (inFree) { fs.left--; fs.totalWin += totalWin; }
      if (isFreeSlot && res.scatter.freeSpins) {
        if (fs.left === 0 && !inFree) fs = { left: 0, lineBet, lines: activeLines, totalWin: 0 };
        fs.left += res.scatter.freeSpins;
      }

      const ratio = totalWin / (bet || 1);
      const suspense = !inFree && (ratio >= WIN_TIERS.big || (res.scatter?.count || 0) >= 2 || !!respin);
      await animateReels(newGrid, { suspense });
      grid = newGrid;
      showWins(res);

      if (respin) {
        api.sound.freeSpins();
        winMsg.className = 'win-msg on big';
        winMsg.innerHTML = t('respin_title');
        machine.classList.add('respin');
        markHot(respin.reel);
        await wait(reduced ? 150 : 650);
        const g2 = grid.slice();
        g2[respin.reel] = respin.newCol;
        await animateReels(g2, { only: [respin.reel] });
        grid = g2;
        machine.classList.remove('respin');
        clearWins();
        showWins(respin.result);
      }

      if (totalWin > 0) api.win(totalWin); // начисляем, когда барабаны остановились

      if (totalWin > 0) {
        const tier = ratio >= WIN_TIERS.epic ? 'epic' : ratio >= WIN_TIERS.mega ? 'mega' : ratio >= WIN_TIERS.big ? 'big' : ratio > WIN_TIERS.win ? 'win' : '';
        const big = tier === 'big' || tier === 'mega' || tier === 'epic';
        winMsg.className = `win-msg on${big ? ' big' : ''}`;
        winMsg.innerHTML = `${t('msg_win', { amount: fmt(totalWin) })} ${coinInline}`;
        machine.classList.add('winning');
        later(() => machine.classList.remove('winning'), 1400);
        if (big) { api.sound.bigWin(); api.bigWin(totalWin, tier, machine); }
        else if (tier === 'win') { api.sound.win(); api.coinBurst(machine); }
        else api.sound.win();
      } else {
        winMsg.textContent = inFree ? t('msg_free_miss') : t('msg_try_again');
      }

      if (isFreeSlot && res.scatter.freeSpins) {
        api.sound.freeSpins();
        api.toast(t(inFree ? 'fs_toast_more' : 'fs_toast', { n: res.scatter.freeSpins }));
      }
      const wild5 = res.lineWins.some((w) => w.symbol === engine.wildIdx && w.count === 5);
      api.reportRound({ bet: inFree ? 0 : bet, win: totalWin, freeSpinsTriggered: isFreeSlot && !!res.scatter.freeSpins, wild5 });

      const fsEnded = inFree && fs.left === 0;
      if (fsEnded) {
        winMsg.className = 'win-msg on big';
        winMsg.innerHTML = `${t('fs_total', { amount: fmt(fs.totalWin) })} ${coinInline}`;
      }

      spinning = false;
      render();

      if (isFreeSlot && fs.left > 0) {
        later(spin, reduced ? 200 : 1100);
      } else {
        await api.afterIdle();
        if (autoLeft > 0 && api.getBalance() >= api.getBet()) continueAuto();
        else if (autoLeft > 0) stopAuto();
      }
    }

    function markHot(keepReel) {
      for (let r = 0; r < def.reels; r++) {
        if (r === keepReel) continue;
        const reel = reelEls[r]?.parentElement;
        reel?.classList.add('hot');
        later(() => reel?.classList.remove('hot'), 900);
      }
    }
    const wait = (ms) => new Promise((r) => later(r, ms));

    // ---------- автопрокрутка ----------
    function startAuto(n) { autoLeft = Math.max(0, Math.round(n)); render(); if (autoLeft > 0 && !spinning) launchAuto(); }
    function stopAuto() { if (!autoLeft) return; autoLeft = 0; render(); }
    function continueAuto() { const gap = reduced ? 100 : speed >= 3 ? 250 : speed === 2 ? 400 : 600; later(launchAuto, gap); }
    function launchAuto() { if (autoLeft <= 0 || spinning) return; if (api.getBalance() < api.getBet()) { stopAuto(); return; } autoLeft--; render(); spin(); }

    // ---------- отрисовка состояния ----------
    function render() {
      const inFree = isFreeSlot && fs.left > 0;
      const auto = autoLeft > 0;
      api.setBetLocked(spinning || inFree);
      spinBtn.disabled = spinning && !auto;
      spinBtn.classList.toggle('fs', inFree);
      spinBtn.classList.toggle('busy', spinning && !auto);
      spinBtn.classList.toggle('stop', auto);
      const label = spinBtn.querySelector('.spin-label');
      const sub = spinBtn.querySelector('.spin-sub');
      if (auto) { label.textContent = t('slot_stop'); sub.textContent = t('slot_left', { n: autoLeft }); }
      else if (spinning) { label.textContent = ''; sub.textContent = ''; }
      else { label.textContent = inFree ? t('slot_free') : t('slot_spin'); sub.textContent = inFree ? `${fs.left}` : ''; }
      autoBtn.disabled = spinning || auto || inFree;
      autoBtn.classList.toggle('active', auto);
      q('.live-speed').querySelectorAll('[data-spd]').forEach((b) => b.classList.toggle('active', Number(b.dataset.spd) === speed));
      machine.classList.toggle('fs', inFree);
      if (linesTotal > 1) {
        const locked = spinning || inFree || auto;
        q('[data-testid="lines"]').textContent = lines;
        const lb = api.getBet() / lines;
        q('.line-bet').textContent = Number.isInteger(lb) ? String(lb) : lb.toFixed(2);
        q('[data-lines="dec"]').disabled = locked || lines <= 1;
        q('[data-lines="inc"]').disabled = locked || lines >= linesTotal;
      }
      const banner = q('.fs-banner');
      banner.hidden = !inFree;
      if (inFree) banner.textContent = t('fs_banner', { left: fs.left, mult: def.freeSpinMultiplier });
    }

    // ---------- окна ----------
    function showAutoPicker() {
      if (spinning || autoLeft > 0) return;
      const chips = AUTOSPIN.presets.map((n) => `<button class="chip-btn" data-n="${n}">${n}</button>`).join('');
      const body = api.openModal(
        `<h2>${t('auto_title')}</h2><p style="margin-top:0">${t('auto_desc')}</p>
         <div class="chip-row">${chips}</div>
         <p style="margin-bottom:6px">${t('auto_custom', { min: AUTOSPIN.min, max: AUTOSPIN.max })}</p>
         <div class="auto-custom"><input id="autoNum" type="number" inputmode="numeric" min="${AUTOSPIN.min}" max="${AUTOSPIN.max}" value="20" data-testid="auto-num" /></div>
         <p style="font-size:13px;color:var(--muted);margin-bottom:0">${t('auto_speed_hint')}</p>
         <button class="btn" id="autoStart" data-testid="auto-start">${t('auto_start')}</button>`);
      const start = (n) => {
        const v = Math.max(AUTOSPIN.min, Math.min(AUTOSPIN.max, Math.round(n || 0)));
        if (!v) return; api.sound.click(); api.closeModal(); startAuto(v);
      };
      body.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => start(Number(b.dataset.n))));
      body.querySelector('#autoStart').addEventListener('click', () => start(Number(body.querySelector('#autoNum').value)));
      body.querySelector('#autoNum').addEventListener('keydown', (e) => { if (e.key === 'Enter') start(Number(e.target.value)); });
    }

    function showPaytable() {
      const d = def;
      const rows = d.symbols.map((s, i) => {
        let text;
        if (s.scatter) {
          text = t('paytable_scatter_sym', { p3: d.scatterPays[3], p4: d.scatterPays[4], p5: d.scatterPays[5], f3: d.freeSpins[3], f4: d.freeSpins[4], f5: d.freeSpins[5], mult: d.freeSpinMultiplier });
        } else {
          const parts = [];
          s.pays.forEach((p, k) => { if (p > 0) parts.push(`${k + 3} — ×${p}`); });
          text = parts.join(' · ');
          if (s.wild) text += '<br>' + (d.wildWinMultiplier ? t('paytable_wild_x2', { mult: d.wildWinMultiplier }) : t('paytable_wild'));
        }
        return `<div class="row"><div class="pay-sym">${symHtml(i)}</div><div class="grow"><b>${s.name}</b><small>${text}</small></div></div>`;
      }).join('');
      let bonusText = '';
      if (d.bonus?.type === 'respin') {
        const bs = d.symbols.find((s) => s.id === d.bonus.symbol);
        bonusText = `<p style="margin-bottom:4px">${t('paytable_respin', { n: d.bonus.trigger, sym: bs?.name || d.bonus.symbol })}</p>`;
      }
      const linesSvg = d.lines.map((l, i) =>
        `<svg viewBox="0 0 ${d.reels * 10} ${d.rows * 10}" width="${d.reels * 10}" height="${d.rows * 10}" style="background:#ffffff12;border-radius:4px"><polyline points="${l.map((r, k) => `${k * 10 + 5},${r * 10 + 5}`).join(' ')}" fill="none" stroke="${LINE_COLORS[i % LINE_COLORS.length]}" stroke-width="2.5"/></svg>`).join(' ');
      api.openModal(`<h2>${t('paytable_title', { name: game.title })}</h2>
        <p style="margin-top:0">${t('paytable_desc')} ${d.scatterPays ? t('paytable_scatter') : ''}</p>
        <div class="list">${rows}</div>${bonusText}
        <p style="margin-bottom:4px"><b>${t('paytable_lines', { n: d.lines.length })}</b></p>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${linesSvg}</div>`);
    }

    // отдать функции управления для unmount
    activeCleanup = () => {
      timers.forEach(clearTimeout);
      timers.clear();
      document.removeEventListener('keydown', keyHandler);
      unsub();
      autoLeft = 0;
      spinning = false;
    };
  }

  function unmount() {
    activeCleanup?.();
    activeCleanup = null;
    document.documentElement.dataset.slot = '';
  }
}

function buildBulbs(host) {
  const n = 22;
  for (let i = 0; i < n; i++) {
    const e = el('i');
    const tt = i / n;
    let x, y;
    if (tt < 0.25) { x = tt / 0.25 * 100; y = 0; }
    else if (tt < 0.5) { x = 100; y = (tt - 0.25) / 0.25 * 100; }
    else if (tt < 0.75) { x = 100 - (tt - 0.5) / 0.25 * 100; y = 100; }
    else { x = 0; y = 100 - (tt - 0.75) / 0.25 * 100; }
    e.style.left = `${x}%`;
    e.style.top = `${y}%`;
    host.appendChild(e);
  }
}
