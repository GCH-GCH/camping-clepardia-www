import { expect,test } from '@playwright/test';

const payload = {
  ok:true,available:true,source:'open-meteo',sourceStatus:'ready',generatedAt:new Date().toISOString(),
  current:{ temperatureC:24.4,apparentTemperatureC:25.1,humidityPercent:58,precipitationMm:0,weatherCode:1,windKmh:9 },
  hourly:Array.from({ length:12 },(_,index) => ({ time:`2026-07-20T${String(8 + index).padStart(2,'0')}:00`,temperatureC:22 + (index % 5),rainProbability:index === 4 ? 65 : 10,weatherCode:index === 4 ? 63 : 1,windKmh:9 + index })),
  daily:Array.from({ length:7 },(_,index) => ({ date:`2026-07-${String(20 + index).padStart(2,'0')}`,weatherCode:index === 1 ? 63 : 1,temperatureMinC:14 + index,temperatureMaxC:24 + index,rainProbability:index === 1 ? 80 : 10,windKmh:12 + index })),
};

const locales = [
  ['pl','/','Pogoda'],['en','/en/','Weather'],['de','/de/','Wetter'],['it','/it/','Meteo'],['fr','/fr/','Météo'],
  ['es','/es/','Tiempo'],['nl','/nl/','Weer'],['cs','/cs/','Počasí'],['sk','/sk/','Počasie'],['sv','/sv/','Väder'],
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(payload) }));
  await page.route('**/api/analytics/event',(route) => route.fulfill({ status:200,contentType:'application/json',body:'{"ok":true}' }));
});

test('desktop drawer ma kontrolowany stan zwinięty i pełny stan hover/focus',async ({ page }) => {
  await page.setViewportSize({ width:1920,height:1080 });
  await page.goto('/',{ waitUntil:'networkidle' });
  await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
  const root = page.locator('.weather-card--hero');
  const trigger = page.locator('[data-weather-open]');
  const panel = page.locator('.weather-card__panel');
  await expect(page.locator('.weather-card__edge-summary>small')).toHaveText('Pogoda');
  await expect(page.locator('[data-weather-temperature]')).toHaveText('24°C');
  await expect(page.locator('.weather-card__icon')).not.toBeEmpty();
  const collapsed = await root.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const panel = element.querySelector('.weather-card__panel');
    return { width:rect.width,right:rect.right,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,panelVisibility:getComputedStyle(panel).visibility,panelOpacity:Number(getComputedStyle(panel).opacity),hitHeight:element.querySelector('button').getBoundingClientRect().height };
  });
  expect(collapsed.width).toBeLessThanOrEqual(114);
  expect(collapsed.right).toBeLessThanOrEqual(collapsed.viewport + 1);
  expect(collapsed.pageWidth).toBeLessThanOrEqual(collapsed.viewport + 1);
  expect(collapsed.panelVisibility).toBe('hidden');
  expect(collapsed.panelOpacity).toBe(0);
  expect(collapsed.hitHeight).toBeGreaterThanOrEqual(44);

  await trigger.hover();
  await expect.poll(() => root.evaluate((element) => Math.round(element.getBoundingClientRect().width))).toBeGreaterThan(330);
  await expect.poll(() => panel.evaluate((element) => getComputedStyle(element).visibility)).toBe('visible');
  await expect(panel).toContainText('Kraków · teraz');
  await expect(panel).toContainText('odczuwalna: 25°C');
  await expect(panel).toContainText('opady: 10%');
  await expect(panel).toContainText('wiatr: 9 km/h');
  await expect(panel).toContainText('Zobacz prognozę');
  await trigger.focus();
  await expect(panel).toBeVisible();
});

test('popup desktop ma premium current, 12 godzin, 7 osobnych dni i dostępność',async ({ page }) => {
  await page.setViewportSize({ width:1366,height:768 });
  await page.goto('/',{ waitUntil:'networkidle' });
  await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
  const trigger = page.locator('[data-weather-open]');
  await trigger.click();
  const dialog = page.locator('[data-weather-dialog]');
  await expect(dialog).toHaveAttribute('open','');
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('[data-weather-hour-card]')).toHaveCount(12);
  await expect(page.locator('[data-weather-day-card]')).toHaveCount(7);
  await expect(dialog).toContainText('odczuwalna');
  await expect(dialog).toContainText('Wilgotność');
  await expect(dialog).toContainText('Rekomendacja na dziś');
  await expect(page.locator('[data-weather-day-card]').first()).toContainText('Dobry dzień na spacer');
  const metrics = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hourly = element.querySelector('[data-weather-hourly]');
    const scroll = element.querySelector('.weather-dialog__scroll');
    const cards = [...element.querySelectorAll('[data-weather-day-card]')].map((node) => node.getBoundingClientRect());
    const distinct = new Set(cards.map((card) => `${Math.round(card.x)}:${Math.round(card.y)}`)).size;
    return { widthRatio:rect.width/innerWidth,heightRatio:rect.height/innerHeight,header:getComputedStyle(element.querySelector('.weather-dialog__header')).position,footer:getComputedStyle(element.querySelector('.weather-dialog__footer')).position,snap:getComputedStyle(hourly).scrollSnapType,hourlyScrollable:hourly.scrollWidth>hourly.clientWidth,overflow:(scroll.scrollWidth-scroll.clientWidth),distinct,locked:document.body.classList.contains('weather-modal-open') };
  });
  expect(metrics.widthRatio).toBeGreaterThanOrEqual(.8);
  expect(metrics.widthRatio).toBeLessThanOrEqual(.91);
  expect(metrics.heightRatio).toBeGreaterThanOrEqual(.8);
  expect(metrics.heightRatio).toBeLessThanOrEqual(.91);
  expect(metrics.header).toBe('sticky');
  expect(metrics.footer).toBe('sticky');
  expect(metrics.snap).toContain('x');
  expect(metrics.hourlyScrollable).toBe(true);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.distinct).toBe(7);
  expect(metrics.locked).toBe(true);
  await page.locator('[data-weather-day-card]').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path:'test-results/task149-weather-days-desktop.png' });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open','');
  await expect(trigger).toHaveAttribute('aria-expanded','false');
  expect(await trigger.evaluate((element) => document.activeElement === element)).toBe(true);
});

