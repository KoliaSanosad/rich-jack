import './style.css';
import * as storage from './core/storage.js';
import { MIN_BET } from './core/config.js';
import { randomInt, weightedIndex } from './core/rng.js';
import { sfx, toggle as toggleSound } from './core/sound.js';
import { $, fmt } from './core/util.js';
import { COIN_SVG, coinInline, initModal, openModal, closeModal, isModalOpen, toast, bigWin, coinBurst } from './core/ui.js';
import { needsAgeGate, showAgeGate } from './core/age.js';
import { createBetPanel } from './core/bet.js';
import * as bonuses from './core/bonuses.js';
import * as ads from './core/ads.js';
import { checkAchievements } from './core/achievements.js';
import { showDaily, showRescue, showAwards, showShop, showSettings, watchVideo, toastAchievements } from './core/screens.js';
import { IS_APP } from './core/platform.js';
import { gameById, GAMES } from './games/registry.js';
import { renderLobby } from './lobby/lobby.js';
import { t, setLang } from './i18n/index.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

storage.load();
setLang(storage.get().settings.lang);
initModal();
document.querySelectorAll('.coin-ico').forEach((e) => { e.innerHTML = COIN_SVG; });

let currentGame = null;
let betPanel = null;

// ---------- api, который получает каждая игра ----------
const api = {
  t,
  reduced,
  rng: { int: randomInt, weighted: weightedIndex },
  sound: sfx,
  getBalance: () => storage.getBalance(),
  getBet: () => (betPanel ? betPanel.getBet() : MIN_BET),
  setBetLocked: (v) => betPanel?.setLocked(v),
  getLines: () => storage.get().settings.lines,
  setLines: (n) => storage.update((s) => { s.settings.lines = n; }),
  subscribe: (cb) => storage.subscribe(cb),
  bet: (amount) => storage.spendCoins(amount),
  win: (amount) => storage.addCoins(amount),
  needCoins: () => { if (storage.getBalance() < MIN_BET) showRescue(); else toast(t('bet_not_enough')); },
  reportRound: ({ bet = 0, win = 0, freeSpinsTriggered = false, wild5 = false }) => {
    storage.update((s) => {
      if (bet > 0) { s.stats.spins++; s.stats.totalBet += bet; }
      s.stats.totalWon += win;
      s.stats.biggestWin = Math.max(s.stats.biggestWin, win);
    });
    toastAchievements(checkAchievements({ win, bet, freeSpinsTriggered, wild5 }));
  },
  afterIdle: async () => {
    await ads.maybeShowInterstitial({ spinning: false });
    if (storage.getBalance() < MIN_BET) setTimeout(showRescue, 500);
  },
  toast,
  openModal,
  closeModal,
  isModalOpen,
  bigWin,
  coinBurst,
};

// ---------- верхняя панель ----------
function renderTop() {
  const st = storage.get();
  $('balance').textContent = fmt(st.balance);
  $('soundBtn').textContent = st.settings.sound ? '🔊' : '🔇';
  $('dailyBtn').classList.toggle('dot', bonuses.dailyStatus().available);
  $('videoBtn').hidden = !IS_APP;
  if (IS_APP) {
    const rv = bonuses.rewardedStatus();
    $('videoBtn').innerHTML = `<span>▶</span>+${rv.amount} (${rv.left})`;
    $('videoBtn').disabled = !rv.available;
    $('shopBtn').innerHTML = `<span>🛒</span>${t('nav_shop')}`;
  } else {
    $('shopBtn').innerHTML = '<span>📲</span>Google Play';
  }
}
storage.subscribe(renderTop);

// ---------- навигация ----------
function clearScreen() {
  const s = $('screen');
  s.innerHTML = '';
  s.className = '';
}

function showLobby() {
  if (currentGame) { currentGame.unmount(); currentGame = null; }
  if (betPanel) { betPanel.destroy(); betPanel = null; }
  clearScreen();
  document.documentElement.dataset.slot = 'lobby';
  fillLobbyArt();
  $('betPanel').hidden = true;
  $('nav').hidden = true;
  $('backBtn').hidden = true;
  renderLobby($('screen'), {
    onPlay: openGame,
    onDaily: showDaily,
    onAwards: showAwards,
    onShop: showShop,
    onSettings: () => showSettings(refreshLang),
  });
  renderTop();
}

// Размытый фон-витрина из собственной графики игр (символы слотов за меню).
let lobbyArtDone = false;
function fillLobbyArt() {
  const host = document.querySelector('.lobby-reels');
  if (!host || lobbyArtDone) return;
  const syms = GAMES.flatMap((g) => g.preview || []);
  if (!syms.length) return;
  let html = '';
  for (let i = 0; i < 40; i++) html += `<i>${syms[i % syms.length]}</i>`;
  host.innerHTML = html;
  lobbyArtDone = true;
}

function openGame(id) {
  const game = gameById(id);
  if (!game) return;
  if (currentGame) currentGame.unmount();
  if (betPanel) { betPanel.destroy(); betPanel = null; }
  clearScreen();
  betPanel = createBetPanel($('betPanel'));
  $('betPanel').hidden = false;
  $('nav').hidden = false;
  $('backBtn').hidden = false;
  currentGame = game;
  game.mount($('screen'), api);
  renderTop();
}

function refreshLang() {
  // перерисовать интерфейс после смены языка
  setLegal();
  if (currentGame) { const id = currentGame.id; openGame(id); }
  else showLobby();
}

function setLegal() {
  $('legal').textContent = t('legal_line');
}

// ---------- запуск ----------
function start() {
  renderTop();
  showLobby();
  if (bonuses.dailyStatus().available) showDaily();
  else if (storage.getBalance() < MIN_BET) showRescue();
}

// верхние кнопки
$('soundBtn').addEventListener('click', () => { toggleSound(); renderTop(); });
$('backBtn').addEventListener('click', showLobby);
$('dailyBtn').addEventListener('click', showDaily);
$('awardsBtn').addEventListener('click', showAwards);
$('shopBtn').addEventListener('click', showShop);
$('videoBtn').addEventListener('click', watchVideo);
setLegal();

if (needsAgeGate()) showAgeGate(start);
else start();

// ---------- только для разработки ----------
if (import.meta.env.DEV) {
  const setCoins = (n) => {
    const cur = storage.getBalance();
    if (n > cur) storage.addCoins(n - cur);
    else if (cur > n) storage.spendCoins(cur - n);
  };
  const devBtn = document.createElement('button');
  devBtn.textContent = '+10 000 (тест)';
  devBtn.setAttribute('data-testid', 'dev-coins');
  devBtn.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:200;padding:8px 12px;border-radius:12px;font-size:13px;' +
    'background:#1e7a3a;color:#fff;border:1.5px solid #4cd97a;box-shadow:0 0 10px #4cd97a88;min-height:auto;min-width:auto';
  devBtn.addEventListener('click', () => { storage.addCoins(10000); toast(`💰 ${fmt(storage.getBalance())}`); });
  document.body.appendChild(devBtn);
  const coinsRaw = new URLSearchParams(location.search).get('coins');
  if (coinsRaw !== null) {
    const n = Number(coinsRaw);
    if (Number.isFinite(n) && n >= 0) setCoins(n);
  }
  const gameParam = new URLSearchParams(location.search).get('game');
  if (gameParam && gameById(gameParam) && storage.get().ageConfirmed) openGame(gameParam);
  window.монеты = (n) => { if (typeof n === 'number' && n >= 0) setCoins(n); else storage.addCoins(10000); return storage.getBalance(); };
  window.сброс = () => { storage.reset(); location.reload(); };
}
