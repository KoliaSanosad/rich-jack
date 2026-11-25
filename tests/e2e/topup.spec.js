// TEMP: тесты временной кнопки пополнения баланса (только для теста на сайте).
// Удалить вместе с кнопкой из src/core/screens.js перед публикацией в Google Play.
import { test, expect } from '@playwright/test';

const num = async (loc) => Number((await loc.textContent()).replace(/\D/g, ''));
const dismissDaily = async (page) => { await page.getByTestId('modal-close').click().catch(() => {}); };

test('TEMP пополнение: на сайте кнопка +1000 без лимита', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('lobby-settings').click();
  await expect(page.getByTestId('topup-btn')).toBeVisible();
  const before = await num(page.getByTestId('balance'));
  await page.getByTestId('topup-btn').click();
  expect(await num(page.getByTestId('balance'))).toBe(before + 1000);
  await page.getByTestId('topup-btn').click(); // без лимита
  expect(await num(page.getByTestId('balance'))).toBe(before + 2000);
});

test('TEMP пополнение: в режиме приложения кнопки нет', async ({ page }) => {
  await page.goto('/?app=1');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('lobby-settings').click();
  await expect(page.getByTestId('topup-btn')).toHaveCount(0);
  await expect(page.locator('#setSound')).toBeVisible(); // настройки точно открыты
});
