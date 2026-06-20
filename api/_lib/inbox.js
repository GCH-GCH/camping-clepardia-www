import { timingSafeEqual } from 'node:crypto';

const TABLE = 'reservation_inquiries';

const envValue = (name) => String(process.env[name] || '').trim();

const supabaseConfig = () => {
  const url = envValue('SUPABASE_URL').replace(/\/+$/, '');
  const key = envValue('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) {
    const missing = [!url ? 'SUPABASE_URL' : '', !key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''].filter(Boolean);
    const error = new Error(`Brak konfiguracji Supabase: ${missing.join(', ')}.`);
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    const error = new Error('SUPABASE_URL ma nieprawidłową wartość. Wklej pełny Project URL z Supabase, np. https://project-ref.supabase.co.');
    error.code = 'SUPABASE_URL_INVALID';
    throw error;
  }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.includes('supabase')) {
    const error = new Error('SUPABASE_URL nie wygląda jak Project URL Supabase.');
    error.code = 'SUPABASE_URL_INVALID';
    throw error;
  }
  if (/^(service.role.key|your.|project.|supabase.)/i.test(key.replace(/[_-]+/g, '.')) || key.length < 20) {
    const error = new Error('SUPABASE_SERVICE_ROLE_KEY ma wartość zastępczą albo jest nieprawidłowy.');
    error.code = 'SUPABASE_SERVICE_ROLE_KEY_INVALID';
    throw error;
  }
  return { url, key };
};

const supabaseRequest = async (path, options = {}) => {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message = body?.message || body?.details || body?.hint || text || `Supabase HTTP ${response.status}`;
    const error = new Error(String(message));
    error.code = body?.code || `SUPABASE_${response.status}`;
    error.status = response.status;
    throw error;
  }
  return body;
};

export const saveReservationInquiry = async (record) => {
  const rows = await supabaseRequest(`${TABLE}?select=id,created_at`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(record),
  });
  const saved = Array.isArray(rows) ? rows[0] : rows;
  if (!saved?.id) {
    const error = new Error('Supabase nie zwrócił ID zapisanego zapytania.');
    error.code = 'SUPABASE_INSERT_WITHOUT_ID';
    throw error;
  }
  return saved;
};

export const updateReservationMailStatus = async (id, values) =>
  supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { prefer: 'return=minimal' },
    body: JSON.stringify(values),
  });

export const listReservationInquiries = async () =>
  supabaseRequest(`${TABLE}?select=*&order=created_at.desc&limit=500`, {
    method: 'GET',
  });

export const updateReservationInquiry = async (id, values) => {
  const rows = await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: 'PATCH',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(values),
  });
  return Array.isArray(rows) ? rows[0] : rows;
};

export const authorizeInboxRequest = (req) => {
  const expected = envValue('CC_INBOX_ACCESS_CODE');
  const received = String(req.headers['x-cc-inbox-code'] || '').trim();
  if (!expected) return { ok: false, reason: 'CC_INBOX_ACCESS_CODE nie jest skonfigurowany.' };
  if (!received) return { ok: false, reason: 'Brak kodu dostępu.' };
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  const ok = expectedBuffer.length === receivedBuffer.length
    && timingSafeEqual(expectedBuffer, receivedBuffer);
  return { ok, reason: ok ? '' : 'Nieprawidłowy kod dostępu.' };
};

export const inboxError = (error) => ({
  error: error?.code || 'INBOX_ERROR',
  reason: error instanceof Error ? error.message : 'Nieznany błąd inboxu.',
});

export const inboxErrorStatus = (error) =>
  ['SUPABASE_NOT_CONFIGURED', 'SUPABASE_URL_INVALID', 'SUPABASE_SERVICE_ROLE_KEY_INVALID'].includes(error?.code)
    ? 503
    : 502;
