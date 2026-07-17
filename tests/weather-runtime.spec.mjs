import { expect,test } from '@playwright/test';

const weatherPayload = {
  ok:true,available:true,source:'open-meteo',forecastInRange:true,
  current:{ temperatureC:24.4,apparentTemperatureC:25.1,precipitationMm:0,weatherCode:1,windKmh:9 },
  daily:Array.from({ length:5 },(_,index) => ({ date:`2026-07-${String(18 + index).padStart(2,'0')}`,weatherCode:index === 1 ? 63 : 1,temperatureMinC:15,temperatureMaxC:25 - index,rainProbability:index === 1 ? 80 : 10 })),
};

const localeCases = [
  ['pl','/','/planer-pobytu','Lipiec i sierpień','Nie udało się teraz pobrać pogody'],
  ['en','/en/','/en/stay-planner','July and August','We could not fetch the weather'],
  ['de','/de/','/de/aufenthaltsplaner','Juli und August','Das Wetter konnte gerade nicht geladen werden'],
  ['it','/it/','/it/pianificatore-soggiorno','Luglio e agosto','Non è stato possibile caricare il meteo'],
  ['fr','/fr/','/fr/planificateur-sejour','Juillet et août','Impossible de charger la météo'],
  ['es','/es/','/es/planificador-estancia','Julio y agosto','No se ha podido cargar el tiempo'],
  ['nl','/nl/','/nl/verblijfsplanner','Juli en augustus','Het weer kon nu niet worden opgehaald'],
  ['cs','/cs/','/cs/planovac-pobytu','Červenec a srpen','Počasí se nyní nepodařilo načíst'],
  ['sk','/sk/','/sk/planovac-pobytu','Júl a august','Počasie sa teraz nepodarilo načítať'],
  ['sv','/sv/','/sv/vistelseplanerare','Juli och augusti','Vädret kunde inte hämtas just nu'],
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analytics/event',(route) => route.fulfill({ status:200,contentType:'application/json',body:'{"ok":true}' }));
});

test('homepage: hero i karta współdzielą pogodę, a slajd sezonowy ma dwa CTA',async ({ page }) => {
  const errors=[]; let requests=0;
  await page.emulateMedia({ reducedMotion:'reduce' });
  page.on('console',(message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror',(error) => errors.push(error.message));
  await page.route('**/api/weather?*',(route) => { requests += 1; return route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(weatherPayload) }); });
  await page.goto('/',{ waitUntil:'networkidle' });
  await expect(page.locator('[data-weather-card]')).toHaveCount(2);
  await expect(page.locator('.weather-card--hero [data-weather-temperature]')).toHaveText('24°C');
  await expect(page.locator('.weather-card--compact [data-weather-temperature]')).toHaveText('24°C');
  expect(requests).toBe(1);

  const seasonal = page.locator('[data-hero-slide].is-seasonal');
  await expect(seasonal).toContainText('Lipiec i sierpień — miejsca campingowe');
  await expect(seasonal.locator('.hero-experience-slider__link')).toHaveCount(2);
  const seasonalIndex = await page.locator('[data-hero-slide]').evaluateAll((slides) => slides.findIndex((slide) => slide.classList.contains('is-seasonal')));
  for (let index=0;index<seasonalIndex;index += 1) await page.locator('[data-hero-slide-next]').click();
  await expect(seasonal).toHaveClass(/is-active/);
  await page.evaluate(() => window.addEventListener('campy:prompt',(event) => { window.__weatherCampyPrompt = event.detail?.prompt || ''; }));
  await seasonal.locator('[data-hero-slide-campy]').click();
  const campyPrompt = await page.evaluate(() => window.__weatherCampyPrompt || '');
  expect(campyPrompt).toContain('lipcu i sierpniu');
  expect(errors).toEqual([]);
});

