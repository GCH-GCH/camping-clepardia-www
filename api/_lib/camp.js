import {
  InboxApiError,
  supabaseRequest,
} from './inbox.js';

const CAMP_STAYS_TABLE = 'camp_stays';
const SITE_EVENTS_TABLE = 'site_events';

const oneLine = (value, max = 300) =>
  String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 5000) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

const numberValue = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const integerValue = (value, fallback = 0) =>
  Math.max(0, Math.floor(numberValue(value, fallback)));

const boolValue = (value) => value === true || value === 'true' || value === 1 || value === '1';

const dateValue = (value) => {
  const text = oneLine(value, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
};

const jsonClone = (value, fallback) => {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback));
  } catch {
    return fallback;
  }
};

const cleanPlate = (value) =>
  oneLine(value, 40)
    .toUpperCase()
    .replace(/[^A-Z0-9ĄĆĘŁŃÓŚŹŻÄÖÜẞ \-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const safeArray = (value) => Array.isArray(value) ? value : [];
const safeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const makeCaseNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const stamp = String(Date.now()).slice(-6);
  return `CC-${year}-${stamp}`;
};

const validateCampStay = (payload = {}) => {
  const errors = [];
  const clientName = oneLine(payload.clientName || payload.client_name, 160);
  const country = oneLine(payload.country, 120);
  const arrival = dateValue(payload.arrivalDate || payload.arrival_date);
  const departure = dateValue(payload.departureDate || payload.departure_date);
  const nights = integerValue(payload.nights, 0);
  const adults = integerValue(payload.adults, 0);
  const children = integerValue(payload.children414 ?? payload.children_4_14, 0);
  const toddlers = integerValue(payload.children04 ?? payload.children_0_4, 0);
  const services = safeArray(payload.services);
  const hasLodgingService = services.some((service) => {
    const text = oneLine([service?.id, service?.scope, service?.label].filter(Boolean).join(' '), 240).toLowerCase();
    return /bungalow|domek|camper|kamper|van|caravan|przyczep|tent|namiot|bus|parking|samoch/.test(text)
      && integerValue(service?.qty, 0) > 0;
  });

  if (!clientName) errors.push('CLIENT_NAME_REQUIRED');
  if (!country) errors.push('COUNTRY_REQUIRED');
  if (!arrival || !departure) errors.push('DATES_REQUIRED');
  if (nights <= 0) errors.push('NIGHTS_REQUIRED');
  if ((adults + children + toddlers) <= 0 && !hasLodgingService) errors.push('GUEST_OR_SERVICE_REQUIRED');

  return { ok: errors.length === 0, errors };
};

const toCampStayRecord = (payload = {}) => {
  const payment = safeObject(payload.payment);
  const adults = integerValue(payload.adults, 0);
  const children = integerValue(payload.children414 ?? payload.children_4_14, 0);
  const toddlers = integerValue(payload.children04 ?? payload.children_0_4, 0);
  const totalGuests = integerValue(payload.totalGuests ?? payload.total_guests, adults + children + toddlers);
  const paid = Math.max(0, numberValue(payload.paidPln ?? payload.paid_pln ?? payment.paidPln, 0));
  const total = Math.max(0, numberValue(payload.totalPln ?? payload.total_pln, 0));
  const isBajt = boolValue(payload.isBajt ?? payload.is_bajt);
  const services = safeArray(payload.services).map((service) => ({
    id: oneLine(service?.id, 80),
    scope: oneLine(service?.scope, 60),
    label: oneLine(service?.label, 140),
    qty: integerValue(service?.qty, 0),
    price: Math.max(0, numberValue(service?.price, 0)),
    perNight: service?.perNight !== false,
    total: Math.max(0, numberValue(service?.total, 0)),
  })).filter((service) => service.id || service.label);

  return {
    source: 'camp',
    status: oneLine(payload.status, 40) || 'active',
    case_number: oneLine(payload.caseNumber || payload.case_number, 40) || makeCaseNumber(),
    client_name: oneLine(payload.clientName || payload.client_name, 160),
    country: oneLine(payload.country, 120),
    country_code: oneLine(payload.countryCode || payload.country_code, 8).toUpperCase(),
    language: oneLine(payload.language, 12).toUpperCase(),
    phone: oneLine(payload.phone, 80),
    email: oneLine(payload.email, 160).toLowerCase(),
    document_number: oneLine(payload.documentNumber || payload.document_number, 120),
    arrival_date: dateValue(payload.arrivalDate || payload.arrival_date) || null,
    departure_date: dateValue(payload.departureDate || payload.departure_date) || null,
    nights: integerValue(payload.nights, 1),
    arrival_time: oneLine(payload.arrivalTime || payload.arrival_time, 40),
    stay_type: oneLine(payload.stayType || payload.stay_type, 80),
    adults,
    children_4_14: children,
    children_0_4: toddlers,
    total_guests: totalGuests,
    vehicle_type: oneLine(payload.vehicleType || payload.vehicle_type, 80),
    vehicle_plate: cleanPlate(payload.vehiclePlate || payload.vehicle_plate),
    trailer_plate: cleanPlate(payload.trailerPlate || payload.trailer_plate),
    vehicle_notes: longText(payload.vehicleNotes || payload.vehicle_notes, 1000),
    services_json: services,
    payment_json: {
      method: oneLine(payment.method || payload.paymentMethod, 60),
      currency: oneLine(payment.currency || 'PLN', 12),
      paidPln: paid,
      remainingPln: Math.max(0, numberValue(payload.remainingPln ?? payload.remaining_pln, Math.max(0, total - paid))),
      fx: safeObject(payment.fx),
    },
    total_pln: total,
    paid_pln: paid,
    remaining_pln: Math.max(0, numberValue(payload.remainingPln ?? payload.remaining_pln, Math.max(0, total - paid))),
    is_bajt: isBajt,
    gus_excluded: isBajt || boolValue(payload.gusExcluded ?? payload.gus_excluded),
    notes: longText(payload.notes, 2500),
    raw_payload_json: jsonClone(payload, {}),
  };
};

export const listCampStays = async () => {
  const { body } = await supabaseRequest(`${CAMP_STAYS_TABLE}?select=*&order=created_at.desc&limit=80`, { method: 'GET' });
  return Array.isArray(body) ? body : [];
};

export const saveCampStay = async (payload = {}) => {
  const validation = validateCampStay(payload);
  if (!validation.ok) {
    throw new InboxApiError('CAMP_VALIDATION_FAILED', 'Nie można zapisać pobytu — brakuje wymaganych danych.', {
      httpStatus: 400,
      details: validation.errors.join(', '),
    });
  }

  const record = toCampStayRecord(payload);
  const { body } = await supabaseRequest(`${CAMP_STAYS_TABLE}?select=*`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(record),
  });
  const saved = Array.isArray(body) ? body[0] : body;
  if (!saved?.id) {
    throw new InboxApiError('CAMP_SAVE_FAILED', 'Supabase nie zwrócił ID zapisanego pobytu.', {
      httpStatus: 500,
      details: 'INSERT succeeded without returned row.',
    });
  }
  return saved;
};

