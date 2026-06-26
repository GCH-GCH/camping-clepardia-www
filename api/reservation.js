import {
  authorizeInboxRequest,
  logInboxError,
  saveReservationInquiry,
  serializeInboxError,
  updateReservationMailStatus,
} from './_lib/inbox.js';

const DAY = 24 * 60 * 60 * 1000;
const MAX_BODY = 32_000;

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.json(payload);
};

const oneLine = (value, max = 600) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const longText = (value, max = 2400) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const configured = (...values) => values.find((value) => String(value || '').trim()) || '';

const envValue = (name) =>
  configured(globalThis.process?.env?.[name], import.meta.env?.[name]);

const mailProvider = () => {
  const provider = String(envValue('MAIL_PROVIDER') || 'auto').trim().toLowerCase();
  return ['auto', 'web3forms', 'resend', 'formsubmit'].includes(provider) ? provider : 'auto';
};

const siteUrl = () =>
  configured(process.env.PUBLIC_SITE_URL, process.env.SITE_URL, 'https://www.clepardia.com.pl').replace(/\/+$/, '');

const inboxUrl = () => `${siteUrl()}/cc-gate-a8f3k9r2p6`;

const reservationUrl = () => `${siteUrl()}/rezerwacja`;

const web3FormsAccessKey = () => String(envValue('WEB3FORMS_ACCESS_KEY') || '').trim();

const reservationToEmail = () =>
  configured(envValue('RESERVATION_TO_EMAIL'), envValue('MAIL_TO'), 'clepardia@gmail.com');

const formSubmitEmail = () =>
  configured(envValue('FORMSUBMIT_TO_EMAIL'), envValue('RESERVATION_TO_EMAIL'), envValue('MAIL_TO'), 'clepardia@gmail.com');

const resendApiKey = () => String(envValue('RESEND_API_KEY') || '').trim();

const reservationFromEmail = () =>
  configured(envValue('RESERVATION_FROM_EMAIL'), envValue('MAIL_FROM'));

const mailEnvSnapshot = () => {
  const apiKey = resendApiKey();
  const from = reservationFromEmail();
  const to = reservationToEmail();
  const fromDomain = String(from).match(/@([^>\s]+)/)?.[1] || '';

  return {
    mailProvider: mailProvider(),
    web3FormsKeyPresent: Boolean(web3FormsAccessKey()),
    resendKeyPresent: Boolean(apiKey),
    resendKeyStartsWithRe: apiKey.startsWith('re_'),
    resendKeyLength: apiKey.length,
    reservationFromPresent: Boolean(reservationFromEmail()),
    reservationToPresent: Boolean(reservationToEmail()),
    formSubmitToPresent: Boolean(formSubmitEmail()),
    fromDomain,
    toPresent: Boolean(to),
  };
};

const logMailEnv = (inquiryId) => {
  try {
    console.info('[reservation-api] mail-env', { inquiryId, ...mailEnvSnapshot() });
  } catch {
    // Logging must never block accepting an enquiry.
  }
};

const collectBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;

    req.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      length += buffer.length;
      if (length > MAX_BODY) {
        reject(new Error('Payload too large.'));
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const readPayload = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const rawBody = typeof req.body === 'string' ? req.body : await collectBody(req);
  const raw = String(rawBody || '').replace(/^\uFEFF/, '').trim();
  return raw ? JSON.parse(raw) : {};
};

const parseDate = (value) => {
  const raw = oneLine(value, 20);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
};

const displayDate = (date) => {
  if (!date) return '';
  return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;
};

const serviceCatalog = {
  camper: { id: 'camper', scope: 'camping', label: 'Kamper', price: 80 },
  van: { id: 'van', scope: 'camping', label: 'Van', price: 75 },
  caravan: { id: 'caravan', scope: 'camping', label: 'Przyczepa', price: 60 },
  'tent-small': { id: 'tent-small', scope: 'camping', label: 'Namiot 1-2 os.', price: 35 },
  'tent-large': { id: 'tent-large', scope: 'camping', label: 'Namiot 3-4 os.', price: 45 },
  'rooftop-tent': { id: 'rooftop-tent', scope: 'camping', label: 'Auto + namiot dachowy', price: 50 },
  electricity: { id: 'electricity', scope: 'camping', label: 'Prąd 10A', price: 30 },
  dog: { id: 'dog', scope: 'camping', label: 'Pies', price: 0 },
  motorcycle: { id: 'motorcycle', scope: 'camping', label: 'Motocykl', price: 25 },
  'cargo-trailer': { id: 'cargo-trailer', scope: 'camping', label: 'Przyczepa bagażowa', price: 25 },
  bus: { id: 'bus', scope: 'camping', label: 'Bus / ciężarówka', price: 160 },
  parking: { id: 'parking', scope: 'camping', label: 'Samochód', price: 35 },
  'extra-car': { id: 'extra-car', scope: 'camping', label: 'Dodatkowe auto', price: 35 },
  'bungalow-2': { id: 'bungalow-2', scope: 'bungalow', label: 'Domek 2-os.', price: 200 },
  'bungalow-3': { id: 'bungalow-3', scope: 'bungalow', label: 'Domek 3-os.', price: 250 },
  'bungalow-4': { id: 'bungalow-4', scope: 'bungalow', label: 'Domek 4-os.', price: 400 },
  adults: { id: 'adults', scope: 'people', label: 'Osoba dorosła', price: 35 },
  children: { id: 'children', scope: 'people', label: 'Dziecko 4-14', price: 20 },
  toddlers: { id: 'toddlers', scope: 'people', label: 'Dziecko do 4', price: 0 },
};

