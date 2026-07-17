export const WEATHER_ENDPOINT = '/api/weather';
export const WEATHER_TIMEOUT_MS = 8_500;
export const WEATHER_CLIENT_CACHE_MS = 10 * 60 * 1000;
const WEATHER_STORAGE_PREFIX = 'cc-weather:';

const requests = globalThis.__ccWeatherRequests instanceof Map ? globalThis.__ccWeatherRequests : new Map();
globalThis.__ccWeatherRequests = requests;

const queryValue = (value) => String(value ?? '').trim();

const storageKey = (url) => `${WEATHER_STORAGE_PREFIX}${url}`;

const readStoredWeather = (url) => {
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(storageKey(url)) || 'null');
    if (cached?.expiresAt > Date.now() && cached?.payload?.ok && cached.payload.available) return cached.payload;
    window.sessionStorage.removeItem(storageKey(url));
  } catch {}
  return null;
};

const storeWeather = (url,payload) => {
  try {
    window.sessionStorage.setItem(storageKey(url),JSON.stringify({ payload,expiresAt:Date.now() + WEATHER_CLIENT_CACHE_MS }));
  } catch {}
};

export const weatherCodeGroup = (code) => {
  const value = Number(code);
  if (value === 0) return 'clear';
  if ([1,2].includes(value)) return 'mostlyClear';
  if (value === 3) return 'cloudy';
  if ([45,48].includes(value)) return 'fog';
  if ([51,53,55,56,57].includes(value)) return 'drizzle';
  if ([61,63,65,66,67,80,81,82].includes(value)) return 'rain';
  if ([71,73,75,77,85,86].includes(value)) return 'snow';
  if ([95,96,99].includes(value)) return 'storm';
  return 'cloudy';
};

export const weatherEmoji = (group) => ({
  clear:'☀️', mostlyClear:'🌤️', cloudy:'☁️', fog:'🌫️', drizzle:'🌦️', rain:'🌧️', snow:'🌨️', storm:'⛈️',
}[group] || '☁️');

export const buildWeatherUrl = ({ start, end, locale, latitude, longitude } = {}) => {
  const query = new URLSearchParams();
  const values = { start, end, locale, latitude, longitude };
  Object.entries(values).forEach(([key,value]) => {
    const normalized = queryValue(value);
    if (normalized) query.set(key,normalized);
  });
  const suffix = query.toString();
  return suffix ? `${WEATHER_ENDPOINT}?${suffix}` : WEATHER_ENDPOINT;
};

export const getPublicWeather = (options = {}) => {
  const url = buildWeatherUrl(options);
  const stored = readStoredWeather(url);
  if (stored) return Promise.resolve(stored);
  const cached = requests.get(url);
  if (cached?.expiresAt > Date.now()) return cached.promise;
  if (cached) requests.delete(url);

  const request = (async () => {
    const controller = new AbortController();
    const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : WEATHER_TIMEOUT_MS;
    const timeout = window.setTimeout(() => controller.abort('WEATHER_CLIENT_TIMEOUT'),timeoutMs);
    try {
      const response = await fetch(url,{ headers:{ accept:'application/json' },signal:controller.signal });
      if (!response.ok) throw new Error(`WEATHER_HTTP_${response.status}`);
      const payload = await response.json();
      if (!payload?.ok || !payload.available) throw new Error(payload?.code || 'WEATHER_UNAVAILABLE');
      storeWeather(url,payload);
      return payload;
    } catch (error) {
      requests.delete(url);
      if (error?.name === 'AbortError') throw new Error('WEATHER_CLIENT_TIMEOUT');
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  })();

  requests.set(url,{ promise:request,expiresAt:Date.now() + WEATHER_CLIENT_CACHE_MS });
  return request;
};

export const clearWeatherRequestCache = () => {
  requests.clear();
  try {
    Object.keys(window.sessionStorage)
      .filter((key) => key.startsWith(WEATHER_STORAGE_PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key));
  } catch {}
};
