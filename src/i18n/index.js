// Переводы. Все тексты интерфейса — в ru.js и en.js.
import { ru } from './ru.js';
import { en } from './en.js';

const DICTS = { ru, en };
export const LANGS = ['ru', 'en'];
let lang = 'ru';

export function setLang(l) {
  lang = DICTS[l] ? l : 'ru';
}
export function getLang() {
  return lang;
}

/** Перевод по ключу. params — подстановки вида {name}. */
export function t(key, params) {
  let s = DICTS[lang]?.[key];
  if (s == null) s = DICTS.ru[key];
  if (s == null) return key;
  if (params) for (const k of Object.keys(params)) s = s.split(`{${k}}`).join(params[k]);
  return s;
}
