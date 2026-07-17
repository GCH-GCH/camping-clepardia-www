import { expect,test } from '@playwright/test';

const slotVersions = async (page) => page.evaluate(() => Object.fromEntries(
  [...document.querySelectorAll('[data-planner-slot]')].map((slot) => [slot.dataset.plannerSlot,Number(slot.dataset.version || 0)]),
));

const clickChoice = async (page,group,value) => {
  const button = page.locator(`[data-planner-${group}] button[data-value="${value}"]`);
  const details = button.locator('xpath=ancestor::details[1]');
  if (await details.count() && await details.getAttribute('open') === null) await details.locator('summary').click();
  await button.click();
};

const assertNoConsoleErrors = (page) => {
  const errors = [];
  page.on('console',(message) => { if (message.type() === 'error') errors.push(`${message.text()} @ ${message.location().url || 'unknown'}`); });
  page.on('pageerror',(error) => errors.push(error.message));
  return () => expect(errors,'Błędy konsoli planera').toEqual([]);
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analytics/event',(route) => route.fulfill({ status:200,contentType:'application/json',body:'{"ok":true}' }));
  await page.route('**/api/weather?*',(route) => route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify({ ok:true,available:true,forecastInRange:true,daily:Array.from({ length:5 },(_,index) => ({
      date:`2030-07-${String(20 + index).padStart(2,'0')}`,weatherCode:index === 1 ? 63 : 1,temperatureMinC:16,temperatureMaxC:24 - index,rainProbability:index === 1 ? 70 : 15,
    })) }),
  }));
  await page.goto('/planer-pobytu',{ waitUntil:'networkidle' });
  await expect(page.locator('[data-planner-result-shell]')).toHaveAttribute('data-planner-state','initial');
  await expect(page.locator('[data-planner-slot]')).toHaveCount(6);
});

test('selektywne aktualizacje zachowują dashboard, modal i statyczne sloty',async ({ page }) => {
  const noConsoleErrors = assertNoConsoleErrors(page);
  await page.evaluate(() => {
    window.__plannerShell = document.querySelector('[data-planner-result-shell]');
    window.__plannerModal = document.querySelector('[data-planner-modal]');
    window.__plannerSummer = document.querySelector('[data-planner-slot="summer"]');
  });

  const beforeTransport = await slotVersions(page);
  await clickChoice(page,'transport','car');
  await expect(page.locator('[data-planner-result-shell]')).toHaveAttribute('data-planner-state','transport');
  const afterTransport = await slotVersions(page);
  expect(afterTransport.hero).toBeGreaterThan(beforeTransport.hero);
  expect(afterTransport.days).toBeGreaterThan(beforeTransport.days);
  expect(afterTransport.quick).toBeGreaterThan(beforeTransport.quick);
  expect(afterTransport.weather).toBe(beforeTransport.weather);
  expect(afterTransport.upsell).toBe(beforeTransport.upsell);
  expect(afterTransport.summer).toBe(beforeTransport.summer);
  expect(await page.evaluate(() => document.querySelector('[data-planner-result-shell]') === window.__plannerShell)).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-planner-modal]') === window.__plannerModal)).toBe(true);
  expect(await page.evaluate(() => document.querySelector('[data-planner-slot="summer"]') === window.__plannerSummer)).toBe(true);
  expect(afterTransport.hero).toBe(beforeTransport.hero + 1);
  expect(afterTransport.days).toBe(beforeTransport.days + 1);
  expect(afterTransport.quick).toBe(beforeTransport.quick + 1);

  const beforePace = await slotVersions(page);
  await clickChoice(page,'pace','intensive');
  const afterPace = await slotVersions(page);
  expect(afterPace.hero).toBeGreaterThan(beforePace.hero);
  expect(afterPace.days).toBeGreaterThan(beforePace.days);
  expect(afterPace.weather).toBe(beforePace.weather);
  expect(afterPace.quick).toBe(beforePace.quick);
  expect(afterPace.upsell).toBe(beforePace.upsell);
  expect(afterPace.hero).toBe(beforePace.hero + 1);
  expect(afterPace.days).toBe(beforePace.days + 1);

  const beforeDate = await slotVersions(page);
  await page.locator('[data-planner-date]').fill('2030-07-20');
  await expect(page.locator('[data-planner-weather-strip]')).toContainText('24°C');
  const afterDate = await slotVersions(page);
  expect(afterDate.hero).toBeGreaterThan(beforeDate.hero);
  expect(afterDate.weather).toBeGreaterThan(beforeDate.weather);
  expect(afterDate.days).toBe(beforeDate.days);
  expect(afterDate.quick).toBe(beforeDate.quick);
  expect(afterDate.upsell).toBe(beforeDate.upsell);
  expect(afterDate.summer).toBe(beforeDate.summer);

  const beforeNights = await slotVersions(page);
  await page.locator('[data-planner-night-step="1"]').click();
  await expect(page.locator('[data-planner-day-card]')).toHaveCount(3);
  const afterNights = await slotVersions(page);
  expect(afterNights.hero).toBeGreaterThan(beforeNights.hero);
  expect(afterNights.days).toBeGreaterThan(beforeNights.days);
  expect(afterNights.upsell).toBeGreaterThan(beforeNights.upsell);
  expect(afterNights.weather).toBeGreaterThan(beforeNights.weather);
  expect(afterNights.quick).toBe(beforeNights.quick);
  expect(afterNights.summer).toBe(beforeNights.summer);

  await page.locator('[data-planner-day-details="1"]').click();
  await expect(page.locator('[data-planner-modal]')).toHaveAttribute('open','');
  await page.locator('[data-planner-pace] button[data-value="calm"]').click({ force:true });
  await expect(page.locator('[data-planner-modal]')).toHaveAttribute('open','');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-planner-modal]')).not.toHaveAttribute('open','');

  for (const summary of await page.locator('[data-planner-accordion] summary').all()) await summary.click();
  await expect(page.locator('[data-planner-panel]')).toHaveAttribute('data-sticky','false');
  expect(await page.locator('[data-planner-panel]').evaluate((element) => getComputedStyle(element).overflowY)).not.toMatch(/auto|scroll/);
  noConsoleErrors();
});

