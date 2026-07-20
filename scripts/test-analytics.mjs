import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  aggregateEvents,
  analyzeFeedbackRows,
  generateRecommendations,
  parseAnalyticsFilters,
  renderAnalyticsReport,
} from '../api/_lib/analytics.js';
import dashboardHandler from '../api/_handlers/analytics/dashboard.js';
import feedbackHandler from '../api/_handlers/analytics/feedback.js';
import recommendationsHandler from '../api/_handlers/analytics/recommendations.js';
import reportHandler from '../api/_handlers/analytics/report.js';

const now = new Date().toISOString();
const event = (event_type, extra = {}) => ({
  id:`event-${Math.random()}`, created_at:now, event_type, page_path:'/', locale:'pl', country_code:'PL', device_type:'mobile',
  session_id:'anon-session-123456789', referrer_domain:'google.com', metadata_json:{}, ...extra,
});

const events = [
  event('page_view'),
  event('language_change',{ locale:'de', metadata_json:{ label:'de' } }),
  event('page_view',{ page_path:'/cennik/' }),
  event('click_cta',{ page_path:'/cennik/', element_id:'booking_cta', category:'booking' }),
  event('open_campy'),
  event('campy_question_category',{ category:'Auschwitz' }),
  event('attraction_click',{ category:'auschwitz_official', element_id:'auschwitz_official_entry' }),
  event('tour_click',{ category:'auschwitz', element_id:'auschwitz_tour' }),
  event('start_booking_form',{ page_path:'/rezerwacja/' }),
  event('booking_step_view',{ page_path:'/rezerwacja/', category:'dates' }),
  event('booking_field_error',{ page_path:'/rezerwacja/', category:'contact' }),
  event('booking_abandon',{ page_path:'/rezerwacja/', category:'contact' }),
  event('submit_booking_form',{ page_path:'/rezerwacja/', category:'camping' }),
];

const filters = parseAnalyticsFilters({ range:'30d' });
const dashboard = aggregateEvents(events,filters);
assert.equal(dashboard.overview.sessions,1,'anonimowa sesja jest agregowana');
assert.equal(dashboard.languages.some((row)=>row.label === 'DE'),true,'language_change zapisuje locale');
assert.equal(dashboard.attractions.auschwitzOfficial,1,'klik oficjalnej karty Auschwitz jest liczony');
assert.equal(dashboard.attractions.auschwitzTour,1,'klik wycieczki Auschwitz jest liczony');
assert.equal(dashboard.campy.opened,1,'otwarcie CAMPY jest liczone');
assert.equal(dashboard.form.started,1,'start formularza jest liczony');
assert.equal(dashboard.form.stepViews,1,'krok formularza jest liczony');
assert.equal(dashboard.form.submitted,1,'submit formularza jest liczony');
assert.equal(dashboard.form.errors[0].label,'contact','błąd formularza zapisuje kategorię, nie wartość pola');

const feedback = analyzeFeedbackRows([{
  created_at:now, language:'de', country:'Niemcy', raw_payload_json:{ deviceType:'mobile', feedback:{ rating:2, liked:['obrazy'], improve:'Kontakt test@example.com +48 600 700 800 i uprość formularz', easyInfo:'trudno', easyForm:'trudno' } },
}],[]);
assert.equal(feedback.average,2,'feedback jest analizowany');
assert.equal(feedback.recentSuggestions[0].suggestion.includes('test@example.com'),false,'email jest usuwany z sugestii');
assert.equal(feedback.recentSuggestions[0].suggestion.includes('600 700 800'),false,'telefon jest usuwany z sugestii');

const recommendations = generateRecommendations(dashboard,feedback,[]);
assert.equal(Array.isArray(recommendations) && recommendations.length > 0,true,'powstaje przynajmniej jedna rekomendacja');
const report = renderAnalyticsReport({ dashboard,feedback,recommendations });
assert.match(report,/^# RAPORT CC WEB/m,'raport ma format Markdown');
assert.match(report,/## Najważniejsze liczby/,'raport ma wymagane sekcje');

const mockResponse = () => ({
  statusCode:200, headers:{}, payload:null,
  setHeader(name,value){ this.headers[name]=value; return this; },
  status(value){ this.statusCode=value; return this; },
  json(value){ this.payload=value; return this; },
  end(value){ this.payload=value; return this; },
});
for (const [name,handler] of [['dashboard',dashboardHandler],['feedback',feedbackHandler],['recommendations',recommendationsHandler],['report',reportHandler]]) {
  const res = mockResponse();
  await handler({ method:'GET', headers:{}, query:{} },res);
  assert.equal(res.statusCode,401,`${name} bez kodu zwraca 401`);
  assert.equal(res.payload?.code,'UNAUTHORIZED',`${name} bez kodu zwraca JSON UNAUTHORIZED`);
}

const [siteAnalytics,router,migration,homepage] = await Promise.all([
  readFile(new URL('../src/components/SiteAnalytics.astro',import.meta.url),'utf8'),
  readFile(new URL('../api/[...path].js',import.meta.url),'utf8'),
  readFile(new URL('../supabase/migrations/20260720143000_site_analytics_intelligence.sql',import.meta.url),'utf8'),
  readFile(new URL('../src/components/home/HomeAttractionsTours.astro',import.meta.url),'utf8'),
]);
assert.match(siteAnalytics,/fetch\('\/api\/analytics\/event'/,'publiczny tracking używa własnego endpointu');
assert.match(siteAnalytics,/\.catch\(\(\) => \{\}\)/,'awaria eventu nie blokuje strony');
assert.doesNotMatch(siteAnalytics,/document\.cookie|localStorage\.setItem\([^,]*analytics/i,'brak marketingowego cookie/localStorage');
for (const route of ['analytics/dashboard','analytics/feedback','analytics/recommendations','analytics/report']) assert.ok(router.includes(route),`router zawiera ${route}`);
const migrationSql = migration.split('\n').filter((line)=>!line.trim().startsWith('--')).join('\n');
assert.doesNotMatch(migrationSql,/\b(drop|delete|truncate)\b/i,'migracja nie zawiera operacji destrukcyjnych');
for (const column of ['country_code','referrer_domain','session_id','element_id','category']) assert.ok(migration.includes(column),`migracja zawiera ${column}`);
assert.ok(homepage.includes('loading="lazy"'),'obrazy homepage mają lazy-loading');
assert.ok(homepage.includes('https://visit.auschwitz.org/'),'homepage ma oficjalny system Auschwitz');
assert.ok(!homepage.includes('>https://qr.codes'),'surowy qr.codes nie jest tekstem publicznego UI');

console.log('Analytics tests passed: events, privacy, funnel, feedback, recommendations, report and 401 contracts.');
