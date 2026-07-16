import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPlannerModel,
  nextPlannerNights,
  renderPlannerHtml,
  renderPlannerSkeleton,
} from '../src/lib/stayPlannerEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes:true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
};

const decodePlannerConfig = (html) => {
  const encoded = html.match(/data-planner-config="([A-Za-z0-9+/=]+)"/)?.[1];
  assert.ok(encoded, 'Brak zakodowanej konfiguracji planera w HTML.');
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
};

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const plannerPages = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (html.includes('data-stay-planner')) plannerPages.push({ file, html, config:decodePlannerConfig(html) });
}

assert.ok(plannerPages.length >= 10, `Znaleziono tylko ${plannerPages.length} stron planera.`);
const configsByLanguage = new Map(plannerPages.map((page) => [page.config.language, page.config]));
assert.deepEqual([...configsByLanguage.keys()].sort(), ['cs','de','en','es','fr','it','nl','pl','sk','sv']);

for (const [language, config] of configsByLanguage) {
  assert.equal(config.kicker.includes('3.0'), true, `${language}: brak oznaczenia Premium 3.0.`);
  for (const key of ['loading','loadingWeather','heroEyebrow','heroSubtitle','rainPlanTitle','openMaps','tramRoute','seeAttraction','checkTrip']) {
    assert.ok(config.premium[key], `${language}: brak premium.${key}.`);
  }
  assert.equal(config.premium.routeSubtitles.length, 5, `${language}: niepełne tytuły tras.`);
  assert.equal(config.premium.routeTips.length, 5, `${language}: niepełne wskazówki tras.`);
  assert.equal(config.premium.upsellNextBenefits.length, 5, `${language}: niepełne porównania pobytu.`);
}

const config = configsByLanguage.get('pl');
assert.ok(config, 'Brak konfiguracji PL.');

const base = {
  weather:'flexible',
  trip:'none',
  startDate:'',
  weatherStatus:'neutral',
  weatherDays:[],
};

const scenarios = {
  A:{ ...base, nights:'2', group:'family', children:'yes', transport:'tram', pace:'normal', interests:['classic','history'] },
  B:{ ...base, nights:'3', group:'pair', children:'no', transport:'mixed', pace:'calm', interests:['food'] },
  C:{ ...base, nights:'4', group:'group', children:'no', transport:'car', pace:'intensive', interests:['history'], trip:'wieliczka' },
  D:{ ...base, nights:'5+', group:'solo', children:'no', transport:'car', pace:'normal', interests:['nature'] },
};

const models = Object.fromEntries(Object.entries(scenarios).map(([key, state]) => [key, buildPlannerModel(config, state)]));
assert.equal(models.A.days.length, 2, 'Scenariusz A powinien mieć 2 karty.');
assert.equal(models.B.days.length, 3, 'Scenariusz B powinien mieć 3 karty.');
assert.equal(models.C.days.length, 4, 'Scenariusz C powinien mieć 4 karty.');
assert.equal(models.D.days.length, 5, 'Scenariusz D powinien mieć 5 kart.');

const signatures = new Set(Object.values(models).map((model) => model.days.map((day) => `${day.title}|${day.transport}|${day.intensity}|${day.subtitle}`).join('::')));
assert.equal(signatures.size, 4, 'Scenariusze A–D nie zmieniają realnie wyniku.');

const requiredDayFields = ['dayNumber','title','subtitle','intensity','morning','midday','evening','transport','duration','distance','weatherAlternative','familyNote','restNote','practicalTips','mapLinks','icon','accent'];
for (const [scenario, model] of Object.entries(models)) {
  model.days.forEach((day) => {
    requiredDayFields.forEach((field) => assert.ok(Object.hasOwn(day, field), `${scenario}: brak day.${field}.`));
    assert.ok(day.morning && day.midday && day.evening, `${scenario}: niepełna oś dnia.`);
    assert.ok(day.mapLinks.maps && day.mapLinks.transport && day.mapLinks.attraction, `${scenario}: niepełne CTA dnia.`);
  });

  const html = renderPlannerHtml(model);
  assert.equal((html.match(/data-planner-day-card/g) || []).length, model.days.length, `${scenario}: liczba kart HTML nie zgadza się z modelem.`);
  assert.equal((html.match(/planner-timeline__label/g) || []).length, model.days.length * 3, `${scenario}: brak osobnych etykiet osi dnia.`);
  assert.equal((html.match(/planner-timeline__value/g) || []).length, model.days.length * 3, `${scenario}: brak osobnych wartości osi dnia.`);
  assert.equal((html.match(/planner-practical__item/g) || []).length, model.days.length * 3, `${scenario}: transport/czas/dystans nie są osobnymi blokami.`);
  assert.ok((html.match(/data-planner-campy-day/g) || []).length === model.days.length, `${scenario}: brak CTA CAMPY w każdej karcie.`);
  assert.ok((html.match(/google\.com\/maps/g) || []).length >= model.days.length, `${scenario}: brak CTA Google Maps.`);
  assert.doesNotMatch(html, /RanoTramwaj|PołudnieRynek|TransportTramwaj|Czas6[–-]8|MorningTram|TransportCar/);
  assert.match(html, /planner-rain-plan/);
}