test('zawieszony request kończy loading fallbackiem na homepage i w Planerze',async ({ page }) => {
  test.setTimeout(35_000);
  await page.route('**/api/weather?*',async () => new Promise(() => {}));
  await page.goto('/',{ waitUntil:'domcontentloaded' });
  await expect(page.locator('.weather-card--compact [data-weather-status]')).toContainText('Nie udało się teraz pobrać pogody',{ timeout:11_000 });
  await expect(page.locator('.weather-card--hero [data-weather-status]')).toContainText('Prognoza chwilowo niedostępna');
  await expect(page.locator('[data-weather-facts]:visible')).toHaveCount(0);

  await page.goto('/planer-pobytu',{ waitUntil:'domcontentloaded' });
  await page.locator('[data-planner-date]').fill('2026-07-18');
  await expect(page.locator('[data-planner-weather-strip]')).toContainText('Nie udało się teraz pobrać pogody',{ timeout:11_000 });
  await expect(page.locator('[data-planner-weather-strip]')).not.toContainText('Sprawdzamy aktualną pogodę');
  await expect(page.locator('[data-planner-day-card]')).toHaveCount(2);
});

test('fallback, hero i slajd sezonowy są lokalizowane w 10 językach',async ({ page }) => {
  for (const [language,home,planner,summer,fallback] of localeCases) {
    await page.unroute('**/api/weather?*').catch(() => {});
    await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(weatherPayload) }));
    await page.goto(home,{ waitUntil:'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang',language);
    await expect(page.locator('.weather-card--hero [data-weather-temperature]')).toHaveText('24°C');
    await expect(page.locator('[data-hero-slide].is-seasonal')).toContainText(summer);

    await page.unroute('**/api/weather?*');
    await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:'{"ok":false,"available":false,"fallback":true}' }));
    await page.goto(planner,{ waitUntil:'domcontentloaded' });
    await page.locator('[data-planner-date]').fill('2026-07-18');
    await expect(page.locator('[data-planner-weather-strip]')).toContainText(fallback);
    if (language !== 'pl') await expect(page.locator('[data-planner-weather-strip]')).not.toContainText(/Sprawdzamy|Nie udało|Pogoda w Krakowie/);
  }
});

for (const width of [360,390,430]) {
  test(`homepage ${width}px: pogoda i slider bez overflow`,async ({ page }) => {
    await page.setViewportSize({ width,height:width === 430 ? 932 : width === 390 ? 844 : 800 });
    await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(weatherPayload) }));
    await page.goto('/',{ waitUntil:'networkidle' });
    await expect(page.locator('.weather-card--hero')).toBeVisible();
    await expect(page.locator('.weather-card--hero [data-weather-temperature]')).toHaveText('24°C');
    const metrics = await page.evaluate(() => ({ viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth,heroWidth:document.querySelector('.weather-card--hero')?.getBoundingClientRect().width || 0 }));
    expect(metrics.page).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.heroWidth).toBeLessThanOrEqual(metrics.viewport - 16);
  });
}

test('zrzuty homepage z pogodą i slajdem sezonowym',async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.route('**/api/weather?*',(route) => route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(weatherPayload) }));
  const openSeasonalSlide = async () => {
    const seasonalIndex = await page.locator('[data-hero-slide]').evaluateAll((slides) => slides.findIndex((slide) => slide.classList.contains('is-seasonal')));
    for (let index=0;index<seasonalIndex;index += 1) await page.locator('[data-hero-slide-next]').click();
    await expect(page.locator('[data-hero-slide].is-seasonal')).toHaveClass(/is-active/);
    await page.waitForTimeout(180);
  };
  await page.setViewportSize({ width:1920,height:1080 });
  await page.goto('/',{ waitUntil:'networkidle' });
  await openSeasonalSlide();
  await page.screenshot({ path:'test-results/task-145-home-desktop.png' });
  await page.setViewportSize({ width:390,height:844 });
  await page.goto('/?qa=task145-mobile',{ waitUntil:'networkidle' });
  await openSeasonalSlide();
  await page.screenshot({ path:'test-results/task-145-home-mobile.png' });
});