const normalizeServiceText = (value) =>
  oneLine(value, 200)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[×x]\s*\d+/g, ' ')
    .replace(/\d+\s*(pln|zl|zł)(\s*\/\s*noc)?/g, ' ')
    .replace(/legacy|pobyt|usluga|uslugi/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const canonicalServiceId = (service = {}) => {
  const id = normalizeServiceText(service.id);
  const label = normalizeServiceText(service.label);
  const scope = normalizeServiceText(service.scope);
  const text = `${scope} ${id} ${label}`;

  if (/electric|prad|power|10a/.test(text)) return 'electricity';
  if (/cargo.*trailer|bagazow|przyczepa bagaz/.test(text)) return 'cargo-trailer';
  if (/rooftop|dachow/.test(text)) return 'rooftop-tent';
  if (/tent.*small|small.*tent|namiot.*1.*2|1.*2.*namiot/.test(text)) return 'tent-small';
  if (/tent.*large|large.*tent|namiot.*3.*4|3.*4.*namiot/.test(text)) return 'tent-large';
  if (/bungalow.*2|domek.*2|2.*os/.test(text)) return 'bungalow-2';
  if (/bungalow.*3|domek.*3|3.*os/.test(text)) return 'bungalow-3';
  if (/bungalow.*4|domek.*4|4.*os/.test(text)) return 'bungalow-4';
  if (/camper|kamper/.test(text)) return 'camper';
  if (/\bvan\b/.test(text)) return 'van';
  if (/caravan|przyczep|wohnwagen|roulotte/.test(text)) return 'caravan';
  if (/dog|pies|hund|chien|perro|pes/.test(text)) return 'dog';
  if (/motorcycle|motocykl/.test(text)) return 'motorcycle';
  if (/\bbus\b|ciezar|truck|lkw/.test(text)) return 'bus';
  if (/extra.*car|dodatk.*auto/.test(text)) return 'extra-car';
  if (/parking|samochod|auto|car\b/.test(text)) return 'parking';
  if (/adult|dorosl|erwachsene|adulti/.test(text)) return 'adults';
  if (/child|dziec|kinder|bambin/.test(text) && !/toddl|do 4|under 4/.test(text)) return 'children';
  if (/toddl|do 4|under 4|infant/.test(text)) return 'toddlers';

  return id || label;
};

const serviceQuantity = (service = {}) => {
  const explicit = Math.floor(Number(service.qty || service.quantity || 0));
  if (explicit > 0) return explicit;
  const match = `${service.label || ''} ${service.id || ''}`.match(/[×x]\s*(\d+)/i);
  return match ? Math.max(1, Math.floor(Number(match[1]))) : 1;
};

const normalizeServices = (payload) => {
  const services = Array.isArray(payload.services) ? payload.services : [];
  const addons = Array.isArray(payload.addons) ? payload.addons : [];
  const normalized = new Map();

  const addService = (service, source = 'services') => {
    const canonicalId = canonicalServiceId(service);
    const catalog = serviceCatalog[canonicalId];
    const qty = serviceQuantity(service);
    if (!canonicalId || qty <= 0) return;

    const entry = {
      id: catalog?.id || oneLine(service?.id || canonicalId, 80),
      scope: catalog?.scope || oneLine(service?.scope || (source === 'legacy' ? 'legacy' : 'pobyt'), 40),
      label: catalog?.label || oneLine(service?.label || service?.id || canonicalId, 120),
      qty,
      price: Math.max(0, Number(service?.price ?? catalog?.price ?? 0)),
      source,
    };
    const key = `${entry.scope}:${canonicalId}`;
    const existing = normalized.get(key);
    if (!existing || (existing.source === 'legacy' && source !== 'legacy')) {
      normalized.set(key, entry);
      return;
    }
    if (existing.source === source) {
      normalized.set(key, { ...existing, qty: Math.max(existing.qty, entry.qty), price: Math.max(existing.price, entry.price) });
    }
  };

  services.forEach((service) => addService(service, 'services'));
  addons
    .filter(Boolean)
    .slice(0, 12)
    .forEach((addon, index) => addService({ id: `legacy-${index + 1}`, scope: 'legacy', label: oneLine(addon, 120), qty: serviceQuantity({ label: addon }) }, 'legacy'));

  return [...normalized.values()]
    .map(({ source, ...service }) => service)
    .slice(0, 40);
};

const validate = (payload) => {
  const errors = {};
  const arrival = parseDate(payload.arrivalIso || payload.arrival);
  const departure = parseDate(payload.departureIso || payload.departure);
  const services = normalizeServices(payload);
  const email = oneLine(payload.email, 254).toLowerCase();
  const phone = oneLine(payload.phone, 80);

  if (!oneLine(payload.fullName, 140)) errors.fullName = 'Podaj imie i nazwisko.';
  if (!email && !phone) errors.contact = 'Podaj adres email albo telefon.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Podaj poprawny adres email.';
  if (!oneLine(payload.country, 120)) errors.country = 'Wybierz kraj.';
  if (!arrival) errors.arrival = 'Podaj date przyjazdu.';
  if (!departure) errors.departure = 'Podaj date wyjazdu.';
  if (arrival && departure && departure <= arrival) errors.departure = 'Data wyjazdu musi byc po dacie przyjazdu.';
  if (!oneLine(payload.stayType || payload.selectedStayMode, 140)) errors.stayType = 'Wybierz typ pobytu.';
  if (!services.length) errors.services = 'Wybierz przynajmniej jedna opcje pobytu lub usluge.';
  if (!payload.quietConsent) errors.quietConsent = 'Potwierdz zasady ciszy nocnej.';
  if (!payload.consent) errors.consent = 'Zaakceptuj kontakt zwrotny.';
  if (!payload.privacyConsent) errors.privacyConsent = 'Zaakceptuj zgode na przetwarzanie danych.';

  return { errors, arrival, departure, services, email, phone };
};

const normalizeFeedback = (value) => {
  if (!value || typeof value !== 'object') return null;
  const rating = Math.min(5, Math.max(0, Math.floor(Number(value.rating || 0))));
  const liked = (Array.isArray(value.liked) ? value.liked : [])
    .map((item) => oneLine(item, 100))
    .filter(Boolean)
    .slice(0, 12);
  const improve = longText(value.improve, 1200);
  const easyInfo = oneLine(value.easyInfo, 100);
  const easyForm = oneLine(value.easyForm, 100);
  if (!rating && !liked.length && !improve && !easyInfo && !easyForm) return null;
  return { rating, liked, improve, easyInfo, easyForm };
};

const normalizeVehicleDetails = (payload = {}) => {
  const source = payload.vehicleDetails && typeof payload.vehicleDetails === 'object'
    ? payload.vehicleDetails
    : payload.vehicle && typeof payload.vehicle === 'object'
      ? payload.vehicle
      : {};
  const vehicle = {
    type: oneLine(payload.vehicleType || source.type || source.kind || source.category, 120),
    model: oneLine(source.model || source.name, 120),
    length: oneLine(source.length, 40),
    width: oneLine(source.width, 40),
    height: oneLine(source.height, 40),
    weight: oneLine(source.weight, 40),
    large: Boolean(source.large || source.heavy || payload.heavyVehicle),
    asphaltNeeded: Boolean(source.asphaltNeeded || source.asphalt || payload.asphaltNeeded),
    trailerPlate: oneLine(payload.trailerPlate || source.trailerPlate || source.trailerRegistration, 80),
    notes: longText(source.notes || source.comment, 500),
    summary: oneLine(source.summary || payload.vehicleSummary, 240),
  };
  if (!vehicle.summary) {
    vehicle.summary = [
      vehicle.type,
      vehicle.model,
      vehicle.length ? `dł. ${vehicle.length}` : '',
      vehicle.width ? `szer. ${vehicle.width}` : '',
      vehicle.height ? `wys. ${vehicle.height}` : '',
      vehicle.weight ? `masa ${vehicle.weight}` : '',
    ].filter(Boolean).join(', ');
  }
  return Object.values(vehicle).some(Boolean) ? vehicle : null;
};

const detectTestSubmission = (payload = {}) => {
  const values = [
    payload.fullName,
    payload.name,
    payload.email,
    payload.phone,
    payload.country,
    payload.message,
    payload.originalMessage,
    payload.source,
    payload.debug,
    payload.test,
    payload.inquiryName,
  ].map((value) => oneLine(value, 400).toLowerCase());
  const haystack = values.join(' ');
  const reasons = [];
  if (/\b(test|tester|demo|dummy|aaa|asd|qwe)\b/.test(String(payload.fullName || payload.name || '').toLowerCase())) {
    reasons.push('name');
  }
  if (/(test|example|demo|fake)/i.test(String(payload.email || ''))) {
    reasons.push('email');
  }
  if (/(test web3forms|test resend|testowy|task12|codex|live test|diagnostic test)/i.test(String(payload.message || payload.originalMessage || ''))) {
    reasons.push('message');
  }
  if (/test\s*(web3forms|resend|cc)/i.test(String(payload.inquiryName || payload.fullName || ''))) {
    reasons.push('inquiryName');
  }
  const phoneDigits = String(payload.phone || '').replace(/\D+/g, '');
  if (/^(0+|1{6,}|123456789|123123123|987654321)$/.test(phoneDigits)) {
    reasons.push('phone');
  }
  if (/\b(test|demo|dummy|fake|debug|codex|task12\w*)\b/i.test(haystack) || payload.test === true || payload.isTest === true) {
    reasons.push('source');
  }
  return { isTest: reasons.length > 0, reasons: [...new Set(reasons)] };
};

const createInquiry = (payload, normalized) => {
  const nights = normalized.arrival && normalized.departure
    ? Math.max(1, Math.round((normalized.departure.getTime() - normalized.arrival.getTime()) / DAY))
    : Math.max(0, Number(payload.nights || 0));

  const vehicleDetails = normalizeVehicleDetails(payload);

  const testDiagnostic = detectTestSubmission(payload);

  return {
    inquiryId: `WEB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    isTest: testDiagnostic.isTest,
    testReasons: testDiagnostic.reasons,
    fullName: oneLine(payload.fullName, 140),
    email: normalized.email,
    phone: normalized.phone,
    country: oneLine(payload.country, 120),
    contactLanguage: oneLine(payload.contactLanguage || payload.locale || 'PL', 40),
    stayType: oneLine(payload.stayType || payload.selectedStayMode, 140),
    stayTypeId: oneLine(payload.stayTypeId, 80),
    stayCategory: oneLine(payload.stayCategory, 40),
    selectedStayMode: oneLine(payload.selectedStayMode || payload.stayMode || payload.stayCategory, 40),
    arrivalIso: oneLine(payload.arrivalIso, 20),
    departureIso: oneLine(payload.departureIso, 20),
    arrival: displayDate(normalized.arrival),
    departure: displayDate(normalized.departure),
    nights,
    people: {
      adults: Math.max(0, Math.floor(Number(payload.people?.adults || 0))),
      children: Math.max(0, Math.floor(Number(payload.people?.children || 0))),
      toddlers: Math.max(0, Math.floor(Number(payload.people?.toddlers || 0))),
    },
    services: normalized.services,
    tours: (Array.isArray(payload.tours) ? payload.tours : [])
      .map((tour) => oneLine(tour, 120))
      .filter(Boolean)
      .slice(0, 12),
    feedback: normalizeFeedback(payload.feedback),
    arrivalTime: oneLine(payload.arrivalTime, 120),
    highSeasonCampingInfo: Boolean(payload.highSeasonCampingInfo),
    bungalowPersonalItemsNotice: Boolean(payload.bungalowPersonalItemsNotice),
    estimatedTotal: oneLine(payload.estimatedTotal || payload.calculatorSummary?.total, 80),
    currencyEstimate: oneLine(payload.currencyEstimate || payload.calculatorSummary?.currencyEstimate, 160),
    currencyDisclaimer: longText(
      payload.currencyDisclaimer
        || payload.calculatorSummary?.currencyDisclaimer
        || 'Przeliczenia EUR / USD / GBP są orientacyjne i informacyjne. Finalna kwota, forma płatności i ewentualny kurs są potwierdzane przez recepcję.',
      500,
    ),
    calculatorSummary: payload.calculatorSummary || null,
    vehiclePlate: oneLine(payload.vehiclePlate, 80),
    vehicleDetails,
    vehicleType: oneLine(payload.vehicleType || vehicleDetails?.type || vehicleDetails?.model || vehicleDetails?.summary, 160),
    trailerPlate: oneLine(payload.trailerPlate || vehicleDetails?.trailerPlate, 80),
    specialNeeds: longText(payload.specialNeeds, 1200),
    lateCheckout: oneLine(payload.lateCheckout, 160),
    eventInterest: oneLine(payload.eventInterest || payload.event || payload.eventName || payload.krakowEvent, 180),
    message: longText(payload.message || payload.originalMessage, 2400),
    quietConsent: Boolean(payload.quietConsent),
    consent: Boolean(payload.consent),
    privacyConsent: Boolean(payload.privacyConsent),
    website: oneLine(payload.website, 220),
    summerNotice: Boolean(payload.summerNotice),
  };
};

const hasBungalow = (inquiry) =>
  /bungalow|domek|domki|combined|razem/i.test(`${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`);

const customerConfirmationEnabled = () =>
  /^true$/i.test(String(envValue('SEND_CUSTOMER_CONFIRMATION') || '').trim());

const createCcSystemDraft = (inquiry) => ({
  source: 'website',
  status: 'new',
  type: 'reservation_inquiry',
  customer: {
    fullName: inquiry.fullName,
    email: inquiry.email,
    phone: inquiry.phone,
    country: inquiry.country,
    language: inquiry.contactLanguage,
  },
  stay: {
    arrivalIso: inquiry.arrivalIso,
    departureIso: inquiry.departureIso,
    nights: inquiry.nights,
    stayTypeId: inquiry.stayTypeId,
    stayType: inquiry.stayType,
    stayCategory: inquiry.stayCategory,
    people: inquiry.people,
    services: inquiry.services,
    tours: inquiry.tours,
    feedback: inquiry.feedback,
    arrivalTime: inquiry.arrivalTime,
    highSeasonCampingInfo: inquiry.highSeasonCampingInfo,
    bungalowPersonalItemsNotice: inquiry.bungalowPersonalItemsNotice,
    estimatedTotal: inquiry.estimatedTotal,
    currencyEstimate: inquiry.currencyEstimate,
    currencyDisclaimer: inquiry.currencyDisclaimer,
    vehiclePlate: inquiry.vehiclePlate,
    vehicleType: inquiry.vehicleType,
    trailerPlate: inquiry.trailerPlate,
    vehicleDetails: inquiry.vehicleDetails,
    specialNeeds: inquiry.specialNeeds,
    lateCheckout: inquiry.lateCheckout,
    eventInterest: inquiry.eventInterest,
    summerNotice: inquiry.summerNotice,
    quietConsent: inquiry.quietConsent,
    consent: inquiry.consent,
    privacyConsent: inquiry.privacyConsent,
  },
  notes: inquiry.message,
  createdAt: inquiry.submittedAt,
});

const buildThreadMetadata = (inquiry) => {
  const dates = [inquiry.arrivalIso || inquiry.arrival, inquiry.departureIso || inquiry.departure].filter(Boolean).join('|');
  const email = String(inquiry.email || '').trim().toLowerCase();
  const stay = [inquiry.stayType, inquiry.arrival || inquiry.arrivalIso, inquiry.departure || inquiry.departureIso].filter(Boolean).join(' · ');
  return {
    originalInquirySubject: `Camping Clepardia — nowe zapytanie o pobyt`,
    customerReplySubject: 'Camping Clepardia — odpowiedź na zapytanie',
    conversationTitle: [inquiry.fullName || 'Klient', stay].filter(Boolean).join(' · '),
    threadKey: [email || inquiry.phone || 'no-contact', dates || inquiry.inquiryId].join('::'),
    clientSafeSummary: [
      inquiry.fullName,
      inquiry.country,
      inquiry.stayType,
      inquiry.arrival && inquiry.departure ? `${inquiry.arrival} — ${inquiry.departure}` : '',
    ].filter(Boolean).join(' · '),
  };
};

const buildAdminDiagnostics = (inquiry, reception = {}) => ({
  inquiryId: inquiry.inquiryId,
  isTest: Boolean(inquiry.isTest),
  testReasons: inquiry.testReasons || [],
  mailProvider: reception.provider || 'none',
  delivered: Boolean(reception.delivered),
  fallbackFrom: reception.fallbackFrom || null,
  errorCode: reception.errorCode || null,
  reason: reception.reason || reception.message || null,
  feedback: inquiry.feedback || null,
  consents: {
    quiet: inquiry.quietConsent,
    contact: inquiry.consent,
    privacy: inquiry.privacyConsent,
  },
  thread: buildThreadMetadata(inquiry),
});

const numericTotal = (value) => {
  const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const countryAliases = [
  ['PL', ['pl', 'polska', 'poland', 'pologne', 'polen']],
  ['NL', ['nl', 'holandia', 'netherlands', 'nederland', 'holland', 'paesi bassi']],
  ['DE', ['de', 'niemcy', 'germany', 'deutschland', 'allemagne']],
  ['CH', ['ch', 'switzerland', 'szwajcaria', 'schweiz', 'suisse']],
  ['CZ', ['cz', 'cs', 'czech', 'czechy', 'czech republic', 'cesko', 'česko']],
  ['SK', ['sk', 'slowacja', 'slovakia', 'slovensko']],
  ['FR', ['fr', 'francja', 'france', 'frankreich', 'francia']],
  ['IT', ['it', 'wlochy', 'włochy', 'italy', 'italia', 'italie']],
  ['ES', ['es', 'hiszpania', 'spain', 'espana', 'españa', 'espagne']],
  ['SE', ['se', 'sv', 'szwecja', 'sweden', 'sverige']],
  ['GB', ['gb', 'uk', 'united kingdom', 'great britain', 'wielka brytania', 'anglia']],
  ['US', ['us', 'usa', 'united states', 'stany zjednoczone']],
];

const stripAccents = (value) => oneLine(value, 200)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const countryCodeFrom = (country) => {
  const value = oneLine(country, 120);
  const bracket = String(value.match(/\(([A-Za-z]{2})\)/)?.[1] || '').toUpperCase();
  if (/^[A-Z]{2}$/.test(bracket)) return bracket;
  const direct = value.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(direct)) return direct;
  const text = stripAccents(value);
  const found = countryAliases.find(([, aliases]) =>
    aliases.some((alias) => text === alias || text.includes(` ${alias} `) || text.startsWith(`${alias} `) || text.endsWith(` ${alias}`)));
  return found?.[0] || '';
};

const flagEmoji = (code) => /^[A-Z]{2}$/.test(code)
  ? [...code].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('')
  : '🌍';

const countryWithFlag = (country) => {
  const raw = oneLine(country, 120);
  const code = countryCodeFrom(raw);
  if (!raw && !code) return '';
  const label = raw || code;
  return `${flagEmoji(code)} ${label}${code && !new RegExp(`\\(${code}\\)`, 'i').test(label) ? ` (${code})` : ''}`;
};

const buildStayLineItems = (inquiry) => {
  const nights = Math.max(1, Math.floor(Number(inquiry.nights || 0)) || 1);
  const normalized = new Map();
  const addLine = (line, rank = 10) => {
    const qty = Math.max(1, Math.floor(Number(line.qty || 1)));
    const price = Math.max(0, Number(line.price || 0));
    const key = `${line.scope || 'pobyt'}:${line.id || line.label}`;
    const entry = {
      id: oneLine(line.id || line.label, 80),
      scope: oneLine(line.scope || 'pobyt', 40),
      label: oneLine(line.label || line.id, 140),
      qty,
      price,
      billable: line.billable !== false,
      note: oneLine(line.note, 140),
      total: line.billable === false ? 0 : price * qty * nights,
      rank,
    };
    if (!entry.label) return;
    const existing = normalized.get(key);
    if (!existing || existing.rank < rank) {
      normalized.set(key, entry);
      return;
    }
    if (existing.rank === rank) {
      normalized.set(key, {
        ...existing,
        qty: Math.max(existing.qty, entry.qty),
        price: Math.max(existing.price, entry.price),
        total: Math.max(existing.total, entry.total),
      });
    }
  };

  const people = inquiry.people || {};
  [
    ['adults', people.adults],
    ['children', people.children],
    ['toddlers', people.toddlers],
  ].forEach(([id, qty]) => {
    const catalog = serviceCatalog[id];
    if (Number(qty || 0) > 0) addLine({ ...catalog, qty }, 60);
  });

  (Array.isArray(inquiry.services) ? inquiry.services : []).forEach((service) => {
    const canonicalId = canonicalServiceId(service);
    const catalog = serviceCatalog[canonicalId];
    addLine({
      id: catalog?.id || service.id || canonicalId,
      scope: catalog?.scope || service.scope || 'pobyt',
      label: catalog?.label || service.label || service.id || canonicalId,
      qty: serviceQuantity(service),
      price: Number(service.price ?? catalog?.price ?? 0),
    }, 50);
  });

  if (Array.isArray(inquiry.tours) && inquiry.tours.length) {
    addLine({
      id: 'tours',
      scope: 'info',
      label: `Wycieczki: ${inquiry.tours.join(', ')}`,
      qty: 1,
      price: 0,
      billable: false,
      note: 'bez doliczania',
    }, 30);
  }

  if (inquiry.eventInterest) {
    addLine({
      id: 'event',
      scope: 'info',
      label: `Wydarzenie: ${inquiry.eventInterest}`,
      qty: 1,
      price: 0,
      billable: false,
      note: 'informacyjnie',
    }, 30);
  }

  return [...normalized.values()]
    .sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label, 'pl'))
    .map(({ rank, ...line }) => line);
};

const calculatedStayTotal = (lineItems) =>
  lineItems.reduce((sum, line) => sum + (line.billable === false ? 0 : Number(line.total || 0)), 0);

const receptionPriceSummary = (inquiry, lineItems) => {
  const calculated = calculatedStayTotal(lineItems);
  const payloadTotal = numericTotal(inquiry.estimatedTotal);
  if (calculated > 0) {
    return {
      label: `${calculated} PLN`,
      hint: payloadTotal && Math.round(payloadTotal) !== Math.round(calculated)
        ? `Wyliczone z osób/usług; formularz podał ${inquiry.estimatedTotal}`
        : 'Wyliczone z osób i usług',
      value: calculated,
    };
  }
  if (payloadTotal) {
    return { label: `${payloadTotal} PLN`, hint: 'Kwota z formularza', value: payloadTotal };
  }
  return { label: 'do potwierdzenia', hint: '', value: null };
};

const stayKindLabel = (inquiry) => {
  const text = `${inquiry.selectedStayMode} ${inquiry.stayCategory} ${inquiry.stayType}`.toLowerCase();
  if (inquiry.isTest) return 'Test';
  if (/combined|razem|łącz|lacz/.test(text)) return 'Razem';
  if (/bungalow|domek|domki/.test(text)) return 'Domki';
  return 'Camping';
};

const createSupabaseRecord = (inquiry, payload) => ({
  status: inquiry.website ? 'spam' : inquiry.isTest ? 'test' : 'new',
  source: oneLine(payload.source || 'website', 80),
  stay_type: inquiry.stayType,
  language: inquiry.contactLanguage,
  country: inquiry.country,
  full_name: inquiry.fullName,
  email: inquiry.email || null,
  phone: inquiry.phone || null,
  arrival_date: inquiry.arrivalIso,
  departure_date: inquiry.departureIso,
  nights: inquiry.nights,
  services_json: inquiry.services,
  estimated_total_pln: numericTotal(inquiry.estimatedTotal),
  estimated_currency_json: inquiry.calculatorSummary || {
    estimate: inquiry.currencyEstimate,
    disclaimer: inquiry.currencyDisclaimer,
  },
  vehicle_registration: inquiry.vehiclePlate || null,
  vehicle_details_json: inquiry.vehicleDetails || normalizeVehicleDetails(payload),
  special_needs: inquiry.specialNeeds || null,
  trips_interest_json: inquiry.tours,
  consents_json: {
    quiet: inquiry.quietConsent,
    contact: inquiry.consent,
    privacy: inquiry.privacyConsent,
  },
  message: inquiry.message || null,
  notes: '',
  mail_provider: 'none',
  mail_delivered: false,
  mail_error: null,
  raw_payload_json: {
    ...payload,
    ccDiagnostics: {
      isTest: Boolean(inquiry.isTest),
      testReasons: inquiry.testReasons || [],
    },
  },
});

const buildReceptionSafeEmail = (inquiry) => {
  const stayKind = stayKindLabel(inquiry);
  const rawServices = Array.isArray(inquiry.services) ? inquiry.services : [];
  const services = buildStayLineItems(inquiry);
  const priceSummary = receptionPriceSummary(inquiry, services);
  const countryDisplay = countryWithFlag(inquiry.country);
  const totalPeople = Number(inquiry.people.adults || 0) + Number(inquiry.people.children || 0) + Number(inquiry.people.toddlers || 0);
  const guests = [
    inquiry.people.adults ? `Dorośli: ${inquiry.people.adults}` : '',
    inquiry.people.children ? `Dzieci 4–14: ${inquiry.people.children}` : '',
    inquiry.people.toddlers ? `Dzieci 0–4: ${inquiry.people.toddlers}` : '',
  ].filter(Boolean).join(', ') || 'do ustalenia';
  const vehicleParts = [
    inquiry.vehicleType,
    inquiry.vehiclePlate ? `rej. ${inquiry.vehiclePlate}` : '',
    inquiry.trailerPlate ? `przyczepa ${inquiry.trailerPlate}` : '',
    inquiry.vehicleDetails?.summary,
  ].filter(Boolean);
  const vehicleSummary = vehicleParts.join(' · ');
  const serviceSearch = rawServices.map((service) => `${service.id} ${service.label} ${service.scope}`).join(' ');
  const freeTextSearch = [
    serviceSearch,
    inquiry.message,
    inquiry.specialNeeds,
    inquiry.vehicleType,
    inquiry.vehicleDetails?.summary,
  ].join(' ');
  const hasElectricity = /electric|prąd|prad|10a/i.test(freeTextSearch);
  const hasEv = /ev|electric car|samoch[oó]d elektry|hybryd|plug[-\s]?in/i.test(freeTextSearch);
  const hasDog = /dog|pies/i.test(freeTextSearch);
  const isLateArrival = /2[1-3]:|21|22|23|po 21|after 21|late|p[oó][źz]n/i.test(inquiry.arrivalTime || '');
  const warningItems = [
    inquiry.highSeasonCampingInfo ? 'Lipiec/sierpień + camping: miejsca według kolejności przyjazdu, najlepiej około 12:00.' : '',
    hasBungalow(inquiry) ? 'Domek: check-in od 16:00, check-out do 11:00. Klient powinien zabrać własne ręczniki, kosmetyki i rzeczy osobiste.' : '',
    isLateArrival ? 'Późny przyjazd: warto wcześniej ustalić szczegóły z recepcją. Recepcja 9:00–21:00, brama standardowo 8:00–22:00.' : '',
    hasElectricity ? 'Prąd 10A: dostępny dla wyposażenia kampera/przyczepy.' : '',
    hasEv ? 'EV / plug-in: nie ma możliwości ładowania samochodów elektrycznych ani hybryd plug-in na stanowisku.' : '',
    inquiry.vehicleDetails?.large || inquiry.vehicleDetails?.asphaltNeeded ? 'Ciężki pojazd: najlepiej ustawić na stabilnym/asfaltowym miejscu.' : '',
    hasDog ? 'Pies: pobyt psa jest bezpłatny; prosimy o sprzątanie po pupilu.' : '',
    'Dojazd: rekomendowane Google Maps, ponieważ wjazd na camping zmienił się w 2022 roku.',
  ].filter(Boolean);
  const badge = warningItems.length ? 'SPRAWDŹ SZCZEGÓŁY' : 'NOWE ZAPYTANIE';
  const sectionTitle = (icon, title) => `<h2 style="margin:0 0 14px;font-size:18px;line-height:1.25;color:#0f2c1d;">${icon} ${escapeHtml(title)}</h2>`;
  const safeRows = (rows) => rows.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');
  const fieldRows = (rows) => safeRows(rows).map(([label, value]) => `
    <tr>
      <td style="padding:10px 0;color:#61736a;border-top:1px solid #e6f1ea;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#102319;font-weight:800;text-align:right;border-top:1px solid #e6f1ea;font-size:13px;">${escapeHtml(value)}</td>
    </tr>
  `).join('');
  const card = ([icon, label, value, hint]) => `
    <td style="width:50%;padding:7px;">
      <div style="min-height:112px;padding:16px;border:1px solid #dceee4;border-radius:18px;background:linear-gradient(145deg,#ffffff,#f4fbf6);">
        <div style="font-size:24px;line-height:1;">${icon}</div>
        <p style="margin:9px 0 4px;color:#60736a;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;">${escapeHtml(label)}</p>
        <strong style="display:block;color:#102319;font-size:18px;line-height:1.25;">${escapeHtml(value || 'do ustalenia')}</strong>
        ${hint ? `<small style="display:block;margin-top:6px;color:#61736a;line-height:1.35;">${escapeHtml(hint)}</small>` : ''}
      </div>
    </td>
  `;
  const serviceRows = services.map((service) => {
    const qty = Math.max(1, Number(service.qty || 1));
    const price = Math.max(0, Number(service.price || 0));
    const sum = Math.max(0, Number(service.total || 0));
    const priceText = service.billable === false ? (service.note || 'bez doliczania') : `${price} PLN / noc`;
    const sumText = service.billable === false ? '—' : `${sum} PLN`;
    return `
      <tr>
        <td style="padding:11px 0;border-top:1px solid #e6f1ea;color:#102319;font-weight:900;">${escapeHtml(service.label || service.id || 'Usługa')}</td>
        <td style="padding:11px 0;border-top:1px solid #e6f1ea;color:#61736a;text-align:center;">${escapeHtml(qty)}</td>
        <td style="padding:11px 0;border-top:1px solid #e6f1ea;color:#61736a;text-align:right;">${escapeHtml(priceText)}</td>
        <td style="padding:11px 0;border-top:1px solid #e6f1ea;color:#0f6b43;text-align:right;font-weight:900;">${escapeHtml(sumText)}</td>
      </tr>
    `;
  }).join('');
  const servicesText = services.map((service) => {
    const qty = Math.max(1, Number(service.qty || 1));
    const price = Math.max(0, Number(service.price || 0));
    const sum = Math.max(0, Number(service.total || 0));
    if (service.billable === false) return `- ${service.label || service.id || 'Informacja'}: ${service.note || 'bez doliczania do ceny'}`;
    return `- ${service.label || service.id || 'Usługa'} x ${qty}: ${price} PLN / noc, orientacyjnie ${sum} PLN`;
  });
  const clientRows = [
    ['Imię i nazwisko', inquiry.fullName],
    ['Email', inquiry.email],
    ['Telefon', inquiry.phone],
    ['Kraj', countryDisplay],
    ['Język kontaktu', inquiry.contactLanguage],
  ];
  const stayRows = [
    ['Data przyjazdu', inquiry.arrival],
    ['Data wyjazdu', inquiry.departure],
    ['Noce', inquiry.nights],
    ['Godzina przyjazdu', inquiry.arrivalTime || 'jeszcze nie wiem'],
    ['Typ pobytu', inquiry.stayType],
    ['Pojazd', vehicleSummary],
    ['Uwagi / potrzeby klienta', inquiry.specialNeeds],
    ['Wydarzenie', inquiry.eventInterest],
    ['Wycieczki', inquiry.tours.join(', ')],
  ];
  const peopleRows = [
    ['Dorośli', inquiry.people.adults || 0],
    ['Dzieci 4–14', inquiry.people.children || 0],
    ['Dzieci 0–4', inquiry.people.toddlers || 0],
    ['Razem osób', totalPeople || 'do ustalenia'],
  ];
  const topCards = [
    ['📅', 'Termin', `${inquiry.arrival || '-'} — ${inquiry.departure || '-'}`, `${inquiry.nights || 0} nocy`],
    ['👥', 'Goście', totalPeople ? `${totalPeople} osób` : 'do ustalenia', guests],
    ['🚐', 'Typ pobytu / pojazd', inquiry.stayType || 'do ustalenia', vehicleSummary],
    ['💰', 'Cena orientacyjna', priceSummary.label, priceSummary.hint || inquiry.currencyEstimate],
    ['🌍', 'Kraj / język', countryDisplay || 'do ustalenia', inquiry.contactLanguage],
  ];
  const warningHtml = warningItems.length
    ? `<section style="margin:18px 0;padding:20px;border:1px solid #f0d7a6;border-radius:20px;background:#fff8ea;color:#4c3b13;">
        ${sectionTitle('ℹ️', 'Ważne informacje')}
        <ul style="margin:0;padding-left:19px;line-height:1.7;">${warningItems.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
      </section>`
    : '';
  const bodyHtml = `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nowe zapytanie o pobyt — Camping Clepardia</title>
  </head>
  <body style="margin:0;background:#eef7f1;color:#102319;font-family:Arial,Helvetica,sans-serif;">
    <div style="padding:28px;background:#eef7f1;">
      <div style="max-width:820px;margin:0 auto;">
        <header style="padding:28px;border-radius:28px;background:linear-gradient(135deg,#07140f,#12472d 58%,#1e7b4d);color:#fff;box-shadow:0 24px 70px rgba(7,20,15,.24);">
          <p style="display:inline-block;margin:0 0 14px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.14);color:#c8ffdc;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(badge)}</p>
          <h1 style="margin:0;font-size:30px;line-height:1.1;">Camping Clepardia</h1>
          <h2 style="margin:8px 0 0;font-size:22px;line-height:1.2;">Nowe zapytanie o pobyt</h2>
          <p style="margin:14px 0 0;color:#d7efe0;font-size:15px;line-height:1.55;">${escapeHtml(stayKind)} · ${escapeHtml(inquiry.arrival || '-')} — ${escapeHtml(inquiry.departure || '-')} · ${escapeHtml([inquiry.fullName, countryDisplay].filter(Boolean).join(' / ') || 'klient')}</p>
        </header>

        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0;margin:18px -7px 4px;">
          <tr>${topCards.slice(0, 2).map(card).join('')}</tr>
          <tr>${topCards.slice(2, 4).map(card).join('')}</tr>
          <tr>${topCards.slice(4, 5).map(card).join('')}</tr>
        </table>

        ${warningHtml}

        <section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#fff;">
          ${sectionTitle('👤', 'Klient')}
          <table role="presentation" style="width:100%;border-collapse:collapse;">${fieldRows(clientRows)}</table>
        </section>

        <section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#fff;">
          ${sectionTitle('🏕️', 'Pobyt')}
          <table role="presentation" style="width:100%;border-collapse:collapse;">${fieldRows(stayRows)}</table>
        </section>

        <section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#fff;">
          ${sectionTitle('👥', 'Osoby')}
          <table role="presentation" style="width:100%;border-collapse:collapse;">${fieldRows(peopleRows)}</table>
        </section>

        <section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#fff;">
          ${sectionTitle('🧾', 'Usługi i cena orientacyjna')}
          ${services.length ? `<table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <th align="left" style="padding:0 0 9px;color:#61736a;font-size:12px;text-transform:uppercase;">Usługa</th>
              <th align="center" style="padding:0 0 9px;color:#61736a;font-size:12px;text-transform:uppercase;">Ilość</th>
              <th align="right" style="padding:0 0 9px;color:#61736a;font-size:12px;text-transform:uppercase;">Cena / noc</th>
              <th align="right" style="padding:0 0 9px;color:#61736a;font-size:12px;text-transform:uppercase;">Suma</th>
            </tr>
            ${serviceRows}
            <tr>
              <td colspan="3" style="padding:14px 0 0;border-top:2px solid #dceee4;color:#102319;font-weight:900;text-align:right;">Razem orientacyjnie</td>
              <td style="padding:14px 0 0;border-top:2px solid #dceee4;color:#0f6b43;text-align:right;font-size:18px;font-weight:950;">${escapeHtml(priceSummary.label)}</td>
            </tr>
          </table>` : ''}
          <p style="margin:14px 0 0;color:#61736a;font-size:13px;line-height:1.55;">Cena jest orientacyjna; finalne warunki potwierdza recepcja.</p>
        </section>

        ${inquiry.message ? `<section style="margin:18px 0;padding:20px;border:1px solid #dceee4;border-radius:20px;background:#fff;">
          ${sectionTitle('💬', 'Wiadomość klienta')}
          <p style="white-space:pre-wrap;line-height:1.7;margin:0;color:#102319;">${escapeHtml(inquiry.message)}</p>
        </section>` : ''}

        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.7;">
          <strong>Camping Clepardia</strong><br>
          www.clepardia.com.pl · +48 795 294 486
        </footer>
      </div>
    </div>
  </body>
</html>`;
  const bodyText = [
    'Nowe zapytanie o pobyt — Camping Clepardia',
    '',
    [stayKind, `${inquiry.arrival || '-'} — ${inquiry.departure || '-'}`, [inquiry.fullName, countryDisplay].filter(Boolean).join(' / ')].filter(Boolean).join(' · '),
    '',
    'NAJWAŻNIEJSZE',
    `Termin: ${inquiry.arrival || '-'} — ${inquiry.departure || '-'} (${inquiry.nights || 0} nocy)`,
    `Goście: ${guests}; razem: ${totalPeople || 'do ustalenia'}`,
    `Typ pobytu / pojazd: ${[inquiry.stayType, vehicleSummary].filter(Boolean).join('; ') || 'do ustalenia'}`,
    `Cena orientacyjna: ${priceSummary.label}${priceSummary.hint ? ` (${priceSummary.hint})` : ''}`,
    `Kraj / język: ${[countryDisplay, inquiry.contactLanguage].filter(Boolean).join(' / ') || 'do ustalenia'}`,
    '',
    'KLIENT',
    ...safeRows(clientRows).map(([label, value]) => `${label}: ${value}`),
    '',
    'POBYT',
    ...safeRows(stayRows).map(([label, value]) => `${label}: ${value}`),
    '',
    'OSOBY',
    ...safeRows(peopleRows).map(([label, value]) => `${label}: ${value}`),
    '',
    servicesText.length ? 'USŁUGI' : '',
    ...servicesText,
    '',
    priceSummary.value ? `Razem orientacyjnie: ${priceSummary.label}` : '',
    '',
    'ℹ️ WAŻNE INFORMACJE',
    ...warningItems.map((note) => `- ${note}`),
    '',
    inquiry.message ? 'WIADOMOŚĆ KLIENTA' : '',
    inquiry.message || '',
    '',
    `Strona: www.clepardia.com.pl`,
    'Camping Clepardia · www.clepardia.com.pl · +48 795 294 486',
  ].filter(Boolean).join('\n');

  return {
    from: reservationFromEmail(),
    to: reservationToEmail(),
    replyTo: inquiry.email || undefined,
    subject: `Camping Clepardia — nowe zapytanie o pobyt — ${stayKind} — ${inquiry.arrival}`,
    html: bodyHtml,
    text: bodyText,
  };
};

const buildReplyPlainTextForMailto = (inquiry) => [
    `Dzień dobry${inquiry.fullName ? ` ${inquiry.fullName.split(/\s+/)[0]}` : ''},`,
    '',
    'dziękujemy za wiadomość i zainteresowanie pobytem w Camping Clepardia.',
    inquiry.arrival && inquiry.departure ? `Termin: ${inquiry.arrival} — ${inquiry.departure}` : '',
    inquiry.nights ? `Liczba nocy: ${inquiry.nights}` : '',
    inquiry.stayType ? `Typ pobytu: ${inquiry.stayType}` : '',
    inquiry.estimatedTotal ? `Cena orientacyjna: ${inquiry.estimatedTotal}` : '',
    '',
    'Finalną dostępność i warunki potwierdza recepcja.',
    '',
    'Pozdrawiamy,',
    'Recepcja Camping Clepardia',
    'www.clepardia.com.pl',
    '+48 795 294 486',
  ].filter(Boolean).join('\n');

const buildClientPremiumReply = (inquiry) => {
  const subject = buildThreadMetadata(inquiry).customerReplySubject;
  const text = buildReplyPlainTextForMailto(inquiry);
  const country = countryWithFlag(inquiry.country);
  const lineItems = buildStayLineItems(inquiry);
  const price = receptionPriceSummary(inquiry, lineItems);
  const html = `<!doctype html>
<html lang="pl">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#eef7f1;color:#102319;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:760px;margin:0 auto;padding:28px;">
      <section style="padding:26px;border-radius:26px;background:linear-gradient(135deg,#07140f,#1e7b4d);color:#fff;">
        <p style="margin:0 0 10px;color:#c8ffdc;font-weight:900;">Camping Clepardia</p>
        <h1 style="margin:0;font-size:28px;">Odpowiedź premium</h1>
        <p style="margin:12px 0 0;color:#d7efe0;">${escapeHtml([inquiry.fullName, country].filter(Boolean).join(' · '))}</p>
      </section>
      <section style="margin-top:16px;padding:20px;border-radius:20px;background:#fff;border:1px solid #dceee4;">
        <h2 style="margin:0 0 12px;color:#0f2c1d;">📅 Szczegóły pobytu</h2>
        <p style="line-height:1.7;margin:0;">Termin: <strong>${escapeHtml(inquiry.arrival || '-')} — ${escapeHtml(inquiry.departure || '-')}</strong><br>Liczba nocy: <strong>${escapeHtml(inquiry.nights || 0)}</strong><br>Typ pobytu: <strong>${escapeHtml(inquiry.stayType || '-')}</strong><br>Cena orientacyjna: <strong>${escapeHtml(price.label)}</strong></p>
      </section>
      <section style="margin-top:16px;padding:20px;border-radius:20px;background:#fff;border:1px solid #dceee4;">
        <h2 style="margin:0 0 12px;color:#0f2c1d;">ℹ️ Ważne informacje</h2>
        <p style="line-height:1.7;margin:0;">Finalną dostępność i warunki potwierdza recepcja. Prosimy korzystać z Google Maps, ponieważ wjazd na camping zmienił się w 2022 roku.</p>
      </section>
      <footer style="padding:18px 4px;color:#54675d;font-size:13px;line-height:1.6;">Camping Clepardia · www.clepardia.com.pl · +48 795 294 486</footer>
    </main>
  </body>
</html>`;
  return { subject, text, html };
};

const buildClientReplyTemplate = buildClientPremiumReply;

const buildCustomerMail = (inquiry) => {
  const depositNote = hasBungalow(inquiry)
    ? 'W przypadku domkow moze byc wymagana zaliczka. Szczegoly otrzymasz w odpowiedzi po sprawdzeniu dostepnosci.'
    : '';
  const services = inquiry.services.map((service) => `${service.label} x ${service.qty}`);
  const rows = [
    ['Typ pobytu', inquiry.stayType],
    ['Termin', `${inquiry.arrival} - ${inquiry.departure}`],
    ['Orientacyjna godzina przyjazdu', inquiry.arrivalTime || 'jeszcze nie wiem'],
    ['Noce', inquiry.nights],
    ['Goscie', [
      inquiry.people.adults ? `dorosli: ${inquiry.people.adults}` : '',
      inquiry.people.children ? `dzieci 4-14: ${inquiry.people.children}` : '',
      inquiry.people.toddlers ? `dzieci do 4: ${inquiry.people.toddlers}` : '',
    ].filter(Boolean).join(', ') || 'brak'],
    ['Uslugi', services.length ? services.join(', ') : 'brak'],
    ['Cena orientacyjna', inquiry.estimatedTotal || 'do potwierdzenia'],
    ['Waluty orientacyjnie', inquiry.currencyEstimate || 'brak'],
  ];
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:9px 0;color:#61736a;border-top:1px solid #e6f1ea;">${escapeHtml(label)}</td>
      <td style="padding:9px 0;color:#102319;font-weight:800;text-align:right;border-top:1px solid #e6f1ea;">${escapeHtml(value || 'brak')}</td>
    </tr>
  `).join('');
  const bodyHtml = `
    <div style="font-family:Arial,sans-serif;background:#eef7f1;padding:28px;color:#102319;">
      <div style="max-width:720px;margin:0 auto;">
        <header style="padding:24px 26px;border-radius:24px;background:linear-gradient(135deg,#0b1f15,#1b3b2a);color:#fff;">
          <p style="display:inline-block;margin:0 0 12px;padding:7px 11px;border-radius:999px;background:rgba(60,179,113,.18);color:#9cf2bf;font-size:12px;font-weight:900;text-transform:uppercase;">Otrzymalismy zapytanie</p>
          <h1 style="margin:0;font-size:26px;">Camping Clepardia</h1>
          <p style="margin:12px 0 0;color:#d7efe0;">To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.</p>
        </header>
        <section style="margin:18px 0;padding:18px 20px;border:1px solid #dceee4;border-radius:18px;background:#fff;">
          <h2 style="margin:0 0 12px;font-size:17px;">Twoje zapytanie</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;">${rowHtml}</table>
        </section>
        ${depositNote ? `<section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff8ea;border:1px solid #f0d7a6;color:#4c3b13;"><strong>Zaliczka przy domkach</strong><p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(depositNote)}</p></section>` : ''}
        <section style="margin:18px 0;padding:16px 18px;border-radius:18px;background:#eef8f1;border:1px solid #dceee4;color:#102319;">
          <strong>Waluty orientacyjne</strong>
          <p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(inquiry.currencyEstimate || 'brak')}</p>
          <p style="margin:8px 0 0;line-height:1.6;color:#4b5b51;">${escapeHtml(inquiry.currencyDisclaimer)}</p>
        </section>
        <section style="margin:18px 0;padding:18px 20px;border-radius:18px;background:#fff;border:1px solid #dceee4;color:#102319;">
          <p style="margin:0;line-height:1.65;">Cisza nocna obowiazuje od 22:00 do 07:00. Dojazd najlepiej sprawdzic w Google Maps: ul. Henryka Pachonskiego 28A, Krakow.</p>
        </section>
        <footer style="padding:18px 6px;color:#54675d;font-size:12px;line-height:1.6;">Kontakt: clepardia@gmail.com, +48 795 294 486. Finalne warunki potwierdza recepcja.</footer>
      </div>
    </div>
  `;
  const bodyText = [
    'Otrzymalismy Twoje zapytanie - Camping Clepardia',
    '',
    'To nie jest automatyczne potwierdzenie rezerwacji. Recepcja sprawdzi dostepnosc i odpowie mozliwie szybko.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value || 'brak'}`),
    inquiry.currencyDisclaimer,
    '',
    depositNote,
    'Cisza nocna: 22:00-07:00.',
    'Kontakt: clepardia@gmail.com, +48 795 294 486.',
  ].filter(Boolean).join('\n');

  return {
    from: reservationFromEmail(),
    to: inquiry.email,
    replyTo: reservationToEmail(),
    subject: 'Otrzymalismy Twoje zapytanie - Camping Clepardia',
    html: bodyHtml,
    text: bodyText,
  };
};

