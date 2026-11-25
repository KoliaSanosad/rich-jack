// Где запущена игра: в Android-приложении (Capacitor) или на сайте.
// Для проверки «режима приложения» на компьютере: npm run dev и открыть http://localhost:5173/?app=1
// (тестовый режим работает ТОЛЬКО при локальной разработке, на настоящем сайте его нет).
const cap = globalThis.Capacitor;
const nativeApp = !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
const devFake =
  !nativeApp &&
  !!import.meta.env?.DEV &&
  typeof location !== 'undefined' &&
  new URLSearchParams(location.search).get('app') === '1';

export const IS_APP = nativeApp || devFake;
/** true — реклама и покупки ненастоящие (тестовые), для проверки на компьютере. */
export const IS_FAKE_APP = devFake;
