// Лобби (главное меню) — строго чёрно-золотое. Меню строится из реестра игр.
import { CATEGORIES, gamesByCategory } from '../games/registry.js';
import { dailyStatus } from '../core/bonuses.js';
import { t } from '../i18n/index.js';

/**
 * Показать лобби в container. handlers = { onPlay(id), onDaily, onAwards, onShop, onSettings }.
 */
export function renderLobby(container, handlers) {
  container.className = 'lobby';
  const cats = CATEGORIES.map((c) => {
    const games = gamesByCategory(c.id);
    const inner = games.length
      ? games.map((g) => `
        <button class="game-tile" data-game="${g.id}" data-testid="game-${g.id}">
          <div class="game-tile-prev">${g.preview.map((s) => `<i>${s}</i>`).join('')}</div>
          <div class="game-tile-info"><b>${g.title}</b><small>${g.tag}</small></div>
          <span class="game-tile-go">${t('play')}</span>
        </button>`).join('')
      : `<div class="cat-empty">${t('cat_empty')}</div>`;
    return `<section class="lobby-cat"><h2>${t(c.titleKey)}</h2><div class="game-list">${inner}</div></section>`;
  }).join('');

  const dailyDot = dailyStatus().available ? ' dot' : '';
  container.innerHTML = `
    <div class="lobby-head">
      <span class="lobby-crown">◆</span>
      <h1 class="lobby-title">RICH JACK</h1>
      <small class="lobby-sub">${t('lobby_subtitle')}</small>
    </div>
    <div class="lobby-quick">
      <button data-act="daily" class="lq${dailyDot}" data-testid="lobby-daily"><span>🎁</span>${t('nav_bonus')}</button>
      <button data-act="awards" data-testid="lobby-awards"><span>🏆</span>${t('nav_awards')}</button>
      <button data-act="shop" data-testid="lobby-shop"><span>🛒</span>${t('lobby_shop')}</button>
      <button data-act="settings" data-testid="lobby-settings"><span>⚙️</span>${t('lobby_settings')}</button>
    </div>
    ${cats}`;

  container.querySelectorAll('[data-game]').forEach((b) =>
    b.addEventListener('click', () => handlers.onPlay(b.dataset.game)));
  const acts = { daily: handlers.onDaily, awards: handlers.onAwards, shop: handlers.onShop, settings: handlers.onSettings };
  container.querySelectorAll('[data-act]').forEach((b) =>
    b.addEventListener('click', () => acts[b.dataset.act]?.()));
}