const normalizeResendError = (body, status) => {
  const rawCode = oneLine(body?.name || body?.code || body?.error || `RESEND_${status}`, 120);
  const rawMessage = oneLine(body?.message || body?.error || `Resend returned ${status}.`, 800);
  const normalized = `${rawCode} ${rawMessage}`.toLowerCase();

  if (status === 401 || normalized.includes('api key is invalid') || normalized.includes('invalid api key')) {
    return {
      errorCode: 'invalid_api_key',
      message: 'Resend API key is invalid. Generate a new key in Resend and update RESEND_API_KEY in Vercel.',
      reason: rawMessage,
    };
  }

  if (status === 403 || normalized.includes('domain') || normalized.includes('sender') || normalized.includes('from') || normalized.includes('verify')) {
    return {
      errorCode: 'sender_rejected',
      message: 'Resend wymaga zweryfikowanego nadawcy/domeny.',
      reason: 'Resend wymaga zweryfikowanego nadawcy/domeny.',
    };
  }

  return {
    errorCode: rawCode,
    message: rawMessage,
    reason: rawMessage,
  };
};

const normalizeFormSubmitError = (body, status) => {
  const rawMessage = oneLine(body?.message || body?.error || body?.reason || `FormSubmit returned ${status}.`, 800);
  const normalized = rawMessage.toLowerCase();
  if (status === 403 || normalized.includes('activate') || normalized.includes('activation') || normalized.includes('confirm')) {
    return {
      errorCode: 'formsubmit_activation_required',
      message: 'FormSubmit zwrócił 403 — prawdopodobnie wymagana ponowna aktywacja lub endpoint jest zablokowany.',
      reason: 'FormSubmit zwrócił 403 — prawdopodobnie wymagana ponowna aktywacja lub endpoint jest zablokowany.',
    };
  }
  return {
    errorCode: oneLine(body?.code || body?.error || `FORMSUBMIT_${status}`, 120),
    message: rawMessage,
    reason: rawMessage,
  };
};

