import { test, expect } from '@playwright/test';

const locales = [
  ['/',/Atrakcje i wycieczki z Krakowa/i],['/en/',/Attractions and tours from Krakow/i],['/de/',/Sehenswürdigkeiten und Ausflüge/i],
  ['/it/',/Attrazioni e tour/i],['/fr/',/Attractions et excursions/i],['/es/',/Atracciones y excursiones/i],
  ['/nl/',/Bezienswaardigheden en tours/i],['/cs/',/Atrakce a výlety/i],['/sk/',/Atrakcie a výlety/i],['/sv/',/Sevärdheter och turer/i],
];

test('homepage ma jedną połączoną sekcję, obrazy, CTA i brak overflow mobile', async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 });
  await page.goto('/');
  const section = page.locator('[data-home-attractions-tours]');
  await expect(section).toHaveCount(1);
  await expect(section.getByText('Atrakcje i wycieczki z Krakowa',{ exact:true })).toBeVisible();
  await expect(section.locator('[data-attraction-card]')).toHaveCount(10);
  await expect(section.locator('[data-auschwitz-warning]')).toContainText('wyłącznie przez internet');
  await expect(section.locator('a[href="https://visit.auschwitz.org/"]')).toBeVisible();
  await expect(section.locator('a[href="https://qr.codes/vksKBT"]').first()).toBeVisible();
  await expect(section).not.toContainText('qr.codes');
  const imageState = await section.locator('img').evaluateAll((images)=>images.every((image)=>image.loading === 'lazy'));
  expect(imageState).toBe(true);
  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('połączona sekcja jest czytelna desktop w light i dark mode', async ({ page }) => {
  await page.setViewportSize({ width:1440,height:1000 });
  await page.goto('/');
  const section = page.locator('[data-home-attractions-tours]');
  await section.scrollIntoViewIfNeeded();
  for (const theme of ['light','dark']) {
    await page.evaluate((value)=>{ document.documentElement.dataset.theme = value; },theme);
    await expect(section).toBeVisible();
    const colors = await section.locator('[data-attraction-card]').first().evaluate((card)=>{
      const heading = card.querySelector('h3');
      const cardStyle = getComputedStyle(card);
      const headingStyle = heading ? getComputedStyle(heading) : null;
      return { background:cardStyle.backgroundColor,color:headingStyle?.color || '' };
    });
    expect(colors.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(colors.color).not.toBe(colors.background);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('połączona sekcja i ostrzeżenie Auschwitz renderują się w 10 językach', async ({ page }) => {
  for (const [route,title] of locales) {
    await page.goto(route);
    const section = page.locator('[data-home-attractions-tours]');
    await expect(section).toHaveCount(1);
    await expect(section).toContainText(title);
    await expect(section.locator('[data-auschwitz-warning] a')).toHaveCount(2);
  }
});

test('Search znajduje kartę wstępu Auschwitz i oficjalny link', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-search-open]').first().click();
  const input = page.locator('[data-search-input]');
  await input.fill('karta wstępu');
  const official = page.locator('.global-search__result[href="https://visit.auschwitz.org/"]');
  await expect(official).toBeVisible();
  await expect(official).toContainText('Oficjalne');
});

test('CAMPY odpowiada poprawnie o Auschwitz i pokazuje dwa CTA', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-chat-toggle]').click();
  await page.locator('[data-chat-input]').fill('Czy mogę kupić bilet przy wejściu do Auschwitz?');
  await page.locator('[data-chat-form]').press('Enter');
  const messages = page.locator('[data-chat-messages]');
  await expect(messages).toContainText('wyłącznie przez internet');
  await expect(messages.locator('a[href="https://visit.auschwitz.org/"]')).toBeVisible();
  await expect(messages.locator('a[href="https://qr.codes/vksKBT"]')).toBeVisible();
});

test('Planer pokazuje duże ostrzeżenie po wyborze Auschwitz', async ({ page }) => {
  await page.goto('/planer-pobytu/');
  const tripAccordion = page.locator('[data-planner-trip-choice]').locator('..').locator('..');
  await tripAccordion.locator('summary').click();
  await page.locator('[data-planner-trip-choice] button[data-value="yes"]').click();
  await page.locator('[data-planner-trips] button[data-value="auschwitz"]').click();
  const warning = page.locator('[data-planner-auschwitz]');
  await expect(warning).toBeVisible();
  await expect(warning).toContainText('wyłącznie przez internet');
  await expect(warning.locator('a')).toHaveCount(2);
});

test('formularz przejmuje opcję propozycji wycieczki z homepage', async ({ page }) => {
  await page.goto('/rezerwacja/?tour=proposal#reservation-mini-game');
  await expect(page.locator('[data-reservation-mini-game]')).toHaveAttribute('data-preselected-tour',/propozycję/i);
});

test('publiczne eventy są wysyłane w tle bez PII', async ({ page }) => {
  const payloads = [];
  await page.route('**/api/analytics/event',async (route)=>{
    payloads.push(route.request().postDataJSON());
    await route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify({ ok:true,stored:true,eventId:'test' }) });
  });
  await page.goto('/');
  await page.locator('[data-attraction-card="oldTown"] [data-analytics-event="attraction_click"]').click();
  await page.waitForTimeout(150);
  expect(payloads.some((item)=>item.eventType === 'page_view')).toBe(true);
  expect(payloads.some((item)=>item.eventType === 'attraction_click' && item.metadata?.category === 'oldTown')).toBe(true);
  expect(payloads.every((item)=>!JSON.stringify(item).includes('@'))).toBe(true);
  expect(payloads.every((item)=>!('ip' in item))).toBe(true);
});

