import assert from 'node:assert/strict';
import { readdir,readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPlannerModel,
  nextPlannerNights,
  previousPlannerNights,
  renderPlannerDayCards,
  renderPlannerDayModal,
  renderPlannerHtml,
  renderPlannerQuickActions,
  renderPlannerSkeleton,
  renderPlannerSummer,
  renderPlannerUpsell,
  renderPlannerWeather,
} from '../src/lib/stayPlannerEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist = path.join(root,'dist');
const walk = async (directory) => (await Promise.all((await readdir(directory,{ withFileTypes:true })).map((entry) => {
  const target = path.join(directory,entry.name);
  return entry.isDirectory() ? walk(target) : [target];
}))).flat();

const decodePlannerConfig = (html) => {
  const encoded = html.match(/data-planner-config="([A-Za-z0-9+/=]+)"/)?.[1];
  assert.ok(encoded,'Brak zakodowanej konfiguracji planera w HTML.');
  return JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));
};

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const plannerPages = [];
for (const file of htmlFiles) {
  const html = await readFile(file,'utf8');
  if (html.includes('data-stay-planner')) plannerPages.push({ file,html,config:decodePlannerConfig(html) });
}

assert.ok(plannerPages.length >= 10,`Znaleziono tylko ${plannerPages.length} stron planera.`);
const configsByLanguage = new Map(plannerPages.map((page) => [page.config.language,page.config]));
assert.deepEqual([...configsByLanguage.keys()].sort(),['cs','de','en','es','fr','it','nl','pl','sk','sv']);

const dashboardKeys = [
  'introTitle','introCopy','introStart','introCampy',
  'panelTitle','panelSubtitle','filtersOpen','filtersClose','active','calm','veryCalm','walkBike','tripYes','tripNo','childrenHint',
  'weatherTitle','weatherDetails','weatherLess','weatherEmpty','weatherLater','weatherUnavailable','weatherRain','dayDetails','previousDays','nextDays',
  'quickMaps','quickTram','quickTickets','quickCampy','quickSave','quickMail','saved','saveError','mailSubject','mailIntro',
  'modalClose','modalSchedule','modalPractical','modalPlanB','modalTips','modalLinks','upsellTitle','upsellCopy','upsellAdd','upsellMax',
  'summerTitle','summerDisclaimer','chooseDate','planSavedAt','nightsDates','groupTile','transportTile','paceTile',
];
for (const [language,config] of configsByLanguage) {
  assert.equal(config.kicker.includes('3.0'),true,`${language}: brak oznaczenia Premium 3.0.`);
  dashboardKeys.forEach((key) => assert.ok(config.dashboard[key],`${language}: brak dashboard.${key}.`));
  assert.equal(config.dashboard.upsellBenefits.length,3,`${language}: upsell nie ma 3 korzyści.`);
  assert.equal(config.dashboard.summerBullets.length,3,`${language}: komunikat letni nie ma 3 punktów.`);
  assert.equal(Object.keys(config.weatherConditions).length,8,`${language}: brak pełnych opisów pogody.`);
  assert.equal(config.assets.days.length,5,`${language}: brak obrazów dla 5 typów dnia.`);
  assert.equal(config.routes.length,5,`${language}: niepełne trasy planera.`);
}
assert.notEqual(configsByLanguage.get('de').dashboard.panelTitle,configsByLanguage.get('en').dashboard.panelTitle,'DE korzysta z angielskiego fallbacku dashboardu.');
assert.notEqual(configsByLanguage.get('sv').dashboard.summerTitle,configsByLanguage.get('en').dashboard.summerTitle,'SV korzysta z angielskiego fallbacku lata.');

const config = configsByLanguage.get('pl');
assert.ok(config,'Brak konfiguracji PL.');
const base = { weather:'flexible',trip:'none',startDate:'',weatherStatus:'neutral',weatherDays:[] };
const scenarios = {
  family:{ ...base,nights:'2',group:'family',children:'yes',transport:'tram',pace:'normal',interests:['classic','history'] },
  pair:{ ...base,nights:'3',group:'pair',children:'no',transport:'mixed',pace:'calm',interests:['food'] },
  group:{ ...base,nights:'4',group:'group',children:'no',transport:'car',pace:'intensive',interests:['history'],trip:'wieliczka' },
  solo:{ ...base,nights:'5+',group:'solo',children:'no',transport:'car',pace:'normal',interests:['nature'] },
};
const models = Object.fromEntries(Object.entries(scenarios).map(([key,state]) => [key,buildPlannerModel(config,state)]));
assert.equal(models.family.days.length,2);
assert.equal(models.pair.days.length,3);
assert.equal(models.group.days.length,4);
assert.equal(models.solo.days.length,5);

