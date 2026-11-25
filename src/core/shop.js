// Покупки — ТОЛЬКО в приложении (Google Play Billing). На сайте вместо магазина кнопка «Скачать в Google Play».
import { IS_APP, IS_FAKE_APP } from './platform.js';
import { PRODUCTS } from './config.js';
import * as storage from './storage.js';

export function getProducts() {
  if (!IS_APP) return [];
  const { noAds } = storage.get();
  return PRODUCTS.map((p) => ({ ...p, owned: !!p.noAds && noAds }));
}

/** Купить пакет. Возвращает true при успешной покупке. */
export async function buy(id) {
  if (!IS_APP) return false;
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return false;
  let ok = false;
  if (IS_FAKE_APP) ok = true; // тестовый режим: покупка «проходит» без денег
  // TODO: Google Play Billing при сборке приложения
  if (!ok) return false;
  if (p.noAds) storage.update((s) => { s.noAds = true; });
  if (p.coins) storage.addCoins(p.coins);
  return true;
}
