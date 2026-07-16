const CAMPING_LOCATION = { latitude: 50.1047, longitude: 19.9318 };
const CURRENT_TTL_MS = 20 * 60 * 1000;
const DAILY_TTL_MS = 3 * 60 * 60 * 1000;
const MAX_FORECAST_DAYS = 16;
const currentCache = new Map();
const dailyCache = new Map();

const sendJson = (res, status, body) => {
  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, max-age=0, s-maxage=1200, stale-while-revalidate=10800');
  return res.json(body);
};

const finiteNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const coordinate = (value, fallback, min, max) => {
  const parsed = finiteNumber(value, fallback);
  return Math.min(max, Math.max(min, Math.round(parsed * 10000) / 10000));
};

const dateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
const isoToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const addDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getCached = (cache, key) => {
  const item = cache.get(key);
  if (!item || item.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

const setCached = (cache, key, value, ttl) => {
  if (cache.size > 80) {
    for (const [entryKey, entry] of cache.entries()) if (entry.expiresAt <= Date.now()) cache.delete(entryKey);
    if (cache.size > 80) cache.delete(cache.keys().next().value);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
};

const fetchOpenMeteo = async (params) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    const response = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error(`OPEN_METEO_HTTP_${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const currentWeather = async (latitude, longitude) => {
  const key = `${latitude}:${longitude}`;
  const cached = getCached(currentCache, key);
  if (cached) return { value: cached, cached: true };
  const body = await fetchOpenMeteo({
    latitude, longitude, timezone: 'Europe/Warsaw',
    current: 'temperature_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m',
  });
  const current = body.current || {};
  const value = {
    time: current.time || null,
    temperatureC: finiteNumber(current.temperature_2m, null),
    apparentTemperatureC: finiteNumber(current.apparent_temperature, null),
    precipitationMm: finiteNumber(current.precipitation, 0),
    rainMm: finiteNumber(current.rain, 0),
    weatherCode: finiteNumber(current.weather_code, null),
    windKmh: finiteNumber(current.wind_speed_10m, null),
    windGustKmh: finiteNumber(current.wind_gusts_10m, null),
  };
  return { value: setCached(currentCache, key, value, CURRENT_TTL_MS), cached: false };
};

const dailyWeather = async (latitude, longitude, start, end) => {
  const today = isoToday();
  const maxDate = addDays(today, MAX_FORECAST_DAYS - 1);
  const requestedStart = start || today;
  const requestedEnd = end || maxDate;
  if (requestedStart > maxDate || requestedEnd < today) return { value: [], cached: false, inRange: false };
  const safeStart = requestedStart < today ? today : requestedStart;
  const safeEnd = requestedEnd > maxDate ? maxDate : requestedEnd;
  const key = `${latitude}:${longitude}:${safeStart}:${safeEnd}`;
  const cached = getCached(dailyCache, key);
  if (cached) return { value: cached, cached: true, inRange: true };
  const body = await fetchOpenMeteo({
    latitude, longitude, timezone: 'Europe/Warsaw', start_date: safeStart, end_date: safeEnd,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max',
  });
  const daily = body.daily || {};
  const value = (daily.time || []).map((date, index) => ({
    date,
    weatherCode: finiteNumber(daily.weather_code?.[index], null),
    temperatureMaxC: finiteNumber(daily.temperature_2m_max?.[index], null),
    temperatureMinC: finiteNumber(daily.temperature_2m_min?.[index], null),
    precipitationMm: finiteNumber(daily.precipitation_sum?.[index], 0),
    rainMm: finiteNumber(daily.rain_sum?.[index], 0),
    rainProbability: finiteNumber(daily.precipitation_probability_max?.[index], null),
    windKmh: finiteNumber(daily.wind_speed_10m_max?.[index], null),
    windGustKmh: finiteNumber(daily.wind_gusts_10m_max?.[index], null),
    uvIndex: finiteNumber(daily.uv_index_max?.[index], null),
  }));
  return { value: setCached(dailyCache, key, value, DAILY_TTL_MS), cached: false, inRange: true };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    return sendJson(res, 405, { ok: false, available: false, code: 'METHOD_NOT_ALLOWED' });
  }
  const latitude = coordinate(req.query?.latitude ?? req.query?.lat, CAMPING_LOCATION.latitude, -90, 90);
  const longitude = coordinate(req.query?.longitude ?? req.query?.lon, CAMPING_LOCATION.longitude, -180, 180);
  const start = dateOnly(req.query?.start ?? req.query?.startDate);
  const end = dateOnly(req.query?.end ?? req.query?.endDate);
  try {
    const [current, daily] = await Promise.all([
      currentWeather(latitude, longitude),
      dailyWeather(latitude, longitude, start, end),
    ]);
    return sendJson(res, 200, {
      ok: true,
      available: true,
      source: 'open-meteo',
      location: { latitude, longitude, name: 'Camping Clepardia · Kraków', timezone: 'Europe/Warsaw' },
      current: current.value,
      daily: daily.value,
      forecastInRange: daily.inRange,
      cache: { current: current.cached ? 'hit' : 'miss', daily: daily.cached ? 'hit' : 'miss', currentTtlMinutes: 20, dailyTtlMinutes: 180 },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[weather-api]', { name: error?.name || 'Error', message: String(error?.message || 'weather unavailable').slice(0, 160) });
    return sendJson(res, 200, {
      ok: false,
      available: false,
      fallback: true,
      location: { latitude, longitude, name: 'Camping Clepardia · Kraków' },
      current: null,
      daily: [],
      forecastInRange: false,
    });
  }
}