test('scenariusze A, B i C realnie generują różne plany',async ({ page }) => {
  const noConsoleErrors = assertNoConsoleErrors(page);
  const signature = () => page.locator('[data-planner-day-card]').evaluateAll((cards) => cards.map((card) => card.textContent.replace(/\s+/g,' ').trim()).join('|'));

  // A: 2 noce, rodzina, dzieci, tramwaj, spokojnie, klasyka + historia.
  await expect(page.locator('[data-planner-day-card]')).toHaveCount(2);
  const scenarioA = await signature();
  expect(scenarioA).toMatch(/Tramwaj 18/i);

  // B: 3 noce, para, bez dzieci, auto, aktywnie, kuchnia + Kazimierz.
  await page.locator('[data-planner-night-step="1"]').click();
  await clickChoice(page,'group','pair');
  await clickChoice(page,'transport','car');
  await clickChoice(page,'pace','intensive');
  const interestsDetails = page.locator('[data-planner-interests]').locator('xpath=ancestor::details[1]');
  if (await interestsDetails.getAttribute('open') === null) await interestsDetails.locator('summary').click();
  while (await page.locator('[data-planner-interests] button.is-active').count()) await page.locator('[data-planner-interests] button.is-active').first().click();
  await clickChoice(page,'interests','food');
  await expect(page.locator('[data-planner-day-card]')).toHaveCount(3);
  const scenarioB = await signature();
  expect(scenarioB).not.toBe(scenarioA);
  expect(scenarioB).toMatch(/Kazimierz/i);

  // C: 4 noce, grupa, spacer/rower, głównie na zewnątrz, natura.
  await page.locator('[data-planner-night-step="1"]').click();
  await clickChoice(page,'group','group');
  await clickChoice(page,'transport','mixed');
  await clickChoice(page,'weather','sun');
  await clickChoice(page,'interests','nature');
  await expect(page.locator('[data-planner-day-card]')).toHaveCount(4);
  const scenarioC = await signature();
  expect(scenarioC).not.toBe(scenarioB);
  expect(scenarioC).toMatch(/Ojc|rower|Bike/i);

  await clickChoice(page,'trip-choice','yes');
  await expect(page.locator('[data-planner-day-card]').filter({ hasText:'Wieliczka' })).toHaveCount(1);
  noConsoleErrors();
});

