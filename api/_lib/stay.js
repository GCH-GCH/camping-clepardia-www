import { createHash, randomBytes } from 'node:crypto';
import { InboxApiError, supabaseRequest } from './inbox.js';

const TABLE = 'stay_panels';
const INQUIRIES_TABLE = 'reservation_inquiries';
const SUPPORTED_LOCALES = new Set(['pl', 'en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv']);

const oneLine = (value, max = 240) =>
  String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 700) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

const safeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const safeArray = (value) => Array.isArray(value) ? value : [];

export const normalizeStayLocale = (value) => {
  const locale = oneLine(value, 16).toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.has(locale) ? locale : 'pl';
};

export const generateStayToken = () => randomBytes(32).toString('base64url');
export const hashStayToken = (token) => createHash('sha256').update(String(token || ''), 'utf8').digest('hex');

const tokenLooksValid = (token) => /^[A-Za-z0-9_-]{40,120}$/.test(String(token || ''));

const siteOrigin = () =>
  String(process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.clepardia.com.pl')
    .trim()
    .replace(/\/+$/, '');

export const stayPanelUrl = (token) => `${siteOrigin()}/stay/${encodeURIComponent(token)}`;

const firstName = (value) => oneLine(value, 140).split(/\s+/)[0] || '';

const normalizePeople = (payload = {}) => {
  const people = safeObject(payload.people);
  const guests = safeObject(payload.guests);
  const adults = Math.max(0, Math.floor(Number(people.adults ?? guests.adults ?? payload.adults ?? 0)));
  const children = Math.max(0, Math.floor(Number(people.children ?? guests.children ?? payload.children ?? 0)));
  const toddlers = Math.max(0, Math.floor(Number(people.toddlers ?? guests.toddlers ?? payload.toddlers ?? 0)));
  const total = Math.max(0, Math.floor(Number(payload.totalGuests ?? guests.total ?? adults + children + toddlers)));
  return { adults, children, toddlers, total };
};

const publicService = (service = {}) => ({
  id: oneLine(service.id, 80),
  label: oneLine(service.label || service.id, 120),
  qty: Math.max(1, Math.floor(Number(service.qty || service.quantity || 1))),
  scope: oneLine(service.scope, 40),
});

const publicPanel = (panel, inquiry, localeOverride = '') => {
  const payload = safeObject(inquiry.raw_payload_json);
  const services = safeArray(inquiry.services_json).map(publicService).filter((item) => item.label).slice(0, 30);
  const tours = safeArray(inquiry.trips_interest_json).map((item) => oneLine(item, 120)).filter(Boolean).slice(0, 12);
  const locale = normalizeStayLocale(localeOverride || panel.locale || inquiry.language || payload.locale);
  const serviceText = services.map((item) => `${item.id} ${item.label}`.toLowerCase()).join(' ');
  return {
    locale,
    status: oneLine(inquiry.status || 'new', 40),
    customerFirstName: firstName(inquiry.full_name),
    arrivalDate: oneLine(inquiry.arrival_date, 20),
    departureDate: oneLine(inquiry.departure_date, 20),
    nights: Math.max(0, Math.floor(Number(inquiry.nights || 0))),
    stayType: oneLine(inquiry.stay_type, 140),
    people: normalizePeople(payload),
    country: oneLine(inquiry.country, 120),
    services,
    tours,
    estimatedTotalPln: Number.isFinite(Number(inquiry.estimated_total_pln)) ? Number(inquiry.estimated_total_pln) : null,
    arrivalTime: oneLine(payload.arrivalTime, 120),
    hasElectricity: /electric|prąd|prad|10a/.test(serviceText),
    hasDog: /\bdog\b|\bpies\b|\bhund\b|\bchien\b|\bperro\b|\bcane\b/.test(serviceText),
    isBungalow: /bungalow|domek|domki/.test(`${inquiry.stay_type} ${serviceText}`.toLowerCase()),
    panel: {
      createdAt: panel.created_at,
      openCount: Math.max(0, Number(panel.open_count || 0)),
      lastOpenedAt: panel.last_opened_at || null,
      feedbackSubmitted: Boolean(panel.feedback_at),
    },
  };
};

export const createStayPanelForInquiry = async (inquiryId, locale = 'pl') => {
  const id = oneLine(inquiryId, 100);
  if (!id) throw new InboxApiError('STAY_INQUIRY_ID_MISSING', 'Brak ID zapytania dla My Stay Panel.', { httpStatus: 500 });
  const token = generateStayToken();
  const record = {
    inquiry_id: id,
    stay_token: token,
    token_hash: hashStayToken(token),
    locale: normalizeStayLocale(locale),
    status: 'active',
    updated_at: new Date().toISOString(),
  };
  const { body } = await supabaseRequest(`${TABLE}?on_conflict=inquiry_id&select=*`, {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(record),
  });
  const saved = Array.isArray(body) ? body[0] : body;
  if (!saved?.stay_token) {
    throw new InboxApiError('STAY_PANEL_CREATE_FAILED', 'Nie udało się utworzyć My Stay Panel.', {
      httpStatus: 500,
      details: 'UPSERT returned no stay panel row.',
    });
  }
  return {
    status: saved.status || 'active',
    url: stayPanelUrl(saved.stay_token),
    openCount: Number(saved.open_count || 0),
    lastOpenedAt: saved.last_opened_at || null,
    createdAt: saved.created_at || null,
    feedback: null,
  };
};

export const regenerateStayPanelForInquiry = async (inquiryId) => {
  const id = oneLine(inquiryId, 100);
  const token = generateStayToken();
  const { body } = await supabaseRequest(`${TABLE}?inquiry_id=eq.${encodeURIComponent(id)}&select=*`, {
    method: 'PATCH',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify({
      stay_token: token,
      token_hash: hashStayToken(token),
      status: 'active',
      updated_at: new Date().toISOString(),
    }),
  });
  const saved = Array.isArray(body) ? body[0] : body;
  if (!saved?.stay_token) {
    throw new InboxApiError('STAY_PANEL_NOT_FOUND', 'Nie znaleziono My Stay Panel dla zapytania.', { httpStatus: 404 });
  }
  return {
    status: saved.status || 'active',
    url: stayPanelUrl(saved.stay_token),
    openCount: Number(saved.open_count || 0),
    lastOpenedAt: saved.last_opened_at || null,
    createdAt: saved.created_at || null,
    feedback: saved.feedback_at ? {
      rating: saved.feedback_rating,
      helpful: saved.feedback_helpful,
      text: saved.feedback_text || '',
      at: saved.feedback_at,
    } : null,
  };
};

export const listStayPanelsForInquiries = async (inquiryIds = []) => {
  const ids = [...new Set(inquiryIds.map((item) => oneLine(item, 100)).filter(Boolean))].slice(0, 500);
  if (!ids.length) return new Map();
  const inFilter = encodeURIComponent(`(${ids.join(',')})`);
  const { body } = await supabaseRequest(`${TABLE}?inquiry_id=in.${inFilter}&select=*`, { method: 'GET' });
  const rows = Array.isArray(body) ? body : [];
  return new Map(rows.map((row) => [String(row.inquiry_id), {
    status: row.status || 'active',
    url: row.stay_token ? stayPanelUrl(row.stay_token) : '',
    openCount: Number(row.open_count || 0),
    lastOpenedAt: row.last_opened_at || null,
    createdAt: row.created_at || null,
    feedback: row.feedback_at ? {
      rating: row.feedback_rating,
      helpful: row.feedback_helpful,
      text: row.feedback_text || '',
      at: row.feedback_at,
    } : null,
  }]));
};

export const getStayPanelByToken = async (token, localeOverride = '') => {
  const cleanToken = String(token || '').trim();
  if (!tokenLooksValid(cleanToken)) return null;
  const tokenHash = hashStayToken(cleanToken);
  const { body: panelBody } = await supabaseRequest(`${TABLE}?token_hash=eq.${tokenHash}&status=eq.active&select=*&limit=1`, { method: 'GET' });
  const panel = Array.isArray(panelBody) ? panelBody[0] : panelBody;
  if (!panel?.inquiry_id) return null;

  const { body: inquiryBody } = await supabaseRequest(
    `${INQUIRIES_TABLE}?id=eq.${encodeURIComponent(panel.inquiry_id)}&select=status,full_name,country,language,stay_type,arrival_date,departure_date,nights,services_json,trips_interest_json,estimated_total_pln,raw_payload_json&limit=1`,
    { method: 'GET' },
  );
  const inquiry = Array.isArray(inquiryBody) ? inquiryBody[0] : inquiryBody;
  if (!inquiry) return null;
  return { panel, inquiry, publicData: publicPanel(panel, inquiry, localeOverride), tokenHash };
};

export const recordStayPanelOpen = async (panel) => {
  const nextCount = Math.max(0, Number(panel?.open_count || 0)) + 1;
  const now = new Date().toISOString();
  await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(panel.id)}`, {
    method: 'PATCH',
    headers: { prefer: 'return=minimal' },
    body: JSON.stringify({ open_count: nextCount, last_opened_at: now, updated_at: now }),
  });
  return { openCount: nextCount, lastOpenedAt: now };
};

export const saveStayPanelFeedback = async (panel, value = {}) => {
  const rating = Number(value.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new InboxApiError('STAY_FEEDBACK_INVALID', 'Wybierz ocenę od 1 do 5.', { httpStatus: 400 });
  }
  const now = new Date().toISOString();
  const feedback = {
    feedback_rating: rating,
    feedback_helpful: typeof value.helpful === 'boolean' ? value.helpful : null,
    feedback_text: longText(value.improve, 700) || null,
    feedback_at: now,
    updated_at: now,
  };
  await supabaseRequest(`${TABLE}?id=eq.${encodeURIComponent(panel.id)}`, {
    method: 'PATCH',
    headers: { prefer: 'return=minimal' },
    body: JSON.stringify(feedback),
  });
  return { rating, helpful: feedback.feedback_helpful, text: feedback.feedback_text || '', at: now };
};
