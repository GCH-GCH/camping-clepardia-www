import assert from 'node:assert/strict';

process.env.SUPABASE_URL = 'https://task150.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-value-with-safe-placeholder-150';
process.env.CC_INBOX_ACCESS_CODE = 'task150-access';
process.env.RESEND_API_KEY = 'resend-test-value-with-safe-placeholder-150';
process.env.RESERVATION_FROM_EMAIL = 'Camping Clepardia <formularz@example.invalid>';
process.env.RESERVATION_TO_EMAIL = 'recepcja@example.invalid';
process.env.PUBLIC_SITE_URL = 'https://www.clepardia.com.pl';
delete process.env.WEB3FORMS_ACCESS_KEY;
delete process.env.SEND_CUSTOMER_CONFIRMATION;

const { supabaseRequest } = await import('../api/_lib/inbox.js');
const { default: reservationHandler } = await import('../api/reservation.js');
const { default: systemHealthHandler } = await import('../api/_handlers/system/health.js');

const originalFetch = globalThis.fetch;
const originalError = console.error;
const originalInfo = console.info;
const state = {
  storage: 'success',
  mail: 'success',
  supabaseHeaders: null,
};

const jsonResponse = (body, status = 200) => new Response(
  status === 204 ? null : JSON.stringify(body),
  { status, headers: status === 204 ? {} : { 'content-type': 'application/json' } },
);

globalThis.fetch = async (input, options = {}) => {
  const url = String(input);
  const method = String(options.method || 'GET').toUpperCase();

  if (url.startsWith('https://task150.supabase.co/rest/v1/')) {
    state.supabaseHeaders = options.headers || null;
    if (url.includes('/reservation_inquiries?select=id,created_at') && method === 'POST') {
      if (state.storage === 'failure') {
        return jsonResponse({
          code: 'PGRST_TEST',
          message: 'diagnostic database failure that must stay private',
          details: 'private schema diagnostic',
        }, 503);
      }
      return jsonResponse([{ id: '00000000-0000-4000-8000-000000000150', created_at: new Date().toISOString() }], 201);
    }
    if (url.includes('/stay_panels?') && method === 'POST') {
      return jsonResponse([{
        id: 'stay-150',
        stay_token: 'A'.repeat(48),
        status: 'active',
        created_at: new Date().toISOString(),
      }], 201);
    }
    if (url.includes('/reservation_inquiries?') && method === 'PATCH') return jsonResponse(null, 204);
    return jsonResponse([], 200);
  }

  if (url === 'https://api.resend.com/emails') {
    return state.mail === 'success'
      ? jsonResponse({ id: 'resend-test-150' }, 200)
      : jsonResponse({ name: 'application_error', message: 'diagnostic mail failure that must stay private' }, 503);
  }

  if (url.startsWith('https://formsubmit.co/')) {
    return jsonResponse({ success: false, message: 'activation required' }, 403);
  }

  throw new Error(`Nieoczekiwany request w test:supabase: ${url}`);
};

const responseMock = () => ({
  statusCode: 200,
  headers: {},
  payload: null,
  status(value) { this.statusCode = value; return this; },
  setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; return this; },
  json(value) { this.payload = value; return this; },
});

const requestMock = ({ method = 'GET', body = undefined, authorized = false } = {}) => ({
  method,
  body,
  headers: authorized ? { 'x-cc-inbox-code': process.env.CC_INBOX_ACCESS_CODE } : {},
  query: {},
});

const reservationPayload = {
  fullName: 'Jan Kowalski',
  email: 'jan@example.invalid',
  phone: '',
  country: 'Polska (PL)',
  contactLanguage: 'PL',
  arrivalIso: '2026-09-10',
  departureIso: '2026-09-12',
  stayType: 'Camping',
  stayTypeId: 'camping',
  stayCategory: 'camping',
  selectedStayMode: 'camping',
  people: { adults: 2, children: 0, toddlers: 0 },
  services: [
    { id: 'adults', scope: 'person', label: 'Osoba dorosła', qty: 2, price: 35 },
    { id: 'camper', scope: 'camping', label: 'Kamper', qty: 1, price: 80 },
    { id: 'electricity', scope: 'camping', label: 'Prąd 10A', qty: 1, price: 30 },
  ],
  quietConsent: true,
  consent: true,
  privacyConsent: true,
  website: '',
  message: 'Test kontraktu bez wysyłki do zewnętrznych usług.',
};