const buildFormSubmitPayload = (message, inquiry) => ({
  _subject: message.subject,
  _template: 'table',
  _captcha: 'false',
  _replyto: inquiry.email || '',
  _autoresponse: '',
  inquiry_id: inquiry.inquiryId,
  zapis_do_panelu: 'zapisano w reservation_inquiries',
  status: 'Do potwierdzenia przez recepcje',
  typ_pobytu: inquiry.stayType,
  termin: `${inquiry.arrival} - ${inquiry.departure}`,
  orientacyjna_godzina_przyjazdu: inquiry.arrivalTime || 'jeszcze nie wiem',
  liczba_nocy: inquiry.nights,
  goscie: [
    inquiry.people.adults ? `Dorosli: ${inquiry.people.adults}` : '',
    inquiry.people.children ? `Dzieci 4-14: ${inquiry.people.children}` : '',
    inquiry.people.toddlers ? `Dzieci do 4: ${inquiry.people.toddlers}` : '',
  ].filter(Boolean).join(', ') || 'brak',
  uslugi: inquiry.services.map((service) => `${service.scope ? `[${service.scope}] ` : ''}${service.label} x ${service.qty} - ${service.price} PLN / noc`).join('\n') || 'brak',
  cena_orientacyjna: inquiry.estimatedTotal || 'brak',
  waluty_orientacyjnie: inquiry.currencyEstimate || 'brak',
  informacja_o_walutach: inquiry.currencyDisclaimer || 'Waluty obce pokazujemy wylacznie orientacyjnie.',
  kraj: inquiry.country || 'brak',
  jezyk_kontaktu: inquiry.contactLanguage || 'brak',
  imie_i_nazwisko: inquiry.fullName || 'brak',
  email: inquiry.email || 'brak',
  telefon: inquiry.phone || 'brak',
  numer_rejestracyjny: inquiry.vehiclePlate || 'brak',
  specjalne_potrzeby: inquiry.specialNeeds || 'brak',
  pozniejszy_wyjazd: inquiry.lateCheckout || 'brak',
  wycieczki_bez_doliczania_ceny: inquiry.tours.join(', ') || 'brak',
  ocena_strony: inquiry.feedback?.rating ? `${inquiry.feedback.rating}/5` : 'brak',
  co_sie_podobalo: inquiry.feedback?.liked?.join(', ') || 'brak',
  latwo_znalezc_informacje: inquiry.feedback?.easyInfo || 'brak',
  prosty_formularz: inquiry.feedback?.easyForm || 'brak',
  sugestia_ulepszenia: inquiry.feedback?.improve || 'brak',
  camping_lipiec_sierpien_bez_rezerwacji: inquiry.highSeasonCampingInfo ? 'TAK — według kolejności przyjazdu' : 'nie dotyczy',
  domki_wlasne_reczniki_i_rzeczy_osobiste: inquiry.bungalowPersonalItemsNotice ? 'informacja przekazana' : 'nie dotyczy',
  wiadomosc_klienta: inquiry.message || 'brak',
  zgoda_cisza_nocna: inquiry.quietConsent ? 'zaakceptowana' : 'brak',
  zgoda_kontaktowa: inquiry.consent ? 'zaakceptowana' : 'brak',
  zgoda_prywatnosc: inquiry.privacyConsent ? 'zaakceptowana' : 'brak',
  informacja: 'Dostepnosc i finalne warunki potwierdza recepcja.',
  podsumowanie: message.text,
});