export const allowedSiteEventTypes = new Set([
  'page_view',
  'language_change',
  'click_cta',
  'open_campy',
  'campy_question',
  'start_booking_form',
  'submit_booking_form',
  'feedback_submit',
  'filter_used',
  'category_click',
]);

export const saveSiteEvent = async (payload = {}) => {
  const eventType = oneLine(payload.eventType || payload.event_type, 80);
  if (!allowedSiteEventTypes.has(eventType)) {
    throw new InboxApiError('ANALYTICS_EVENT_NOT_ALLOWED', 'Nieobsługiwany typ eventu.', {
      httpStatus: 400,
      details: eventType || 'empty',
    });
  }

  const metadata = safeObject(payload.metadata || payload.metadata_json);
  const metadataText = JSON.stringify(metadata).slice(0, 5000);
  const record = {
    event_type: eventType,
    page_path: oneLine(payload.pagePath || payload.page_path, 240),
    locale: oneLine(payload.locale, 16).toLowerCase(),
    country_guess: oneLine(payload.countryGuess || payload.country_guess, 80),
    referrer: oneLine(payload.referrer, 300),
    device_type: oneLine(payload.deviceType || payload.device_type, 40),
    metadata_json: JSON.parse(metadataText || '{}'),
  };

  const { body } = await supabaseRequest(`${SITE_EVENTS_TABLE}?select=id,created_at`, {
    method: 'POST',
    headers: { prefer: 'return=representation' },
    body: JSON.stringify(record),
  });
  return Array.isArray(body) ? body[0] : body;
};