const callReservation = async ({ storage, mail, authorized = false }) => {
  state.storage = storage;
  state.mail = mail;
  const res = responseMock();
  await reservationHandler(requestMock({ method: 'POST', body: reservationPayload, authorized }), res);
  return res;
};

try {
  console.error = () => {};
  console.info = () => {};

  await supabaseRequest('reservation_inquiries?select=id&limit=0', { method: 'GET' });
  assert.equal(state.supabaseHeaders.apikey, process.env.SUPABASE_SERVICE_ROLE_KEY);
  assert.equal(state.supabaseHeaders.authorization, `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  assert.equal(state.supabaseHeaders['content-type'], 'application/json');

  const unauthorizedHealth = responseMock();
  await systemHealthHandler(requestMock(), unauthorizedHealth);
  assert.equal(unauthorizedHealth.statusCode, 401);
  assert.deepEqual(unauthorizedHealth.payload, { ok: false, code: 'UNAUTHORIZED' });

  const routedUnauthorizedHealth = responseMock();
  await reservationHandler({ ...requestMock(), query: { ccRoute: 'system-health' } }, routedUnauthorizedHealth);
  assert.equal(routedUnauthorizedHealth.statusCode, 401);
  assert.deepEqual(routedUnauthorizedHealth.payload, { ok: false, code: 'UNAUTHORIZED' });

  const routedUnauthorizedCamp = responseMock();
  await reservationHandler({ ...requestMock(), query: { ccRoute: 'camp-stays' } }, routedUnauthorizedCamp);
  assert.equal(routedUnauthorizedCamp.statusCode, 401);

  const authorizedHealth = responseMock();
  await systemHealthHandler(requestMock({ authorized: true }), authorizedHealth);
  assert.equal(authorizedHealth.statusCode, 200);
  assert.equal(authorizedHealth.payload.ok, true);
  assert.equal(authorizedHealth.payload.supabase.connected, true);
  assert.equal(authorizedHealth.payload.tables.reservation_inquiries.ok, true);
  assert.equal(authorizedHealth.payload.tables.mail_thread_events.ok, true);
  assert.equal(authorizedHealth.payload.resend.configured, true);
  assert.equal('serviceRoleKey' in authorizedHealth.payload.env, false);

  const storageFailMailOk = await callReservation({ storage: 'failure', mail: 'success' });
  assert.equal(storageFailMailOk.statusCode, 200);
  assert.equal(storageFailMailOk.payload.ok, true);
  assert.equal(storageFailMailOk.payload.accepted, true);
  assert.equal('inquirySaved' in storageFailMailOk.payload, false);
  assert.equal('provider' in storageFailMailOk.payload, false);
  assert.doesNotMatch(JSON.stringify(storageFailMailOk.payload), /supabase|database|schema|pgrst/i);

  const storageFailMailOkAdmin = await callReservation({ storage: 'failure', mail: 'success', authorized: true });
  assert.equal(storageFailMailOkAdmin.payload.inquirySaved, false);
  assert.equal(storageFailMailOkAdmin.payload.mailDelivered, true);
  assert.equal(storageFailMailOkAdmin.payload.deliveryState, 'storage_failed / mail_delivered');

  const storageOkMailFail = await callReservation({ storage: 'success', mail: 'failure' });
  assert.equal(storageOkMailFail.statusCode, 200);
  assert.equal(storageOkMailFail.payload.ok, true);
  assert.equal(storageOkMailFail.payload.accepted, true);
  assert.ok(storageOkMailFail.payload.inquiryId);
  assert.equal('mailProvider' in storageOkMailFail.payload, false);

  const bothFail = await callReservation({ storage: 'failure', mail: 'failure' });
  assert.equal(bothFail.statusCode, 503);
  assert.equal(bothFail.payload.ok, false);
  assert.equal(bothFail.payload.accepted, false);
  assert.equal(bothFail.payload.retry, true);
  assert.equal(bothFail.payload.contact.phone, '+48 795 294 486');
  assert.equal(bothFail.payload.contact.email, 'clepardia@gmail.com');
  assert.doesNotMatch(JSON.stringify(bothFail.payload), /supabase|database|schema|pgrst|provider/i);

  originalInfo('test:supabase OK — nagłówki service-role, health auth i 3 scenariusze fallbacku');
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  console.info = originalInfo;
}