const signatures = new Set(Object.values(models).map((model) => model.days.map((day) => `${day.routeIndex}|${day.transport}|${day.intensity}|${day.subtitle}`).join('::')));
assert.equal(signatures.size,4,'Rodzina/para/grupa/solo nie zmieniają realnie planu.');

const requiredDayFields = ['dayNumber','routeIndex','title','subtitle','intensity','morning','midday','evening','morningShort','middayShort','eveningShort','transport','duration','distance','weatherAlternative','planBShort','familyNote','restNote','practicalTips','mapLinks','icon','accent','image'];
for (const [scenario,model] of Object.entries(models)) {
  model.days.forEach((day) => {
    requiredDayFields.forEach((field) => assert.ok(Object.hasOwn(day,field),`${scenario}: brak day.${field}.`));
    assert.ok(day.morning && day.midday && day.evening,`${scenario}: niepełna kolejność dnia.`);
    assert.ok(day.morningShort.length <= 82 && day.middayShort.length <= 82 && day.eveningShort.length <= 82,`${scenario}: tekst głównej karty jest za długi.`);
    assert.ok(day.mapLinks.maps && day.mapLinks.transport && day.mapLinks.attraction,`${scenario}: niepełne linki dnia.`);
  });
  const html = renderPlannerHtml(model);
  assert.equal((html.match(/data-planner-day-card/g) || []).length,model.days.length,`${scenario}: zła liczba kart HTML.`);
  assert.equal((html.match(/class="planner-day-card__time"/g) || []).length,model.days.length * 3,`${scenario}: rano/południe/wieczór nie są trzema kafelkami.`);
  assert.equal((html.match(/planner-day-card__practical/g) || []).length,model.days.length,`${scenario}: brak praktycznych kafelków.`);
  assert.equal((html.match(/planner-quick__item/g) || []).length,6,`${scenario}: szybkie akcje nie mają 6 kafelków.`);
  assert.equal((html.match(/<dialog class="planner-dialog"/g) || []).length,1,`${scenario}: brak pojedynczego modalu.`);
  assert.match(html,/data-planner-days-track/);
  assert.match(html,/data-planner-add-night/);
  assert.match(html,/data-planner-save/);
  assert.match(html,/data-planner-mail/);
  assert.match(html,/google\.com\/maps/);
  assert.equal((renderPlannerDayCards(model).match(/data-planner-day-card/g) || []).length,model.days.length,`${scenario}: selektywny renderer dni zgubił kartę.`);
  assert.match(renderPlannerWeather(model.weather),/data-planner-weather-strip/);
  assert.equal((renderPlannerQuickActions(model.quickActions).match(/planner-quick__item/g) || []).length,6);
  assert.match(renderPlannerUpsell(model.upsell),/data-planner-add-night/);
  assert.match(renderPlannerSummer(model.summer),/planner-summer/);
  assert.doesNotMatch(html,/planner-timeline__|planner-practical__|planner-rain-plan|stay-planner__plan-heading|stay-planner__upsell-compare/,'Stary długi render nadal istnieje.');
}

assert.ok(models.family.days[0].familyNote,'Rodzina nie dostała wskazówki rodzinnej.');
assert.equal(models.pair.days.every((day) => day.familyNote === ''),true,'Para bez dzieci dostała notatkę rodzinną.');
assert.match(models.family.days[0].transport,/Tramwaj 18/);
assert.notEqual(models.family.days[0].transport,models.group.days[0].transport,'Auto i tramwaj generują ten sam transport.');
assert.match(models.group.days.map((day) => day.title).join(' '),/Wieliczka/,'Wybrana wycieczka nie trafiła do planu.');
assert.doesNotMatch(models.family.days.map((day) => day.title).join(' '),/Wieliczka/,'Wycieczka pojawia się mimo wyboru „Nie”.');
assert.equal(models.solo.upsell.visible,false,'Upsell proponuje 6. noc po 5+.');