assert.equal(models.A.days[0].familyNote.length > 0, true, 'Rodzina nie dostała wskazówki rodzinnej.');
assert.equal(models.B.days.every((day) => day.familyNote === ''), true, 'Para bez dzieci dostała notatkę rodzinną.');
assert.match(models.A.days[0].transport, /Tramwaj 18/);
assert.notEqual(models.A.days[0].transport, models.C.days[0].transport, 'Auto i tramwaj generują ten sam transport.');
assert.match(models.C.days.map((day) => day.title).join(' '), /Wieliczka/);
assert.equal(models.D.upsell.visible, false, 'Upsell nie powinien proponować 6. nocy po 5+.');

for (const [nights, expected] of [['1',1],['2',2],['3',3],['4',4],['5+',5]]) {
  const model = buildPlannerModel(config, { ...base, nights, group:'pair', children:'no', transport:'tram', pace:'normal', interests:['classic'] });
  assert.equal(model.days.length, expected, `${nights}: zła liczba kart.`);
}

assert.equal(nextPlannerNights('1'), '2');
assert.equal(nextPlannerNights('2'), '3');
assert.equal(nextPlannerNights('3'), '4');
assert.equal(nextPlannerNights('4'), '5+');
assert.equal(nextPlannerNights('5+'), '5+');
assert.equal(models.A.upsell.nextNights, '3');
assert.equal(models.A.upsell.nextBenefits.length, 3);

const weatherModel = buildPlannerModel(config, {
  ...scenarios.A,
  startDate:'2026-07-20',
  weatherStatus:'ready',
  weatherDays:[{ date:'2026-07-20', temperatureMinC:17, temperatureMaxC:25, rainProbability:20 }],
});
assert.match(weatherModel.days[0].weatherBadge, /17–25°C/);
assert.equal(weatherModel.hero.weatherSummary, config.weatherReady);
const laterModel = buildPlannerModel(config, { ...scenarios.A, startDate:'2030-07-20', weatherStatus:'later' });
assert.equal(laterModel.hero.weatherSummary, config.weatherLater);

const skeleton = renderPlannerSkeleton(config, 3);
assert.equal((skeleton.match(/planner-skeleton__card/g) || []).length, 3);
assert.match(skeleton, new RegExp(config.premium.loading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

const clientSource = await readFile(path.join(root, 'src/scripts/stayPlannerClient.js'), 'utf8');
const componentSource = await readFile(path.join(root, 'src/components/pages/StayPlannerPage.astro'), 'utf8');
assert.ok(clientSource.indexOf("if (!state.startDate)") < clientSource.indexOf('fetch(`/api/weather'), 'Pogoda może być pobierana bez daty.');
assert.match(clientSource, /await wait\(170\)/);
assert.match(clientSource, /await wait\(380\)/);
assert.match(componentSource, /animation-delay: calc\(var\(--planner-card-index\) \* 80ms/);
assert.match(componentSource, /cubic-bezier\(\.22,1,\.36,1\)/);
assert.match(componentSource, /@media \(prefers-reduced-motion:reduce\)/);
assert.match(componentSource, /@media \(max-width:720px\)/);
assert.match(componentSource, /overflow: clip/);

console.log(`Planner runtime test passed: ${plannerPages.length} stron, 10 języków, scenariusze A–D, 1/2/3/4/5+ kart, CTA, pogoda, upsell i animacje.`);
