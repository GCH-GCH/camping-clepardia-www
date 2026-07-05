import {
  InboxApiError,
  supabaseRequest,
} from './inbox.js';

const CAMP_STAYS_TABLE = 'camp_stays';
const CLIENTS_MIGRATION_MESSAGE = 'Moduł Klienci wymaga uruchomienia migracji CAMP w Supabase.';

const oneLine = (value, max = 300) =>
  String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const safeArray = (value) => Array.isArray(value) ? value : [];
const safeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const normalizeText = (value) =>
  oneLine(value, 1000)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const dateStamp = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addDaysStamp = (stamp, days) => {
  const date = new Date(`${stamp || dateStamp()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateStamp();
  date.setDate(date.getDate() + Number(days || 0));
  return dateStamp(date);
};

const numberValue = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const rawPayload = (stay = {}) => safeObject(stay.raw_payload_json) ? stay.raw_payload_json : {};
const paymentPayload = (stay = {}) => safeObject(stay.payment_json) ? stay.payment_json : safeObject(rawPayload(stay).payment) ? rawPayload(stay).payment : {};
const servicesPayload = (stay = {}) => {
  const raw = rawPayload(stay);
  return safeArray(stay.services_json).length ? stay.services_json : safeArray(raw.services);
};

const cleanPlate = (value) =>
  oneLine(value, 60)
    .toUpperCase()
    .replace(/[^A-Z0-9ÄĄĆĘŁŃÓŚŹŻÄÖÜẞ \-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isTestStay = (stay = {}) => {
  const raw = rawPayload(stay);
  const text = normalizeText([
    stay.client_name,
    stay.email,
    stay.notes,
    stay.case_number,
    raw.clientName,
    raw.email,
    raw.notes,
  ].join(' '));
  return /\b(test|demo|dummy|safe|qa)\b/.test(text);
};

const serviceSummary = (services) =>
  services
    .filter((service) => numberValue(service?.qty, 0) > 0)
    .slice(0, 5)
    .map((service) => `${oneLine(service?.label || service?.id || 'Usługa', 120)} × ${numberValue(service?.qty, 0)}`)
    .join(', ');

const servicesText = (services) =>
  services
    .map((service) => [
      service?.id,
      service?.scope,
      service?.label,
      service?.qty,
      service?.price,
    ].filter(Boolean).join(' '))
    .join(' ');

const computedStayStatus = (stay = {}, today = dateStamp()) => {
  const arrival = oneLine(stay.arrival_date || rawPayload(stay).arrivalDate, 20);
  const departure = oneLine(stay.departure_date || rawPayload(stay).departureDate, 20);
  if (arrival === today) return { key: 'arrival_today', label: 'przyjazd dziś' };
  if (departure === today) return { key: 'departure_today', label: 'wyjazd dziś' };
  if (arrival && arrival > today) return { key: 'future', label: 'przyszły' };
  if (arrival && departure && arrival <= today && departure >= today) return { key: 'active', label: 'aktywny' };
  if (departure && departure < today) return { key: 'finished', label: 'wyjechał' };
  return { key: 'unknown', label: 'do sprawdzenia' };
};

const clientKeyForStay = (stay = {}) => {
  const raw = rawPayload(stay);
  const email = oneLine(stay.email || raw.email, 160).toLowerCase();
  const phone = oneLine(stay.phone || raw.phone, 80).replace(/\s+/g, '');
  const vehiclePlate = cleanPlate(stay.vehicle_plate || raw.vehiclePlate);
  const trailerPlate = cleanPlate(stay.trailer_plate || raw.trailerPlate);
  const name = normalizeText(stay.client_name || raw.clientName);
  const country = normalizeText(stay.country_code || raw.countryCode || stay.country || raw.country);
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  if (vehiclePlate) return `plate:${vehiclePlate}`;
  if (trailerPlate) return `trailer:${trailerPlate}`;
  if (name || country) return `name:${name}:${country}`;
  return `stay:${stay.id || stay.case_number || Math.random().toString(36).slice(2)}`;
};

const normalizeStay = (stay = {}) => {
  const raw = rawPayload(stay);
  const payment = paymentPayload(stay);
  const services = servicesPayload(stay);
  const total = numberValue(stay.total_pln ?? raw.totalPln, 0);
  const paid = numberValue(stay.paid_pln ?? raw.paidPln ?? payment.paidPln, 0);
  const remaining = numberValue(stay.remaining_pln ?? raw.remainingPln ?? payment.remainingPln, Math.max(0, total - paid));
  const status = computedStayStatus(stay);
  const clientName = oneLine(stay.client_name || raw.clientName || 'Bez imienia', 160);
  const countryCode = oneLine(stay.country_code || raw.countryCode, 8).toUpperCase();
  const vehiclePlate = cleanPlate(stay.vehicle_plate || raw.vehiclePlate);
  const trailerPlate = cleanPlate(stay.trailer_plate || raw.trailerPlate);
  const isBajt = Boolean(stay.is_bajt || raw.isBajt);
  const serviceText = servicesText(services);
  const searchText = normalizeText([
    stay.id,
    stay.case_number,
    raw.caseNumber,
    clientName,
    stay.country,
    countryCode,
    stay.language || raw.language,
    stay.email || raw.email,
    stay.phone || raw.phone,
    vehiclePlate,
    trailerPlate,
    stay.vehicle_type || raw.vehicleType,
    stay.arrival_date || raw.arrivalDate,
    stay.departure_date || raw.departureDate,
    stay.status,
    status.key,
    isBajt ? 'BAJT' : '',
    stay.notes || raw.notes,
    stay.vehicle_notes || raw.vehicleNotes,
    stay.stay_type || raw.stayType,
    serviceText,
  ].join(' '));
  return {
    id: oneLine(stay.id || '', 80),
    caseNumber: oneLine(stay.case_number || raw.caseNumber, 80),
    clientKey: clientKeyForStay(stay),
    clientName,
    country: oneLine(stay.country || raw.country, 120),
    countryCode,
    language: oneLine(stay.language || raw.language, 20).toUpperCase(),
    email: oneLine(stay.email || raw.email, 160).toLowerCase(),
    phone: oneLine(stay.phone || raw.phone, 80),
    documentNumber: oneLine(stay.document_number || raw.documentNumber, 120),
    arrivalDate: oneLine(stay.arrival_date || raw.arrivalDate, 20),
    departureDate: oneLine(stay.departure_date || raw.departureDate, 20),
    nights: numberValue(stay.nights ?? raw.nights, 0),
    arrivalTime: oneLine(stay.arrival_time || raw.arrivalTime, 40),
    stayType: oneLine(stay.stay_type || raw.stayType, 80),
    adults: numberValue(stay.adults ?? raw.adults, 0),
    children414: numberValue(stay.children_4_14 ?? raw.children414, 0),
    children04: numberValue(stay.children_0_4 ?? raw.children04, 0),
    totalGuests: numberValue(stay.total_guests ?? raw.totalGuests, 0),
    vehicleType: oneLine(stay.vehicle_type || raw.vehicleType, 80),
    vehiclePlate,
    trailerPlate,
    vehicleNotes: oneLine(stay.vehicle_notes || raw.vehicleNotes, 500),
    services,
    serviceSummary: serviceSummary(services) || 'Brak usług',
    paymentMethod: oneLine(payment.method || raw.paymentMethod, 80),
    totalPln: total,
    paidPln: paid,
    remainingPln: Math.max(0, remaining),
    paymentStatus: remaining <= 0 && total > 0 ? 'opłacone' : paid > 0 ? 'częściowo' : 'do sprawdzenia',
    isBajt,
    gusExcluded: Boolean(stay.gus_excluded || raw.gusExcluded || isBajt),
    notes: oneLine(stay.notes || raw.notes, 1000),
    rawStatus: oneLine(stay.status, 60),
    computedStatus: status.key,
    computedStatusLabel: status.label,
    isTest: isTestStay(stay),
    createdAt: oneLine(stay.created_at || raw.createdAt, 40),
    updatedAt: oneLine(stay.updated_at || raw.updatedAt, 40),
    searchText,
  };
};

const aggregateClients = (normalizedStays = []) => {
  const map = new Map();
  normalizedStays.forEach((stay) => {
    const current = map.get(stay.clientKey) || {
      clientKey: stay.clientKey,
      clientName: stay.clientName,
      country: stay.country,
      countryCode: stay.countryCode,
      language: stay.language,
      email: stay.email,
      phone: stay.phone,
      primaryVehiclePlate: stay.vehiclePlate,
      stays: [],
      searchText: '',
    };
    current.stays.push(stay);
    current.clientName = current.clientName || stay.clientName;
    current.country = current.country || stay.country;
    current.countryCode = current.countryCode || stay.countryCode;
    current.language = current.language || stay.language;
    current.email = current.email || stay.email;
    current.phone = current.phone || stay.phone;
    current.primaryVehiclePlate = current.primaryVehiclePlate || stay.vehiclePlate;
    map.set(stay.clientKey, current);
  });
  return [...map.values()].map((client) => {
    const sorted = client.stays.sort((a, b) => String(b.arrivalDate || b.createdAt).localeCompare(String(a.arrivalDate || a.createdAt)));
    const latest = sorted[0] || {};
    const active = sorted.some((stay) => ['active', 'arrival_today', 'departure_today'].includes(stay.computedStatus));
    const returning = sorted.length > 1;
    const countries = [...new Set(sorted.map((stay) => stay.countryCode || stay.country).filter(Boolean))];
    const languages = [...new Set(sorted.map((stay) => stay.language).filter(Boolean))];
    const searchText = normalizeText([
      client.clientName,
      client.country,
      client.countryCode,
      client.language,
      client.email,
      client.phone,
      client.primaryVehiclePlate,
      returning ? 'powracajacy returning' : '',
      sorted.map((stay) => stay.searchText).join(' '),
    ].join(' '));
    return {
      ...client,
      stays: sorted,
      latestStay: latest,
      staysCount: sorted.length,
      returning,
      hasBajt: sorted.some((stay) => stay.isBajt),
      hasPaymentToCheck: sorted.some((stay) => stay.remainingPln > 0 || stay.paymentStatus === 'do sprawdzenia'),
      active,
      countries,
      languages,
      firstStayAt: sorted[sorted.length - 1]?.arrivalDate || sorted[sorted.length - 1]?.createdAt || '',
      lastStayAt: latest.arrivalDate || latest.createdAt || '',
      searchText,
      isTest: sorted.some((stay) => stay.isTest),
    };
  }).sort((a, b) => String(b.lastStayAt).localeCompare(String(a.lastStayAt)));
};

const matchesFilter = (client, filter, today = dateStamp()) => {
  const stays = client.stays || [];
  if (!filter || filter === 'all') return !client.isTest;
  if (filter === 'everything') return true;
  if (filter === 'active') return stays.some((stay) => stay.computedStatus === 'active');
  if (filter === 'arrival_today') return stays.some((stay) => stay.arrivalDate === today);
  if (filter === 'departure_today') return stays.some((stay) => stay.departureDate === today);
  if (filter === 'next7') return stays.some((stay) => stay.arrivalDate >= today && stay.arrivalDate <= addDaysStamp(today, 7));
  if (filter === 'bajt') return client.hasBajt;
  if (filter === 'payment') return client.hasPaymentToCheck;
  if (filter === 'returning') return client.returning;
  if (filter === 'tests') return client.isTest;
  if (filter === 'archived') return stays.every((stay) => stay.computedStatus === 'finished');
  if (filter === 'countries') return Boolean(client.country || client.countryCode);
  if (filter === 'languages') return Boolean(client.language || client.languages?.length);
  const text = normalizeText(stays.map((stay) => [
    stay.stayType,
    stay.vehicleType,
    stay.serviceSummary,
    servicesText(stay.services),
  ].join(' ')).join(' '));
  if (filter === 'camping') return /camping|camper|kamper|caravan|przyczep|tent|namiot|van/.test(text);
  if (filter === 'bungalow') return /bungalow|domek/.test(text);
  if (filter === 'camper') return /camper|kamper/.test(text);
  if (filter === 'caravan') return /caravan|przyczep/.test(text);
  if (filter === 'tent') return /tent|namiot/.test(text);
  if (filter === 'electricity') return /electric|prad|10a/.test(text);
  if (filter === 'dog') return /dog|pies|hund|chien|perro/.test(text);
  return true;
};

export const clientsMigrationMessage = CLIENTS_MIGRATION_MESSAGE;

export const isCampStaysMigrationError = (payload = {}) => {
  const text = `${payload.error || ''} ${payload.details || ''}`.toLowerCase();
  return payload.code === 'SUPABASE_QUERY_FAILED'
    && (/camp_stays/.test(text) || /relation .*does not exist/.test(text) || /schema cache/.test(text));
};

export const listClientCampStays = async ({ limit = 1000 } = {}) => {
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1000)));
  const { body } = await supabaseRequest(`${CAMP_STAYS_TABLE}?select=*&order=created_at.desc&limit=${safeLimit}`, { method: 'GET' });
  return Array.isArray(body) ? body : [];
};

export const getClientsOnline = async ({ search = '', filter = 'all', limit = 1000 } = {}) => {
  const rawStays = await listClientCampStays({ limit });
  const normalizedStays = rawStays.map(normalizeStay);
  const clients = aggregateClients(normalizedStays);
  const query = normalizeText(search);
  const filtered = clients.filter((client) =>
    (!query || client.searchText.includes(query))
    && matchesFilter(client, filter)
  );
  const today = dateStamp();
  const countries = new Set(filtered.map((client) => client.countryCode || client.country).filter(Boolean));
  const languages = new Set(filtered.flatMap((client) => client.languages || []).filter(Boolean));
  return {
    clients: filtered,
    allClientsCount: clients.length,
    stays: normalizedStays,
    stats: {
      clients: filtered.length,
      stays: filtered.reduce((sum, client) => sum + client.stays.length, 0),
      active: filtered.filter((client) => client.stays.some((stay) => stay.computedStatus === 'active')).length,
      arrivalsToday: filtered.filter((client) => client.stays.some((stay) => stay.arrivalDate === today)).length,
      departuresToday: filtered.filter((client) => client.stays.some((stay) => stay.departureDate === today)).length,
      bajt: filtered.filter((client) => client.hasBajt).length,
      countries: countries.size,
      languages: languages.size,
      paymentToCheck: filtered.filter((client) => client.hasPaymentToCheck).length,
      returning: filtered.filter((client) => client.returning).length,
    },
  };
};

export const getClientOnlineDetail = async ({ clientKey = '', stayId = '', limit = 1000 } = {}) => {
  const data = await getClientsOnline({ filter: 'everything', limit });
  const client = data.clients.find((entry) => {
    if (clientKey && entry.clientKey === clientKey) return true;
    if (stayId && entry.stays.some((stay) => String(stay.id || stay.caseNumber) === String(stayId))) return true;
    return false;
  });
  if (!client) {
    throw new InboxApiError('CLIENT_NOT_FOUND', 'Nie znaleziono klienta/pobytu w camp_stays.', {
      httpStatus: 404,
      details: clientKey || stayId || 'empty',
    });
  }
  return client;
};

export const buildClientNoteFallback = (payload = {}) => ({
  ok: true,
  saved: false,
  code: 'CLIENT_NOTES_TABLE_TODO',
  reason: 'Notatki Klienci Online są przygotowane w UI, ale osobna tabela client_notes jest jeszcze TODO.',
  clientKey: oneLine(payload.clientKey, 180),
});