const parseProviderBody = (text) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const sanitizeProviderBody = (value) => {
  const raw = typeof value === 'string' ? value : JSON.stringify(value || {});
  return oneLine(raw.replace(/"access_key"\s*:\s*"[^"]+"/gi, '"access_key":"[redacted]"'), 1000);
};

const web3FormsAdminDiagnostic = (accessKey, response, responseBody, responseText, contentType) => ({
  keyPresent: Boolean(String(accessKey || '').trim()),
  keyLength: String(accessKey || '').trim().length,
  status: response?.status ?? null,
  responseSuccess: typeof responseBody?.success === 'boolean' ? responseBody.success : null,
  responseBody: sanitizeProviderBody(Object.keys(responseBody || {}).length ? responseBody : responseText),
  contentType,
});

const normalizeWeb3FormsError = (body, status, responseText = '') => {
  const rawMessage = oneLine(body?.message || body?.error || body?.reason || responseText || `Web3Forms returned ${status}.`, 800);
  const normalized = rawMessage.toLowerCase();
  if (status === 401 || normalized.includes('access_key') || normalized.includes('access key') || normalized.includes('invalid key')) {
    return {
      errorCode: 'web3forms_invalid_access_key',
      message: 'Web3Forms access key is missing or invalid.',
      reason: rawMessage,
    };
  }
  if (normalized.includes('this method is not allowed') || normalized.includes('server ip address') || normalized.includes('pro plan')) {
    return {
      errorCode: 'WEB3FORMS_SERVER_SIDE_BLOCKED',
      message: 'Web3Forms blokuje wysyłkę server-side z tej funkcji. Wymagana wysyłka client-side albo dopuszczenie IP/plan Pro po stronie Web3Forms.',
      reason: rawMessage,
    };
  }
  return {
    errorCode: oneLine(body?.code || body?.error || `WEB3FORMS_${status}`, 120),
    message: rawMessage,
    reason: rawMessage,
  };
};

const buildWeb3FormsPayload = (message, inquiry) => ({
  access_key: web3FormsAccessKey(),
  subject: message.subject,
  from_name: 'Camping Clepardia — formularz strony',
  name: inquiry.fullName || 'Gość strony',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email || '') ? inquiry.email : reservationToEmail(),
  message: message.text,
});