for (const [nights,expected] of [['1',1],['2',2],['3',3],['4',4],['5+',5]]) {
  const model = buildPlannerModel(config,{ ...base,nights,group:'pair',children:'no',transport:'tram',pace:'normal',interests:['classic'] });
  assert.equal(model.days.length,expected,`${nights}: zła liczba kart.`);
  assert.equal((renderPlannerHtml(model).match(/data-planner-day-card/g) || []).length,expected,`${nights}: renderer zgubił kartę.`);
}
assert.equal(nextPlannerNights('1'),'2');
assert.equal(nextPlannerNights('4'),'5+');
assert.equal(nextPlannerNights('5+'),'5+');
assert.equal(previousPlannerNights('5+'),'4');
assert.equal(previousPlannerNights('1'),'1');

const paceNormal = buildPlannerModel(config,{ ...scenarios.pair,pace:'normal' });
const paceCalm = buildPlannerModel(config,{ ...scenarios.pair,pace:'calm' });
const paceActive = buildPlannerModel(config,{ ...scenarios.pair,pace:'intensive' });
assert.notEqual(paceNormal.days[0].midday,paceCalm.days[0].midday,'Spokojne tempo nie zmienia programu.');
assert.notEqual(paceNormal.days[0].midday,paceActive.days[0].midday,'Aktywne tempo nie zmienia programu.');
const childPlan = buildPlannerModel(config,{ ...scenarios.pair,children:'yes' });
assert.notEqual(childPlan.days.map((day) => day.routeIndex).join(','),models.pair.days.map((day) => day.routeIndex).join(','),'Dzieci nie zmieniają doboru tras.');
const indoorPlan = buildPlannerModel(config,{ ...scenarios.family,weather:'indoor' });
assert.notEqual(indoorPlan.days[0].weatherAlternative,models.family.days[0].weatherAlternative,'Preferencja wnętrz nie zmienia planu B.');

const weatherModel = buildPlannerModel(config,{
  ...scenarios.family,startDate:'2026-07-20',weatherStatus:'ready',
  weatherDays:[
    { date:'2026-07-20',weatherCode:1,temperatureMinC:17,temperatureMaxC:25,rainProbability:20 },
    { date:'2026-07-21',weatherCode:63,temperatureMinC:15,temperatureMaxC:21,rainProbability:70 },
  ],
});
assert.equal(weatherModel.weather.days.length,2,'Pasek pogody nie ma danych dla dni pobytu.');
assert.equal(weatherModel.weather.days[0].temperature,'25°C');
assert.equal(weatherModel.weather.days[1].rain,'70%');
const laterModel = buildPlannerModel(config,{ ...scenarios.family,startDate:'2030-07-20',weatherStatus:'later' });
assert.equal(laterModel.weather.message,config.dashboard.weatherLater);
const emptyModel = buildPlannerModel(config,scenarios.family);
assert.equal(emptyModel.weather.message,config.dashboard.weatherEmpty);

const modalHtml = renderPlannerDayModal(models.family.days[0],models.family.labels);
assert.match(modalHtml,/planner-dialog__timeline/);
assert.match(modalHtml,/planner-dialog__facts/);
assert.match(modalHtml,/planner-dialog__links/);
assert.match(modalHtml,/google\.com\/maps/);
assert.doesNotMatch(modalHtml,/undefined|null/);

