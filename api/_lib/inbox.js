import { timingSafeEqual } from 'node:crypto';

const TABLE = 'reservation_inquiries';
const envValue = (name) => String(process.env[name] || '').trim();
const preview = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length <= 34 ? text : `${text.slice(0, 18)}…${text.slice(-12)}`;
};

export class InboxApiError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'InboxApiError';
    this.code = code;
    this.httpStatus = options.httpStatus || 500;
    this.supabaseStatus = options.supabaseStatus ?? null;
    this.details = options.details ?? null;
    this.missing = options.missing || undefined;
    this.valuePreview = options.valuePreview || undefined;
  }
}

export const getInboxEnvHealth = () => {
  const url = envValue('SUPABASE_URL').replace(/\/+$/, '');
  const key = envValue('SUPABASE_SERVICE_ROLE_KEY');
  const inboxCode = envValue('CC_INBOX_ACCESS_CODE');
  let parsedUrl = null;
  try {
    parsedUrl = url ? new URL(url) : null;
  } catch {}
  return {
    supabaseUrlPresent: Boolean(url),
    serviceRolePresent: Boolean(key),
    inboxCodePresent: Boolean(inboxCode),
    supabaseHost: parsedUrl?.hostname || '',
    resendKeyPresent: Boolean(envValue('RESEND_API_KEY')),
    resendKeyLength: envValue('RESEND_API_KEY').length,
    reservationFromPresent: Boolean(envValue('RESERVATION_FROM_EMAIL') || envValue('MAIL_FROM')),
    reservationToPresent: Boolean(envValue('RESERVATION_TO_EMAIL') || envValue('MAIL_TO')),
    web3FormsKeyPresent: Boolean(envValue('WEB3FORMS_ACCESS_KEY')),
    formSubmitToPresent: Boolean(envValue('FORMSUBMIT_TO_EMAIL') || envValue('RESERVATION_TO_EMAIL') || envValue('MAIL_TO')),
  };
};

const supabaseConfig = () => {
  const url = envValue('SUPABASE_URL').replace(/\/+$/, '');
  const key = envValue('SUPABASE_SERVICE_ROLE_KEY');
  const missing = [
    !url ? 'SUPABASE_URL' : '',
    !key ? 'SUPABASE_SERVICE_ROLE_KEY' : '',
  ].filter(Boolean);
  if (missing.length) {
    throw new InboxApiError('ENV_MISSING', `Brak wymaganych zmiennych ENV: ${missing.join(', ')}.`, {
      httpStatus: 500,
      missing,
    });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new InboxApiError('SUPABASE_URL_INVALID', 'SUPABASE_URL nie jest poprawnym adresem URL.', {
      httpStatus: 500,
      valuePreview: preview(url),
    });
  }
  if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.supabase.co')) {
    throw new InboxApiError('SUPABASE_URL_INVALID', 'SUPABASE_URL musi wskazywać host https://….supabase.co.', {
      httpStatus: 500,
      valuePreview: preview(url),
    });
  }
  return { url, key, host: parsedUrl.hostname };
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const networkErrorDetails = (error) => {
  const cause = error?.cause;
  return [
    error instanceof Error ? error.message : String(error),
    cause?.code,
    cause?.syscall,
    cause?.hostname,
    cause?.message,
  ].filter(Boolean).join(' | ');
};

export const supabaseRequest = async (path, options = {}) => {
  const { url, key } = supabaseConfig();
  let response;
  try {
    response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new InboxApiError('SUPABASE_QUERY_FAILED', 'Nie udało się połączyć z Supabase.', {
      httpStatus: 502,
      details: networkErrorDetails(error),
    });
  }

  const body = await parseResponseBody(response);
  if (!response.ok) {
    const errorText = String(body?.message || body?.error || `Supabase HTTP ${response.status}`);
    const details = [body?.details, body?.hint, body?.code].filter(Boolean).join(' | ') || null;
    throw new InboxApiError('SUPABASE_QUERY_FAILED', errorText, {
      httpStatus: response.status >= 500 ? 502 : 500,
      supabaseStatus: response.status,
      details,
    });
  }
  return { body, status: response.status };
};

export const saveReservationInquiry = async (record) => {
  const { body } = await supabaseRequest(`${TABLE}?select=id,created_at`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(record),
  });
  const saved = Array.isArray(body) ? body[0] : body;
  if (!saved?.id) {
    throw new InboxApiError('SUPABASE_QUERY_FAILED', 'Supabase nie zwrócił ID zapisanego zapytania.', {
      httpStatus: 500,
      details: 'INSERT succeeded without a returned id.',
    });
  }
  return saved;
};

export const updateReservationMailStatus = async (id, values) =>
  supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { prefer: 'return=minimal' },
    body: JSON.stringify(values),
  });

export const listReservationInquiries = async () => {
  const { body } = await supabaseRequest(`${TABLE}?select=*&order=created_at.desc&limit=500`, { method: 'GET' });
  return Array.isArray(body) ? body : [];
};

export const checkReservationInquiriesTable = async () => {
  const { status } = await supabaseRequest(`${TABLE}?select=id&limit=1`, {
    method: 'GET',
    headers: { prefer: 'count=exact' },
  });
  return { ok: true, status, error: null };
};

export const updateReservationInquiry = async (id, values) => {
  const { body } = await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: 'PATCH',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(values),
  });
  return Array.isArray(body) ? body[0] : body;
};

export const authorizeInboxRequest = (req) => {
  const expected = envValue('CC_INBOX_ACCESS_CODE');
  const received = String(req.headers?.['x-cc-inbox-code'] || '').trim();
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length
    && timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const serializeInboxError = (error) => {
  if (error instanceof InboxApiError) {
    return {
      status: error.httpStatus,
      payload: {
        ok: false,
        code: error.code,
        error: error.message,
        details: error.details,
        ...(error.missing ? { missing: error.missing } : {}),
        ...(error.valuePreview ? { valuePreview: error.valuePreview } : {}),
        ...(error.supabaseStatus !== null ? { supabaseStatus: error.supabaseStatus } : {}),
      },
    };
  }
  return {
    status: 500,
    payload: {
      ok: false,
      code: 'INTERNAL_ERROR',
      error: error instanceof Error ? error.message : 'Nieznany błąd.',
      details: null,
    },
  };
};

export const logInboxError = (scope, error, extra = {}) => {
  const serialized = serializeInboxError(error);
  console.error(`[${scope}]`, {
    code: serialized.payload.code,
    status: serialized.status,
    supabaseStatus: serialized.payload.supabaseStatus ?? null,
    error: serialized.payload.error,
    details: serialized.payload.details,
    ...extra,
  });
};