test('każde zainteresowanie realnie zmienia dwudniowy plan',async ({ page }) => {
  const noConsoleErrors = assertNoConsoleErrors(page);
  const interests = page.locator('[data-planner-interests]');
  const details = interests.locator('xpath=ancestor::details[1]');
  if (await details.getAttribute('open') === null) await details.locator('summary').click();
  const values = await interests.locator('button[data-value]').evaluateAll((buttons) => buttons.map((button) => button.dataset.value));
  const signatures = [];

  for (const value of values) {
    while (await interests.locator('button.is-active').count()) await interests.locator('button.is-active').first().click();
    await interests.locator(`button[data-value="${value}"]`).click();
    signatures.push((await page.locator('[data-planner-day-card]').allTextContents()).join('|'));
  }

  expect(new Set(signatures).size).toBe(values.length);
  noConsoleErrors();
});

test('aktualizacja zachowuje focus, datę i stan akordeonu',async ({ page }) => {
  const noConsoleErrors = assertNoConsoleErrors(page);
  const accordion = page.locator('[data-planner-interests]').locator('xpath=ancestor::details[1]');
  await accordion.locator('summary').click();
  await page.locator('[data-planner-date]').fill('2030-07-20');
  await expect(page.locator('[data-planner-weather-strip]')).toContainText('24°C');
  const paceButton = page.locator('[data-planner-pace] button[data-value="intensive"]');
  await paceButton.focus();
  await paceButton.press('Enter');
  await expect(accordion).toHaveAttribute('open','');
  await expect(page.locator('[data-planner-date]')).toHaveValue('2030-07-20');
  expect(await paceButton.evaluate((button) => document.activeElement === button)).toBe(true);
  await expect(page.locator('[data-planner-result-shell]')).toHaveAttribute('data-planner-state','pace');
  noConsoleErrors();
});

for (const width of [360,390,430]) {
  test(`mobile ${width}px: brak overflow i dotykowe kontrolki`,async ({ page }) => {
    const noConsoleErrors = assertNoConsoleErrors(page);
    await page.setViewportSize({ width,height:844 });
    await page.reload({ waitUntil:'networkidle' });
    await page.locator('[data-planner-filter-toggle]').click();
    const metrics = await page.evaluate(() => ({
      viewport:document.documentElement.clientWidth,
      page:document.documentElement.scrollWidth,
      panelOverflow:getComputedStyle(document.querySelector('[data-planner-panel]')).overflowY,
      smallestButton:Math.min(...[...document.querySelectorAll('[data-planner-panel] button')].filter((button) => button.offsetParent).map((button) => button.getBoundingClientRect().height)),
    }));
    expect(metrics.page).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.panelOverflow).not.toMatch(/auto|scroll/);
    expect(metrics.smallestButton).toBeGreaterThanOrEqual(44);
    await expect(page.locator('[data-planner-day-card]')).toHaveCount(2);
    noConsoleErrors();
  });
}

test('zrzuty QA desktop i mobile',async ({ page }) => {
  await page.setViewportSize({ width:1920,height:1080 });
  await page.reload({ waitUntil:'networkidle' });
  await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
  await page.evaluate(() => window.scrollTo(0,0));
  await page.locator('[data-planner-debug]').evaluate((debug) => { debug.hidden = true; });
  await page.screenshot({ path:'test-results/planner-task-144-desktop.png' });
  await page.locator('[data-planner-dashboard]').scrollIntoViewIfNeeded();
  await page.screenshot({ path:'test-results/planner-task-144-desktop-dashboard.png' });
  await page.setViewportSize({ width:390,height:844 });
  await page.goto('/planer-pobytu?qa=mobile',{ waitUntil:'networkidle' });
  await expect(page.locator('.page-loader')).toBeHidden({ timeout:10_000 });
  await page.evaluate(() => {
    history.scrollRestoration = 'manual';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top:0,left:0,behavior:'instant' });
  });
  await page.waitForTimeout(300);
  await page.locator('[data-planner-debug]').evaluate((debug) => { debug.hidden = true; });
  await page.screenshot({ path:'test-results/planner-task-144-mobile.png' });
  await page.locator('[data-planner-dashboard]').scrollIntoViewIfNeeded();
  await page.screenshot({ path:'test-results/planner-task-144-mobile-dashboard.png' });
});