test('CC SYSTEM renderuje 11 zakładek, filtry, rekomendacje i raport Markdown', async ({ page,context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  const dashboard = {
    filters:{ range:'30d',fromLabel:'2026-07-01',toLabel:'2026-07-20' },
    options:{ countries:['PL','DE'],locales:['pl','de'],devices:['mobile','desktop'],pages:['/','/rezerwacja/'],eventTypes:['page_view','submit_booking_form'],attractions:['Auschwitz'],referrers:['google.com'] },
    overview:{ sessions:12,pageViews:30,events:82,ctaClicks:14,sessionScope:'Anonimowa sesja w bieżącej karcie.' },
    countries:{ notice:'Kraj orientacyjny; bez IP.',rows:[{label:'PL',count:8,share:67},{label:'DE',count:4,share:33}] },
    languages:[{label:'PL',count:8,share:67}],devices:[{label:'mobile',count:7,share:58}],
    pages:{ top:[{label:'/',count:20,share:67}],paths:[{label:'/ → /rezerwacja/',count:6,share:50,averageSeconds:42}],hours:[{label:'12:00',count:6,share:20}],days:[{label:'pon.',count:8,share:27}] },
    clicks:{ top:[{label:'Rezerwuj',count:8,share:57}],phone:2,email:1,maps:3,tours:4 },
    form:{ started:10,stepViews:35,submitted:6,abandoned:3,completionRate:60,steps:[{label:'dates',count:10,share:29}],abandonSteps:[{label:'contact',count:3,share:100}],errors:[{label:'contact',count:4,share:100}],languages:[{label:'PL',count:9,share:90}],devices:[{label:'mobile',count:7,share:70}],stayTypes:[{label:'camping',count:6,share:60}] },
    campy:{ opened:9,questions:7,categories:[{label:'Auschwitz',count:4,share:57}],languages:[{label:'PL',count:9,share:100}],conversions:{pricing:2,directions:1,attractions:3,booking:2} },
    attractions:{ topAttractions:[{label:'Wieliczka',count:5,share:50}],topTours:[{label:'Auschwitz',count:4,share:100}],auschwitzOfficial:3,auschwitzTour:2,planner:2,bookingTransitions:3 },
  };
  const feedback = { count:4,average:4.3,ratings:[{label:'5',count:3,share:75}],positives:[{label:'Czytelność',count:3,share:75}],problems:[{label:'Za długi formularz',count:2,share:50}],byLanguage:[{label:'PL',count:3,share:75}],lowByLanguage:[],byDevice:[{label:'mobile',count:3,share:75}],recentSuggestions:[{suggestion:'Skrócić krok kontaktu.',locale:'PL',device:'mobile',createdAt:'2026-07-20T10:00:00Z'}] };
  const recommendations = [{ key:'mobile-abandonment',title:'Uprość formularz mobilny',priority:'high',reason:'3 porzucenia.',source:'Lejek formularza',action:'Sprawdź krok kontaktu.',status:'new' }];
  const report = '# RAPORT CC WEB — 2026-07-01–2026-07-20\n\n## Najważniejsze liczby\n\n- Sesje: 12';
  await page.route('**/api/**',async (route)=>{
    const path = new URL(route.request().url()).pathname;
    let body = { ok:true };
    if (path === '/api/inbox/list') body={ok:true,inquiries:[]};
    else if (path === '/api/inbox/health') body={ok:true,env:{},tableCheck:{ok:true},mailCenter:{ok:true,tables:{},historyActive:true,draftsActive:true}};
    else if (path === '/api/camp/stays') body={ok:true,stays:[]};
    else if (path === '/api/clients/list') body={ok:true,clients:[],stats:{},source:'camp_stays'};
    else if (path === '/api/analytics/status') body={ok:true,eventCount:82,recentEvents:[],summary:{},myStay:{ok:true,panelCount:0,activeTokens:0,feedbackCount:0,totalOpens:0}};
    else if (path === '/api/analytics/dashboard') body={ok:true,dashboard};
    else if (path === '/api/analytics/feedback') body={ok:true,feedback};
    else if (path === '/api/analytics/recommendations') body=route.request().method() === 'GET' ? {ok:true,recommendations} : {ok:true,recommendation:{recommendation_key:'mobile-abandonment',status:'planned'}};
    else if (path === '/api/analytics/report') body={ok:true,report};
    await route.fulfill({ status:200,contentType:'application/json',body:JSON.stringify(body) });
  });
  await page.goto('/cc-gate-a8f3k9r2p6/');
  await page.locator('[data-login-form] input').fill('test-code');
  await page.locator('[data-login-form]').press('Enter');
  await expect(page.locator('[data-app]')).toBeVisible();
  await page.locator('[data-view="analytics"]').click();
  await expect(page.locator('.analytics-pro')).toContainText('Decyzje oparte na realnych eventach');
  await expect(page.locator('[data-analytics-tab]')).toHaveCount(11);
  await expect(page.locator('[data-analytics-filter]')).toHaveCount(8);
  await page.locator('[data-analytics-tab="recommendations"]').click();
  await expect(page.locator('.analytics-recommendations')).toContainText('Uprość formularz mobilny');
  await page.locator('[data-analytics-tab="report"]').click();
  await expect(page.locator('[data-analytics-report]')).toContainText('# RAPORT CC WEB');
  await page.locator('[data-analytics-copy]').click();
  await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toContain('# RAPORT CC WEB');
});