const skeleton = renderPlannerSkeleton(config,5);
assert.equal((skeleton.match(/<article class="planner-skeleton__card">/g) || []).length,3,'Skeleton pokazuje więcej niż 3 karty.');
assert.match(skeleton,new RegExp(config.premium.loading.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

const clientSource = await readFile(path.join(root,'src/scripts/stayPlannerClient.js'),'utf8');
const componentSource = await readFile(path.join(root,'src/components/pages/StayPlannerPage.astro'),'utf8');
const engineSource = await readFile(path.join(root,'src/lib/stayPlannerEngine.js'),'utf8');
assert.ok(clientSource.indexOf("if (!state.startDate)") < clientSource.indexOf('getPublicWeather({ start:state.startDate,end })'),'Pogoda może być pobierana bez daty.');
assert.match(clientSource,/from '@\/lib\/weatherClient\.js'/,'Planer nie używa wspólnego klienta pogody.');
assert.match(clientSource,/Math\.min\(3,cards\.length\)/,'Desktop nie ogranicza widoku do 3 dni.');
assert.match(clientSource,/pointerdown/,'Brak gestu swipe.');
assert.match(clientSource,/showModal\(\)/,'Modal nie jest otwierany natywnie.');
assert.match(clientSource,/event\.key !== 'Tab'/,'Brak focus trapu.');
assert.match(clientSource,/event\.key === 'Escape'/,'Brak zamykania ESC.');
assert.match(clientSource,/localStorage\.setItem\('cc-stay-planner-v3'/,'Zapis planu nie działa w localStorage.');
assert.match(clientSource,/mailto:/,'Akcja e-mail nie jest zaimplementowana.');
assert.match(clientSource,/planner_add_night/,'Brak eventu planner_add_night.');
assert.match(clientSource,/const updateHeroSummary =/,'Brak selektywnego updateHeroSummary.');
assert.match(clientSource,/const updateWeather =/,'Brak selektywnego updateWeather.');
assert.match(clientSource,/const updateDayCards =/,'Brak selektywnego updateDayCards.');
assert.match(clientSource,/const updateQuickActions =/,'Brak selektywnego updateQuickActions.');
assert.match(clientSource,/const updateUpsell =/,'Brak selektywnego updateUpsell.');
assert.match(clientSource,/const updateSummerCard =/,'Brak selektywnego updateSummerCard.');
assert.match(clientSource,/const updatePlannerMeta =/,'Brak selektywnego updatePlannerMeta.');
assert.equal((clientSource.match(/result\.innerHTML\s*=\s*renderPlannerHtml/g) || []).length,1,'Pełny dashboard jest przepisywany więcej niż raz.');
assert.doesNotMatch(clientSource,/transitionPlan|result\.classList\.add\('is-exiting'\)/,'Pozostał globalny transition/rerender dashboardu.');
assert.match(componentSource,/grid-template-columns:minmax\(340px,390px\) minmax\(0,1fr\)/,'Brak czytelnego układu panel + wynik.');
assert.match(componentSource,/data-planner-start/,'Brak CTA hero do planera.');
assert.match(componentSource,/data-planner-intro-campy/,'Brak CTA hero do CAMPY.');
assert.match(componentSource,/data-planner-accordion/,'Brak accordionów panelu.');
assert.match(componentSource,/\.stay-planner__panel\.can-stick/,'Brak warunkowego sticky panelu.');
assert.doesNotMatch(componentSource,/\.stay-planner__panel\s*\{[^}]*overflow\s*:\s*(auto|scroll)/s,'Panel nadal ma wewnętrzny scroll.');
assert.match(componentSource,/@media \(max-width:700px\)/);
assert.match(componentSource,/@media \(max-width:390px\)/);
assert.match(componentSource,/@media \(prefers-reduced-motion:reduce\)/);
assert.match(componentSource,/overflow:clip/);
assert.doesNotMatch(componentSource,/WeatherCard|SummerCampingNotice|stay-planner__quiz|stay-planner__inspiration|stay-planner__extras/,'Stare sekcje nadal są w komponencie.');
assert.doesNotMatch(engineSource,/planner-timeline__|planner-rain-plan|stay-planner__upsell-compare/,'Stary renderer nadal jest w silniku.');

for (const page of plannerPages) {
  assert.match(page.html,/data-planner-panel/);
  assert.match(page.html,/data-planner-night-step="-1"/);
  assert.match(page.html,/data-planner-trip-choice/);
  assert.doesNotMatch(page.html,/data-planner-debug/,'Diagnostyka DEV trafiła do buildu produkcyjnego.');
  assert.doesNotMatch(page.html,/stay-planner__quiz|stay-planner__inspiration|stay-planner__extras/);
}

console.log(`Planner runtime test passed: ${plannerPages.length} stron, 10 języków, 1/2/3/4/5 kart, personalizacja, karuzela, pogoda, modal, akcje, upsell i brak starego renderu.`);
