import { expect,test } from '@playwright/test';

const weatherPayload = {
  ok:true,available:true,source:'open-meteo',forecastInRange:true,updatedAt:'2026-07-20T12:00:00.000Z',
  current:{ temperatureC:23.6,apparentTemperatureC:24.1,humidityPercent:58,precipitationMm:0,weatherCode:1,windKmh:11 },
  hourly:Array.from({ length:12 },(_,index) => ({ time:`2026-07-20T${String(8 + index).padStart(2,'0')}:00`,temperatureC:22,apparentTemperatureC:23,rainProbability:10,precipitationMm:0,weatherCode:1,windKmh:11 })),
  daily:Array.from({ length:7 },(_,index) => ({ date:`2026-07-${String(20 + index).padStart(2,'0')}`,weatherCode:1,temperatureMinC:15,temperatureMaxC:24,rainProbability:10,windMaxKmh:14 })),
};

const localeCases = [
  ['pl','/','/planer-pobytu','Planer pobytu'],
  ['en','/en/','/en/stay-planner','Stay planner'],
  ['de','/de/','/de/aufenthaltsplaner','Aufenthaltsplaner'],
  ['it','/it/','/it/pianificatore-soggiorno','Pianificatore di soggiorno'],
  ['fr','/fr/','/fr/planificateur-sejour','Planificateur de séjour'],
  ['es','/es/','/es/planificador-estancia','Planificador de estancia'],
  ['nl','/nl/','/nl/verblijfsplanner','Verblijfsplanner'],
  ['cs','/cs/','/cs/planovac-pobytu','Plánovač pobytu'],
  ['sk','/sk/','/sk/planovac-pobytu','Plánovač pobytu'],
  ['sv','/sv/','/sv/vistelseplanerare','Vistelseplanerare'],
];

const publicRoutes = ['/', '/camping', '/domki', '/cennik', '/dojazd', '/atrakcje', '/galeria', '/planer-pobytu', '/kontakt', '/faq', '/rezerwacja', '/aktualnosci', '/404'];
const technicalLabel = /Planer Premium|Premium Planner|Premium[- ]Planer|Premium 2\.0|Premium 3\.0|Planer 2\.0|\bVERSION\b|\bBETA\b|\bDEV\b|AI POWERED/i;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analytics/event',(route) => route.fulfill({ status:200,contentType:'application/json',body:'{"ok":true}' }));
  await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(weatherPayload) }));
});

test('homepage: jedna pogoda jest doklejona do prawej krawędzi hero',async ({ page }) => {
  await page.setViewportSize({ width:1920,height:1080 });
  await page.goto('/',{ waitUntil:'networkidle' });
  await expect(page.locator('[data-weather-card]')).toHaveCount(1);
  const drawer = page.locator('.weather-card--hero');
  const trigger = drawer.locator('[data-weather-open]');
  const collapsed = await drawer.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const button = element.querySelector('[data-weather-open]')?.getBoundingClientRect();
    return { right:innerWidth - rect.right,pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,visibleTab:innerWidth-(button?.left || innerWidth) };
  });
  expect(Math.abs(collapsed.right)).toBeLessThanOrEqual(1);
  expect(collapsed.pageOverflow).toBeLessThanOrEqual(1);
  expect(collapsed.visibleTab).toBeGreaterThanOrEqual(108);
  expect(collapsed.visibleTab).toBeLessThanOrEqual(122);
  await trigger.hover();
  await expect.poll(() => trigger.evaluate((element) => Math.abs(innerWidth-element.getBoundingClientRect().right))).toBeLessThanOrEqual(1);
  await expect(trigger).toContainText('Zobacz prognozę');
  await page.screenshot({ path:'test-results/task147-home-desktop-drawer-expanded.png',fullPage:false });
  await page.evaluate(() => { document.documentElement.dataset.theme='light'; });
  await trigger.click();
  await expect(page.locator('[data-weather-dialog]')).toHaveAttribute('open','');
  await expect.poll(() => page.locator('[data-weather-dialog]').evaluate((element) => getComputedStyle(element).filter)).toBe('none');
  await expect(page.locator('[data-weather-dialog-content]')).toBeVisible();
  await page.screenshot({ path:'test-results/task147-weather-popup-light.png',fullPage:false });
  await page.keyboard.press('Escape');
});

test('przełącznik motywu aktualizuje stan dostępności',async ({ page }) => {
  await page.goto('/',{ waitUntil:'domcontentloaded' });
  const toggle = page.locator('[data-theme-toggle]').first();
  await expect(toggle).toHaveAttribute('aria-label',/.+/);
  const before = await toggle.getAttribute('aria-pressed');
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-pressed',before || 'false');
});

test('publiczne strony nie mają overflow w light i dark',async ({ page }) => {
  test.setTimeout(90_000);
  for (const route of publicRoutes) {
    await page.goto(route,{ waitUntil:'domcontentloaded' });
    for (const theme of ['dark','light']) {
      await page.evaluate((value) => { document.documentElement.dataset.theme=value; },theme);
      const metrics = await page.evaluate(() => ({ viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth,bodyColor:getComputedStyle(document.body).color }));
      expect(metrics.page,`${route} ${theme}: horizontal overflow`).toBeLessThanOrEqual(metrics.viewport + 1);
      expect(metrics.bodyColor,`${route} ${theme}: body text`).not.toBe('rgba(0, 0, 0, 0)');
    }
  }
});

for (const width of [360,390,430]) {
  test(`Planer ${width}px: hero, CTA i oba motywy bez ucięcia`,async ({ page }) => {
    await page.setViewportSize({ width,height:width === 360 ? 800 : width === 390 ? 844 : 932 });
    await page.goto('/planer-pobytu',{ waitUntil:'networkidle' });
    await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
    for (const theme of ['dark','light']) {
      await page.evaluate((value) => { document.documentElement.dataset.theme=value; },theme);
      const metrics = await page.evaluate(() => {
        const intro=document.querySelector('.stay-planner__intro');
        const title=document.querySelector('#plannerIntroTitle');
        const start=document.querySelector('[data-planner-start]');
        const resultTitle=document.querySelector('.planner-hero h2');
        const inside=(node) => { const box=node?.getBoundingClientRect(); return box ? box.left>=-1 && box.right<=innerWidth+1 : false; };
        return { overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,intro:inside(intro),title:inside(title),start:inside(start),resultTitle:inside(resultTitle),titleText:title?.textContent?.trim() || '' };
      });
      expect(metrics.overflow).toBeLessThanOrEqual(1);
      expect(metrics.intro).toBe(true);
      expect(metrics.title).toBe(true);
      expect(metrics.start).toBe(true);
      expect(metrics.resultTitle).toBe(true);
      expect(metrics.titleText.length).toBeGreaterThan(12);
    }
    if (width === 390) await page.screenshot({ path:'test-results/task147-planner-mobile-light.png',fullPage:false });
  });
}

test('homepage i Planer mają klient-friendly etykiety w 10 językach',async ({ page }) => {
  test.setTimeout(90_000);
  for (const [language,home,planner,kicker] of localeCases) {
    await page.goto(home,{ waitUntil:'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang',language);
    await expect(page.locator('#main-content')).not.toContainText(technicalLabel);
    await expect(page.locator('[data-weather-card]')).toHaveCount(1);
    await page.goto(planner,{ waitUntil:'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang',language);
    await expect(page.locator('.stay-planner__intro-content>span')).toContainText(kicker);
    await expect(page.locator('#main-content')).not.toContainText(technicalLabel);
    expect(await page.title()).not.toMatch(technicalLabel);
  }
});