for (const [width,height] of [[360,800],[390,844],[430,932]]) {
  test(`mobile ${width}x${height}: kompaktowa zakładka i popup bez overflow`,async ({ page }) => {
    await page.setViewportSize({ width,height });
    await page.goto('/',{ waitUntil:'networkidle' });
    await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
    const root = page.locator('.weather-card--hero');
    await expect(page.locator('.weather-card__edge-summary>small')).toHaveText('Pogoda');
    const closed = await root.evaluate((element) => ({ width:element.getBoundingClientRect().width,panel:getComputedStyle(element.querySelector('.weather-card__panel')).display,page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,hit:element.querySelector('button').getBoundingClientRect().height }));
    expect(closed.width).toBeLessThanOrEqual(148);
    expect(closed.panel).toBe('none');
    expect(closed.page).toBeLessThanOrEqual(closed.viewport + 1);
    expect(closed.hit).toBeGreaterThanOrEqual(44);
    await page.locator('[data-weather-open]').click();
    await expect(page.locator('[data-weather-dialog]')).toHaveAttribute('open','');
    await expect.poll(() => page.locator('[data-weather-dialog]').evaluate((element) => getComputedStyle(element).transform)).toBe('none');
    await expect(page.locator('[data-weather-hour-card]')).toHaveCount(12);
    await expect(page.locator('[data-weather-day-card]')).toHaveCount(7);
    const opened = await page.locator('[data-weather-dialog]').evaluate((element) => {
      const rect=element.getBoundingClientRect(); const scroll=element.querySelector('.weather-dialog__scroll');
      return { width:rect.width,height:rect.height,vw:innerWidth,vh:innerHeight,overflow:scroll.scrollWidth-scroll.clientWidth,columns:getComputedStyle(element.querySelector('.weather-dialog__daily')).gridTemplateColumns };
    });
    expect(opened.width).toBeGreaterThanOrEqual(opened.vw - 1);
    expect(opened.height).toBeGreaterThanOrEqual(opened.vh - 1);
    expect(opened.overflow).toBeLessThanOrEqual(1);
    expect(opened.columns.split(' ').length).toBe(1);
    if (width === 390) {
      await page.locator('[data-weather-day-card]').first().scrollIntoViewIfNeeded();
      await page.screenshot({ path:'test-results/task149-weather-days-mobile-390.png' });
    }
  });
}

test('hero ma automatyczny rok i pogoda ma lokalizację w 10 językach',async ({ page }) => {
  const year = String(new Date().getFullYear());
  for (const [language,path,label] of locales) {
    await page.goto(path,{ waitUntil:'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang',language);
    await expect(page.locator('[data-hero-year]')).toHaveAttribute('data-hero-year',year);
    await expect(page.locator('[data-hero-year]')).toContainText(year);
    await expect(page.locator('.weather-card__edge-summary>small')).toHaveText(label);
    if (language !== 'pl') await expect(page.locator('.weather-card--hero')).not.toContainText(/Zobacz prognozę|Kraków · teraz|Pogoda$/);
  }
});

test('light, dark i reduced motion zachowują czytelne stany',async ({ page }) => {
  await page.setViewportSize({ width:1366,height:768 });
  await page.goto('/',{ waitUntil:'networkidle' });
  for (const theme of ['dark','light']) {
    await page.evaluate((value) => document.documentElement.setAttribute('data-theme',value),theme);
    await page.locator('[data-weather-open]').click();
    await expect(page.locator('[data-weather-dialog]')).toHaveAttribute('open','');
    const colors = await page.locator('[data-weather-day-card]').first().evaluate((element) => ({ color:getComputedStyle(element).color,background:getComputedStyle(element).backgroundColor }));
    expect(colors.color).not.toBe(colors.background);
    await page.keyboard.press('Escape');
  }
  await page.emulateMedia({ reducedMotion:'reduce' });
  const durations = await page.locator('[data-weather-open]').evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(durations).toMatch(/0\.01ms|1e-05s|0s/);
});
