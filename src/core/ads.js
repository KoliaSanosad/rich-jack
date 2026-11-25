// Реклама — ТОЛЬКО в приложении. На сайте все функции ничего не делают.
// Настоящая реклама (AdMob) подключится при сборке Android-приложения.
import { IS_APP, IS_FAKE_APP } from './platform.js';
import { INTERSTITIAL_MIN_INTERVAL_MS } from './config.js';
import * as storage from './storage.js';

function fakeAd(title, seconds) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'fake-ad';
    el.innerHTML = `<div><b>ТЕСТОВАЯ РЕКЛАМА</b><p>${title}</p><p class="fake-ad-t"></p></div>`;
    document.body.appendChild(el);
    let left = seconds;
    const t = el.querySelector('.fake-ad-t');
    const tick = () => {
      t.textContent = left > 0 ? `Осталось ${left} с` : '';
      if (left-- <= 0) { el.remove(); resolve(true); } else setTimeout(tick, 1000);
    };
    tick();
  });
}

/** Видео за награду. Возвращает true, если досмотрено до конца. */
export async function showRewarded() {
  if (!IS_APP) return false;
  if (IS_FAKE_APP) return fakeAd('Видео за награду', 2);
  // TODO: AdMob rewarded при сборке приложения
  return false;
}

/** Межстраничная реклама: не чаще раза в 4 минуты, никогда во время вращения. */
export async function maybeShowInterstitial({ spinning } = {}, now = Date.now()) {
  if (!IS_APP || spinning) return false;
  const st = storage.get();
  if (st.noAds) return false;
  if (st.lastInterstitialAt && now - st.lastInterstitialAt < INTERSTITIAL_MIN_INTERVAL_MS) return false;
  if (!st.lastInterstitialAt) {
    // первый запуск: отсчёт 4 минут начинается с начала игры
    storage.update((s) => { s.lastInterstitialAt = now; });
    return false;
  }
  storage.update((s) => { s.lastInterstitialAt = now; });
  if (IS_FAKE_APP) return fakeAd('Межстраничная реклама', 2);
  // TODO: AdMob interstitial при сборке приложения
  return false;
}