const toUrlEncoded = (payload) => {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  return params;
};

const sendWithWeb3Forms = async (message, inquiry) => {
  const accessKey = web3FormsAccessKey();
  const keyLength = accessKey.length;
  if (!accessKey) {
    return {
      provider: 'web3forms',
      delivered: false,
      errorCode: 'WEB3FORMS_KEY_MISSING',
      reason: 'WEB3FORMS_KEY_MISSING',
      message: 'WEB3FORMS_KEY_MISSING',
      keyPresent: false,
      keyLength,
      contentType: 'application/x-www-form-urlencoded',
    };
  }

  try {
    const contentType = 'application/x-www-form-urlencoded';
    const payload = buildWeb3FormsPayload(message, inquiry);
    const formBody = toUrlEncoded(payload);
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': `${contentType}; charset=UTF-8`,
        'user-agent': 'curl/8.5.0',
      },
      body: formBody.toString(),
    });
    const responseText = await response.text().catch(() => '');
    const body = parseProviderBody(responseText);
    const diagnostic = web3FormsAdminDiagnostic(accessKey, response, body, responseText, contentType);

    if (!response.ok || body?.success === false) {
      const normalizedError = normalizeWeb3FormsError(body, response.status, responseText);
      console.error('[reservation-api] web3forms-provider-error', {
        status: response.status,
        errorCode: normalizedError.errorCode,
        reason: normalizedError.reason,
        keyPresent: diagnostic.keyPresent,
        keyLength: diagnostic.keyLength,
        responseBody: diagnostic.responseBody,
        contentType,
      });
      return {
        provider: 'web3forms',
        delivered: false,
        status: response.status,
        ...diagnostic,
        ...normalizedError,
      };
    }

    return {
      provider: 'web3forms',
      delivered: true,
      messageId: oneLine(body?.data?.id || body?.message || body?.submission_id || '', 180),
      message: oneLine(body?.message || 'Sent through Web3Forms.', 240),
      status: response.status,
      keyPresent: diagnostic.keyPresent,
      keyLength: diagnostic.keyLength,
      responseSuccess: diagnostic.responseSuccess,
      contentType,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Web3Forms request failed.';
    return {
      provider: 'web3forms',
      delivered: false,
      errorCode: 'WEB3FORMS_REQUEST_FAILED',
      message,
      reason: message,
      keyPresent: true,
      keyLength,
      contentType: 'application/x-www-form-urlencoded',
    };
  }
};

