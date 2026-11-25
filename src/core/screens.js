// Общие окна ядра: ежедневный бонус, спасательный бонус, награды, магазин, настройки.
import * as storage from './storage.js';
import * as bonuses from './bonuses.js';
import * as shop from './shop.js';
import * as ads from './ads.js';
import { ACHIEVEMENTS } from './achievements.js';
import { openModal, closeModal, toast, coinInline } from './ui.js';
import { sfx, toggle as toggleSound } from './sound.js';
import { IS_APP } from './platform.js';
import { MIN_BET } from './config.js';
import { fmt, fmtDuration } from './util.js';
import { t, setLang, getLang, LANGS } from '../i18n/index.js';

export function toastAchievements(ids) {
  ids.forEach((id) => toast(t('ach_new', { name: t(`ach_${id}_name`) })));
}

export function showDaily() {
  const ds = bonuses.dailyStatus();
  const days = [1, 2, 3, 4, 5, 6, 7].map((d) => {
    const cur = Math.min(ds.day, 7);
    const cls = d === cur ? (ds.available ? 'now' : 'done') : d < cur ? 'done' : '';
    return `<div class="${cls}">${t('daily_day', { n: d })}<b>${fmt(bonuses.dailyAmount(d))}</b></div>`;
  }).join('');
  const body = openModal(
    `<h2>${t('daily_title')}</h2><div class="days">${days}</div><p>${t('daily_desc')}</p>
     ${ds.available
       ? `<button class="btn" id="claimDaily" data-testid="claim-daily">${t('daily_claim', { amount: fmt(ds.amount) })} ${coinInline}</button>`
       : `<p style="text-align:center;color:var(--muted)">${t('daily_done')}</p>`}`,
  );
  body.querySelector('#claimDaily')?.addEventListener('click', () => {
    const r = bonuses.claimDaily();
    if (r) {
      sfx.coin();
      toast(t('daily_toast', { amount: fmt(r.amount) }));
    }
    closeModal();
  });
}

export function showRescue() {
  const rs = bonuses.rescueStatus();
  if (!rs.needed) return;
  const ds = bonuses.dailyStatus();
  let action = '';
  if (IS_APP) {
    action = rs.available
      ? `<button class="btn" id="rescueBtn" data-testid="rescue-btn">${t('rescue_watch', { amount: rs.amount })} ${coinInline}</button>`
      : `<p>${t('rescue_wait', { time: fmtDuration(rs.waitMs) })}</p>`;
  } else {
    action = `<p>${t('rescue_app_only')}</p>`;
  }
  if (ds.available) action += `<button class="btn alt" id="rescueDaily">${t('rescue_daily', { amount: fmt(ds.amount) })}</button>`;
  else action += `<p>${t('rescue_daily_tomorrow')}</p>`;
  const body = openModal(`<h2>${t('rescue_title')}</h2><p>${t('rescue_desc', { min: MIN_BET })}</p>${action}`);
  body.querySelector('#rescueBtn')?.addEventListener('click', async () => {
    closeModal();
    if (await ads.showRewarded()) {
      const got = bonuses.claimRescue();
      if (got) { sfx.coin(); toast(t('rescue_toast', { amount: got })); }
    }
  });
  body.querySelector('#rescueDaily')?.addEventListener('click', () => { closeModal(); showDaily(); });
}

export function showAwards() {
  const st = storage.get();
  const rows = ACHIEVEMENTS.map((a) => {
    const got = !!st.achievements[a.id];
    return `<div class="row ${got ? '' : 'locked'}"><span style="font-size:26px">${got ? '🏆' : '🔒'}</span>
      <div class="grow"><b>${t(`ach_${a.id}_name`)}</b><small>${t(`ach_${a.id}_desc`)}</small></div></div>`;
  }).join('');
  const n = Object.keys(st.achievements).length;
  openModal(`<h2>${t('awards_title', { n, total: ACHIEVEMENTS.length })}</h2>
    <p style="text-align:center;color:var(--muted);margin-top:0">${t('awards_stat', { spins: fmt(st.stats.spins), best: fmt(st.stats.biggestWin) })}</p>
    <div class="list">${rows}</div>`);
}

export function showShop() {
  if (!IS_APP) {
    toast(t('shop_web'));
    return;
  }
  const rows = shop.getProducts().map((p) => `<div class="row">
      <span style="font-size:26px">${p.noAds ? '🚫' : coinInline}</span>
      <div class="grow"><b>${p.noAds ? t('shop_no_ads') : t('coins_n', { n: fmt(p.coins) })}</b>
      <small>${p.noAds ? t('shop_no_ads_desc') : t('shop_coins_desc')}</small>
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}</div>
      <button class="btn" data-buy="${p.id}" ${p.owned ? 'disabled' : ''}>${p.owned ? t('shop_owned') : p.price}</button></div>`).join('');
  const body = openModal(`<h2>${t('shop_title')}</h2><div class="list">${rows}</div>
    <p style="font-size:12px;color:var(--muted)">${t('shop_rules')}</p>`);
  body.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', async () => {
    if (await shop.buy(b.dataset.buy)) { sfx.coin(); toast(t('shop_buy_ok')); }
    closeModal();
  }));
}

export async function watchVideo() {
  if (!bonuses.rewardedStatus().available) return;
  if (await ads.showRewarded()) {
    const got = bonuses.claimRewarded();
    if (got) { sfx.coin(); toast(t('video_toast', { amount: got })); }
  }
}

/** Настройки: язык, звук, сброс. onLang — колбэк после смены языка (перерисовать интерфейс). */
export function showSettings(onLang) {
  const st = storage.get();
  const langs = LANGS.map((l) => `<button class="chip-btn ${getLang() === l ? 'active' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('');
  const body = openModal(`<h2>${t('settings_title')}</h2>
    <div class="set-row"><span>${t('settings_lang')}</span><div class="chip-row">${langs}</div></div>
    <div class="set-row"><span>${t('settings_sound')}</span><button class="btn alt" id="setSound">${st.settings.sound ? t('settings_sound_on') : t('settings_sound_off')}</button></div>
    <button class="btn alt" id="setReset" style="margin-top:12px">${t('settings_reset')}</button>
    <p style="font-size:12px;color:var(--muted)">${t('settings_rules')}</p>`);
  body.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    storage.update((s) => { s.settings.lang = b.dataset.lang; });
    setLang(b.dataset.lang);
    sfx.click();
    closeModal();
    onLang?.();
  }));
  body.querySelector('#setSound').addEventListener('click', () => { toggleSound(); closeModal(); showSettings(onLang); });
  body.querySelector('#setReset').addEventListener('click', () => {
    if (confirm(t('settings_reset_confirm'))) { storage.reset(); location.reload(); }
  });
}
