import assert from 'node:assert/strict';
import fs from 'node:fs';
import weatherHandler from '../api/_handlers/weather.js';
import { getWeatherCopy,weatherCopy,weatherLanguages } from '../src/i18n/weather.ts';

const originalFetch = globalThis.fetch;

const responseMock = () => ({
  statusCode:200,headers:{},body:null,
  status(code) { this.statusCode = code; return this; },
  setHeader(name,value) { this.headers[String(name).toLowerCase()] = value; return this; },
  json(body) { this.body = body; return body; },
});

try {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    const daily = url.searchParams.has('daily');
    const hourly = url.searchParams.has('hourly');
    return {
      ok:true,status:200,
      json:async () => daily ? {
        daily:{ time:['2026-07-28','2026-07-29'],weather_code:[1,63],temperature_2m_max:[25,21],temperature_2m_min:[15,14],precipitation_sum:[0,4],rain_sum:[0,3],precipitation_probability_max:[10,80],wind_speed_10m_max:[12,17],wind_gusts_10m_max:[22,31],uv_index_max:[6,3] },
      } : hourly ? {
        hourly:{ time:['2026-07-17T12:00','2026-07-17T13:00'],temperature_2m:[24,25],apparent_temperature:[25,26],relative_humidity_2m:[58,55],precipitation_probability:[10,15],precipitation:[0,0],weather_code:[1,1],wind_speed_10m:[9,10] },
      } : {
        current:{ time:'2026-07-17T12:00',temperature_2m:24,apparent_temperature:25,relative_humidity_2m:58,precipitation:0,rain:0,weather_code:1,wind_speed_10m:9,wind_gusts_10m:15 },
      },
    };
  };

  const successRes = responseMock();
  await weatherHandler({ method:'GET',query:{ latitude:'50.1111',longitude:'19.9222',start:'2026-07-28',end:'2026-07-29' } },successRes);
  assert.equal(successRes.statusCode,200);
  assert.equal(successRes.body.ok,true);
  assert.equal(successRes.body.available,true);
  assert.equal(successRes.body.source,'open-meteo');
  assert.equal(successRes.body.current.temperatureC,24);
  assert.equal(successRes.body.current.humidityPercent,58);
  assert.equal(successRes.body.hourly.length,2);
  assert.equal(successRes.body.hourly[1].rainProbability,15);
  assert.equal(successRes.body.daily.length,2);
  assert.equal(successRes.body.daily[1].rainProbability,80);
  assert.equal(successRes.body.cache.currentTtlMinutes,20);
  assert.equal(successRes.body.cache.hourlyTtlMinutes,20);
  assert.equal(successRes.body.cache.dailyTtlMinutes,180);
  assert.match(successRes.headers['cache-control'],/s-maxage=1200/);

  globalThis.fetch = async () => { throw new Error('TEST_UPSTREAM_DOWN'); };
  const fallbackRes = responseMock();
  await weatherHandler({ method:'GET',query:{ latitude:'50.2222',longitude:'19.8333' } },fallbackRes);
  assert.equal(fallbackRes.statusCode,200);
  assert.equal(fallbackRes.body.ok,false);
  assert.equal(fallbackRes.body.available,false);
  assert.equal(fallbackRes.body.fallback,true);
  assert.equal(fallbackRes.body.code,'WEATHER_PROVIDER_UNAVAILABLE');

  const methodRes = responseMock();
  await weatherHandler({ method:'POST',query:{} },methodRes);
  assert.equal(methodRes.statusCode,405);
  assert.equal(methodRes.body.code,'METHOD_NOT_ALLOWED');

  assert.deepEqual(weatherLanguages,['pl','en','de','it','fr','es','nl','cs','sk','sv']);
  for (const language of weatherLanguages) {
    assert.ok(weatherCopy[language].unavailable.length > 55,`${language}: fallback pogodowy jest zbyt krótki.`);
    assert.ok(weatherCopy[language].heroUnavailable,`${language}: brak fallbacku pogody w hero.`);
    assert.equal(Object.keys(weatherCopy[language].conditions).length,8,`${language}: niepełne opisy warunków.`);
    const drawer = getWeatherCopy(language);
    ['viewForecast','currentWeather','hourlyForecast','weekForecast','retry','openPlanner','askCampy','close'].forEach((key) => assert.ok(drawer[key],`${language}: brak weather drawer ${key}.`));
  }

  const client = fs.readFileSync('src/lib/weatherClient.js','utf8');
  const card = fs.readFileSync('src/components/WeatherCard.astro','utf8');
  const planner = fs.readFileSync('src/scripts/stayPlannerClient.js','utf8');
  const myStay = fs.readFileSync('src/pages/stay/index.astro','utf8');
  const slider = fs.readFileSync('src/components/home/HeroExperienceCard.astro','utf8');
  const plannerCopy = fs.readFileSync('src/i18n/stayPlannerPremium.ts','utf8');
  assert.match(client,/WEATHER_TIMEOUT_MS = 8_500/);
  assert.match(client,/WEATHER_CLIENT_CACHE_MS = 10 \* 60 \* 1000/);
  assert.match(client,/WEATHER_ENDPOINT = '\/api\/weather'/);
  assert.match(card,/from '@\/lib\/weatherClient\.js'/);
  assert.match(planner,/from '@\/lib\/weatherClient\.js'/);
  assert.match(myStay,/from '@\/lib\/weatherClient\.js'/);
  assert.doesNotMatch(card,/fetch\(`?\/api\/weather/);
  assert.doesNotMatch(planner,/fetch\(`?\/api\/weather/);
  assert.doesNotMatch(myStay,/fetch\(`?\/api\/weather/);
  assert.equal((slider.match(/seasonal:true/g) || []).length,1);
  assert.match(slider,/kind:'welcome'[\s\S]*kind:'summer'[\s\S]*kind:'weather'[\s\S]*kind:'directions'[\s\S]*kind:'trips'/);
  assert.match(card,/data-weather-dialog/);
  assert.match(card,/data-weather-hourly/);
  for (const language of weatherLanguages) assert.match(slider,new RegExp(`\\n  ${language}: \\{`));
  assert.doesNotMatch(plannerCopy,/Planer Premium 3\.0|Premium Planner 3\.0|Premium-Planer 3\.0|Planner Premium 3\.0|Planificateur Premium 3\.0|Planificador Premium 3\.0|Premiumplanerare 3\.0/i);

  console.log('Weather test passed: endpoint success/fallback, cache, shared client, timeout, hero, slider and 10 languages.');
} finally {
  globalThis.fetch = originalFetch;
}