const sendWithResend = async (message) => {
  const apiKey = resendApiKey();
  const missing = [
    !apiKey ? 'RESEND_API_KEY' : '',
    !String(message.from || '').trim() ? 'RESERVATION_FROM_EMAIL' : '',
    !String(message.to || '').trim() ? 'RESERVATION_TO_EMAIL' : '',
  ].filter(Boolean);
  if (missing.length) {
    return {
      provider: 'resend',
      delivered: false,
      errorCode: 'RESEND_ENV_MISSING',
      reason: `Brak wymaganych ENV dla Resend: ${missing.join(', ')}.`,
      message: `Brak wymaganych ENV dla Resend: ${missing.join(', ')}.`,
      missing,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to.split(',').map((item) => item.trim()).filter(Boolean),
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const normalizedError = normalizeResendError(body, response.status);
      console.error('[reservation-api] resend-provider-error', {
        status: response.status,
        errorCode: normalizedError.errorCode,
        reason: normalizedError.reason,
      });
      return {
        provider: 'resend',
        delivered: false,
        status: response.status,
        ...normalizedError,
      };
    }

    return {
      provider: 'resend',
      delivered: true,
      messageId: body?.id || '',
      status: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed.';
    return {
      provider: 'resend',
      delivered: false,
      errorCode: 'RESEND_REQUEST_FAILED',
      message,
      reason: message,
    };
  }
};

const sendWithFormSubmit = async (message, inquiry) => {
  const to = formSubmitEmail();
  if (!to) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'FORMSUBMIT_TO_EMAIL / RESERVATION_TO_EMAIL is not configured - mail body prepared but not sent.',
    };
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        origin: siteUrl(),
        referer: reservationUrl(),
        'user-agent': 'Camping Clepardia reservation API',
      },
      body: JSON.stringify(buildFormSubmitPayload(message, inquiry)),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || body?.success === false) {
      const normalizedError = normalizeFormSubmitError(body, response.status);
      console.error('[reservation-api] formsubmit-provider-error', {
        status: response.status,
        errorCode: normalizedError.errorCode,
        reason: normalizedError.reason,
      });
      return {
        provider: 'formsubmit',
        delivered: false,
        status: response.status,
        activationNotice: normalizedError.errorCode === 'formsubmit_activation_required',
        activationRequired: normalizedError.errorCode === 'formsubmit_activation_required',
        ...normalizedError,
      };
    }

    return {
      provider: 'formsubmit',
      delivered: true,
      messageId: oneLine(body?.submission_id || body?.message || body?.next || '', 180),
      activationNotice: false,
      message: 'Sent through FormSubmit.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'FormSubmit request failed.';
    return {
      provider: 'formsubmit',
      delivered: false,
      errorCode: 'FORMSUBMIT_REQUEST_FAILED',
      message,
      reason: message,
    };
  }
};

