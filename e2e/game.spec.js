import { test, expect } from '@playwright/test';

const num = async (loc) => Number((await loc.textContent()).replace(/\D/g, ''));

test('экран 18+ при первом запуске, затем бонус и вращение', async ({ page }) => {
  await page.goto('/');
  const gate = page.getByTestId('age-gate');
  await expect(gate).toContainText('Виртуальные монеты не имеют денежной ценности');
  await expect(gate).toContainText('Успех в игре не означает успеха в реальных азартных играх');
  await page.getByTestId('age-ok').click();

  // ежедневный бонус открывается сам
  await page.getByTestId('claim-daily').click();
  await expect(page.getByTestId('balance')).toHaveText('2 500');

  // ставка на линию: максимум 10 на 1 уровне ([1,2,3,5,10])
  for (let i = 0; i < 6; i++) await page.getByTestId('linebet-plus').click({ force: true });
  await expect(page.getByTestId('linebet')).toHaveText('10');
  await expect(page.getByTestId('linebet-plus')).toBeDisabled();
  // общая ставка = ставка на линию × число линий = 10 × 10 = 100
  await expect(page.getByTestId('bet')).toHaveText('100');
  // число линий можно уменьшать (1–10)
  for (let i = 0; i < 9; i++) await page.getByTestId('lines-minus').click({ force: true });
  await expect(page.getByTestId('lines')).toHaveText('1');
  await expect(page.getByTestId('lines-minus')).toBeDisabled();
  await expect(page.getByTestId('bet')).toHaveText('10'); // 10 × 1 линия
  // вернём 10 линий и минимальную ставку на линию
  for (let i = 0; i < 9; i++) await page.getByTestId('lines-plus').click({ force: true });
  for (let i = 0; i < 6; i++) await page.getByTestId('linebet-minus').click({ force: true });
  await expect(page.getByTestId('bet')).toHaveText('10'); // 1 × 10 линий

  await page.getByTestId('spin').click();
  await expect(page.getByTestId('spin')).toBeEnabled();
  await expect(page.locator('.reel')).toHaveCount(5);
  await expect(page.locator('.reel').first().locator('.cell')).toHaveCount(3);
  expect(await num(page.getByTestId('balance'))).not.toBeNaN();

  // после перезагрузки экран 18+ не показывается
  await page.reload();
  await expect(page.getByTestId('age-gate')).toHaveCount(0);
});

test('на сайте нет магазина и рекламы, есть кнопка Google Play', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click();
  await expect(page.getByTestId('video-btn')).toBeHidden();
  await expect(page.getByTestId('shop-btn')).toContainText('Google Play');
  await expect(page.locator('body')).not.toContainText('$');
});

test('звук выключается', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click();
  await page.getByTestId('sound').click();
  await expect(page.getByTestId('sound')).toHaveAttribute('aria-label', 'Включить звук');
});

test('20 вращений подряд: баланс сходится', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click();
  for (let i = 0; i < 20; i++) {
    await page.getByTestId('spin').click();
    await expect(page.getByTestId('spin')).toBeEnabled();
    // ждём окончания бесплатных вращений, если выпали
    await expect(page.getByTestId('fs-banner')).toBeHidden({ timeout: 20_000 });
    await expect(page.getByTestId('spin')).toBeEnabled();
  }
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('nebesny_kush_save_v1')));
  expect(save.balance).toBe(2000 - save.stats.totalBet + save.stats.totalWon);
  expect(await num(page.getByTestId('balance'))).toBe(save.balance);
});

test('режим приложения (тест): магазин и видео', async ({ page }) => {
  await page.goto('/?app=1');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click();
  await expect(page.getByTestId('video-btn')).toBeVisible();
  await page.getByTestId('shop-btn').click();
  await expect(page.locator('.modal-card')).toContainText('Самый выгодный');
  await page.getByTestId('modal-close').click();
  await page.getByTestId('video-btn').click();
  await expect(page.getByTestId('balance')).toHaveText('2 100', { timeout: 10_000 });
});

test('автопрокрутка крутит заданное число раз и останавливается', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click().catch(() => {});
  const spinsBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('nebesny_kush_save_v1'))?.stats.spins || 0);
  await page.getByTestId('live-spd-3').click(); // быстрая скорость (постоянный регулятор, на главном экране)
  await page.getByTestId('auto-btn').click();
  await page.getByTestId('auto-num').fill('5');
  await page.getByTestId('auto-start').click();
  // дождаться завершения автопрокрутки: кнопка снова «ПУСК»
  await expect(page.getByTestId('spin')).toContainText('ПУСК', { timeout: 30_000 });
  await expect(page.getByTestId('fs-banner')).toBeHidden();
  const spinsAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('nebesny_kush_save_v1')).stats.spins);
  expect(spinsAfter - spinsBefore).toBe(5);
});

test('кнопка СТОП прерывает автопрокрутку', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click().catch(() => {});
  await page.getByTestId('auto-btn').click();
  await page.getByTestId('auto-num').fill('100');
  await page.getByTestId('auto-start').click();
  await expect(page.getByTestId('spin')).toContainText('СТОП');
  await page.getByTestId('spin').click(); // стоп
  await expect(page.getByTestId('spin')).toContainText('ПУСК', { timeout: 30_000 });
});

test('ставку можно вписать вручную', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click().catch(() => {});
  await page.getByTestId('bet').click();
  await page.getByTestId('bet-num').fill('50');
  await page.getByTestId('bet-set').click();
  await expect(page.getByTestId('bet')).toHaveText('50');
});

test('регулятор скорости виден всегда, запоминается и меняется на лету', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await page.getByTestId('modal-close').click().catch(() => {});
  // регулятор доступен без автопрокрутки
  await expect(page.getByTestId('live-spd-1')).toBeVisible();
  await page.getByTestId('live-spd-1').click();
  await expect(page.getByTestId('live-spd-1')).toHaveClass(/active/);
  // запоминается после перезагрузки
  await page.reload();
  await page.getByTestId('modal-close').click().catch(() => {}); // ежедневный бонус откроется снова
  await expect(page.getByTestId('live-spd-1')).toHaveClass(/active/);
  // меняется во время автопрокрутки
  await page.getByTestId('auto-btn').click();
  await page.getByTestId('auto-num').fill('100');
  await page.getByTestId('auto-start').click();
  await expect(page.getByTestId('spin')).toContainText('СТОП');
  await page.getByTestId('live-spd-3').click();
  await expect(page.getByTestId('live-spd-3')).toHaveClass(/active/);
  await page.getByTestId('spin').click(); // стоп
  await expect(page.getByTestId('spin')).toContainText('ПУСК', { timeout: 30_000 });
  await expect(page.getByTestId('live-spd-3')).toBeVisible(); // регулятор остаётся
});
