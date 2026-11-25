import { test, expect } from '@playwright/test';

const num = async (loc) => Number((await loc.textContent()).replace(/\D/g, ''));
const SAVE = 'rich_jack_save_v1';

// Закрыть ежедневный бонус, если он открылся сам
async function dismissDaily(page) {
  await page.getByTestId('modal-close').click().catch(() => {});
}

test('экран 18+ при первом запуске, бонус, лобби с двумя играми', async ({ page }) => {
  await page.goto('/');
  const gate = page.getByTestId('age-gate');
  await expect(gate).toContainText('Виртуальные монеты не имеют денежной ценности');
  await expect(gate).toContainText('Успех в игре не означает успеха в реальных азартных играх');
  await page.getByTestId('age-ok').click();

  // ежедневный бонус открывается сам: 500 монет в первый день
  await page.getByTestId('claim-daily').click();
  await expect(page.getByTestId('balance')).toHaveText('2 500');

  // в лобби обе игры
  await expect(page.getByTestId('game-nebesny')).toBeVisible();
  await expect(page.getByTestId('game-western')).toBeVisible();

  // после перезагрузки экран 18+ не показывается
  await page.reload();
  await expect(page.getByTestId('age-gate')).toHaveCount(0);
});

test('оба слота играют на общем балансе', async ({ page }) => {
  await page.goto('/?coins=5000');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);

  // открыть «Небесный Куш», сделать ставку и вращение
  await page.getByTestId('game-nebesny').click();
  await expect(page.getByTestId('bet-panel')).toBeVisible();
  await expect(page.locator('.reel')).toHaveCount(5);
  await page.getByTestId('bet-min').click(); // ставка 10
  await expect(page.getByTestId('bet')).toHaveValue('10');
  await page.getByTestId('spin').click();
  await expect(page.getByTestId('spin')).toBeEnabled();
  await expect(page.getByTestId('fs-banner')).toBeHidden({ timeout: 20_000 });
  const balAfterNebesny = await num(page.getByTestId('balance'));

  // назад в лобби и открыть «Дикий Запад» — баланс тот же
  await page.getByTestId('back-btn').click();
  await page.getByTestId('game-western').click();
  await expect(page.locator('.reel')).toHaveCount(3);
  expect(await num(page.getByTestId('balance'))).toBe(balAfterNebesny);
  await page.getByTestId('spin').click();
  await expect(page.getByTestId('spin')).toBeEnabled();

  // баланс = старт + бонусы − ставки + выигрыши
  const save = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), SAVE);
  expect(await num(page.getByTestId('balance'))).toBe(save.balance);
});

test('на сайте нет магазина-витрины и знака $, есть кнопка Google Play', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await expect(page.getByTestId('video-btn')).toBeHidden();
  await expect(page.getByTestId('shop-btn')).toContainText('Google Play');
  await expect(page.locator('body')).not.toContainText('$');
});

test('ставку можно вписать вручную и использовать кнопки', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('game-nebesny').click();

  await page.getByTestId('bet').fill('50');
  await page.getByTestId('bet').press('Enter');
  await expect(page.getByTestId('bet')).toHaveValue('50');

  await page.getByTestId('bet-double').click();
  await expect(page.getByTestId('bet')).toHaveValue('100');
  await page.getByTestId('bet-min').click();
  await expect(page.getByTestId('bet')).toHaveValue('10');
  await expect(page.getByTestId('bet-dec')).toBeDisabled(); // ниже минимума нельзя
});

test('выбор числа линий: ставка на линию = ставка ÷ линии, итог не меняется', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('game-nebesny').click();
  await page.getByTestId('bet').fill('100');
  await page.getByTestId('bet').press('Enter');
  await expect(page.getByTestId('lines')).toHaveText('10');
  await expect(page.getByTestId('line-bet')).toHaveText('10'); // 100 ÷ 10
  for (let i = 0; i < 5; i++) await page.getByTestId('lines-dec').click();
  await expect(page.getByTestId('lines')).toHaveText('5');
  await expect(page.getByTestId('line-bet')).toHaveText('20'); // 100 ÷ 5
  await expect(page.getByTestId('bet')).toHaveValue('100');    // итоговая ставка та же
  await page.getByTestId('lines-dec').click();                 // 4 линии
  await expect(page.getByTestId('lines')).toHaveText('4');
  await page.getByTestId('spin').click();                      // спин на выбранном числе линий
  await expect(page.getByTestId('spin')).toBeEnabled();
  await expect(page.getByTestId('fs-banner')).toBeHidden({ timeout: 20_000 });
  // у «Дикого Запада» одна линия — выбора нет
  await page.getByTestId('back-btn').click();
  await page.getByTestId('game-western').click();
  await expect(page.getByTestId('lines-panel')).toHaveCount(0);
});

test('20 вращений подряд: баланс сходится', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('game-nebesny').click();
  for (let i = 0; i < 20; i++) {
    await page.getByTestId('spin').click();
    await expect(page.getByTestId('spin')).toBeEnabled();
    await expect(page.getByTestId('fs-banner')).toBeHidden({ timeout: 20_000 });
  }
  const save = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), SAVE);
  expect(save.balance).toBe(100000 - save.stats.totalBet + save.stats.totalWon);
  expect(await num(page.getByTestId('balance'))).toBe(save.balance);
});

test('режим приложения: витрина пакетов и видео за награду', async ({ page }) => {
  await page.goto('/?app=1');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await expect(page.getByTestId('video-btn')).toBeVisible();
  await page.getByTestId('shop-btn').click();
  await expect(page.locator('.modal-card')).toContainText('Самый выгодный');
  await page.getByTestId('modal-close').click();
  await page.getByTestId('video-btn').click();
  await expect(page.getByTestId('balance')).toHaveText('2 100', { timeout: 10_000 });
});

test('автопрокрутка крутит заданное число раз и останавливается', async ({ page }) => {
  await page.goto('/?coins=100000');
  await page.getByTestId('age-ok').click();
  await dismissDaily(page);
  await page.getByTestId('game-nebesny').click();
  const spinsBefore = await page.evaluate((k) => JSON.parse(localStorage.getItem(k))?.stats.spins || 0, SAVE);
  await page.getByTestId('live-spd-3').click(); // быстрая скорость
  await page.getByTestId('auto-btn').click();
  await page.getByTestId('auto-num').fill('5');
  await page.getByTestId('auto-start').click();
  await expect(page.getByTestId('spin')).toContainText('СТОП');
  await expect(page.getByTestId('spin')).not.toContainText('СТОП', { timeout: 30_000 });
  await expect(page.getByTestId('fs-banner')).toBeHidden();
  const spinsAfter = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).stats.spins, SAVE);
  expect(spinsAfter - spinsBefore).toBe(5);
});