const sendReceptionMail = async (message, inquiry) => {
  const resend = await sendWithResend(message);
  if (resend.delivered) return resend;

  if (web3FormsAccessKey()) {
    const web3forms = await sendWithWeb3Forms(message, inquiry);
    if (web3forms.delivered) return web3forms;

    const formsubmit = await sendWithFormSubmit(message, inquiry);
    return {
      ...formsubmit,
      fallbackFrom: {
        provider: 'resend',
        delivered: false,
        status: resend.status || null,
        errorCode: resend.errorCode || 'RESEND_ERROR',
        message: resend.message || resend.reason || 'Resend delivery failed.',
        reason: resend.reason || '',
        missing: resend.missing || undefined,
        nextFallback: {
          provider: 'web3forms',
          delivered: false,
          status: web3forms.status || null,
          errorCode: web3forms.errorCode || 'WEB3FORMS_ERROR',
          message: web3forms.message || web3forms.reason || 'Web3Forms delivery failed.',
          reason: web3forms.reason || '',
          keyPresent: web3forms.keyPresent,
          keyLength: web3forms.keyLength,
          responseBody: web3forms.responseBody || '',
          responseSuccess: web3forms.responseSuccess ?? null,
          contentType: web3forms.contentType || '',
        },
      },
    };
  }

  const formsubmit = await sendWithFormSubmit(message, inquiry);
  return {
    ...formsubmit,
    fallbackFrom: {
      provider: 'resend',
      delivered: false,
      status: resend.status || null,
      errorCode: resend.errorCode || 'RESEND_ERROR',
      message: resend.message || resend.reason || 'Resend delivery failed.',
      reason: resend.reason || '',
      missing: resend.missing || undefined,
    },
  };
};

const sendCustomerConfirmation = async (message) => {
  const apiKey = resendApiKey();
  if (!apiKey) {
    return {
      provider: 'mock',
      delivered: false,
      reason: 'Customer autoresponder template is ready, but RESEND_API_KEY is not configured.',
    };
  }
  return sendWithResend(message);
};

const providerFailureSummary = (result, label = '') => {
  if (!result) return '';
  const prefix = label || result.provider || 'provider';
  return oneLine([
    `${prefix}: ${result.errorCode || result.message || result.reason || 'MAIL_ERROR'}`,
    result.status ? `status ${result.status}` : '',
    typeof result.keyPresent === 'boolean' ? `keyPresent ${result.keyPresent}` : '',
    Number.isFinite(Number(result.keyLength)) ? `keyLength ${Number(result.keyLength)}` : '',
    result.responseBody ? `body ${result.responseBody}` : '',
    result.missing ? `missing ${[].concat(result.missing).join(',')}` : '',
    result.reason || result.message || '',
  ].filter(Boolean).join(' | '), 900);
};

const acceptedReservationResponse = (req, inquiry, reception = {}, mail = {}, inboxUpdateError = '') => {
  const publicPayload = {
    ok: true,
    inquirySaved: true,
    inquiryId: inquiry.inquiryId,
    mode: 'accepted',
    message: 'Dziękujemy. Zapytanie zostało przyjęte przez recepcję Camping Clepardia.',
  };
  if (!authorizeInboxRequest(req)) return publicPayload;
  return {
    ...publicPayload,
    provider: reception.fallbackFrom ? 'fallback' : (reception.provider || 'none'),
    delivered: Boolean(reception.delivered),
    error: reception.delivered ? null : (reception.errorCode || 'MAIL_NOT_DELIVERED'),
    reason: reception.delivered
      ? (inboxUpdateError || null)
      : [reception.reason || reception.message || 'Mail body prepared but not sent.', inboxUpdateError].filter(Boolean).join(' | '),
    mail,
    ccSystemDraft: createCcSystemDraft(inquiry),
    adminDiagnostics: buildAdminDiagnostics(inquiry, reception),
    clientReplyTemplate: buildClientReplyTemplate(inquiry),
  };
};

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('allow', 'POST, OPTIONS');
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        error: null,
        reason: 'Preflight response.',
        inquiryId: null,
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST, OPTIONS');
      return sendJson(res, 405, {
        ok: false,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        code: 'METHOD_NOT_ALLOWED',
        error: 'METHOD_NOT_ALLOWED',
        reason: 'Method not allowed.',
        inquiryId: null,
        message: 'Method not allowed.',
      });
    }

    const payload = await readPayload(req);
    const normalized = validate(payload);

    if (Object.keys(normalized.errors).length) {
      return sendJson(res, 400, {
        ok: false,
        inquirySaved: false,
        provider: 'none',
        delivered: false,
        error: 'VALIDATION_ERROR',
        reason: 'Reservation payload validation failed.',
        inquiryId: null,
        errors: normalized.errors,
      });
    }

    const inquiry = createInquiry(payload, normalized);
    let saved;
    try {
      saved = await saveReservationInquiry(createSupabaseRecord(inquiry, payload));
      inquiry.inquiryId = String(saved.id);
    } catch (error) {
      logInboxError('reservation-save', error);
      const diagnostic = serializeInboxError(error);
      return sendJson(res, diagnostic.status, {
        ok: false,
        inquirySaved: false,
        inquiryId: null,
        provider: 'none',
        delivered: false,
        code: diagnostic.payload.code,
        error: diagnostic.payload.error,
        reason: diagnostic.payload.error,
        details: diagnostic.payload.details,
        ...(diagnostic.payload.missing ? { missing: diagnostic.payload.missing } : {}),
        ...(diagnostic.payload.valuePreview ? { valuePreview: diagnostic.payload.valuePreview } : {}),
        ...(diagnostic.payload.supabaseStatus ? { supabaseStatus: diagnostic.payload.supabaseStatus } : {}),
      });
    }

    if (inquiry.website) {
      return sendJson(res, 200, {
        ok: true,
        inquirySaved: true,
        inquiryId: inquiry.inquiryId,
        mode: 'accepted',
        message: 'Dziękujemy. Zapytanie zostało przyjęte przez recepcję Camping Clepardia.',
      });
    }

    logMailEnv(inquiry.inquiryId);
    const reception = await sendReceptionMail(buildReceptionSafeEmail(inquiry), inquiry);
    const mailError = reception.delivered
      ? null
      : oneLine([
          providerFailureSummary(reception.fallbackFrom, reception.fallbackFrom?.provider || 'fallback'),
          providerFailureSummary(reception.fallbackFrom?.nextFallback, reception.fallbackFrom?.nextFallback?.provider || 'fallback2'),
          providerFailureSummary(reception, reception.provider || 'provider'),
        ].filter(Boolean).join(' | '), 1200);
    let inboxUpdateError = '';
    try {
      await updateReservationMailStatus(inquiry.inquiryId, {
        mail_provider: reception.fallbackFrom ? 'fallback' : (reception.provider || 'none'),
        mail_delivered: Boolean(reception.delivered),
        mail_error: mailError,
      });
    } catch (error) {
      const diagnostic = serializeInboxError(error);
      inboxUpdateError = diagnostic.payload.error;
      logInboxError('reservation-mail-status-update', error, { inquiryId: inquiry.inquiryId });
    }
    const mail = {
      reception,
      autoresponder: {
        provider: reception.provider,
        delivered: false,
        reason: customerConfirmationEnabled()
          ? 'Customer autoresponder was not attempted because reception mail did not finish yet.'
          : 'Customer autoresponder template is prepared. Set SEND_CUSTOMER_CONFIRMATION=true to enable it.',
      },
    };

    if (!reception.delivered && reception.provider === 'formsubmit' && reception.activationNotice) {
      return sendJson(res, 200, acceptedReservationResponse(req, inquiry, reception, mail, inboxUpdateError));
    }

    if (!reception.delivered && reception.provider !== 'mock') {
      console.error('[reservation-api] mail-error', {
        inquiryId: inquiry.inquiryId,
        provider: reception.provider || 'unknown',
        status: reception.status || null,
        errorCode: reception.errorCode || 'MAIL_ERROR',
        message: reception.message || reception.reason || 'Mail delivery failed.',
      });
      return sendJson(res, 200, acceptedReservationResponse(req, inquiry, reception, mail, inboxUpdateError));
    }

    if (reception.delivered && inquiry.email && customerConfirmationEnabled()) {
      const autoresponder = await sendCustomerConfirmation(buildCustomerMail(inquiry));
      mail.autoresponder = autoresponder;
      if (!autoresponder.delivered) {
        console.error('[reservation-api] customer-autoresponder-error', {
          inquiryId: inquiry.inquiryId,
          provider: autoresponder.provider || 'unknown',
          status: autoresponder.status || null,
          errorCode: autoresponder.errorCode || 'CUSTOMER_AUTORESPONDER_ERROR',
          message: autoresponder.message || autoresponder.reason || 'Customer autoresponder failed.',
        });
      }
    } else if (reception.delivered && inquiry.email) {
      mail.autoresponder = {
        provider: reception.provider,
        delivered: false,
        reason: 'Customer autoresponder template is ready but SEND_CUSTOMER_CONFIRMATION is not true.',
      };
    }

    return sendJson(res, 200, acceptedReservationResponse(req, inquiry, reception, mail, inboxUpdateError));
  } catch (error) {
    console.error('[reservation-api-unhandled]', {
      code: error?.code || 'RESERVATION_ENDPOINT_FAILED',
      error: error instanceof Error ? error.message : String(error),
    });
    return sendJson(res, 500, {
      ok: false,
      inquirySaved: false,
      provider: 'none',
      delivered: false,
      code: 'RESERVATION_ENDPOINT_FAILED',
      error: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
      inquiryId: null,
      mode: 'error',
      message: 'Reservation endpoint failed before accepting the enquiry.',
      reason: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
    });
  }
}
